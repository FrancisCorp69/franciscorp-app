import { httpsCallable } from "firebase/functions";
import { functions } from "./firebase";

type RespuestaAdmin = {
  ok: boolean;
  mensaje: string;
};

export async function aprobarSolicitudDelivery(
  deliveryId: string
): Promise<RespuestaAdmin> {
  const funcion = httpsCallable<
    { deliveryId: string },
    RespuestaAdmin
  >(functions, "aprobarSolicitudDelivery");

  const resultado = await funcion({ deliveryId });

  return resultado.data;
}

export async function rechazarSolicitudDelivery(
  deliveryId: string
): Promise<RespuestaAdmin> {
  const funcion = httpsCallable<
    { deliveryId: string },
    RespuestaAdmin
  >(functions, "rechazarSolicitudDelivery");

  const resultado = await funcion({ deliveryId });

  return resultado.data;
}
