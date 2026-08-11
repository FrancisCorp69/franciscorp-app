import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export default function CrearNegocioScreen() {
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
          <Text style={styles.title}>Crear negocio</Text>

          <Text style={styles.subtitle}>
            Configura tu negocio para ofrecer tus productos o servicios
          </Text>
        </View>
      </View>

      {/* ================= INFORMACIÓN ================= */}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Información del negocio</Text>

        <Text style={styles.label}>Nombre del negocio</Text>

        <TextInput
          style={styles.input}
          placeholder="Ej. El Búnker"
          placeholderTextColor="#999"
        />

        <Text style={styles.label}>Categoría</Text>

        <TextInput
          style={styles.input}
          placeholder="Ej. Restaurante, tienda, servicios..."
          placeholderTextColor="#999"
        />

        <Text style={styles.label}>Descripción</Text>

        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Describe brevemente tu negocio"
          placeholderTextColor="#999"
          multiline
          numberOfLines={4}
        />
      </View>

      {/* ================= UBICACIÓN ================= */}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ubicación</Text>

        <Text style={styles.label}>Dirección</Text>

        <TextInput
          style={styles.input}
          placeholder="Ingresa la dirección"
          placeholderTextColor="#999"
        />

        <Text style={styles.label}>Ciudad</Text>

        <TextInput
          style={styles.input}
          placeholder="Ej. Portoviejo"
          placeholderTextColor="#999"
        />
      </View>

      {/* ================= TIPO DE OFERTA ================= */}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>¿Qué quieres ofrecer?</Text>

        <Pressable style={styles.option}>
          <MaterialCommunityIcons
            name="shopping-outline"
            size={25}
            color="#0066CC"
          />

          <View style={styles.optionText}>
            <Text style={styles.optionTitle}>Productos</Text>

            <Text style={styles.optionDescription}>
              Vender productos a los clientes.
            </Text>
          </View>

          <MaterialCommunityIcons name="chevron-right" size={24} color="#999" />
        </Pressable>

        <Pressable style={styles.option}>
          <MaterialCommunityIcons
            name="briefcase-outline"
            size={25}
            color="#0066CC"
          />

          <View style={styles.optionText}>
            <Text style={styles.optionTitle}>Servicios</Text>

            <Text style={styles.optionDescription}>
              Ofrecer servicios profesionales o especializados.
            </Text>
          </View>

          <MaterialCommunityIcons name="chevron-right" size={24} color="#999" />
        </Pressable>

        <Pressable style={styles.option}>
          <MaterialCommunityIcons
            name="storefront-outline"
            size={25}
            color="#0066CC"
          />

          <View style={styles.optionText}>
            <Text style={styles.optionTitle}>Productos y servicios</Text>

            <Text style={styles.optionDescription}>
              Ofrecer ambos dentro del mismo negocio.
            </Text>
          </View>

          <MaterialCommunityIcons name="chevron-right" size={24} color="#999" />
        </Pressable>
      </View>

      {/* ================= BOTÓN ================= */}

      <Pressable style={styles.createButton} onPress={() => router.back()}>
        <MaterialCommunityIcons
          name="check-circle-outline"
          size={25}
          color="#fff"
        />

        <Text style={styles.createButtonText}>Continuar</Text>
      </Pressable>

      <Text style={styles.note}>
        Más adelante conectaremos este formulario con Firebase para guardar
        permanentemente la información de tu negocio.
      </Text>
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
    lineHeight: 19,
  },

  section: {
    marginHorizontal: 20,
    marginTop: 25,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#222",
    marginBottom: 15,
  },

  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#444",
    marginBottom: 7,
    marginTop: 12,
  },

  input: {
    height: 52,
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 12,
    paddingHorizontal: 15,
    fontSize: 15,
    color: "#222",
    backgroundColor: "#FAFAFA",
  },

  textArea: {
    height: 110,
    paddingTop: 14,
    textAlignVertical: "top",
  },

  option: {
    minHeight: 75,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 14,
    marginBottom: 12,
    paddingHorizontal: 15,
    paddingVertical: 13,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
  },

  optionText: {
    flex: 1,
    marginLeft: 13,
  },

  optionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
  },

  optionDescription: {
    marginTop: 3,
    fontSize: 13,
    color: "#777",
    lineHeight: 18,
  },

  createButton: {
    marginHorizontal: 20,
    marginTop: 30,
    height: 55,
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

  note: {
    marginHorizontal: 25,
    marginTop: 14,
    textAlign: "center",
    fontSize: 13,
    lineHeight: 19,
    color: "#888",
  },
});
