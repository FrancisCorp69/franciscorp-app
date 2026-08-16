import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import {
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";

import { db, storage } from "../services/firebase";

export default function AgregarProductoScreen() {
  const params = useLocalSearchParams<{ id?: string }>();

  const negocioId = String(params.id || "");

  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [precio, setPrecio] = useState("");
  const [categoria, setCategoria] = useState("");

  const [fotoUri, setFotoUri] = useState<string | null>(null);

  const [disponible, setDisponible] = useState(true);
  const [destacado, setDestacado] = useState(false);

  const [nombreNegocio, setNombreNegocio] = useState("");
  const [cargandoNegocio, setCargandoNegocio] = useState(true);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    async function cargarNegocio() {
      if (!negocioId) {
        setCargandoNegocio(false);
        return;
      }

      try {
        const referencia = doc(db, "negocios", negocioId);
        const documento = await getDoc(referencia);

        if (documento.exists()) {
          const datos = documento.data();

          setNombreNegocio(
            String(datos.nombre || "Mi negocio"),
          );
        }
      } catch (error) {
        console.error(
          "ERROR CARGANDO NEGOCIO:",
          error,
        );
      } finally {
        setCargandoNegocio(false);
      }
    }

    cargarNegocio();
  }, [negocioId]);

  const seleccionarFoto = async () => {
    try {
      const permiso =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permiso.granted) {
        Alert.alert(
          "Permiso requerido",
          "Necesitamos acceso a tus fotografías para seleccionar la imagen del producto.",
        );

        return;
      }

      const resultado =
        await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ["images"],
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });

      if (resultado.canceled) {
        return;
      }

      const uri = resultado.assets[0]?.uri;

      if (uri) {
        setFotoUri(uri);
      }
    } catch (error) {
      console.error(
        "ERROR SELECCIONANDO FOTO:",
        error,
      );

      Alert.alert(
        "Error",
        "No pudimos seleccionar la fotografía.",
      );
    }
  };

  const tomarFoto = async () => {
    try {
      const permiso =
        await ImagePicker.requestCameraPermissionsAsync();

      if (!permiso.granted) {
        Alert.alert(
          "Permiso requerido",
          "Necesitamos acceso a la cámara para tomar una fotografía.",
        );

        return;
      }

      const resultado =
        await ImagePicker.launchCameraAsync({
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });

      if (resultado.canceled) {
        return;
      }

      const uri = resultado.assets[0]?.uri;

      if (uri) {
        setFotoUri(uri);
      }
    } catch (error) {
      console.error(
        "ERROR TOMANDO FOTO:",
        error,
      );

      Alert.alert(
        "Error",
        "No pudimos tomar la fotografía.",
      );
    }
  };

  const elegirFoto = () => {
    Alert.alert(
      "Fotografía del producto",
      "¿Cómo quieres agregar la fotografía?",
      [
        {
          text: "Galería",
          onPress: seleccionarFoto,
        },
        {
          text: "Cámara",
          onPress: tomarFoto,
        },
        {
          text: "Cancelar",
          style: "cancel",
        },
      ],
    );
  };

  const validarFormulario = () => {
    if (!negocioId) {
      Alert.alert(
        "Error",
        "No se identificó el negocio.",
      );

      return false;
    }

    if (!nombre.trim()) {
      Alert.alert(
        "Falta el nombre",
        "Ingresa el nombre del producto.",
      );

      return false;
    }

    if (!precio.trim()) {
      Alert.alert(
        "Falta el precio",
        "Ingresa el precio del producto.",
      );

      return false;
    }

    const precioNumerico = Number(
      precio.replace(",", "."),
    );

    if (
      Number.isNaN(precioNumerico) ||
      precioNumerico < 0
    ) {
      Alert.alert(
        "Precio inválido",
        "Ingresa un precio válido.",
      );

      return false;
    }

    return true;
  };

  const guardarProducto = async () => {
    if (!validarFormulario()) {
      return;
    }

    try {
      setGuardando(true);

      console.log(
        "GUARDANDO PRODUCTO PARA NEGOCIO:",
        negocioId,
      );

      let fotoURL = "";

      /*
       * ==============================
       * SUBIR FOTO A FIREBASE STORAGE
       * ==============================
       */

      if (fotoUri) {
        console.log("SUBIENDO FOTO DEL PRODUCTO...");

        const respuesta = await fetch(fotoUri);
        const blob = await respuesta.blob();

        const nombreArchivo =
          `${Date.now()}-${Math.random()
            .toString(36)
            .substring(2, 10)}.jpg`;

        const referenciaFoto = ref(
          storage,
          `negocios/${negocioId}/productos/${nombreArchivo}`,
        );

        await uploadBytes(
          referenciaFoto,
          blob,
          {
            contentType: "image/jpeg",
          },
        );

        fotoURL =
          await getDownloadURL(
            referenciaFoto,
          );

        console.log(
          "FOTO SUBIDA:",
          fotoURL,
        );
      }

      /*
       * ==============================
       * CREAR PRODUCTO EN FIRESTORE
       * ==============================
       */

      const precioNumerico = Number(
        precio.replace(",", "."),
      );

      const producto = {
        negocioId,

        nombre: nombre.trim(),

        descripcion:
          descripcion.trim(),

        precio: precioNumerico,

        categoria:
          categoria.trim() || "General",

        foto: fotoURL,

        disponible,

        destacado,

        estado: disponible
          ? "activo"
          : "agotado",

        creadoEn: serverTimestamp(),

        actualizadoEn:
          serverTimestamp(),
      };

      const productosRef = collection(
        db,
        "negocios",
        negocioId,
        "productos",
      );

      const referenciaProducto =
        await addDoc(
          productosRef,
          producto,
        );

      console.log(
        "PRODUCTO CREADO:",
        referenciaProducto.id,
      );

      Alert.alert(
        "Producto creado",
        "El producto se agregó correctamente al menú.",
        [
          {
            text: "Aceptar",
            onPress: () => {
              router.back();
            },
          },
        ],
      );
    } catch (error) {
      console.error(
        "ERROR GUARDANDO PRODUCTO:",
        error,
      );

      Alert.alert(
        "Error",
        "No pudimos guardar el producto. Revisa tu conexión e inténtalo nuevamente.",
      );
    } finally {
      setGuardando(false);
    }
  };

  if (cargandoNegocio) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color="#0066CC"
        />

        <Text style={styles.loadingText}>
          Cargando negocio...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={
        styles.contentContainer
      }
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {/* ================= HEADER ================= */}

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

        <View style={styles.headerText}>
          <Text style={styles.title}>
            Agregar producto
          </Text>

          <Text style={styles.subtitle}>
            {nombreNegocio || "Mi negocio"}
          </Text>
        </View>
      </View>

      {/* ================= FOTO ================= */}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Fotografía
        </Text>

        <Text style={styles.sectionDescription}>
          Una buena fotografía ayuda a que los clientes
          conozcan tu producto.
        </Text>

        <Pressable
          style={styles.photoContainer}
          onPress={elegirFoto}
        >
          {fotoUri ? (
            <Image
              source={{ uri: fotoUri }}
              style={styles.photo}
            />
          ) : (
            <>
              <MaterialCommunityIcons
                name="camera-plus-outline"
                size={45}
                color="#0066CC"
              />

              <Text style={styles.photoTitle}>
                Agregar fotografía
              </Text>

              <Text style={styles.photoText}>
                Galería o cámara
              </Text>
            </>
          )}
        </Pressable>

        {fotoUri ? (
          <Pressable
            style={styles.changePhotoButton}
            onPress={elegirFoto}
          >
            <MaterialCommunityIcons
              name="camera-switch-outline"
              size={19}
              color="#0066CC"
            />

            <Text
              style={
                styles.changePhotoButtonText
              }
            >
              Cambiar fotografía
            </Text>
          </Pressable>
        ) : null}
      </View>

      {/* ================= INFORMACIÓN ================= */}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Información del producto
        </Text>

        <Text style={styles.label}>
          Nombre del producto *
        </Text>

        <TextInput
          value={nombre}
          onChangeText={setNombre}
          placeholder="Ej. Arroz chaufa especial"
          placeholderTextColor="#999"
          style={styles.input}
        />

        <Text style={styles.label}>
          Descripción
        </Text>

        <TextInput
          value={descripcion}
          onChangeText={setDescripcion}
          placeholder="Describe los ingredientes o características..."
          placeholderTextColor="#999"
          style={[
            styles.input,
            styles.textArea,
          ]}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />

        <Text style={styles.label}>
          Categoría
        </Text>

        <TextInput
          value={categoria}
          onChangeText={setCategoria}
          placeholder="Ej. Platos principales"
          placeholderTextColor="#999"
          style={styles.input}
        />

        <Text style={styles.label}>
          Precio *
        </Text>

        <View style={styles.priceContainer}>
          <Text style={styles.currency}>
            $
          </Text>

          <TextInput
            value={precio}
            onChangeText={setPrecio}
            placeholder="0.00"
            placeholderTextColor="#999"
            keyboardType="decimal-pad"
            style={styles.priceInput}
          />
        </View>
      </View>

      {/* ================= OPCIONES ================= */}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Opciones
        </Text>

        <View style={styles.optionRow}>
          <View style={styles.optionIcon}>
            <MaterialCommunityIcons
              name="check-circle-outline"
              size={25}
              color="#22C55E"
            />
          </View>

          <View style={styles.optionInfo}>
            <Text style={styles.optionTitle}>
              Disponible
            </Text>

            <Text style={styles.optionDescription}>
              Los clientes podrán ver y pedir este
              producto.
            </Text>
          </View>

          <Switch
            value={disponible}
            onValueChange={setDisponible}
          />
        </View>

        <View style={styles.optionRow}>
          <View style={styles.optionIcon}>
            <MaterialCommunityIcons
              name="star-outline"
              size={25}
              color="#F5A623"
            />
          </View>

          <View style={styles.optionInfo}>
            <Text style={styles.optionTitle}>
              Producto destacado
            </Text>

            <Text style={styles.optionDescription}>
              Destaca este producto dentro del menú.
            </Text>
          </View>

          <Switch
            value={destacado}
            onValueChange={setDestacado}
          />
        </View>
      </View>

      {/* ================= GUARDAR ================= */}

      <Pressable
        style={[
          styles.saveButton,
          guardando &&
            styles.saveButtonDisabled,
        ]}
        onPress={guardarProducto}
        disabled={guardando}
      >
        {guardando ? (
          <ActivityIndicator
            size="small"
            color="#fff"
          />
        ) : (
          <MaterialCommunityIcons
            name="content-save-outline"
            size={23}
            color="#fff"
          />
        )}

        <Text style={styles.saveButtonText}>
          {guardando
            ? "Guardando..."
            : "Guardar producto"}
        </Text>
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
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },

  loadingText: {
    marginTop: 12,
    color: "#666",
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
    fontSize: 25,
    fontWeight: "700",
    color: "#222",
  },

  subtitle: {
    marginTop: 3,
    fontSize: 14,
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
  },

  sectionDescription: {
    marginTop: 5,
    fontSize: 13,
    lineHeight: 19,
    color: "#777",
  },

  photoContainer: {
    marginTop: 14,
    height: 220,
    borderRadius: 18,
    backgroundColor: "#F4F8FF",
    borderWidth: 1,
    borderColor: "#DCE9FA",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },

  photo: {
    width: "100%",
    height: "100%",
  },

  photoTitle: {
    marginTop: 10,
    fontSize: 17,
    fontWeight: "700",
    color: "#0066CC",
  },

  photoText: {
    marginTop: 4,
    fontSize: 13,
    color: "#888",
  },

  changePhotoButton: {
    marginTop: 10,
    minHeight: 40,
    borderRadius: 10,
    backgroundColor: "#F4F8FF",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },

  changePhotoButtonText: {
    marginLeft: 6,
    color: "#0066CC",
    fontWeight: "600",
  },

  label: {
    marginTop: 17,
    marginBottom: 7,
    fontSize: 14,
    fontWeight: "600",
    color: "#444",
  },

  input: {
    minHeight: 50,
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 15,
    color: "#222",
    backgroundColor: "#fff",
  },

  textArea: {
    minHeight: 110,
    paddingTop: 14,
  },

  priceContainer: {
    minHeight: 50,
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
  },

  currency: {
    marginLeft: 14,
    fontSize: 18,
    fontWeight: "700",
    color: "#0066CC",
  },

  priceInput: {
    flex: 1,
    minHeight: 50,
    paddingHorizontal: 10,
    fontSize: 16,
    color: "#222",
  },

  optionRow: {
    marginTop: 14,
    padding: 14,
    borderRadius: 15,
    backgroundColor: "#F8F8F8",
    flexDirection: "row",
    alignItems: "center",
  },

  optionIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },

  optionInfo: {
    flex: 1,
    marginHorizontal: 10,
  },

  optionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#222",
  },

  optionDescription: {
    marginTop: 3,
    fontSize: 12,
    lineHeight: 17,
    color: "#777",
  },

  saveButton: {
    marginHorizontal: 20,
    marginTop: 28,
    minHeight: 56,
    borderRadius: 14,
    backgroundColor: "#0066CC",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  saveButtonDisabled: {
    opacity: 0.7,
  },

  saveButtonText: {
    marginLeft: 8,
    fontSize: 17,
    fontWeight: "700",
    color: "#fff",
  },

  bottomSpace: {
    height: 20,
  },
});
