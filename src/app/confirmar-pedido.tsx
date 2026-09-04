import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";

import {
  addDoc,
  collection,
  doc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";

import { auth, db } from "../services/firebase";
import { useCart } from "../context/CartContext";

type ModalActivo =
  | "direccion"
  | "referencia"
  | "pago"
  | null;

export default function ConfirmarPedidoScreen() {
  const { cart, items, subtotal, vaciarCarrito } = useCart();

  const [direccion, setDireccion] = useState("");
  const [referencia, setReferencia] = useState("");
  const [metodoPago, setMetodoPago] = useState("");

  const [costoEntrega, setCostoEntrega] = useState(0);
  const [cargandoEnvio, setCargandoEnvio] = useState(true);
  const [confirmando, setConfirmando] = useState(false);

  const [modalActivo, setModalActivo] =
    useState<ModalActivo>(null);

  const [direccionTemporal, setDireccionTemporal] =
    useState("");

  const [referenciaTemporal, setReferenciaTemporal] =
    useState("");

  useEffect(() => {
    async function cargarDatosNegocio() {
      if (!cart?.negocioId) {
        setCargandoEnvio(false);
        return;
      }

      try {
        const negocioRef = doc(
          db,
          "negocios",
          cart.negocioId
        );

        const negocioSnap = await getDoc(negocioRef);

        if (negocioSnap.exists()) {
          const datos = negocioSnap.data();

          const costo =
            Number(datos.costoEntrega) || 0;

          setCostoEntrega(costo);
        }
      } catch (error) {
        console.error(
          "Error obteniendo costo de entrega:",
          error
        );
      } finally {
        setCargandoEnvio(false);
      }
    }

    cargarDatosNegocio();
  }, [cart?.negocioId]);

  const total = subtotal + costoEntrega;

  function abrirDireccion() {
    setDireccionTemporal(direccion);
    setModalActivo("direccion");
  }

  function guardarDireccion() {
    const valor = direccionTemporal.trim();

    if (!valor) {
      Alert.alert(
        "Dirección requerida",
        "Escribe la dirección donde deseas recibir tu pedido."
      );
      return;
    }

    setDireccion(valor);
    setModalActivo(null);
  }

  function abrirReferencia() {
    setReferenciaTemporal(referencia);
    setModalActivo("referencia");
  }

  function guardarReferencia() {
    setReferencia(
      referenciaTemporal.trim()
    );
    setModalActivo(null);
  }

  function seleccionarPago(
    metodo: string
  ) {
    setMetodoPago(metodo);
    setModalActivo(null);
  }

  async function confirmarPedido() {
    if (confirmando) return;

    const usuario = auth.currentUser;

    if (!usuario) {
      Alert.alert(
        "Sesión requerida",
        "Debes iniciar sesión para realizar un pedido."
      );
      return;
    }

    if (!cart || items.length === 0) {
      Alert.alert(
        "Carrito vacío",
        "No hay productos para realizar el pedido."
      );
      return;
    }

    if (!direccion.trim()) {
      Alert.alert(
        "Falta la dirección",
        "Selecciona o escribe una dirección de entrega."
      );
      return;
    }

    if (!metodoPago) {
      Alert.alert(
        "Falta el método de pago",
        "Selecciona cómo deseas pagar tu pedido."
      );
      return;
    }

    try {
      setConfirmando(true);

      const pedido = {
        usuarioId: usuario.uid,

        negocioId: cart.negocioId,
        negocioNombre: cart.negocioNombre,

        items: items.map((item) => ({
          productoId: item.productoId,
          nombre: item.nombre,
          precio: item.precio,
          cantidad: item.cantidad,
          subtotal: item.subtotal,
          foto: item.foto || "",
        })),

        subtotal,
        costoEntrega,
        total,

        direccionEntrega: direccion.trim(),

        referencia: referencia.trim(),

        metodoPago,

        estado: "pendiente",

        fechaCreacion: serverTimestamp(),
      };

      const referenciaPedido = await addDoc(
        collection(db, "pedidos"),
        pedido
      );

      const orderId = referenciaPedido.id;

      vaciarCarrito();

      router.replace({
        pathname: "/pedido-realizado",
        params: {
          orderId,
        },
      });
    } catch (error) {
      console.error(
        "ERROR CREANDO PEDIDO:",
        error
      );

      Alert.alert(
        "No se pudo crear el pedido",
        "Ocurrió un problema al guardar tu pedido. Intenta nuevamente."
      );
    } finally {
      setConfirmando(false);
    }
  }

  if (!cart || items.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <MaterialCommunityIcons
          name="cart-outline"
          size={75}
          color="#999"
        />

        <Text style={styles.emptyTitle}>
          No hay productos
        </Text>

        <Text style={styles.emptyText}>
          Tu carrito está vacío. Agrega productos antes de continuar.
        </Text>

        <Pressable
          style={styles.backButton}
          onPress={() => router.replace("/cliente")}
        >
          <Text style={styles.backButtonText}>
            Explorar negocios
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={
        Platform.OS === "ios"
          ? "padding"
          : "height"
      }
      keyboardVerticalOffset={0}
    >
      <View style={styles.mainContainer}>

        {/* HEADER */}

        <View style={styles.header}>
          <Pressable
            style={styles.headerButton}
            onPress={() => router.back()}
          >
            <MaterialCommunityIcons
              name="arrow-left"
              size={25}
              color="#222"
            />
          </Pressable>

          <Text style={styles.headerTitle}>
            Confirmar pedido
          </Text>

          <View style={styles.headerSpace} />
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={
            Platform.OS === "ios"
              ? "interactive"
              : "on-drag"
          }
        >

          {/* NEGOCIO */}

          <View style={styles.businessCard}>
            <MaterialCommunityIcons
              name="storefront-outline"
              size={27}
              color="#333"
            />

            <View style={styles.businessInfo}>
              <Text style={styles.businessLabel}>
                Pedido de
              </Text>

              <Text style={styles.businessName}>
                {cart.negocioNombre}
              </Text>
            </View>
          </View>

          {/* PRODUCTOS */}

          <Text style={styles.sectionTitle}>
            Resumen de productos
          </Text>

          {items.map((item) => (
            <View
              key={item.productoId}
              style={styles.itemRow}
            >
              <View style={styles.quantityBox}>
                <Text style={styles.quantityText}>
                  {item.cantidad}x
                </Text>
              </View>

              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>
                  {item.nombre}
                </Text>

                <Text style={styles.itemUnitPrice}>
                  ${item.precio.toFixed(2)} c/u
                </Text>
              </View>

              <Text style={styles.itemSubtotal}>
                ${item.subtotal.toFixed(2)}
              </Text>
            </View>
          ))}

          {/* ENTREGA */}

          <Text style={styles.sectionTitle}>
            Entrega
          </Text>

          <Pressable
            style={styles.optionCard}
            onPress={abrirDireccion}
          >
            <View style={styles.optionIcon}>
              <MaterialCommunityIcons
                name="map-marker-outline"
                size={27}
                color="#555"
              />
            </View>

            <View style={styles.optionInfo}>
              <Text style={styles.optionTitle}>
                Dirección de entrega
              </Text>

              <Text
                style={[
                  styles.optionText,
                  direccion &&
                    styles.optionTextSelected,
                ]}
                numberOfLines={2}
              >
                {direccion ||
                  "Seleccionar dirección"}
              </Text>
            </View>

            <MaterialCommunityIcons
              name="chevron-right"
              size={25}
              color="#999"
            />
          </Pressable>

          {/* REFERENCIA */}

          <Pressable
            style={styles.optionCard}
            onPress={abrirReferencia}
          >
            <View style={styles.optionIcon}>
              <MaterialCommunityIcons
                name="note-text-outline"
                size={27}
                color="#555"
              />
            </View>

            <View style={styles.optionInfo}>
              <Text style={styles.optionTitle}>
                Referencia
              </Text>

              <Text
                style={[
                  styles.optionText,
                  referencia &&
                    styles.optionTextSelected,
                ]}
                numberOfLines={2}
              >
                {referencia ||
                  "Agregar una referencia"}
              </Text>
            </View>

            <MaterialCommunityIcons
              name="chevron-right"
              size={25}
              color="#999"
            />
          </Pressable>

          {/* PAGO */}

          <Text style={styles.sectionTitle}>
            Método de pago
          </Text>

          <Pressable
            style={styles.optionCard}
            onPress={() =>
              setModalActivo("pago")
            }
          >
            <View style={styles.optionIcon}>
              <MaterialCommunityIcons
                name={
                  metodoPago === "Efectivo"
                    ? "cash"
                    : metodoPago === "Transferencia bancaria"
                    ? "bank-transfer"
                    : "credit-card-outline"
                }
                size={27}
                color="#555"
              />
            </View>

            <View style={styles.optionInfo}>
              <Text style={styles.optionTitle}>
                Método de pago
              </Text>

              <Text
                style={[
                  styles.optionText,
                  metodoPago &&
                    styles.optionTextSelected,
                ]}
              >
                {metodoPago ||
                  "Seleccionar método de pago"}
              </Text>
            </View>

            <MaterialCommunityIcons
              name="chevron-right"
              size={25}
              color="#999"
            />
          </Pressable>

          {/* RESUMEN */}

          <View style={styles.summaryCard}>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>
                Subtotal
              </Text>

              <Text style={styles.summaryValue}>
                ${subtotal.toFixed(2)}
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>
                Costo de envío
              </Text>

              {cargandoEnvio ? (
                <ActivityIndicator
                  size="small"
                  color="#555"
                />
              ) : (
                <Text style={styles.summaryValue}>
                  {costoEntrega > 0
                    ? `$${costoEntrega.toFixed(2)}`
                    : "Gratis"}
                </Text>
              )}
            </View>

            <View style={styles.divider} />

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>
                Total
              </Text>

              <Text style={styles.totalValue}>
                ${total.toFixed(2)}
              </Text>
            </View>
          </View>

          {/* CONFIRMAR */}

          <Pressable
            style={[
              styles.confirmButton,
              confirmando &&
                styles.confirmButtonDisabled,
            ]}
            onPress={confirmarPedido}
            disabled={confirmando}
          >
            {confirmando ? (
              <ActivityIndicator
                size="small"
                color="#fff"
              />
            ) : (
              <MaterialCommunityIcons
                name="check-circle-outline"
                size={23}
                color="#fff"
              />
            )}

            <Text style={styles.confirmButtonText}>
              {confirmando
                ? "Creando pedido..."
                : "Confirmar pedido"}
            </Text>
          </Pressable>

          <View style={styles.bottomSpace} />

        </ScrollView>
      </View>

      {/* MODAL DIRECCIÓN */}

      <Modal
        visible={modalActivo === "direccion"}
        transparent
        animationType="slide"
        onRequestClose={() =>
          setModalActivo(null)
        }
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>

            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Dirección de entrega
              </Text>

              <Pressable
                onPress={() =>
                  setModalActivo(null)
                }
              >
                <MaterialCommunityIcons
                  name="close"
                  size={25}
                  color="#555"
                />
              </Pressable>
            </View>

            <Text style={styles.modalDescription}>
              Escribe la dirección completa donde deseas recibir tu pedido.
            </Text>

            <TextInput
              value={direccionTemporal}
              onChangeText={setDireccionTemporal}
              placeholder="Ej: Calle 10 y Av. Principal, casa #25"
              placeholderTextColor="#999"
              style={styles.input}
              multiline
              autoFocus
              returnKeyType="done"
            />

            <Pressable
              style={styles.modalButton}
              onPress={guardarDireccion}
            >
              <Text style={styles.modalButtonText}>
                Guardar dirección
              </Text>
            </Pressable>

          </View>
        </View>
      </Modal>

      {/* MODAL REFERENCIA */}

      <Modal
        visible={modalActivo === "referencia"}
        transparent
        animationType="slide"
        onRequestClose={() =>
          setModalActivo(null)
        }
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>

            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Referencia
              </Text>

              <Pressable
                onPress={() =>
                  setModalActivo(null)
                }
              >
                <MaterialCommunityIcons
                  name="close"
                  size={25}
                  color="#555"
                />
              </Pressable>
            </View>

            <Text style={styles.modalDescription}>
              Agrega información que ayude al repartidor a encontrar tu dirección.
            </Text>

            <TextInput
              value={referenciaTemporal}
              onChangeText={setReferenciaTemporal}
              placeholder="Ej: Casa de dos pisos, puerta blanca"
              placeholderTextColor="#999"
              style={[
                styles.input,
                styles.inputMultiline,
              ]}
              multiline
              numberOfLines={4}
              autoFocus
            />

            <Pressable
              style={styles.modalButton}
              onPress={guardarReferencia}
            >
              <Text style={styles.modalButtonText}>
                Guardar referencia
              </Text>
            </Pressable>

          </View>
        </View>
      </Modal>

      {/* MODAL PAGO */}

      <Modal
        visible={modalActivo === "pago"}
        transparent
        animationType="slide"
        onRequestClose={() =>
          setModalActivo(null)
        }
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>

            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Método de pago
              </Text>

              <Pressable
                onPress={() =>
                  setModalActivo(null)
                }
              >
                <MaterialCommunityIcons
                  name="close"
                  size={25}
                  color="#555"
                />
              </Pressable>
            </View>

            <Pressable
              style={styles.paymentOption}
              onPress={() =>
                seleccionarPago("Efectivo")
              }
            >
              <View style={styles.paymentIcon}>
                <MaterialCommunityIcons
                  name="cash"
                  size={26}
                  color="#333"
                />
              </View>

              <View style={styles.paymentInfo}>
                <Text style={styles.paymentTitle}>
                  Efectivo
                </Text>

                <Text style={styles.paymentDescription}>
                  Paga al recibir tu pedido.
                </Text>
              </View>

              {metodoPago === "Efectivo" && (
                <MaterialCommunityIcons
                  name="check-circle"
                  size={25}
                  color="#222"
                />
              )}
            </Pressable>

            <Pressable
              style={styles.paymentOption}
              onPress={() =>
                seleccionarPago(
                  "Transferencia bancaria"
                )
              }
            >
              <View style={styles.paymentIcon}>
                <MaterialCommunityIcons
                  name="bank-transfer"
                  size={26}
                  color="#333"
                />
              </View>

              <View style={styles.paymentInfo}>
                <Text style={styles.paymentTitle}>
                  Transferencia bancaria
                </Text>

                <Text style={styles.paymentDescription}>
                  Realiza una transferencia según las instrucciones del negocio.
                </Text>
              </View>

              {metodoPago ===
                "Transferencia bancaria" && (
                <MaterialCommunityIcons
                  name="check-circle"
                  size={25}
                  color="#222"
                />
              )}
            </Pressable>

          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f7f7",
  },

  mainContainer: {
    flex: 1,
  },

  scroll: {
    flex: 1,
  },

  content: {
    padding: 16,
    paddingBottom: 130,
  },

  header: {
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },

  headerButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#222",
  },

  headerSpace: {
    width: 40,
  },

  businessCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 14,
    marginBottom: 22,
  },

  businessInfo: {
    marginLeft: 12,
  },

  businessLabel: {
    fontSize: 12,
    color: "#888",
  },

  businessName: {
    fontSize: 17,
    fontWeight: "700",
    color: "#222",
    marginTop: 2,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#222",
    marginBottom: 12,
    marginTop: 4,
  },

  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
  },

  quantityBox: {
    width: 42,
    height: 36,
    borderRadius: 9,
    backgroundColor: "#eee",
    alignItems: "center",
    justifyContent: "center",
  },

  quantityText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#222",
  },

  itemInfo: {
    flex: 1,
    marginLeft: 12,
  },

  itemName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#222",
  },

  itemUnitPrice: {
    fontSize: 12,
    color: "#777",
    marginTop: 3,
  },

  itemSubtotal: {
    fontSize: 15,
    fontWeight: "700",
    color: "#222",
    marginLeft: 8,
  },

  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 14,
    marginBottom: 10,
  },

  optionIcon: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: "#eee",
    alignItems: "center",
    justifyContent: "center",
  },

  optionInfo: {
    flex: 1,
    marginLeft: 12,
  },

  optionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#222",
  },

  optionText: {
    fontSize: 13,
    color: "#888",
    marginTop: 3,
  },

  optionTextSelected: {
    color: "#222",
    fontWeight: "600",
  },

  summaryCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginTop: 10,
  },

  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
  },

  summaryLabel: {
    fontSize: 15,
    color: "#666",
  },

  summaryValue: {
    fontSize: 15,
    fontWeight: "600",
    color: "#222",
  },

  divider: {
    height: 1,
    backgroundColor: "#eee",
    marginVertical: 4,
  },

  totalLabel: {
    fontSize: 18,
    fontWeight: "700",
    color: "#222",
  },

  totalValue: {
    fontSize: 20,
    fontWeight: "800",
    color: "#222",
  },

  confirmButton: {
    height: 55,
    borderRadius: 14,
    backgroundColor: "#222",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 20,
  },

  confirmButtonDisabled: {
    opacity: 0.7,
  },

  confirmButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },

  bottomSpace: {
    height: 80,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },

  modalCard: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 35,
  },

  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  modalTitle: {
    fontSize: 21,
    fontWeight: "700",
    color: "#222",
  },

  modalDescription: {
    fontSize: 14,
    color: "#777",
    lineHeight: 20,
    marginBottom: 15,
  },

  input: {
    minHeight: 55,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 13,
    fontSize: 15,
    color: "#222",
    backgroundColor: "#fafafa",
    marginBottom: 15,
  },

  inputMultiline: {
    minHeight: 110,
    textAlignVertical: "top",
  },

  modalButton: {
    height: 52,
    borderRadius: 13,
    backgroundColor: "#222",
    alignItems: "center",
    justifyContent: "center",
  },

  modalButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },

  paymentOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },

  paymentIcon: {
    width: 45,
    height: 45,
    borderRadius: 12,
    backgroundColor: "#eee",
    alignItems: "center",
    justifyContent: "center",
  },

  paymentInfo: {
    flex: 1,
    marginLeft: 13,
    marginRight: 10,
  },

  paymentTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#222",
  },

  paymentDescription: {
    fontSize: 13,
    color: "#777",
    marginTop: 4,
    lineHeight: 18,
  },

  emptyContainer: {
    flex: 1,
    backgroundColor: "#f7f7f7",
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
  },

  emptyTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#222",
    marginTop: 18,
  },

  emptyText: {
    fontSize: 15,
    color: "#777",
    textAlign: "center",
    marginTop: 8,
    lineHeight: 22,
  },

  backButton: {
    backgroundColor: "#222",
    paddingHorizontal: 25,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 25,
  },

  backButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
});
