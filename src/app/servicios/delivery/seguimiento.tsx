import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import {
  doc,
  getDoc,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { db } from "../../../services/firebase";

const ESTADOS = [
  {
    id: "solicitado",
    titulo: "Solicitud enviada",
    icono: "send-check-outline",
  },
  {
    id: "aceptado",
    titulo: "Delivery aceptó",
    icono: "check-circle-outline",
  },
  {
    id: "en_camino_recogida",
    titulo: "En camino a recoger",
    icono: "moped-outline",
  },
  {
    id: "recogido",
    titulo: "Pedido recogido",
    icono: "package-variant-closed",
  },
  {
    id: "en_camino_destino",
    titulo: "En camino al destino",
    icono: "truck-fast-outline",
  },
  {
    id: "entregado",
    titulo: "Pedido entregado",
    icono: "package-check",
  },
  {
    id: "completado",
    titulo: "Servicio completado",
    icono: "check-decagram-outline",
  },
];

export default function SeguimientoDeliveryScreen() {
  const params = useLocalSearchParams<{
    solicitudId?: string;
  }>();

  const solicitudId = String(params.solicitudId || "");

  const [solicitud, setSolicitud] = useState<any>(null);
  const [cargando, setCargando] = useState(true);
  const [actualizando, setActualizando] = useState(false);

  const cargarSolicitud = async () => {
    if (!solicitudId) {
      setCargando(false);
      return;
    }

    try {
      const snap = await getDoc(
        doc(db, "solicitudes_delivery", solicitudId)
      );

      if (snap.exists()) {
        setSolicitud({
          id: snap.id,
          ...snap.data(),
        });
      }
    } catch (error) {
      console.error("ERROR CARGANDO SOLICITUD:", error);

      Alert.alert(
        "Error",
        "No pudimos cargar el seguimiento."
      );
    } finally {
      setCargando(false);
      setActualizando(false);
    }
  };

  useEffect(() => {
    cargarSolicitud();

    const intervalo = setInterval(() => {
      cargarSolicitud();
    }, 5000);

    return () => clearInterval(intervalo);
  }, [solicitudId]);

  if (cargando) {
    return (
      <View style={styles.cargando}>
        <ActivityIndicator size="large" color="#0066CC" />
        <Text style={styles.cargandoTexto}>
          Cargando seguimiento...
        </Text>
      </View>
    );
  }

  if (!solicitud) {
    return (
      <View style={styles.cargando}>
        <MaterialCommunityIcons
          name="alert-circle-outline"
          size={65}
          color="#999"
        />

        <Text style={styles.errorTitulo}>
          Solicitud no encontrada
        </Text>

        <TouchableOpacity
          style={styles.boton}
          onPress={() => router.back()}
        >
          <Text style={styles.botonTexto}>
            Volver
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const estadoActual = solicitud.estado || "solicitado";

  const indiceActual = ESTADOS.findIndex(
    (estado) => estado.id === estadoActual
  );

  const rechazada = estadoActual === "rechazado";
  const cancelada = estadoActual === "cancelado";

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.botonAtras}
          onPress={() => router.back()}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={27}
            color="#0066CC"
          />
        </TouchableOpacity>

        <View style={styles.headerTextos}>
          <Text style={styles.titulo}>
            Seguimiento
          </Text>

          <Text style={styles.subtitulo}>
            {solicitud.deliveryNombre || "Delivery"}
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.contenido}
        refreshControl={
          <RefreshControl
            refreshing={actualizando}
            onRefresh={() => {
              setActualizando(true);
              cargarSolicitud();
            }}
          />
        }
      >
        <View style={styles.estadoPrincipal}>
          <MaterialCommunityIcons
            name={
              rechazada || cancelada
                ? "alert-circle-outline"
                : "truck-fast-outline"
            }
            size={55}
            color={
              rechazada || cancelada
                ? "#D32F2F"
                : "#0066CC"
            }
          />

          <Text style={styles.estadoTitulo}>
            {rechazada
              ? "Solicitud rechazada"
              : cancelada
              ? "Solicitud cancelada"
              : ESTADOS[indiceActual >= 0 ? indiceActual : 0]
                  ?.titulo || "Solicitud enviada"}
          </Text>

          <Text style={styles.estadoDescripcion}>
            {rechazada
              ? "El Delivery no pudo aceptar este servicio."
              : cancelada
              ? "Esta solicitud fue cancelada."
              : estadoActual === "completado"
              ? "El servicio terminó correctamente."
              : "El estado se actualizará automáticamente."}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitulo}>
            📍 Información del servicio
          </Text>

          <View style={styles.infoFila}>
            <MaterialCommunityIcons
              name="map-marker"
              size={21}
              color="#20A050"
            />

            <View style={styles.infoTexto}>
              <Text style={styles.infoLabel}>
                Origen
              </Text>

              <Text style={styles.infoValor}>
                {solicitud.origen}
              </Text>
            </View>
          </View>

          <View style={styles.infoFila}>
            <MaterialCommunityIcons
              name="map-marker-check"
              size={21}
              color="#0066CC"
            />

            <View style={styles.infoTexto}>
              <Text style={styles.infoLabel}>
                Destino
              </Text>

              <Text style={styles.infoValor}>
                {solicitud.destino}
              </Text>
            </View>
          </View>

          <View style={styles.infoFila}>
            <MaterialCommunityIcons
              name="package-variant"
              size={21}
              color="#666"
            />

            <View style={styles.infoTexto}>
              <Text style={styles.infoLabel}>
                Qué transporta
              </Text>

              <Text style={styles.infoValor}>
                {solicitud.descripcion}
              </Text>
            </View>
          </View>

          <View style={styles.precioFila}>
            <Text style={styles.precioLabel}>
              Precio estimado
            </Text>

            <Text style={styles.precio}>
              ${Number(
                solicitud.precioEstimado || 0
              ).toFixed(2)}
            </Text>
          </View>
        </View>

        {!rechazada && !cancelada && (
          <View style={styles.card}>
            <Text style={styles.cardTitulo}>
              Estado del servicio
            </Text>

            {ESTADOS.map((estado, index) => {
              const completado = index <= indiceActual;
              const actual = index === indiceActual;

              return (
                <View
                  key={estado.id}
                  style={styles.estadoFila}
                >
                  <View style={styles.lineaContenedor}>
                    <View
                      style={[
                        styles.circulo,
                        completado &&
                          styles.circuloActivo,
                      ]}
                    >
                      <MaterialCommunityIcons
                        name={estado.icono as any}
                        size={19}
                        color={
                          completado
                            ? "#fff"
                            : "#999"
                        }
                      />
                    </View>

                    {index <
                      ESTADOS.length - 1 && (
                      <View
                        style={[
                          styles.linea,
                          index < indiceActual &&
                            styles.lineaActiva,
                        ]}
                      />
                    )}
                  </View>

                  <View style={styles.estadoTexto}>
                    <Text
                      style={[
                        styles.estadoNombre,
                        completado &&
                          styles.estadoNombreActivo,
                      ]}
                    >
                      {estado.titulo}
                    </Text>

                    {actual && (
                      <Text style={styles.estadoActual}>
                        Estado actual
                      </Text>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {estadoActual === "completado" && (
          <TouchableOpacity
            style={styles.botonCalificar}
            activeOpacity={0.8}
            onPress={() =>
              router.push({
                pathname:
                  "/servicios/delivery/calificar" as any,
                params: {
                  solicitudId,
                  deliveryId:
                    solicitud.deliveryId || "",
                  deliveryNombre:
                    solicitud.deliveryNombre ||
                    "Delivery",
                },
              })
            }
          >
            <MaterialCommunityIcons
              name="star-outline"
              size={24}
              color="#fff"
            />

            <Text style={styles.botonTexto}>
              Calificar Delivery
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },

  header: {
    paddingTop: 55,
    paddingHorizontal: 18,
    paddingBottom: 18,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#E8E8E8",
  },

  botonAtras: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#F0F6FF",
    alignItems: "center",
    justifyContent: "center",
  },

  headerTextos: {
    marginLeft: 13,
  },

  titulo: {
    fontSize: 23,
    fontWeight: "bold",
    color: "#222",
  },

  subtitulo: {
    marginTop: 3,
    fontSize: 14,
    color: "#777",
  },

  contenido: {
    padding: 16,
    paddingBottom: 40,
  },

  estadoPrincipal: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 24,
    alignItems: "center",
    marginBottom: 14,
  },

  estadoTitulo: {
    marginTop: 12,
    fontSize: 21,
    fontWeight: "bold",
    color: "#222",
    textAlign: "center",
  },

  estadoDescripcion: {
    marginTop: 7,
    color: "#777",
    textAlign: "center",
    lineHeight: 20,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
  },

  cardTitulo: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 17,
  },

  infoFila: {
    flexDirection: "row",
    marginBottom: 17,
  },

  infoTexto: {
    flex: 1,
    marginLeft: 10,
  },

  infoLabel: {
    fontSize: 12,
    color: "#888",
  },

  infoValor: {
    marginTop: 3,
    fontSize: 14,
    color: "#333",
  },

  precioFila: {
    borderTopWidth: 1,
    borderTopColor: "#EEE",
    paddingTop: 14,
    marginTop: 2,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  precioLabel: {
    fontSize: 14,
    color: "#666",
  },

  precio: {
    fontSize: 23,
    fontWeight: "bold",
    color: "#0066CC",
  },

  estadoFila: {
    flexDirection: "row",
    minHeight: 58,
  },

  lineaContenedor: {
    width: 35,
    alignItems: "center",
  },

  circulo: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#E5E5E5",
    alignItems: "center",
    justifyContent: "center",
  },

  circuloActivo: {
    backgroundColor: "#0066CC",
  },

  linea: {
    width: 2,
    flex: 1,
    backgroundColor: "#E2E2E2",
    marginVertical: 2,
  },

  lineaActiva: {
    backgroundColor: "#0066CC",
  },

  estadoTexto: {
    flex: 1,
    marginLeft: 10,
    paddingTop: 7,
  },

  estadoNombre: {
    fontSize: 14,
    color: "#888",
  },

  estadoNombreActivo: {
    color: "#222",
    fontWeight: "700",
  },

  estadoActual: {
    marginTop: 3,
    fontSize: 11,
    color: "#0066CC",
    fontWeight: "600",
  },

  botonCalificar: {
    height: 53,
    borderRadius: 14,
    backgroundColor: "#F2B705",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  botonTexto: {
    marginLeft: 8,
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },

  cargando: {
    flex: 1,
    backgroundColor: "#F5F7FA",
    alignItems: "center",
    justifyContent: "center",
  },

  cargandoTexto: {
    marginTop: 12,
    color: "#666",
  },

  errorTitulo: {
    marginTop: 15,
    fontSize: 19,
    fontWeight: "bold",
    color: "#333",
  },

  boton: {
    marginTop: 20,
    backgroundColor: "#0066CC",
    paddingHorizontal: 25,
    paddingVertical: 13,
    borderRadius: 12,
  },
});
