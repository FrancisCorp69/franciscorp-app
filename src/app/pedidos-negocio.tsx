import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  updateDoc,
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
import { db } from "../services/firebase";

type EstadoPedido =
  | "pendiente"
  | "aceptado"
  | "preparando"
  | "listo"
  | "en_camino"
  | "entregado"
  | "cancelado";

interface ItemPedido {
  id?: string;
  nombre?: string;
  cantidad?: number;
  precio?: number;
  subtotal?: number;
}

interface Cliente {
  nombre?: string;
  apellido?: string;
  telefono?: string;
  email?: string;
}

interface Pedido {
  id: string;
  negocioId: string;
  usuarioId: string;
  estado: EstadoPedido;
  fechaCreacion?: any;
  fechaActualizacion?: any;
  items?: ItemPedido[];
  productos?: ItemPedido[];
  subtotal?: number;
  costoEnvio?: number;
  envio?: number;
  total?: number;
  direccion?: string;
  ciudad?: string;
  referencia?: string;
  metodoPago?: string;
  cliente?: Cliente;
}

interface Negocio {
  id: string;
  nombre?: string;
  propietarioId?: string;
  ownerId?: string;
}

function convertirFecha(fecha: any): Date | null {
  if (!fecha) return null;

  if (fecha?.toDate) {
    return fecha.toDate();
  }

  if (fecha instanceof Date) {
    return fecha;
  }

  if (typeof fecha === "string" || typeof fecha === "number") {
    const fechaConvertida = new Date(fecha);
    return isNaN(fechaConvertida.getTime()) ? null : fechaConvertida;
  }

  if (fecha?.seconds) {
    return new Date(fecha.seconds * 1000);
  }

  return null;
}

