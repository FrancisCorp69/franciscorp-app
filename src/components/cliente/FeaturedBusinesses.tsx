import { MaterialCommunityIcons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

interface FeaturedBusinessesProps {
  businesses: any[];
}

export default function FeaturedBusinesses({
  businesses,
}: FeaturedBusinessesProps) {
    console.log("DATOS EN FEATURED:", businesses);
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>
        Negocios destacados
      </Text>

      {businesses.map((business) => (
        <View
          style={styles.card}
          key={business.id}
        >

          <View style={styles.logo}>
            <MaterialCommunityIcons
              name="store"
              size={34}
              color="#0066CC"
            />
          </View>


          <View style={styles.info}>

            <Text style={styles.name}>
              {business.nombre}
            </Text>


            <Text style={styles.description}>
              {business.descripcion}
            </Text>


            <Text style={styles.address}>
              📍 {business.direccion}
            </Text>


            <View style={styles.details}>

              <Text style={styles.detail}>
                🚚 {business.tiempoEntrega} min
              </Text>


              <Text style={styles.detail}>
                💵 ${business.costoEntrega}
              </Text>


              <Text style={styles.detail}>
                ⭐ {business.totalCalificaciones || 0}
              </Text>

            </View>

          </View>

        </View>
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
    padding: 16,
    alignItems: "center",
    marginBottom: 15,

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
    width: 70,
    height: 70,
    borderRadius: 16,
    backgroundColor: "#F4F8FF",

    justifyContent: "center",
    alignItems: "center",
  },


  info: {
    flex: 1,
    marginLeft: 15,
  },


  name: {
    fontSize: 18,
    fontWeight: "700",
    color: "#222",
  },


  description: {
    marginTop: 5,
    color: "#666",
    fontSize: 14,
  },


  address: {
    marginTop: 5,
    color: "#555",
    fontSize: 13,
  },


  details: {
    flexDirection: "row",
    marginTop: 10,
  },


  detail: {
    marginRight: 15,
    fontSize: 13,
    color: "#444",
  },

});