import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";

const servicios = [
  {
    id: "delivery",
    nombre: "Delivery",
    icono: "ðŸšš",
    ruta: "/servicios/delivery",
  },
  {
    id: "expreso",
    nombre: "Expreso",
    icono: "ðŸš•",
    ruta: "/expreso",
  },
  {
    id: "compras",
    nombre: "Compras",
    icono: "ðŸ›’",
    ruta: "/servicios",
  },
  {
    id: "farmacia",
    nombre: "Farmacia",
    icono: "ðŸ’Š",
    ruta: "/farmacia",
  },
  {
    id: "tiendas",
    nombre: "Tiendas",
    icono: "ðŸª",
    ruta: "/empresa",
  },
  {
    id: "flete",
    nombre: "Flete",
    icono: "ðŸ“¦",
    ruta: "/flete",
  },
  {
    id: "empleo",
    nombre: "Empleo",
    icono: "ðŸ’¼",
    ruta: "/empleo",
  },
  {
    id: "servicios",
    nombre: "Servicios",
    icono: "ðŸ› ï¸",
    ruta: "/servicios",
  },
  {
    id: "restaurantes",
    nombre: "Restaurantes",
    icono: "ðŸ½ï¸",
    ruta: "/restaurantes",
  },
  {
    id: "grua",
    nombre: "GrÃºa",
    icono: "ðŸš—",
    ruta: null,
  },
  {
    id: "salud",
    nombre: "Salud",
    icono: "âš•ï¸",
    ruta: null,
  },
  {
    id: "ambulancia",
    nombre: "Ambulancia",
    icono: "ðŸš‘",
    ruta: null,
  },
];

export default function ServicesGrid() {
  const abrirServicio = (ruta: string | null) => {
    if (!ruta) return;
    router.push(ruta as any);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Servicios</Text>

      <View style={styles.grid}>
        {servicios.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.card}
            onPress={() => abrirServicio(item.ruta)}
            activeOpacity={0.8}
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
    minHeight: 95,
    backgroundColor: "#ffffff",
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,

    elevation: 3,

    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 5,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  icono: {
    fontSize: 32,
    marginBottom: 6,
  },

  nombre: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
});



