import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  collection,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { aprobarSolicitudDelivery, rechazarSolicitudDelivery } from "../../services/adminDelivery";
import { auth, db } from "../../services/firebase";

type SolicitudDelivery = {
  id: string;
  nombre?: string;
  email?: string;
  telefono?: string;
  roles?: {
    Delivery?: boolean;
  };
  delivery?: {
    estadoVerificacion?: string;
    estado?: string;
    activo?: boolean;
    disponible?: boolean;
    tipoVehiculo?: string;
    marca?: string;
    modelo?: string;
    anio?: string | number;
    color?: string;
    placa?: string;
    zonaTrabajo?: string;
    solicitud?: {
      estado?: string;
    };
  };
};

export default function AdministradorDelivery() {
  const [cargando, setCargando] = useState(true);
  const [esAdmin, setEsAdmin] = useState(false);
  const [solicitudes, setSolicitudes] = useState<SolicitudDelivery[]>([]);
  const [procesando, setProcesando] = useState<string | null>(null);

  useEffect(() => {
    let activo = true;

    const iniciar = async () => {
      try {
        const usuario = auth.currentUser;

        if (!usuario) {
          if (activo) {
            setEsAdmin(false);
            setCargando(false);
          }
          return;
        }

        const tokenResult = await usuario.getIdTokenResult(true);

        if (tokenResult.claims.admin !== true) {
          if (activo) {
            setEsAdmin(false);
            setCargando(false);
          }
          return;
        }

        if (activo) {
          setEsAdmin(true);
        }

        const q = query(
          collection(db, "usuarios"),
          where(
            "delivery.estadoVerificacion",
            "==",
            "pendiente"
          )
        );

        const unsubscribe = onSnapshot(
          q,
          (snapshot) => {
            if (!activo) {
              return;
            }

            const lista: SolicitudDelivery[] =
              snapshot.docs.map((doc) => ({
                id: doc.id,
                ...(doc.data() as Omit<SolicitudDelivery, "id">),
              }));

            setSolicitudes(lista);
            setCargando(false);
          },
          (error) => {
            console.error(
              "ERROR CONSULTANDO SOLICITUDES DELIVERY:",
              error
            );

            if (activo) {
              setCargando(false);
              Alert.alert(
                "Error",
                "No se pudieron cargar las solicitudes Delivery."
              );
            }
          }
        );

        return unsubscribe;
      } catch (error) {
        console.error(
          "ERROR VERIFICANDO ADMIN DELIVERY:",
          error
        );

        if (activo) {
          setEsAdmin(false);
          setCargando(false);
        }
      }
    };

    let unsubscribe: (() => void) | undefined;

    iniciar().then((resultado) => {
      if (typeof resultado === "function") {
        unsubscribe = resultado;
      }
    });

    return () => {
      activo = false;
      unsubscribe?.();
    };
  }, []);

  const aprobar = async (solicitud: SolicitudDelivery) => {
    if (procesando) {
      return;
    }

    Alert.alert(
      "Aprobar Delivery",
      `¿Deseas aprobar a ${solicitud.nombre || "este solicitante"}?`,
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Aprobar",
          onPress: async () => {
            try {
              setProcesando(solicitud.id);

              const resultado =
                await aprobarSolicitudDelivery(solicitud.id);

              Alert.alert(
                "Solicitud aprobada",
                resultado.mensaje
              );
            } catch (error: any) {
              console.error(
                "ERROR APROBANDO DELIVERY:",
                error
              );

              Alert.alert(
                "No se pudo aprobar",
                error?.message ||
                  "La solicitud ya no está disponible o no tienes autorización."
              );
            } finally {
              setProcesando(null);
            }
          },
        },
      ]
    );
  };

  const rechazar = async (solicitud: SolicitudDelivery) => {
    if (procesando) {
      return;
    }

    Alert.alert(
      "Rechazar Delivery",
      `¿Deseas rechazar a ${solicitud.nombre || "este solicitante"}?`,
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Rechazar",
          style: "destructive",
          onPress: async () => {
            try {
              setProcesando(solicitud.id);

              const resultado =
                await rechazarSolicitudDelivery(solicitud.id);

              Alert.alert(
                "Solicitud rechazada",
                resultado.mensaje
              );
            } catch (error: any) {
              console.error(
                "ERROR RECHAZANDO DELIVERY:",
                error
              );

              Alert.alert(
                "No se pudo rechazar",
                error?.message ||
                  "La solicitud ya no está disponible o no tienes autorización."
              );
            } finally {
              setProcesando(null);
            }
          },
        },
      ]
    );
  };

  const valor = (texto?: string | number) => {
    if (
      texto === undefined ||
      texto === null ||
      String(texto).trim() === ""
    ) {
      return "Sin registrar";
    }

    return String(texto);
  };

  if (cargando) {
    return (
      <View style={styles.cargando}>
        <ActivityIndicator
          size="large"
          color="#0066CC"
        />

        <Text style={styles.cargandoTexto}>
          Cargando solicitudes...
        </Text>
      </View>
    );
  }

  if (!esAdmin) {
    return (
      <View style={styles.noAutorizado}>
        <MaterialCommunityIcons
          name="shield-alert-outline"
          size={70}
          color="#D32F2F"
        />

        <Text style={styles.noAutorizadoTitulo}>
          Acceso no autorizado
        </Text>

        <Text style={styles.noAutorizadoTexto}>
          No tienes permisos para revisar solicitudes Delivery.
        </Text>

        <TouchableOpacity
          style={styles.botonVolver}
          onPress={() => router.replace("/administrador" as any)}
        >
          <Text style={styles.botonVolverTexto}>
            Volver al panel
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.botonAtras}
          onPress={() => router.back()}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={28}
            color="#0066CC"
          />
        </TouchableOpacity>

        <View style={styles.headerTextos}>
          <Text style={styles.titulo}>
            🚴 Solicitudes Delivery
          </Text>

          <Text style={styles.subtitulo}>
            Solicitudes pendientes de revisión
          </Text>
        </View>
      </View>

      <FlatList
        data={solicitudes}
        keyExtractor={(item) => item.id}
        contentContainerStyle={
          solicitudes.length === 0
            ? styles.listaVacia
            : styles.lista
        }
        renderItem={({ item }) => {
          const ocupado = procesando === item.id;

          return (
            <View style={styles.tarjeta}>
              <View style={styles.nombreFila}>
                <MaterialCommunityIcons
                  name="moped-outline"
                  size={28}
                  color="#0066CC"
                />

                <Text style={styles.nombre}>
                  {valor(item.nombre)}
                </Text>
              </View>

              <View style={styles.dato}>
                <Text style={styles.etiqueta}>
                  📧 Correo
                </Text>

                <Text style={styles.valor}>
                  {valor(item.email)}
                </Text>
              </View>

              <View style={styles.dato}>
                <Text style={styles.etiqueta}>
                  📱 Teléfono
                </Text>

                <Text style={styles.valor}>
                  {valor(item.telefono)}
                </Text>
              </View>

              <View style={styles.separador} />

              <Text style={styles.seccion}>
                🚗 Vehículo
              </Text>

              <Text style={styles.valor}>
                Tipo: {valor(item.delivery?.tipoVehiculo)}
              </Text>

              <Text style={styles.valor}>
                Marca: {valor(item.delivery?.marca)}
              </Text>

              <Text style={styles.valor}>
                Modelo: {valor(item.delivery?.modelo)}
              </Text>

              <Text style={styles.valor}>
                Año: {valor(item.delivery?.anio)}
              </Text>

              <Text style={styles.valor}>
                Color: {valor(item.delivery?.color)}
              </Text>

              <Text style={styles.valor}>
                Placa: {valor(item.delivery?.placa)}
              </Text>

              <View style={styles.separador} />

              <Text style={styles.seccion}>
                📍 Zona de trabajo
              </Text>

              <Text style={styles.valor}>
                {valor(item.delivery?.zonaTrabajo)}
              </Text>

              <View style={styles.estado}>
                <Text style={styles.estadoTexto}>
                  PENDIENTE
                </Text>
              </View>

              <View style={styles.botones}>
                <TouchableOpacity
                  style={[
                    styles.boton,
                    styles.botonAprobar,
                    ocupado && styles.botonDeshabilitado,
                  ]}
                  disabled={ocupado}
                  onPress={() => aprobar(item)}
                >
                  {ocupado ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.botonTexto}>
                      APROBAR
                    </Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.boton,
                    styles.botonRechazar,
                    ocupado && styles.botonDeshabilitado,
                  ]}
                  disabled={ocupado}
                  onPress={() => rechazar(item)}
                >
                  <Text style={styles.botonTexto}>
                    RECHAZAR
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.vacio}>
            <MaterialCommunityIcons
              name="check-circle-outline"
              size={70}
              color="#4CAF50"
            />

            <Text style={styles.vacioTitulo}>
              🎉 No hay solicitudes Delivery pendientes.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
    paddingTop: 55,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 18,
  },

  botonAtras: {
    marginRight: 10,
    padding: 4,
  },

  headerTextos: {
    flex: 1,
  },

  titulo: {
    fontSize: 21,
    fontWeight: "bold",
    color: "#0066CC",
  },

  subtitulo: {
    marginTop: 4,
    fontSize: 13,
    color: "#777",
  },

  lista: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },

  listaVacia: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },

  tarjeta: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
    marginBottom: 15,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 5,
  },

  nombreFila: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },

  nombre: {
    marginLeft: 10,
    flex: 1,
    fontSize: 19,
    fontWeight: "bold",
    color: "#222",
  },

  dato: {
    marginBottom: 8,
  },

  etiqueta: {
    fontSize: 12,
    color: "#777",
    fontWeight: "bold",
  },

  valor: {
    marginTop: 3,
    fontSize: 14,
    color: "#333",
  },

  separador: {
    height: 1,
    backgroundColor: "#E5E5E5",
    marginVertical: 13,
  },

  seccion: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#0066CC",
    marginBottom: 6,
  },

  estado: {
    alignSelf: "flex-start",
    marginTop: 15,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#FFF3CD",
  },

  estadoTexto: {
    color: "#856404",
    fontSize: 12,
    fontWeight: "bold",
  },

  botones: {
    flexDirection: "row",
    gap: 10,
    marginTop: 18,
  },

  boton: {
    flex: 1,
    minHeight: 46,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  botonAprobar: {
    backgroundColor: "#2E7D32",
  },

  botonRechazar: {
    backgroundColor: "#D32F2F",
  },

  botonDeshabilitado: {
    opacity: 0.5,
  },

  botonTexto: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "bold",
  },

  cargando: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F5F7FA",
  },

  cargandoTexto: {
    marginTop: 12,
    color: "#666",
  },

  noAutorizado: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
    backgroundColor: "#F5F7FA",
  },

  noAutorizadoTitulo: {
    marginTop: 15,
    fontSize: 23,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
  },

  noAutorizadoTexto: {
    marginTop: 10,
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
  },

  botonVolver: {
    marginTop: 25,
    backgroundColor: "#0066CC",
    paddingHorizontal: 25,
    paddingVertical: 13,
    borderRadius: 12,
  },

  botonVolverTexto: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },

  vacio: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 50,
  },

  vacioTitulo: {
    marginTop: 15,
    fontSize: 16,
    color: "#555",
    textAlign: "center",
  },
});

