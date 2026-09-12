import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";

export default function ExpresoServiciosScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🚗 Servicios Expreso</Text>
        <Text style={styles.headerSubtitle}>
          Solicita un Expreso para transportar paquetes, documentos o productos.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>📦 Solicitar un servicio</Text>

        <Text style={styles.cardDescription}>
          Encuentra un Expreso disponible para realizar tu servicio de forma
          rápida y segura.
        </Text>

        <TouchableOpacity
          style={styles.boton}
          onPress={() => router.push("/servicios/expreso/solicitar")}
        >
          <Text style={styles.botonTexto}>Solicitar Expreso</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>📋 Mis servicios</Text>

        <Text style={styles.cardDescription}>
          Aquí podrás consultar tus solicitudes de Expreso y revisar su estado.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    padding: 16,
  },

  header: {
    marginBottom: 20,
  },

  headerTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: "#222",
    marginBottom: 8,
  },

  headerSubtitle: {
    fontSize: 15,
    color: "#666",
    lineHeight: 22,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 18,
    marginBottom: 16,
    elevation: 3,
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  cardTitle: {
    fontSize: 19,
    fontWeight: "700",
    color: "#222",
    marginBottom: 10,
  },

  cardDescription: {
    fontSize: 15,
    color: "#666",
    lineHeight: 22,
    marginBottom: 16,
  },

  boton: {
    backgroundColor: "#D4AF37",
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: "center",
  },

  botonTexto: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
