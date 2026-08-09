import { router } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const servicios = [
  {
    id: "delivery",
    nombre: "Delivery",
    icono: "🚚",
    ruta: "/servicios",
  },
  {
    id: "expreso",
    nombre: "Expreso",
    icono: "🚕",
    ruta: "/expreso",
  },
  {
    id: "compras",
    nombre: "Compras",
    icono: "🛒",
    ruta: "/servicios",
  },
  {
    id: "farmacia",
    nombre: "Farmacia",
    icono: "💊",
    ruta: "/farmacia",
  },
  {
    id: "tiendas",
    nombre: "Tiendas",
    icono: "🏪",
    ruta: "/empresa",
  },
  {
    id: "flete",
    nombre: "Flete",
    icono: "📦",
    ruta: "/flete",
  },
  {
    id: "empleo",
    nombre: "Empleo",
    icono: "💼",
    ruta: "/empleo",
  },
  {
    id: "servicios",
    nombre: "Servicios",
    icono: "🛠️",
    ruta: "/servicios",
  },
];

export default function ServicesGrid() {
  const abrirServicio = (ruta: string) => {
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
            activeOpacity={0.8}
            onPress={() => abrirServicio(item.ruta)}
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
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
});
