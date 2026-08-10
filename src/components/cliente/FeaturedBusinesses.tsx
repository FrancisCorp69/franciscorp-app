import { StyleSheet, Text, View } from "react-native";

interface FeaturedBusinessesProps {
  businesses: any[];
}

export default function FeaturedBusinesses({
  businesses,
}: FeaturedBusinessesProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>NEGOCIOS DESTACADOS - PRUEBA</Text>

      <Text style={styles.info}>Negocios recibidos: {businesses.length}</Text>

      {businesses.map((business) => (
        <View key={business.id} style={styles.card}>
          <Text style={styles.name}>
            {business.nombre || "Negocio sin nombre"}
          </Text>

          <Text>{business.categoria || "Sin categoría"}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    marginHorizontal: 16,
    padding: 16,
    backgroundColor: "#eeeeee",
    borderRadius: 16,
  },

  title: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 10,
  },

  info: {
    fontSize: 16,
    marginBottom: 10,
  },

  card: {
    backgroundColor: "#ffffff",
    padding: 15,
    borderRadius: 12,
    marginTop: 10,
  },

  name: {
    fontSize: 18,
    fontWeight: "700",
  },
});
