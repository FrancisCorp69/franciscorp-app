import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

type TipoNegocio = {
  id: string;
  nombre: string;
  descripcion: string;
  icono: keyof typeof MaterialCommunityIcons.glyphMap;
};

const tiposNegocio: TipoNegocio[] = [
  {
    id: "restaurante",
    nombre: "Restaurante",
    descripcion: "Comida, bebidas y productos preparados.",
    icono: "silverware-fork-knife",
  },
  {
    id: "tienda",
    nombre: "Tienda",
    descripcion: "Venta de productos de diferentes categorías.",
    icono: "storefront-outline",
  },
  {
    id: "farmacia",
    nombre: "Farmacia",
    descripcion: "Productos farmacéuticos y de cuidado personal.",
    icono: "pill",
  },
  {
    id: "servicios",
    nombre: "Servicios",
    descripcion: "Ofrece servicios profesionales o especializados.",
    icono: "tools",
  },
  {
    id: "transporte",
    nombre: "Transporte",
    descripcion: "Servicios de transporte y movilidad.",
    icono: "truck-outline",
  },
  {
    id: "empresa",
    nombre: "Empresa",
    descripcion: "Crea un espacio para representar tu empresa.",
    icono: "office-building-outline",
  },
  {
    id: "profesional",
    nombre: "Profesional",
    descripcion: "Ofrece tus conocimientos y servicios profesionales.",
    icono: "account-tie-outline",
  },
  {
    id: "otro",
    nombre: "Otro",
    descripcion: "Crea otro tipo de negocio.",
    icono: "plus-circle-outline",
  },
];

export default function CrearNegocioScreen() {
  const seleccionarTipo = (tipo: TipoNegocio) => {
    console.log("TIPO DE NEGOCIO SELECCIONADO:", tipo);

    router.push({
      pathname: "/crear-negocio",
      params: {
        tipo: tipo.id,
      },
    });
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* ================= ENCABEZADO ================= */}

      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={26} color="#222" />
        </Pressable>

        <View style={styles.headerText}>
          <Text style={styles.title}>Crear mi negocio</Text>

          <Text style={styles.subtitle}>
            Selecciona el tipo de negocio que deseas crear
          </Text>
        </View>
      </View>

      {/* ================= INFORMACIÓN ================= */}

      <View style={styles.infoBox}>
        <MaterialCommunityIcons
          name="information-outline"
          size={23}
          color="#0066CC"
        />

        <Text style={styles.infoText}>
          Puedes crear varios negocios dentro de FrancisCorp. Cada negocio
          tendrá su propia información, productos y servicios.
        </Text>
      </View>

      {/* ================= TIPOS DE NEGOCIO ================= */}

      <Text style={styles.sectionTitle}>¿Qué tipo de negocio crearás?</Text>

      <View style={styles.lista}>
        {tiposNegocio.map((tipo) => (
          <Pressable
            key={tipo.id}
            style={({ pressed }) => [
              styles.tipoCard,
              pressed && styles.tipoCardPressed,
            ]}
            onPress={() => seleccionarTipo(tipo)}
          >
            <View style={styles.iconCircle}>
              <MaterialCommunityIcons
                name={tipo.icono}
                size={30}
                color="#0066CC"
              />
            </View>

            <View style={styles.tipoContenido}>
              <Text style={styles.tipoNombre}>{tipo.nombre}</Text>

              <Text style={styles.tipoDescripcion}>{tipo.descripcion}</Text>
            </View>

            <MaterialCommunityIcons
              name="chevron-right"
              size={25}
              color="#999"
            />
          </Pressable>
        ))}
      </View>

      <View style={styles.bottomSpace} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  contentContainer: {
    paddingBottom: 40,
  },

  /* ================= HEADER ================= */

  header: {
    paddingTop: 55,
    paddingHorizontal: 20,
    paddingBottom: 18,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#F4F8FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  headerText: {
    flex: 1,
  },

  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#222",
  },

  subtitle: {
    marginTop: 4,
    fontSize: 14,
    lineHeight: 20,
    color: "#777",
  },

  /* ================= INFO ================= */

  infoBox: {
    marginHorizontal: 20,
    marginTop: 20,
    padding: 16,
    borderRadius: 15,
    backgroundColor: "#F4F8FF",
    flexDirection: "row",
    alignItems: "flex-start",
  },

  infoText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    lineHeight: 20,
    color: "#555",
  },

  /* ================= SECTION ================= */

  sectionTitle: {
    marginHorizontal: 20,
    marginTop: 28,
    marginBottom: 14,
    fontSize: 20,
    fontWeight: "700",
    color: "#222",
  },

  /* ================= LISTA ================= */

  lista: {
    paddingHorizontal: 20,
  },

  tipoCard: {
    minHeight: 82,
    marginBottom: 12,
    paddingHorizontal: 15,
    paddingVertical: 13,
    borderRadius: 16,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E5EAF0",
    flexDirection: "row",
    alignItems: "center",

    elevation: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },

  tipoCardPressed: {
    opacity: 0.7,
  },

  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#F4F8FF",
    justifyContent: "center",
    alignItems: "center",
  },

  tipoContenido: {
    flex: 1,
    marginLeft: 14,
    marginRight: 8,
  },

  tipoNombre: {
    fontSize: 17,
    fontWeight: "700",
    color: "#222",
  },

  tipoDescripcion: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 18,
    color: "#777",
  },

  bottomSpace: {
    height: 20,
  },
});
