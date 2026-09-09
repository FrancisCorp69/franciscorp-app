import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
  updateDoc,
  where,
  doc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

import { auth, db } from "../../services/firebase";

type SolicitudDelivery = {
  id: string;
  clienteId: string;
  deliveryId: string;
  estado: string;
  origen: string;
  destino: string;
  descripcion: string;
  precioEstimado: number;
  fechaCreacion?: Timestamp | null;
};

export default function SolicitudesDeliveryScreen() {
  const router = useRouter();

  const [solicitudes, setSolicitudes] = useState<SolicitudDelivery[]>([]);
  const [cargando, setCargando] = useState(true);
  const [actualizando, setActualizando] = useState(false);
  const [procesandoId, setProcesandoId] = useState<string | null>(null);
  const [uid, setUid] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (usuario) => {
      if (!usuario) {
        setUid(null);
        setSolicitudes([]);
        setCargando(false);
        return;
      }

      setUid(usuario.uid);
    });

    return unsubscribeAuth;
  }, []);

  useEffect(() => {
    if (!uid) {
      return;
    }

    setCargando(true);

    const q = query(
      collection(db, "solicitudes_delivery"),
      where("deliveryId", "==", uid),
      where("estado", "==", "solicitado"),
      orderBy("fechaCreacion", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const datos: SolicitudDelivery[] = snapshot.docs.map((documento) => {
          const data = documento.data();

          return {
            id: documento.id,
            clienteId: data.clienteId,
            deliveryId: data.deliveryId,
            estado: data.estado,
            origen: data.origen ?? "",
            destino: data.destino ?? "",
            descripcion: data.descripcion ?? "",
            precioEstimado: Number(data.precioEstimado ?? 0),
            fechaCreacion: data.fechaCreacion ?? null,
          };
        });

        setSolicitudes(datos);
        setCargando(false);
        setActualizando(false);
      },
      (error) => {
        console.error("ERROR SOLICITUDES DELIVERY:", error);
        setCargando(false);
        setActualizando(false);

        Alert.alert(
          "Error",
          "No se pudieron cargar las solicitudes de Delivery."
        );
      }
    );

    return unsubscribe;
  }, [uid]);

  const actualizar = () => {
    setActualizando(true);

    setTimeout(() => {
      setActualizando(false);
    }, 800);
  };

  const cambiarEstado = async (
    solicitud: SolicitudDelivery,
    nuevoEstado: "aceptado" | "rechazado"
  ) => {
    if (!uid) {
      Alert.alert(
        "Sesión requerida",
        "Debes iniciar sesión nuevamente."
      );
      return;
    }

    if (procesandoId) {
      return;
    }

    setProcesandoId(solicitud.id);

    try {
      const solicitudRef = doc(
        db,
        "solicitudes_delivery",
        solicitud.id
      );

      await updateDoc(solicitudRef, {
        estado: nuevoEstado,
        fechaActualizacion: new Date(),
      });

      if (nuevoEstado === "aceptado") {
        Alert.alert(
          "Solicitud aceptada",
          "Has aceptado el servicio. El cliente será notificado."
        );
      } else {
        Alert.alert(
          "Solicitud rechazada",
          "La solicitud fue rechazada y el cliente será notificado."
        );
      }
    } catch (error) {
      console.error("ERROR CAMBIANDO ESTADO:", error);

      Alert.alert(
        "No se pudo actualizar",
        "La solicitud no pudo ser actualizada. Inténtalo nuevamente."
      );
    } finally {
      setProcesandoId(null);
    }
  };

  const confirmarSolicitud = (
    solicitud: SolicitudDelivery,
    nuevoEstado: "aceptado" | "rechazado"
  ) => {
    const aceptar = nuevoEstado === "aceptado";

    Alert.alert(
      aceptar ? "Aceptar solicitud" : "Rechazar solicitud",
      aceptar
        ? "¿Quieres aceptar este servicio de Delivery?"
        : "¿Quieres rechazar esta solicitud?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: aceptar ? "Aceptar" : "Rechazar",
          style: aceptar ? "default" : "destructive",
          onPress: () =>
            cambiarEstado(solicitud, nuevoEstado),
        },
      ]
    );
  };

  const renderSolicitud = ({
    item,
  }: {
    item: SolicitudDelivery;
  }) => {
    const procesando = procesandoId === item.id;

    return (
      <View style={styles.card}>
        <View style={styles.encabezado}>
          <Text style={styles.titulo}>
            Nueva solicitud
          </Text>

          <View style={styles.estado}>
            <Text style={styles.estadoTexto}>
              PENDIENTE
            </Text>
          </View>
        </View>

        <View style={styles.separador} />

        <Text style={styles.etiqueta}>
          📍 Origen
        </Text>

        <Text style={styles.valor}>
          {item.origen}
        </Text>

        <Text style={styles.etiqueta}>
          📍 Destino
        </Text>

        <Text style={styles.valor}>
          {item.destino}
        </Text>

        <Text style={styles.etiqueta}>
          📦 Qué debe transportar
        </Text>

        <Text style={styles.valor}>
          {item.descripcion}
        </Text>

        <View style={styles.precioBox}>
          <Text style={styles.precioLabel}>
            Precio estimado
          </Text>

          <Text style={styles.precio}>
            ${item.precioEstimado.toFixed(2)}
          </Text>
        </View>

        {procesando ? (
          <View style={styles.procesando}>
            <ActivityIndicator size="small" />

            <Text style={styles.procesandoTexto}>
              Procesando solicitud...
            </Text>
          </View>
        ) : (
          <View style={styles.botones}>
            <TouchableOpacity
              style={[
                styles.boton,
                styles.botonRechazar,
              ]}
              onPress={() =>
                confirmarSolicitud(
                  item,
                  "rechazado"
                )
              }
              disabled={!!procesandoId}
            >
              <Text style={styles.textoRechazar}>
                RECHAZAR
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.boton,
                styles.botonAceptar,
              ]}
              onPress={() =>
                confirmarSolicitud(
                  item,
                  "aceptado"
                )
              }
              disabled={!!procesandoId}
            >
              <Text style={styles.textoAceptar}>
                ACEPTAR
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  if (cargando) {
    return (
      <View style={styles.centrado}>
        <ActivityIndicator size="large" />

        <Text style={styles.cargandoTexto}>
          Cargando solicitudes...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.contenedor}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.botonVolver}
          onPress={() => router.back()}
        >
          <Text style={styles.volver}>
            ‹
          </Text>
        </TouchableOpacity>

        <View>
          <Text style={styles.headerTitulo}>
            Solicitudes
          </Text>

          <Text style={styles.headerSubtitulo}>
            Servicios disponibles
          </Text>
        </View>
      </View>

      {solicitudes.length === 0 ? (
        <FlatList<SolicitudDelivery>
          data={[]}
          renderItem={() => null}
          refreshControl={
            <RefreshControl
              refreshing={actualizando}
              onRefresh={actualizar}
            />
          }
          ListEmptyComponent={
            <View style={styles.vacio}>
              <Text style={styles.iconoVacio}>
                📦
              </Text>

              <Text style={styles.vacioTitulo}>
                No tienes solicitudes
              </Text>

              <Text style={styles.vacioTexto}>
                Cuando un cliente solicite tus
                servicios de Delivery, aparecerá aquí.
              </Text>
            </View>
          }
        />
      ) : (
        <FlatList
          data={solicitudes}
          keyExtractor={(item) => item.id}
          renderItem={renderSolicitud}
          contentContainerStyle={styles.lista}
          refreshControl={
            <RefreshControl
              refreshing={actualizando}
              onRefresh={actualizar}
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: "#f5f6f8",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 55,
    paddingBottom: 18,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },

  botonVolver: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#f1f3f5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  volver: {
    fontSize: 32,
    lineHeight: 34,
    fontWeight: "300",
  },

  headerTitulo: {
    fontSize: 23,
    fontWeight: "700",
  },

  headerSubtitulo: {
    marginTop: 2,
    color: "#6b7280",
    fontSize: 14,
  },

  lista: {
    padding: 16,
    paddingBottom: 30,
  },

  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },
  },

  encabezado: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  titulo: {
    fontSize: 20,
    fontWeight: "700",
  },

  estado: {
    backgroundColor: "#fff4cc",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },

  estadoTexto: {
    fontSize: 11,
    fontWeight: "700",
  },

  separador: {
    height: 1,
    backgroundColor: "#eeeeee",
    marginVertical: 15,
  },

  etiqueta: {
    fontSize: 13,
    fontWeight: "700",
    color: "#6b7280",
    marginTop: 10,
  },

  valor: {
    fontSize: 16,
    color: "#111827",
    marginTop: 4,
    lineHeight: 22,
  },

  precioBox: {
    marginTop: 18,
    padding: 14,
    borderRadius: 12,
    backgroundColor: "#f7f7f7",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  precioLabel: {
    fontSize: 14,
    fontWeight: "600",
  },

  precio: {
    fontSize: 22,
    fontWeight: "800",
  },

  botones: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
  },

  boton: {
    flex: 1,
    minHeight: 50,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  botonRechazar: {
    backgroundColor: "#eeeeee",
  },

  botonAceptar: {
    backgroundColor: "#111827",
  },

  textoRechazar: {
    fontWeight: "700",
    fontSize: 14,
  },

  textoAceptar: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 14,
  },

  procesando: {
    marginTop: 18,
    minHeight: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },

  procesandoTexto: {
    color: "#6b7280",
    fontSize: 14,
  },

  centrado: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f5f6f8",
  },

  cargandoTexto: {
    marginTop: 12,
    color: "#6b7280",
  },

  vacio: {
    flex: 1,
    minHeight: 500,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 35,
  },

  iconoVacio: {
    fontSize: 55,
    marginBottom: 15,
  },

  vacioTitulo: {
    fontSize: 21,
    fontWeight: "700",
    textAlign: "center",
  },

  vacioTexto: {
    marginTop: 8,
    fontSize: 15,
    lineHeight: 22,
    color: "#6b7280",
    textAlign: "center",
  },
});


