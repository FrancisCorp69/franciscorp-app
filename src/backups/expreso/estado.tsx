import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";

export default function EstadoExpresoScreen() {
  const estadoActual = "buscando";

  const mostrarMensaje = () => {
    Alert.alert(
      "Proximo paso",
      "Aqui conectaremos las solicitudes y ofertas reales de los Expresos mediante Firebase."
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Estado de mi Expreso</Text>
        <Text style={styles.headerSubtitle}>
          Consulta el estado de tu solicitud y las ofertas recibidas.
        </Text>
      </View>

      <View style={styles.estadoCard}>
        <View style={styles.iconCircle}>
          <Text style={styles.icon}>🔎</Text>
        </View>

        <Text style={styles.estadoTitle}>Buscando Expresos</Text>

        <Text style={styles.estadoDescription}>
          Estamos buscando Expresos disponibles para tu viaje.
        </Text>

        <View style={styles.loadingBar}>
          <View style={styles.loadingProgress} />
        </View>

        <Text style={styles.estadoInfo}>
          Cuando un Expreso responda, su oferta aparecera aqui.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>📋 Resumen de la solicitud</Text>

        <View style={styles.row}>
          <Text style={styles.label}>Origen</Text>
          <Text style={styles.value}>Pendiente</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Destino</Text>
          <Text style={styles.value}>Pendiente</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Pasajeros</Text>
          <Text style={styles.value}>1</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Tu oferta</Text>
          <Text style={styles.price}>$0.00</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>🚗 Ofertas de Expresos</Text>

        <View style={styles.emptyOffer}>
          <Text style={styles.emptyIcon}>🚕</Text>

          <Text style={styles.emptyTitle}>
            Aun no hay ofertas
          </Text>

          <Text style={styles.emptyDescription}>
            Cuando los Expresos disponibles respondan a tu solicitud,
            podras comparar sus ofertas y elegir el que prefieras.
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() => router.back()}
      >
        <Text style={styles.secondaryButtonText}>
          Volver
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.testButton}
        onPress={mostrarMensaje}
      >
        <Text style={styles.testButtonText}>
          Informacion del sistema
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  content: {
    paddingBottom: 40,
  },
  header: {
    backgroundColor: "#111111",
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 24,
  },
  headerTitle: {
    color: "#D4AF37",
    fontSize: 25,
    fontWeight: "800",
  },
  headerSubtitle: {
    color: "#ffffff",
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
  },
  estadoCard: {
    backgroundColor: "#ffffff",
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 22,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000000",
    shadowOpacity: 0.08,
    shadowRadius: 5,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#fff8df",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  icon: {
    fontSize: 34,
  },
  estadoTitle: {
    color: "#222222",
    fontSize: 21,
    fontWeight: "800",
  },
  estadoDescription: {
    color: "#666666",
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    marginTop: 8,
  },
  loadingBar: {
    width: "100%",
    height: 7,
    backgroundColor: "#eeeeee",
    borderRadius: 5,
    marginTop: 20,
    overflow: "hidden",
  },
  loadingProgress: {
    width: "45%",
    height: "100%",
    backgroundColor: "#D4AF37",
    borderRadius: 5,
  },
  estadoInfo: {
    color: "#888888",
    fontSize: 12,
    textAlign: "center",
    marginTop: 12,
  },
  card: {
    backgroundColor: "#ffffff",
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 14,
    padding: 18,
    elevation: 2,
    shadowColor: "#000000",
    shadowOpacity: 0.08,
    shadowRadius: 5,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },
  sectionTitle: {
    color: "#222222",
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 16,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: "#eeeeee",
  },
  label: {
    color: "#777777",
    fontSize: 14,
  },
  value: {
    color: "#222222",
    fontSize: 14,
    fontWeight: "700",
    maxWidth: "60%",
    textAlign: "right",
  },
  price: {
    color: "#D4AF37",
    fontSize: 17,
    fontWeight: "800",
  },
  emptyOffer: {
    alignItems: "center",
    paddingVertical: 15,
  },
  emptyIcon: {
    fontSize: 36,
    marginBottom: 10,
  },
  emptyTitle: {
    color: "#333333",
    fontSize: 16,
    fontWeight: "800",
  },
  emptyDescription: {
    color: "#777777",
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
    marginTop: 8,
  },
  secondaryButton: {
    marginHorizontal: 16,
    marginTop: 20,
    backgroundColor: "#111111",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
  testButton: {
    marginHorizontal: 16,
    marginTop: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  testButtonText: {
    color: "#888888",
    fontSize: 12,
  },
});
