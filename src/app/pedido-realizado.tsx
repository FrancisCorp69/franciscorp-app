import React from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";

export default function PedidoRealizadoScreen() {
  const params = useLocalSearchParams<{
    orderId?: string;
  }>();

  const orderId = String(
    params.orderId || ""
  );

  return (
    <View style={styles.container}>

      <View style={styles.iconCircle}>
        <MaterialCommunityIcons
          name="check"
          size={65}
          color="#fff"
        />
      </View>

      <Text style={styles.title}>
        ¡Pedido realizado!
      </Text>

      <Text style={styles.description}>
        Tu pedido fue registrado correctamente.
      </Text>

      <View style={styles.orderCard}>
        <Text style={styles.orderLabel}>
          Número de pedido
        </Text>

        <Text style={styles.orderId}>
          #{orderId}
        </Text>

        <Text style={styles.orderInfo}>
          Puedes consultar el estado de tu pedido en cualquier momento.
        </Text>
      </View>

      <Pressable
        style={styles.trackButton}
        onPress={() =>
          router.replace({
            pathname: "/pedidos",
            params: {
              orderId,
            },
          })
        }
      >
        <MaterialCommunityIcons
          name="map-marker-path"
          size={23}
          color="#fff"
        />

        <Text style={styles.trackButtonText}>
          Ver estado del pedido
        </Text>
      </Pressable>

      <Pressable
        style={styles.homeButton}
        onPress={() =>
          router.replace("/cliente")
        }
      >
        <Text style={styles.homeButtonText}>
          Volver al inicio
        </Text>
      </Pressable>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f7f7",
    alignItems: "center",
    justifyContent: "center",
    padding: 25,
  },

  iconCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "#222",
    alignItems: "center",
    justifyContent: "center",
  },

  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#222",
    marginTop: 25,
    textAlign: "center",
  },

  description: {
    fontSize: 16,
    color: "#777",
    marginTop: 8,
    textAlign: "center",
  },

  orderCard: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginTop: 30,
    alignItems: "center",
  },

  orderLabel: {
    fontSize: 13,
    color: "#888",
  },

  orderId: {
    fontSize: 20,
    fontWeight: "800",
    color: "#222",
    marginTop: 5,
  },

  orderInfo: {
    fontSize: 13,
    color: "#777",
    textAlign: "center",
    lineHeight: 19,
    marginTop: 12,
  },

  trackButton: {
    width: "100%",
    height: 55,
    borderRadius: 14,
    backgroundColor: "#222",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 20,
  },

  trackButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },

  homeButton: {
    marginTop: 15,
    paddingVertical: 12,
  },

  homeButtonText: {
    color: "#555",
    fontSize: 15,
    fontWeight: "600",
  },
});
