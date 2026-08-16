import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

export default function RolNegociosScreen() {
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
          <Text style={styles.title}>Negocios</Text>

          <Text style={styles.subtitle}>
            Tu espacio para ofrecer productos y servicios
          </Text>
        </View>
      </View>

      {/* ================= PRESENTACIÓN ================= */}

      <View style={styles.welcomeBox}>
        <View style={styles.iconCircle}>
          <MaterialCommunityIcons
            name="storefront-outline"
            size={42}
            color="#0066CC"
          />
        </View>

        <Text style={styles.welcomeTitle}>Bienvenido a Negocios</Text>

        <Text style={styles.welcomeText}>
          Crea y administra tus negocios dentro de FrancisCorp. Puedes ofrecer
          productos, servicios o ambos.
        </Text>
      </View>

      {/* ================= CREAR NEGOCIO ================= */}

      <Pressable
        style={styles.createButton}
        onPress={() => {
          router.push("/crear-negocio");
        }}
      >
        <MaterialCommunityIcons
          name="plus-circle-outline"
          size={25}
          color="#fff"
        />

        <Text style={styles.createButtonText}>Crear mi negocio</Text>
      </Pressable>

      {/* ================= MIS NEGOCIOS ================= */}

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Mis negocios</Text>
      </View>

      <View style={styles.emptyBox}>
        <MaterialCommunityIcons
          name="store-off-outline"
          size={48}
          color="#999"
        />

        <Text style={styles.emptyTitle}>Todavía no tienes negocios</Text>

        <Text style={styles.emptyText}>
          Cuando crees un negocio aparecerá aquí para que puedas administrarlo.
        </Text>
      </View>

      {/* ================= INFORMACIÓN ================= */}

      <View style={styles.infoBox}>
        <MaterialCommunityIcons
          name="information-outline"
          size={23}
          color="#0066CC"
        />

        <Text style={styles.infoText}>
          En FrancisCorp puedes crear diferentes tipos de negocios y ofrecer
          cualquier producto o servicio permitido dentro de la plataforma.
        </Text>
      </View>
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
    fontSize: 27,
    fontWeight: "700",
    color: "#222",
  },

  subtitle: {
    marginTop: 3,
    fontSize: 14,
    color: "#777",
  },

  /* ================= WELCOME ================= */

  welcomeBox: {
    margin: 20,
    padding: 24,
    borderRadius: 20,
    backgroundColor: "#F4F8FF",
    alignItems: "center",
  },

  iconCircle: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },

  welcomeTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#222",
    textAlign: "center",
  },

  welcomeText: {
    marginTop: 10,
    fontSize: 15,
    lineHeight: 22,
    color: "#666",
    textAlign: "center",
  },

  /* ================= CREATE ================= */

  createButton: {
    marginHorizontal: 20,
    minHeight: 54,
    borderRadius: 14,
    backgroundColor: "#0066CC",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  createButtonText: {
    marginLeft: 9,
    fontSize: 17,
    fontWeight: "700",
    color: "#fff",
  },

  /* ================= SECTION ================= */

  sectionHeader: {
    paddingHorizontal: 20,
    marginTop: 30,
    marginBottom: 12,
  },

  sectionTitle: {
    fontSize: 21,
    fontWeight: "700",
    color: "#222",
  },

  /* ================= EMPTY ================= */

  emptyBox: {
    marginHorizontal: 20,
    padding: 28,
    borderRadius: 18,
    backgroundColor: "#F7F7F7",
    alignItems: "center",
  },

  emptyTitle: {
    marginTop: 12,
    fontSize: 18,
    fontWeight: "700",
    color: "#555",
    textAlign: "center",
  },

  emptyText: {
    marginTop: 7,
    fontSize: 14,
    lineHeight: 20,
    color: "#888",
    textAlign: "center",
  },

  /* ================= INFO ================= */

  infoBox: {
    marginHorizontal: 20,
    marginTop: 22,
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
});
