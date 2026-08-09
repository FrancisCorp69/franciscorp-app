import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import {
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";

export default function NegocioScreen() {
  const params = useLocalSearchParams();

  const nombre = String(params.nombre || "Negocio");
  const categoria = String(params.categoria || "Negocio");
  const descripcion = String(params.descripcion || "Información del negocio.");
  const direccion = String(params.direccion || "Dirección no disponible");
  const ciudad = String(params.ciudad || "");
  const foto = String(params.foto || "");
  const calificacion = String(params.calificacion || "0");
  const costoEntrega = String(params.costoEntrega || "0");
  const tiempoEntrega = String(params.tiempoEntrega || "0");

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Pressable style={styles.backButton} onPress={() => router.back()}>
        <MaterialCommunityIcons name="arrow-left" size={26} color="#222" />

        <Text style={styles.backText}>Volver</Text>
      </Pressable>

      {foto ? (
        <Image source={{ uri: foto }} style={styles.cover} />
      ) : (
        <View style={styles.coverPlaceholder}>
          <MaterialCommunityIcons name="store" size={70} color="#0066CC" />
        </View>
      )}

      <View style={styles.content}>
        <Text style={styles.name}>{nombre}</Text>

        <Text style={styles.category}>{categoria}</Text>

        <Text style={styles.description}>{descripcion}</Text>

        <View style={styles.infoBox}>
          <View style={styles.infoRow}>
            <MaterialCommunityIcons
              name="map-marker"
              size={22}
              color="#0066CC"
            />

            <Text style={styles.infoText}>
              {direccion}
              {ciudad ? `, ${ciudad}` : ""}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="star" size={22} color="#F5A623" />

            <Text style={styles.infoText}>Calificación: {calificacion}</Text>
          </View>

          <View style={styles.infoRow}>
            <MaterialCommunityIcons
              name="truck-delivery"
              size={22}
              color="#0066CC"
            />

            <Text style={styles.infoText}>
              Costo de entrega: ${costoEntrega}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <MaterialCommunityIcons
              name="clock-outline"
              size={22}
              color="#0066CC"
            />

            <Text style={styles.infoText}>
              Tiempo estimado: {tiempoEntrega} min
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Productos y servicios</Text>

        <View style={styles.emptyBox}>
          <MaterialCommunityIcons name="food-outline" size={42} color="#999" />

          <Text style={styles.emptyTitle}>Próximamente</Text>

          <Text style={styles.emptyText}>
            Aquí mostraremos los productos y servicios de este negocio.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  backButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 12,
  },

  backText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "600",
    color: "#222",
  },

  cover: {
    width: "100%",
    height: 220,
    backgroundColor: "#F4F8FF",
  },

  coverPlaceholder: {
    width: "100%",
    height: 220,
    backgroundColor: "#F4F8FF",
    justifyContent: "center",
    alignItems: "center",
  },

  content: {
    padding: 20,
  },

  name: {
    fontSize: 28,
    fontWeight: "700",
    color: "#222",
  },

  category: {
    marginTop: 5,
    fontSize: 16,
    fontWeight: "600",
    color: "#0066CC",
    textTransform: "capitalize",
  },

  description: {
    marginTop: 14,
    fontSize: 16,
    lineHeight: 23,
    color: "#666",
  },

  infoBox: {
    marginTop: 20,
    padding: 16,
    backgroundColor: "#F7F9FC",
    borderRadius: 16,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },

  infoText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: "#444",
  },

  sectionTitle: {
    marginTop: 28,
    marginBottom: 14,
    fontSize: 21,
    fontWeight: "700",
    color: "#222",
  },

  emptyBox: {
    padding: 25,
    borderRadius: 16,
    backgroundColor: "#F7F7F7",
    alignItems: "center",
  },

  emptyTitle: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: "700",
    color: "#555",
  },

  emptyText: {
    marginTop: 6,
    textAlign: "center",
    fontSize: 14,
    lineHeight: 20,
    color: "#888",
  },
});
