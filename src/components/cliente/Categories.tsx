import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const categorias = [
  {
    id: "restaurantes",
    nombre: "Restaurantes",
    icono: "🍔",
  },
  {
    id: "tiendas",
    nombre: "Tiendas",
    icono: "🏪",
  },
  {
    id: "farmacia",
    nombre: "Farmacia",
    icono: "💊",
  },
  {
    id: "servicios",
    nombre: "Servicios",
    icono: "🛠️",
  },
  {
    id: "empleo",
    nombre: "Empleo",
    icono: "💼",
  },
  {
    id: "salud",
    nombre: "Salud",
    icono: "❤️",
  },
];

export default function Categories() {
  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Categorías</Text>

      <View style={styles.grid}>
        {categorias.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.card}
            onPress={() => {
              console.log("Categoría seleccionada:", item.nombre);
            }}
          >
            <Text style={styles.icono}>{item.icono}</Text>

            <Text style={styles.nombre}>{item.nombre}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    paddingHorizontal: 16,
    marginBottom: 30,
  },

  titulo: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 12,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  card: {
    width: "31%",
    height: 95,
    backgroundColor: "#ffffff",
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    elevation: 3,
  },

  icono: {
    fontSize: 32,
    marginBottom: 6,
  },

  nombre: {
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
  },
});
