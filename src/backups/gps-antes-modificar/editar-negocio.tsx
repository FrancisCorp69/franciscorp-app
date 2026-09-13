import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import {
  doc,
  getDoc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";

import { db } from "../services/firebase";

export default function EditarNegocioScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const negocioId = String(params.id || "");

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  const [nombre, setNombre] = useState("");
  const [categoria, setCategoria] = useState("");
  const [descripcion, setDescripcion] = useState("");

  const [telefono, setTelefono] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [correo, setCorreo] = useState("");
  const [redesSociales, setRedesSociales] = useState("");
  const [paginaWeb, setPaginaWeb] = useState("");

  const [direccion, setDireccion] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [provincia, setProvincia] = useState("");

  const [activo, setActivo] = useState(true);

  useEffect(() => {
    async function cargarNegocio() {
      if (!negocioId) {
        Alert.alert(
          "Negocio no encontrado",
          "No se recibió el identificador del negocio.",
        );

        router.back();
        return;
      }

      try {
        const referencia = doc(db, "negocios", negocioId);
        const documento = await getDoc(referencia);

        if (!documento.exists()) {
          Alert.alert(
            "Negocio no encontrado",
            "El negocio no existe.",
          );

          router.back();
          return;
        }

        const datos = documento.data();

        setNombre(String(datos.nombre || ""));
        setCategoria(String(datos.categoria || ""));
        setDescripcion(String(datos.descripcion || ""));

        setTelefono(String(datos.contacto?.telefono || ""));
        setWhatsapp(String(datos.contacto?.whatsapp || ""));
        setCorreo(String(datos.contacto?.correo || ""));
        setRedesSociales(String(datos.contacto?.redesSociales || ""));
        setPaginaWeb(String(datos.contacto?.paginaWeb || ""));

        setDireccion(String(datos.ubicacion?.direccion || ""));
        setCiudad(String(datos.ubicacion?.ciudad || ""));
        setProvincia(String(datos.ubicacion?.provincia || ""));

        setActivo(datos.estado !== "inactivo");
      } catch (error) {
        console.error("ERROR CARGANDO NEGOCIO:", error);

        Alert.alert(
          "Error",
          "No pudimos cargar la información del negocio.",
        );

        router.back();
      } finally {
        setCargando(false);
      }
    }

    cargarNegocio();
  }, [negocioId]);

  const guardarCambios = async () => {
    if (!negocioId) return;

    if (!nombre.trim()) {
      Alert.alert(
        "Falta información",
        "Ingresa el nombre del negocio.",
      );
      return;
    }

    if (!descripcion.trim()) {
      Alert.alert(
        "Falta información",
        "Ingresa una descripción del negocio.",
      );
      return;
    }

    setGuardando(true);

    try {
      const referencia = doc(db, "negocios", negocioId);

      await updateDoc(referencia, {
        nombre: nombre.trim(),
        categoria: categoria.trim(),
        descripcion: descripcion.trim(),

        contacto: {
          telefono: telefono.trim(),
          whatsapp: whatsapp.trim(),
          correo: correo.trim(),
          redesSociales: redesSociales.trim(),
          paginaWeb: paginaWeb.trim(),
        },

        ubicacion: {
          direccion: direccion.trim(),
          ciudad: ciudad.trim(),
          provincia: provincia.trim(),
        },

        estado: activo ? "activo" : "inactivo",
        actualizadoEn: serverTimestamp(),
      });

      Alert.alert(
        "Cambios guardados",
        "La información de tu negocio se actualizó correctamente.",
        [
          {
            text: "Aceptar",
            onPress: () => router.back(),
          },
        ],
      );
    } catch (error) {
      console.error("ERROR ACTUALIZANDO NEGOCIO:", error);

      Alert.alert(
        "Error",
        "No pudimos guardar los cambios. Inténtalo nuevamente.",
      );
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066CC" />

        <Text style={styles.loadingText}>
          Cargando información...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={26}
            color="#222"
          />
        </Pressable>

        <View>
          <Text style={styles.title}>Editar negocio</Text>

          <Text style={styles.subtitle}>
            Actualiza la información de tu negocio
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Información general
        </Text>

        <Text style={styles.label}>Nombre del negocio *</Text>

        <TextInput
          style={styles.input}
          value={nombre}
          onChangeText={setNombre}
          placeholder="Ej. El Búnker"
        />

        <Text style={styles.label}>Categoría</Text>

        <TextInput
          style={styles.input}
          value={categoria}
          onChangeText={setCategoria}
          placeholder="Ej. Restaurante"
        />

        <Text style={styles.label}>Descripción *</Text>

        <TextInput
          style={[styles.input, styles.textArea]}
          value={descripcion}
          onChangeText={setDescripcion}
          placeholder="Describe tu negocio"
          multiline
          textAlignVertical="top"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Información de contacto
        </Text>

        <Text style={styles.label}>Teléfono</Text>

        <TextInput
          style={styles.input}
          value={telefono}
          onChangeText={setTelefono}
          placeholder="Número de teléfono"
          keyboardType="phone-pad"
        />

        <Text style={styles.label}>WhatsApp</Text>

        <TextInput
          style={styles.input}
          value={whatsapp}
          onChangeText={setWhatsapp}
          placeholder="Número de WhatsApp"
          keyboardType="phone-pad"
        />

        <Text style={styles.label}>Correo electrónico</Text>

        <TextInput
          style={styles.input}
          value={correo}
          onChangeText={setCorreo}
          placeholder="correo@ejemplo.com"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.label}>Redes sociales</Text>

        <TextInput
          style={styles.input}
          value={redesSociales}
          onChangeText={setRedesSociales}
          placeholder="Instagram, Facebook, TikTok..."
        />

        <Text style={styles.label}>Página web</Text>

        <TextInput
          style={styles.input}
          value={paginaWeb}
          onChangeText={setPaginaWeb}
          placeholder="https://..."
          autoCapitalize="none"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Ubicación
        </Text>

        <Text style={styles.label}>Dirección</Text>

        <TextInput
          style={styles.input}
          value={direccion}
          onChangeText={setDireccion}
          placeholder="Dirección del negocio"
        />

        <Text style={styles.label}>Ciudad</Text>

        <TextInput
          style={styles.input}
          value={ciudad}
          onChangeText={setCiudad}
          placeholder="Ej. Portoviejo"
        />

        <Text style={styles.label}>Provincia</Text>

        <TextInput
          style={styles.input}
          value={provincia}
          onChangeText={setProvincia}
          placeholder="Ej. Manabí"
        />
      </View>

      <View style={styles.statusBox}>
        <View style={styles.statusTextBox}>
          <Text style={styles.statusTitle}>
            Negocio activo
          </Text>

          <Text style={styles.statusDescription}>
            Si está activo, los clientes podrán encontrarlo.
          </Text>
        </View>

        <Switch
          value={activo}
          onValueChange={setActivo}
        />
      </View>

      <Pressable
        style={[
          styles.saveButton,
          guardando && styles.disabledButton,
        ]}
        disabled={guardando}
        onPress={guardarCambios}
      >
        {guardando ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <MaterialCommunityIcons
              name="content-save-outline"
              size={24}
              color="#fff"
            />

            <Text style={styles.saveButtonText}>
              Guardar cambios
            </Text>
          </>
        )}
      </Pressable>

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

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },

  loadingText: {
    marginTop: 12,
    color: "#666",
    fontSize: 15,
  },

  header: {
    paddingTop: 55,
    paddingHorizontal: 20,
    paddingBottom: 20,
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

  title: {
    fontSize: 25,
    fontWeight: "700",
    color: "#222",
  },

  subtitle: {
    marginTop: 3,
    fontSize: 13,
    color: "#777",
  },

  section: {
    marginHorizontal: 20,
    marginTop: 24,
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
    minHeight: 48,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    paddingHorizontal: 14,
    backgroundColor: "#fff",
    color: "#222",
    fontSize: 15,
  },

  textArea: {
    minHeight: 110,
    paddingTop: 14,
  },

  statusBox: {
    marginHorizontal: 20,
    marginTop: 25,
    padding: 16,
    borderRadius: 15,
    backgroundColor: "#F4F8FF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  statusTextBox: {
    flex: 1,
    paddingRight: 15,
  },

  statusTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#222",
  },

  statusDescription: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 18,
    color: "#666",
  },

  saveButton: {
    marginHorizontal: 20,
    marginTop: 25,
    minHeight: 55,
    borderRadius: 14,
    backgroundColor: "#0066CC",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  disabledButton: {
    opacity: 0.7,
  },

  saveButtonText: {
    marginLeft: 9,
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
  },

  bottomSpace: {
    height: 20,
  },
});
