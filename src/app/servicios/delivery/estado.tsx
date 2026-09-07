import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import {
  doc,
  getDoc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { auth, db } from "../../../services/firebase";

const ESTADOS: Record<
  string,
  {
    titulo: string;
    descripcion: string;
    icono: string;
  }
> = {
  solicitado: {
    titulo: "Solicitud enviada",
    descripcion:
      "Esperando que el Delivery acepte tu solicitud.",
    icono: "clock-outline",
  },

  aceptado: {
    titulo: "Solicitud aceptada",
    descripcion:
      "El Delivery aceptó tu servicio.",
    icono: "check-circle-outline",
  },

  en_camino_recogida: {
    titulo: "Delivery en camino",
    descripcion:
      "El Delivery se dirige al lugar de recogida.",
    icono: "moped",
  },

  recogido: {
    titulo: "Paquete recogido",
    descripcion:
      "El Delivery ya recogió lo que debes transportar.",
    icono: "package-variant-closed-check",
  },

  en_camino_destino: {
    titulo: "En camino al destino",
    descripcion:
      "Tu paquete está siendo trasladado al destino.",
    icono: "truck-fast-outline",
  },

  entregado: {
    titulo: "Entregado",
    descripcion:
      "El Delivery indicó que realizó la entrega.",
    icono: "package-check",
  },

  completado: {
    titulo: "Servicio completado",
    descripcion:
      "El servicio terminó correctamente.",
    icono: "check-decagram",
  },

  rechazado: {
    titulo: "Solicitud rechazada",
    descripcion:
      "El Delivery no pudo aceptar este servicio.",
    icono: "close-circle-outline",
  },

  cancelado: {
    titulo: "Solicitud cancelada",
    descripcion:
      "Esta solicitud fue cancelada.",
    icono: "cancel",
  },
};

export default function EstadoDeliveryScreen() {
  const params = useLocalSearchParams<{
    solicitudId?: string;
  }>();

  const solicitudId = String(
    params.solicitudId || ""
  );

  const [cargando, setCargando] = useState(true);
  const [solicitud, setSolicitud] =
    useState<any>(null);

  useEffect(() => {
    cargarSolicitud();
  }, [solicitudId]);

  async function cargarSolicitud() {
    try {
      if (!auth.currentUser) {
        router.replace("/login");
        return;
      }

      if (!solicitudId) {
        Alert.alert(
          "Solicitud inválida",
          "No se encontró la solicitud."
        );
        router.back();
        return;
      }

      const referencia = doc(
        db,
        "solicitudes_delivery",
        solicitudId
      );

      const snapshot = await getDoc(referencia);

      if (!snapshot.exists()) {
        Alert.alert(
          "No encontrada",
          "La solicitud ya no existe."
        );
        router.back();
        return;
      }

      const datos = snapshot.data();

      if (
        datos.clienteId !==
        auth.currentUser.uid
      ) {
        Alert.alert(
          "Acceso denegado",
          "No puedes ver esta solicitud."
        );
        router.back();
        return;
      }

      setSolicitud({
        id: snapshot.id,
        ...datos,
      });
    } catch (error) {
      console.error(
        "ERROR CARGANDO SOLICITUD:",
        error
      );

      Alert.alert(
        "Error",
        "No se pudo cargar la solicitud."
      );
    } finally {
      setCargando(false);
    }
  }

  async function cancelarSolicitud() {
    try {
      if (!solicitudId) return;

      await updateDoc(
        doc(
          db,
          "solicitudes_delivery",
          solicitudId
        ),
        {
          estado: "cancelado",
          fechaActualizacion:
            serverTimestamp(),
        }
      );

      await cargarSolicitud();

      Alert.alert(
        "Solicitud cancelada",
        "La solicitud fue cancelada."
      );
    } catch (error: any) {
      console.error(
        "ERROR CANCELANDO:",
        error
      );

      Alert.alert(
        "Error",
        error?.message ||
          "No se pudo cancelar la solicitud."
      );
    }
  }

  if (cargando) {
    return (
      <View style={styles.cargando}>
        <ActivityIndicator
          size="large"
          color="#0066CC"
        />

        <Text style={styles.cargandoTexto}>
          Cargando solicitud...
        </Text>
      </View>
    );
  }

  if (!solicitud) {
    return null;
  }

  const estado =
    ESTADOS[solicitud.estado] ||
    ESTADOS.solicitado;

  const puedeCancelar =
    solicitud.estado === "solicitado";

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.back}
          onPress={() => router.back()}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={27}
            color="#FFFFFF"
          />
        </TouchableOpacity>

        <View>
          <Text style={styles.headerTitulo}>
            Mi solicitud
          </Text>

          <Text style={styles.headerSubtitulo}>
            Servicio Delivery
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.contenido}
      >
        <View style={styles.estadoCard}>
          <View style={styles.estadoIcono}>
            <MaterialCommunityIcons
              name={estado.icono as any}
              size={45}
              color="#0066CC"
            />
          </View>

          <Text style={styles.estadoTitulo}>
            {estado.titulo}
          </Text>

          <Text style={styles.estadoDescripcion}>
            {estado.descripcion}
          </Text>
        </View>

        <Text style={styles.seccionTitulo}>
          Detalles del servicio
        </Text>

        <View style={styles.card}>
          <Detalle
            icono="account-outline"
            titulo="Delivery"
            valor={
              solicitud.deliveryNombre ||
              "Delivery"
            }
          />

          <Detalle
            icono="map-marker"
            titulo="Origen"
            valor={solicitud.origen}
          />

          <Detalle
            icono="map-marker-check"
            titulo="Destino"
            valor={solicitud.destino}
          />

          <Detalle
            icono="package-variant"
            titulo="Qué transporta"
            valor={solicitud.descripcion}
          />

          <Detalle
            icono="map-marker-distance"
            titulo="Distancia"
            valor={`${solicitud.distanciaKm || 0} km`}
          />

          <Detalle
            icono="cash"
            titulo="Precio estimado"
            valor={`$${Number(
              solicitud.precioFinal ??
                solicitud.precioEstimado ??
                0
            ).toFixed(2)}`}
            ultimo
          />
        </View>

        {solicitud.estado ===
          "completado" && (
          <View style={styles.calificacionCard}>
            <MaterialCommunityIcons
              name="star-circle"
              size={42}
              color="#F2B705"
            />

            <Text style={styles.calificacionTitulo}>
              Servicio completado
            </Text>

            <Text style={styles.calificacionTexto}>
              La calificación del Delivery se
              podrá realizar desde esta solicitud.
            </Text>
          </View>
        )}

        {puedeCancelar && (
          <TouchableOpacity
            style={styles.cancelar}
            onPress={() =>
              Alert.alert(
                "Cancelar solicitud",
                "¿Seguro que deseas cancelar esta solicitud?",
                [
                  {
                    text: "No",
                    style: "cancel",
                  },
                  {
                    text: "Sí, cancelar",
                    style: "destructive",
                    onPress:
                      cancelarSolicitud,
                  },
                ]
              )
            }
          >
            <MaterialCommunityIcons
              name="close-circle-outline"
              size={21}
              color="#D32F2F"
            />

            <Text style={styles.cancelarTexto}>
              Cancelar solicitud
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.actualizar}
          onPress={cargarSolicitud}
        >
          <MaterialCommunityIcons
            name="refresh"
            size={21}
            color="#FFFFFF"
          />

          <Text style={styles.actualizarTexto}>
            Actualizar estado
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

function Detalle({
  icono,
  titulo,
  valor,
  ultimo,
}: {
  icono: string;
  titulo: string;
  valor: string;
  ultimo?: boolean;
}) {
  return (
    <View
      style={[
        styles.detalle,
        ultimo && styles.detalleUltimo,
      ]}
    >
      <MaterialCommunityIcons
        name={icono as any}
        size={22}
        color="#0066CC"
      />

      <View style={styles.detalleInfo}>
        <Text style={styles.detalleTitulo}>
          {titulo}
        </Text>

        <Text style={styles.detalleValor}>
          {valor}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },

  cargando: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  cargandoTexto: {
    marginTop: 10,
    color: "#666",
  },

  header: {
    backgroundColor: "#0066CC",
    paddingTop: 55,
    paddingBottom: 18,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
  },

  back: {
    width: 42,
    height: 42,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },

  headerTitulo: {
    color: "#FFFFFF",
    fontSize: 21,
    fontWeight: "800",
  },

  headerSubtitulo: {
    color: "#DCEEFF",
    marginTop: 2,
    fontSize: 13,
  },

  contenido: {
    padding: 16,
    paddingBottom: 40,
  },

  estadoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 24,
    alignItems: "center",
    elevation: 2,
  },

  estadoIcono: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: "#EAF4FF",
    alignItems: "center",
    justifyContent: "center",
  },

  estadoTitulo: {
    marginTop: 15,
    fontSize: 22,
    fontWeight: "900",
    color: "#222",
    textAlign: "center",
  },

  estadoDescripcion: {
    marginTop: 7,
    color: "#666",
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },

  seccionTitulo: {
    marginTop: 22,
    marginBottom: 10,
    fontSize: 18,
    fontWeight: "800",
    color: "#172033",
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 17,
    paddingHorizontal: 16,
    elevation: 2,
  },

  detalle: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#EEF1F4",
  },

  detalleUltimo: {
    borderBottomWidth: 0,
  },

  detalleInfo: {
    flex: 1,
    marginLeft: 11,
  },

  detalleTitulo: {
    color: "#777",
    fontSize: 12,
  },

  detalleValor: {
    marginTop: 3,
    color: "#222",
    fontSize: 14,
    fontWeight: "700",
  },

  calificacionCard: {
    marginTop: 16,
    backgroundColor: "#FFFDF2",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
  },

  calificacionTitulo: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: "800",
    color: "#333",
  },

  calificacionTexto: {
    marginTop: 5,
    color: "#666",
    textAlign: "center",
    lineHeight: 19,
  },

  cancelar: {
    marginTop: 18,
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#F2B8B5",
    backgroundColor: "#FFF5F4",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },

  cancelarTexto: {
    color: "#D32F2F",
    fontWeight: "800",
  },

  actualizar: {
    marginTop: 12,
    minHeight: 50,
    borderRadius: 13,
    backgroundColor: "#0066CC",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  actualizarTexto: {
    color: "#FFFFFF",
    fontWeight: "800",
  },
});
