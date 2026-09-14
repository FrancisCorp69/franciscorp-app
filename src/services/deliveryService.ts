import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase";

export interface CoordenadasUbicacion {
  latitud: number;
  longitud: number;
}

export interface TramoTarifaDelivery {
  id: string;
  desde: number;
  hasta: number;
  tarifa: number;
  etiqueta?: string;
}

export interface ConfiguracionDelivery {
  tipo?: string;
  activo?: boolean;
  tramos?: TramoTarifaDelivery[];
  tarifaBaseMas12?: number;
  tarifaExtraKm?: number;
  minutoEspera?: number;
}

export interface CalculoDelivery {
  distanciaKm: number;
  costoEntrega: number;
  configuracionActiva: boolean;
}

function gradosARadianes(grados: number): number {
  return (grados * Math.PI) / 180;
}

export function calcularDistanciaKm(
  origen: CoordenadasUbicacion,
  destino: CoordenadasUbicacion,
): number {
  const radioTierraKm = 6371;

  const lat1 = gradosARadianes(origen.latitud);
  const lat2 = gradosARadianes(destino.latitud);

  const diferenciaLatitud = gradosARadianes(
    destino.latitud - origen.latitud,
  );

  const diferenciaLongitud = gradosARadianes(
    destino.longitud - origen.longitud,
  );

  const a =
    Math.sin(diferenciaLatitud / 2) *
      Math.sin(diferenciaLatitud / 2) +
    Math.cos(lat1) *
      Math.cos(lat2) *
      Math.sin(diferenciaLongitud / 2) *
      Math.sin(diferenciaLongitud / 2);

  const c =
    2 *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a),
    );

  return radioTierraKm * c;
}

export async function obtenerConfiguracionDelivery(): Promise<ConfiguracionDelivery | null> {
  try {
    const referencia = doc(
      db,
      "configuracion",
      "delivery",
    );

    const snapshot = await getDoc(referencia);

    if (!snapshot.exists()) {
      console.error(
        "No existe configuracion/delivery en Firestore.",
      );
      return null;
    }

    return snapshot.data() as ConfiguracionDelivery;
  } catch (error) {
    console.error(
      "Error obteniendo configuracion de Delivery:",
      error,
    );
    return null;
  }
}

function obtenerTramoAplicable(
  distanciaKm: number,
  tramos: TramoTarifaDelivery[],
): TramoTarifaDelivery | null {
  const tramosOrdenados = [...tramos].sort(
    (a, b) => a.desde - b.desde,
  );

  for (const tramo of tramosOrdenados) {
    if (
      distanciaKm >= tramo.desde &&
      distanciaKm <= tramo.hasta
    ) {
      return tramo;
    }
  }

  return null;
}

export function calcularCostoDeliveryDesdeConfiguracion(
  distanciaKm: number,
  configuracion: ConfiguracionDelivery,
): number {
  if (!configuracion.activo) {
    throw new Error(
      "El servicio de Delivery está temporalmente desactivado.",
    );
  }

  if (!Number.isFinite(distanciaKm) || distanciaKm < 0) {
    throw new Error(
      "La distancia de Delivery no es válida.",
    );
  }

  const tramos = Array.isArray(configuracion.tramos)
    ? configuracion.tramos
    : [];

  const tramo = obtenerTramoAplicable(
    distanciaKm,
    tramos,
  );

  if (tramo) {
    return Number(tramo.tarifa) || 0;
  }

  if (distanciaKm > 12) {
    const base = Number(
      configuracion.tarifaBaseMas12,
    );

    const extraPorKm = Number(
      configuracion.tarifaExtraKm,
    );

    if (
      !Number.isFinite(base) ||
      !Number.isFinite(extraPorKm)
    ) {
      throw new Error(
        "La configuración para distancias mayores a 12 km no es válida.",
      );
    }

    const kilometrosExtra = distanciaKm - 12;

    return Number(
      (
        base +
        kilometrosExtra * extraPorKm
      ).toFixed(2),
    );
  }

  throw new Error(
    "No existe una tarifa configurada para esta distancia.",
  );
}

export async function calcularCostoDelivery(
  origen: CoordenadasUbicacion,
  destino: CoordenadasUbicacion,
): Promise<CalculoDelivery> {
  const configuracion =
    await obtenerConfiguracionDelivery();

  if (!configuracion) {
    throw new Error(
      "No se pudo cargar la configuración de Delivery.",
    );
  }

  const distanciaKm = calcularDistanciaKm(
    origen,
    destino,
  );

  const costoEntrega =
    calcularCostoDeliveryDesdeConfiguracion(
      distanciaKm,
      configuracion,
    );

  return {
    distanciaKm: Number(
      distanciaKm.toFixed(2),
    ),
    costoEntrega,
    configuracionActiva:
      configuracion.activo === true,
  };
}