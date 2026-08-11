import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

interface FeaturedBusinessesProps {
  businesses: any[];
}

export default function FeaturedBusinesses({
  businesses,
}: FeaturedBusinessesProps) {
  const abrirNegocio = (business: any) => {
    console.log("ABRIENDO NEGOCIO:", business.nombre);
    console.log("ID DEL NEGOCIO:", business.id);

    router.push({
      pathname: "/negocio",
      params: {
        id: String(business.id || ""),
        nombre: String(business.nombre || ""),
        categoria: String(business.categoria || ""),
        descripcion: String(business.descripcion || ""),
        direccion: String(business.direccion || ""),
        ciudad: String(business.ciudad || ""),
        foto: String(business.foto || ""),
        calificacion: String(business.calificacion || ""),
        costoEntrega: String(business.costoEntrega || ""),
        tiempoEntrega: String(business.tiempoEntrega || ""),
      },
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Negocios destacados</Text>

      {businesses.length === 0 ? (
        <View style={styles.emptyBox}>
          <MaterialCommunityIcons name="store-outline" size={40} color="#999" />

          <Text style={styles.emptyText}>No hay negocios disponibles.</Text>
        </View>
      ) : (
        businesses.map((business) => (
          <View key={business.id} style={styles.card}>
            {/* IMAGEN */}
            {business.foto ? (
              <Image source={{ uri: business.foto }} style={styles.image} />
            ) : (
              <View style={styles.logo}>
                <MaterialCommunityIcons
                  name="store"
                  size={34}
                  color="#0066CC"
                />
              </View>
            )}

            {/* INFORMACIÓN */}
            <View style={styles.info}>
              <Text style={styles.name}>{business.nombre}</Text>

              <Text style={styles.category}>{business.categoria}</Text>

              {business.descripcion ? (
                <Text style={styles.description} numberOfLines={2}>
                  {business.descripcion}
                </Text>
              ) : null}

              <Text style={styles.address}>
                📍 {business.direccion}
                {business.ciudad ? `, ${business.ciudad}` : ""}
              </Text>

              <View style={styles.details}>
                <Text style={styles.detail}>
                  ⭐ {business.calificacion || "0"}
                </Text>

                <Text style={styles.detail}>
                  🚚 ${business.costoEntrega || "0"}
                </Text>

                <Text style={styles.detail}>
                  ⏱ {business.tiempoEntrega || "0"} min
                </Text>
              </View>

              {/* BOTÓN */}
              <Pressable
                style={styles.button}
                onPress={() => abrirNegocio(business)}
              >
                <Text style={styles.buttonText}>Ver negocio</Text>
              </Pressable>
            </View>
          </View>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 30,
  },

  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#222",
    marginBottom: 15,
  },

  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 12,
    marginBottom: 18,
    alignItems: "center",

    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: {
      width: 0,
      height: 2,
    },

    elevation: 3,
  },

  logo: {
    width: 60,
    height: 60,
    borderRadius: 14,
    backgroundColor: "#F4F8FF",
    justifyContent: "center",
    alignItems: "center",
  },

  image: {
    width: 60,
    height: 60,
    borderRadius: 14,
  },

  info: {
    flex: 1,
    marginLeft: 12,
  },

  name: {
    fontSize: 18,
    fontWeight: "700",
    color: "#222",
  },

  category: {
    color: "#0066CC",
    fontWeight: "600",
    marginTop: 3,
    textTransform: "capitalize",
  },

  description: {
    marginTop: 6,
    color: "#666",
  },

  address: {
    marginTop: 6,
    color: "#555",
    fontSize: 13,
  },

  details: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 10,
  },

  detail: {
    marginRight: 15,
    color: "#444",
    fontSize: 13,
  },

  button: {
    marginTop: 14,
    backgroundColor: "#0066CC",
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },

  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },

  emptyBox: {
    padding: 25,
    backgroundColor: "#F7F7F7",
    borderRadius: 16,
    alignItems: "center",
  },

  emptyText: {
    marginTop: 8,
    color: "#777",
    fontSize: 14,
  },
});