function formatearFecha(fecha: any): string {
  const fechaConvertida = convertirFecha(fecha);

  if (!fechaConvertida) {
    return "Fecha no disponible";
  }

  return fechaConvertida.toLocaleString("es-EC", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function obtenerEstadoTexto(estado: EstadoPedido): string {
  switch (estado) {
    case "pendiente":
      return "Pendiente";
    case "aceptado":
      return "Pedido aceptado";
    case "preparando":
      return "Preparando";
    case "listo":
      return "Listo para entregar";
    case "en_camino":
      return "En camino";
    case "entregado":
      return "Entregado";
    case "cancelado":
      return "Cancelado";
    default:
      return estado;
  }
}

function obtenerEstadoIcono(
  estado: EstadoPedido
): keyof typeof MaterialCommunityIcons.glyphMap {
  switch (estado) {
    case "pendiente":
      return "clock-outline";

    case "aceptado":
      return "check-circle-outline";

    case "preparando":
      return "chef-hat";

    case "listo":
      return "package-variant-closed-check";

    case "en_camino":
      return "truck-delivery-outline";

    case "entregado":
      return "check-circle-outline";

    case "cancelado":
      return "close-circle-outline";

    default:
      return "help-circle-outline";
  }
}

function obtenerEstadoColor(estado: EstadoPedido): string {
  switch (estado) {
    case "pendiente":
      return "#F59E0B";

    case "aceptado":
      return "#16A34A";

    case "preparando":
      return "#2563EB";

    case "listo":
      return "#7C3AED";

    case "en_camino":
      return "#0284C7";

    case "entregado":
      return "#16A34A";

    case "cancelado":
      return "#DC2626";

    default:
      return "#555";
  }
}

function obtenerEstadoFondo(estado: EstadoPedido): string {
  switch (estado) {
    case "pendiente":
      return "#FFF7E6";

    case "aceptado":
      return "#ECFDF3";

    case "preparando":
      return "#EFF6FF";

    case "listo":
      return "#F5F3FF";

    case "en_camino":
      return "#F0F9FF";

    case "entregado":
      return "#ECFDF3";

    case "cancelado":
      return "#FEF2F2";

    default:
      return "#F1F1F1";
  }
}

function obtenerSiguienteEstado(
  estado: EstadoPedido
): EstadoPedido | null {
  switch (estado) {
    case "aceptado":
      return "preparando";

    case "preparando":
      return "listo";

    case "listo":
      return "en_camino";

    case "en_camino":
      return "entregado";

    default:
      return null;
  }
}

function obtenerTextoAccion(estado: EstadoPedido): string {
  switch (estado) {
    case "aceptado":
      return "Comenzar preparación";

    case "preparando":
      return "Marcar como listo";

    case "listo":
      return "Enviar pedido";

    case "en_camino":
      return "Marcar como entregado";

    default:
      return "";
  }
}

function obtenerIconoPago(
  metodoPago?: string
): keyof typeof MaterialCommunityIcons.glyphMap {
  const metodo = (metodoPago || "").toLowerCase();

  if (
    metodo.includes("efectivo") ||
    metodo.includes("cash")
  ) {
    return "cash";
  }

  return "credit-card-outline";
}

export default function PedidosNegocioScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const negocioId = params.id;

  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [cargando, setCargando] = useState(true);
  const [negocio, setNegocio] = useState<Negocio | null>(null);
  const [verificando, setVerificando] = useState(true);

  useEffect(() => {
    if (!negocioId) {
      setVerificando(false);
      setCargando(false);
      return;
    }

    const verificarNegocio = async () => {
      try {
        const usuario = await import("firebase/auth").then(
          (mod) => mod.getAuth().currentUser
        );

        if (!usuario) {
          Alert.alert(
            "Sesión requerida",
            "Debes iniciar sesión para administrar los pedidos."
          );
          router.back();
          return;
        }

        const negocioRef = doc(db, "negocios", negocioId);
        const negocioSnap = await getDoc(negocioRef);

        if (!negocioSnap.exists()) {
          Alert.alert(
            "Negocio no encontrado",
            "No se encontró el negocio."
          );
          router.back();
          return;
        }

        const datosNegocio = {
          id: negocioSnap.id,
          ...negocioSnap.data(),
        } as Negocio;

        const propietario =
          datosNegocio.propietarioId ||
          datosNegocio.ownerId;

        if (propietario !== usuario.uid) {
          Alert.alert(
            "Acceso denegado",
            "No tienes permiso para administrar los pedidos de este negocio."
          );
          router.back();
          return;
        }

        setNegocio(datosNegocio);
        setVerificando(false);
      } catch (error) {
        console.error(
          "ERROR VERIFICANDO NEGOCIO:",
          error
        );

        Alert.alert(
          "Error",
          "No se pudo verificar el negocio."
        );

        router.back();
      }
    };

    verificarNegocio();
  }, [negocioId]);

  useEffect(() => {
    if (!negocioId || verificando) return;

    const pedidosQuery = query(
      collection(db, "pedidos"),
      where("negocioId", "==", negocioId)
    );

    const unsubscribe = onSnapshot(
      pedidosQuery,
      async (snapshot) => {
        try {
          const pedidosBase = snapshot.docs.map(
            (pedidoDoc) =>
              ({
                id: pedidoDoc.id,
                ...pedidoDoc.data(),
              }) as Pedido
          );

          pedidosBase.sort((a, b) => {
            const fechaA =
              convertirFecha(a.fechaCreacion)?.getTime() || 0;

            const fechaB =
              convertirFecha(b.fechaCreacion)?.getTime() || 0;

            return fechaB - fechaA;
          });

          const pedidosCompletos = await Promise.all(
            pedidosBase.map(async (pedido) => {
              try {
                if (!pedido.usuarioId) {
                  return {
                    ...pedido,
                    cliente: {
                      nombre: "Cliente",
                      apellido: "",
                      telefono: "No registrado",
                    },
                  };
                }

                const usuarioRef = doc(
                  db,
                  "usuarios",
                  pedido.usuarioId
                );

                const usuarioSnap = await getDoc(usuarioRef);

                if (usuarioSnap.exists()) {
                  return {
                    ...pedido,
                    cliente: usuarioSnap.data() as Cliente,
                  };
                }

                return {
                  ...pedido,
                  cliente: {
                    nombre: "Cliente",
                    apellido: "",
                    telefono: "No registrado",
                  },
                };
              } catch (error) {
                console.error(
                  "ERROR OBTENIENDO CLIENTE:",
                  error
                );

                return {
                  ...pedido,
                  cliente: {
                    nombre: "Cliente",
                    apellido: "",
                    telefono: "No registrado",
                  },
                };
              }
            })
          );

          setPedidos(pedidosCompletos);
          setCargando(false);
        } catch (error) {
          console.error(
            "ERROR PROCESANDO PEDIDOS:",
            error
          );

          setCargando(false);
        }
      },
      (error) => {
        console.error(
          "ERROR ESCUCHANDO PEDIDOS:",
          error
        );

        Alert.alert(
          "Error",
          "No se pudieron cargar los pedidos."
        );

        setCargando(false);
      }
    );

    return unsubscribe;
  }, [negocioId, verificando]);

  const cambiarEstado = async (
    pedidoId: string,
    nuevoEstado: EstadoPedido
  ) => {
    try {
      const pedidoRef = doc(
        db,
        "pedidos",
        pedidoId
      );

      await updateDoc(pedidoRef, {
        estado: nuevoEstado,
        fechaActualizacion: new Date(),
      });
    } catch (error) {
      console.error(
        "ERROR CAMBIANDO ESTADO:",
        error
      );

      Alert.alert(
        "Error",
        "No se pudo actualizar el estado del pedido."
      );
    }
  };

  const aceptarPedido = (pedido: Pedido) => {
    Alert.alert(
      "Aceptar pedido",
      "¿Deseas aceptar este pedido?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Aceptar",
          onPress: () =>
            cambiarEstado(
              pedido.id,
              "aceptado"
            ),
        },
      ]
    );
  };

  const rechazarPedido = (pedido: Pedido) => {
    Alert.alert(
      "Rechazar pedido",
      "¿Deseas cancelar este pedido?",
      [
        {
          text: "No",
          style: "cancel",
        },
        {
          text: "Sí, cancelar",
          style: "destructive",
          onPress: () =>
            cambiarEstado(
              pedido.id,
              "cancelado"
            ),
        },
      ]
    );
  };

  const avanzarPedido = (pedido: Pedido) => {
    const siguienteEstado =
      obtenerSiguienteEstado(pedido.estado);

    if (!siguienteEstado) return;

    Alert.alert(
      obtenerTextoAccion(pedido.estado),
      `¿Deseas cambiar el pedido a "${obtenerEstadoTexto(
        siguienteEstado
      )}"?`,
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Confirmar",
          onPress: () =>
            cambiarEstado(
              pedido.id,
              siguienteEstado
            ),
        },
      ]
    );
  };

  const renderPedido = ({
    item: pedido,
  }: {
    item: Pedido;
  }) => {
    const productos =
      pedido.items ||
      pedido.productos ||
      [];

    const subtotal =
      typeof pedido.subtotal === "number"
        ? pedido.subtotal
        : productos.reduce(
            (total, producto) =>
              total +
              (producto.subtotal ??
                (producto.precio || 0) *
                  (producto.cantidad || 0)),
            0
          );

    const costoEnvio =
      pedido.costoEnvio ??
      pedido.envio ??
      0;

    const total =
      pedido.total ??
      subtotal + costoEnvio;

    const nombreCliente =
      [
        pedido.cliente?.nombre,
        pedido.cliente?.apellido,
      ]
        .filter(Boolean)
        .join(" ") || "Cliente";

    const estadoColor =
      obtenerEstadoColor(pedido.estado);

    const estadoFondo =
      obtenerEstadoFondo(pedido.estado);

    return (
      <View style={styles.card}>
        {/* ENCABEZADO */}
        <View style={styles.cardHeader}>
          <View style={styles.headerInfo}>
            <View style={styles.orderTitleRow}>
              <MaterialCommunityIcons
                name="receipt-text-outline"
                size={21}
                color="#D4AF37"
              />

              <Text style={styles.orderTitle}>
                Pedido #
                {pedido.id
                  .slice(-6)
                  .toUpperCase()}
              </Text>
            </View>

            <View style={styles.dateRow}>
              <MaterialCommunityIcons
                name="clock-outline"
                size={16}
                color="#777"
              />

              <Text style={styles.orderDate}>
                {formatearFecha(
                  pedido.fechaCreacion
                )}
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.statusContainer,
              {
                backgroundColor:
                  estadoFondo,
              },
            ]}
          >
            <MaterialCommunityIcons
              name={obtenerEstadoIcono(
                pedido.estado
              )}
              size={17}
              color={estadoColor}
            />

            <Text
              style={[
                styles.statusText,
                {
                  color: estadoColor,
                },
              ]}
            >
              {obtenerEstadoTexto(
                pedido.estado
              )}
            </Text>
          </View>
        </View>

        <View style={styles.separator} />

        {/* CLIENTE */}
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <MaterialCommunityIcons
              name="account-outline"
              size={20}
              color="#D4AF37"
            />

            <Text style={styles.sectionTitle}>
              Cliente
            </Text>
          </View>

          <View style={styles.infoRow}>
            <MaterialCommunityIcons
              name="account-circle-outline"
              size={20}
              color="#666"
            />

            <Text style={styles.infoText}>
              {nombreCliente}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <MaterialCommunityIcons
              name="phone-outline"
              size={20}
              color="#666"
            />

            <Text style={styles.infoText}>
              {pedido.cliente?.telefono ||
                "No registrado"}
            </Text>
          </View>

          {pedido.cliente?.email ? (
            <View style={styles.infoRow}>
              <MaterialCommunityIcons
                name="email-outline"
                size={20}
                color="#666"
              />

              <Text style={styles.infoText}>
                {pedido.cliente.email}
              </Text>
            </View>
          ) : null}
        </View>

        <View style={styles.separator} />

        {/* PRODUCTOS */}
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <MaterialCommunityIcons
              name="package-variant-closed"
              size={20}
              color="#D4AF37"
            />

            <Text style={styles.sectionTitle}>
              Productos
            </Text>
          </View>

          {productos.length === 0 ? (
            <Text style={styles.emptyText}>
              No hay productos registrados.
            </Text>
          ) : (
            productos.map(
              (producto, index) => {
                const subtotalProducto =
                  producto.subtotal ??
                  (producto.precio || 0) *
                    (producto.cantidad || 0);

                return (
                  <View
                    key={
                      producto.id ||
                      `${producto.nombre}-${index}`
                    }
                    style={styles.productRow}
                  >
                    <View
                      style={
                        styles.productLeft
                      }
                    >
                      <View
                        style={
                          styles.quantityContainer
                        }
                      >
                        <MaterialCommunityIcons
                          name="counter"
                          size={15}
                          color="#777"
                        />

                        <Text
                          style={
                            styles.productQuantity
                          }
                        >
                          {producto.cantidad ||
                            0}
                          x
                        </Text>
                      </View>

                      <Text
                        style={
                          styles.productName
                        }
                      >
                        {producto.nombre ||
                          "Producto"}
                      </Text>
                    </View>

                    <Text
                      style={
                        styles.productPrice
                      }
                    >
                      ${subtotalProducto.toFixed(
                        2
                      )}
                    </Text>
                  </View>
                );
              }
            )
          )}
        </View>

        <View style={styles.separator} />

        {/* TOTALES */}
        <View style={styles.totalsBox}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>
              Subtotal
            </Text>

            <Text style={styles.totalValue}>
              ${subtotal.toFixed(2)}
            </Text>
          </View>

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>
              Envío
            </Text>

            <Text style={styles.totalValue}>
              ${costoEnvio.toFixed(2)}
            </Text>
          </View>

          <View style={styles.totalSeparator} />

          <View style={styles.totalFinalRow}>
            <View
              style={styles.totalTitleRow}
            >
              <MaterialCommunityIcons
                name="cash-multiple"
                size={22}
                color="#D4AF37"
              />

              <Text
                style={styles.totalFinalLabel}
              >
                Total
              </Text>
            </View>

            <Text
              style={styles.totalFinalValue}
            >
              ${total.toFixed(2)}
            </Text>
          </View>
        </View>

        <View style={styles.separator} />

        {/* ENTREGA */}
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <MaterialCommunityIcons
              name="truck-delivery-outline"
              size={20}
              color="#D4AF37"
            />

            <Text style={styles.sectionTitle}>
              Información de entrega
            </Text>
          </View>

          <View style={styles.infoRow}>
            <MaterialCommunityIcons
              name="map-marker-outline"
              size={21}
              color="#666"
            />

            <Text style={styles.infoText}>
              {pedido.direccion ||
                "Dirección no disponible"}
            </Text>
          </View>

          {pedido.ciudad ? (
            <View style={styles.infoRow}>
              <MaterialCommunityIcons
                name="city-variant-outline"
                size={20}
                color="#666"
              />

              <Text style={styles.infoText}>
                {pedido.ciudad}
              </Text>
            </View>
          ) : null}

          {pedido.referencia ? (
            <View style={styles.infoRow}>
              <MaterialCommunityIcons
                name="text-box-outline"
                size={20}
                color="#666"
              />

              <Text style={styles.infoText}>
                {pedido.referencia}
              </Text>
            </View>
          ) : null}

          <View style={styles.infoRow}>
            <MaterialCommunityIcons
              name={obtenerIconoPago(
                pedido.metodoPago
              )}
              size={20}
              color="#666"
            />

            <Text style={styles.infoText}>
              {pedido.metodoPago ||
                "Método de pago no especificado"}
            </Text>
          </View>
        </View>

        <View style={styles.separator} />

        {/* ACCIONES */}
        <View style={styles.actionsContainer}>
          {pedido.estado ===
          "pendiente" ? (
            <View style={styles.pendingActions}>
              <TouchableOpacity
                style={styles.acceptButton}
                onPress={() =>
                  aceptarPedido(pedido)
                }
              >
                <MaterialCommunityIcons
                  name="check"
                  size={20}
                  color="#fff"
                />

                <Text
                  style={styles.actionButtonText}
                >
                  Aceptar
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.rejectButton}
                onPress={() =>
                  rechazarPedido(pedido)
                }
              >
                <MaterialCommunityIcons
                  name="close"
                  size={20}
                  color="#fff"
                />

                <Text
                  style={styles.actionButtonText}
                >
                  Rechazar
                </Text>
              </TouchableOpacity>
            </View>
          ) : null}

          {pedido.estado !==
            "pendiente" &&
          pedido.estado !==
            "entregado" &&
          pedido.estado !==
            "cancelado" ? (
            <TouchableOpacity
              style={[
                styles.nextButton,
                {
                  backgroundColor:
                    estadoColor,
                },
              ]}
              onPress={() =>
                avanzarPedido(pedido)
              }
            >
              <MaterialCommunityIcons
                name="arrow-right-circle"
                size={22}
                color="#fff"
              />

              <Text
                style={styles.actionButtonText}
              >
                {obtenerTextoAccion(
                  pedido.estado
                )}
              </Text>
            </TouchableOpacity>
          ) : null}

          {pedido.estado ===
          "entregado" ? (
            <View style={styles.finishedBox}>
              <MaterialCommunityIcons
                name="check-circle-outline"
                size={23}
                color="#16A34A"
              />

              <Text
                style={styles.finishedText}
              >
                Pedido entregado
              </Text>
            </View>
          ) : null}

          {pedido.estado ===
          "cancelado" ? (
            <View style={styles.cancelledBox}>
              <MaterialCommunityIcons
                name="close-circle-outline"
                size={23}
                color="#DC2626"
              />

              <Text
                style={styles.cancelledText}
              >
                Pedido cancelado
              </Text>
            </View>
          ) : null}
        </View>

        {/* DIVISOR DORADO */}
        <View style={styles.orderDivider} />
      </View>
    );
  };

  if (verificando || cargando) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color="#D4AF37"
        />

        <Text style={styles.loadingText}>
          Cargando pedidos...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.pageHeader}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={25}
            color="#222"
          />
        </TouchableOpacity>

        <View style={styles.pageHeaderCenter}>
          <View
            style={styles.pageTitleRow}
          >
            <MaterialCommunityIcons
              name="clipboard-text-outline"
              size={24}
              color="#D4AF37"
            />

            <Text style={styles.pageTitle}>
              Pedidos
            </Text>
          </View>

          <Text style={styles.businessName}>
            {negocio?.nombre ||
              "Administración"}
          </Text>
        </View>
      </View>

      {pedidos.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons
            name="clipboard-text-outline"
            size={60}
            color="#ccc"
          />

          <Text style={styles.emptyTitle}>
            No hay pedidos
          </Text>

          <Text style={styles.emptyDescription}>
            Los nuevos pedidos aparecerán
            aquí automáticamente.
          </Text>
        </View>
      ) : (
        <FlatList
          data={pedidos}
          keyExtractor={(item) => item.id}
          renderItem={renderPedido}
          contentContainerStyle={
            styles.listContent
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7F7",
  },

  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F7F7F7",
  },

  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: "#666",
  },

  pageHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 55,
    paddingBottom: 15,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F5F5F5",
  },

  pageHeaderCenter: {
    flex: 1,
    alignItems: "center",
    marginRight: 42,
  },

  pageTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },

  pageTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#222",
  },

  businessName: {
    marginTop: 3,
    fontSize: 13,
    color: "#777",
  },

  listContent: {
    padding: 15,
    paddingBottom: 30,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    overflow: "hidden",
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 10,
  },

  headerInfo: {
    flex: 1,
  },

  orderTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },

  orderTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#222",
  },

  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 5,
  },

  orderDate: {
    fontSize: 12,
    color: "#777",
  },

  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 7,
    borderRadius: 10,
    maxWidth: 165,
  },

  statusText: {
    fontSize: 12,
    fontWeight: "800",
    flexShrink: 1,
  },

  separator: {
    height: 1,
    backgroundColor: "#eeeeee",
    marginVertical: 14,
  },

  section: {
    gap: 9,
  },

  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginBottom: 2,
  },

  sectionTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#222",
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 9,
  },

  infoText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: "#444",
  },

  productRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 6,
  },

  productLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },

  quantityContainer: {
    minWidth: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: "#F5F5F5",
  },

  productQuantity: {
    fontSize: 13,
    fontWeight: "800",
    color: "#555",
  },

  productName: {
    flex: 1,
    fontSize: 14,
    color: "#333",
    fontWeight: "600",
  },

  productPrice: {
    fontSize: 14,
    fontWeight: "800",
    color: "#333",
    marginLeft: 8,
  },

  emptyText: {
    fontSize: 14,
    color: "#888",
  },

  totalsBox: {
    paddingVertical: 3,
  },

  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 5,
  },

  totalLabel: {
    fontSize: 14,
    color: "#666",
  },

  totalValue: {
    fontSize: 14,
    color: "#444",
    fontWeight: "600",
  },

  totalSeparator: {
    height: 1,
    backgroundColor: "#eeeeee",
    marginVertical: 8,
  },

  totalFinalRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  totalTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },

  totalFinalLabel: {
    fontSize: 17,
    fontWeight: "900",
    color: "#222",
  },

  totalFinalValue: {
    fontSize: 20,
    fontWeight: "900",
    color: "#D4AF37",
  },

  actionsContainer: {
    marginTop: 2,
  },

  pendingActions: {
    flexDirection: "row",
    gap: 10,
  },

  acceptButton: {
    flex: 1,
    minHeight: 46,
    borderRadius: 12,
    backgroundColor: "#16A34A",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },

  rejectButton: {
    flex: 1,
    minHeight: 46,
    borderRadius: 12,
    backgroundColor: "#DC2626",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },

  nextButton: {
    minHeight: 48,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  actionButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "800",
  },

  finishedBox: {
    minHeight: 46,
    borderRadius: 12,
    backgroundColor: "#ECFDF3",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  finishedText: {
    color: "#16A34A",
    fontSize: 14,
    fontWeight: "800",
  },

  cancelledBox: {
    minHeight: 46,
    borderRadius: 12,
    backgroundColor: "#FEF2F2",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  cancelledText: {
    color: "#DC2626",
    fontSize: 14,
    fontWeight: "800",
  },

  orderDivider: {
    height: 9,
    backgroundColor: "#D4AF37",
    marginHorizontal: -16,
    marginBottom: -16,
    marginTop: 16,
  },

  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },

  emptyTitle: {
    marginTop: 15,
    fontSize: 19,
    fontWeight: "800",
    color: "#333",
  },

  emptyDescription: {
    marginTop: 7,
    textAlign: "center",
    fontSize: 14,
    lineHeight: 21,
    color: "#888",
  },
});