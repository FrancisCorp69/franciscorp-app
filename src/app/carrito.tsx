import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useCart } from "../context/CartContext";

export default function CarritoScreen() {
  const {
    cart,
    items,
    subtotal,
    aumentarCantidad,
    disminuirCantidad,
    eliminarProducto,
  } = useCart();

  if (!cart || items.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <MaterialCommunityIcons name="cart-outline" size={80} color="#999" />

        <Text style={styles.emptyTitle}>Tu carrito está vacío</Text>

        <Text style={styles.emptyText}>
          Agrega productos de un negocio para comenzar tu pedido.
        </Text>

        <Pressable
          style={styles.backHomeButton}
          onPress={() => router.push("/cliente")}
        >
          <Text style={styles.backHomeButtonText}>Explorar negocios</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={25} color="#222" />
        </Pressable>

        <Text style={styles.headerTitle}>Mi carrito</Text>

        <View style={styles.headerSpace} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* NEGOCIO */}
        <View style={styles.businessCard}>
          <MaterialCommunityIcons
            name="storefront-outline"
            size={25}
            color="#333"
          />

          <View style={styles.businessInfo}>
            <Text style={styles.businessLabel}>Pedido de</Text>

            <Text style={styles.businessName}>{cart.negocioNombre}</Text>
          </View>
        </View>

        {/* PRODUCTOS */}
        <Text style={styles.sectionTitle}>Productos</Text>

        {items.map((item) => (
          <View key={item.productoId} style={styles.itemCard}>
            {/* IMAGEN */}
            <View style={styles.imageContainer}>
              {item.foto ? (
                <Image
                  source={{ uri: item.foto }}
                  style={styles.productImage}
                />
              ) : (
                <MaterialCommunityIcons
                  name="food-outline"
                  size={38}
                  color="#aaa"
                />
              )}
            </View>

            {/* INFORMACIÓN */}
            <View style={styles.itemInfo}>
              <Text style={styles.itemName} numberOfLines={2}>
                {item.nombre}
              </Text>

              <Text style={styles.itemPrice}>${item.precio.toFixed(2)}</Text>

              {/* CONTROLES */}
              <View style={styles.controlsRow}>
                <Pressable
                  style={styles.quantityButton}
                  onPress={() => disminuirCantidad(item.productoId)}
                >
                  <MaterialCommunityIcons name="minus" size={20} color="#222" />
                </Pressable>

                <Text style={styles.quantity}>{item.cantidad}</Text>

                <Pressable
                  style={styles.quantityButton}
                  onPress={() => aumentarCantidad(item.productoId)}
                >
                  <MaterialCommunityIcons name="plus" size={20} color="#222" />
                </Pressable>
              </View>
            </View>

            {/* SUBTOTAL + ELIMINAR */}
            <View style={styles.itemRight}>
              <Pressable onPress={() => eliminarProducto(item.productoId)}>
                <MaterialCommunityIcons
                  name="trash-can-outline"
                  size={22}
                  color="#c62828"
                />
              </Pressable>

              <Text style={styles.itemSubtotal}>
                ${item.subtotal.toFixed(2)}
              </Text>
            </View>
          </View>
        ))}

        {/* RESUMEN */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>

            <Text style={styles.summaryValue}>${subtotal.toFixed(2)}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total</Text>

            <Text style={styles.totalValue}>${subtotal.toFixed(2)}</Text>
          </View>
        </View>

        {/* BOTÓN FUTURO */}
        <Pressable
          style={styles.continueButton}
          onPress={() => router.push("/confirmar-pedido")}
        >
          <Text style={styles.continueButtonText}>Continuar con el pedido</Text>

          <MaterialCommunityIcons name="arrow-right" size={22} color="#fff" />
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f7f7",
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

  backButton: {
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

  content: {
    padding: 16,
    paddingBottom: 35,
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
  },

  itemCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
  },

  imageContainer: {
    width: 75,
    height: 75,
    borderRadius: 12,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  productImage: {
    width: "100%",
    height: "100%",
  },

  itemInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "space-between",
  },

  itemName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#222",
    paddingRight: 5,
  },

  itemPrice: {
    fontSize: 13,
    color: "#777",
    marginTop: 3,
  },

  controlsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },

  quantityButton: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: "#eee",
    alignItems: "center",
    justifyContent: "center",
  },

  quantity: {
    minWidth: 30,
    textAlign: "center",
    fontSize: 15,
    fontWeight: "700",
    color: "#222",
  },

  itemRight: {
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginLeft: 8,
  },

  itemSubtotal: {
    fontSize: 15,
    fontWeight: "700",
    color: "#222",
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
    marginVertical: 14,
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

  continueButton: {
    height: 52,
    borderRadius: 14,
    backgroundColor: "#222",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 18,
    gap: 8,
  },

  continueButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
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

  backHomeButton: {
    backgroundColor: "#222",
    paddingHorizontal: 25,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 25,
  },

  backHomeButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
});
