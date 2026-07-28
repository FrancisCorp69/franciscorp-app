import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

interface FeaturedBusinessesProps {
  businesses: any[];
}

export default function FeaturedBusinesses({
  businesses,
}: FeaturedBusinessesProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>
        NEGOCIOS DESTACADOS 999
      </Text>

      {businesses.map((business) => (
        <Pressable
          key={business.id}
          style={styles.card}
          onPress={() => {
            console.log("Abrir negocio:", business.nombre);
          }}
        >
          {business.foto ? (
            <Image
              source={{ uri: business.foto }}
              style={styles.image}
            />
          ) : (
            <View style={styles.logo}>
              <MaterialCommunityIcons
                name="store"
                size={34}
                color="#0066CC"
              />
            </View>
          )}

          <View style={styles.info}>
            <Text style={styles.name}>
              {business.nombre}
            </Text>

            <Text style={styles.category}>
              {business.categoria}
            </Text>

            <Text style={styles.description}>
              {business.descripcion}
            </Text>

            <Text style={styles.address}>
              📍 {business.direccion}, {business.ciudad}
            </Text>

            <View style={styles.details}>
              <Text style={styles.detail}>
                ⭐ {business.calificacion}
              </Text>

              <Text style={styles.detail}>
                🚚 ${business.costoEntrega}
              </Text>

              <Text style={styles.detail}>
                ⏱ {business.tiempoEntrega} min
              </Text>
            </View>

            <Pressable
              style={styles.button}
              onPress={() => {
                console.log("Ver negocio:", business.nombre);
              }}
            >
              <Text style={styles.buttonText}>
                Ver negocio
              </Text>
            </Pressable>
          </View>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
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
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: "center",
  },

  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
});