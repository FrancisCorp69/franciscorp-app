import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import {
  doc,
  getDoc,
  serverTimestamp,
  updateDoc,
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

function uriToBlob(uri: string): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.onload = () => {
      resolve(xhr.response);
    };

    xhr.onerror = () => {
      reject(new Error("No se pudo convertir la imagen."));
    };

    xhr.responseType = "blob";
    xhr.open("GET", uri, true);
    xhr.send(null);
  });
}

export default function EditarProductoScreen() {
  const params = useLocalSearchParams<{
    negocioId?: string;
    productoId?: string;
  }>();

  const negocioId = String(params.negocioId || "");
  const productoId = String(params.productoId || "");

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [precio, setPrecio] = useState("");
  const [categoria, setCategoria] = useState("");

  const [disponible, setDisponible] = useState(true);
  const [destacado, setDestacado] = useState(false);

  const [fotoActual, setFotoActual] = useState("");
  const [fotoNueva, setFotoNueva] = useState("");

  useEffect(() => {
    async function cargarProducto() {
      if (!negocioId || !productoId) {
        Alert.alert(
          "Datos incompletos",
          "No se pudo identificar el negocio o el producto.",
        );

        router.back();
        return;
      }

      try {
        console.log("CARGANDO PRODUCTO:", productoId);

        const referenciaProducto = doc(
          db,
          "negocios",
          negocioId,
          "productos",
          productoId,
        );

        const documento = await getDoc(referenciaProducto);

        if (!documento.exists()) {
          Alert.alert(
            "Producto no encontrado",
            "El producto que intentas editar no existe.",
          );

          router.back();
          return;
        }

        const datos = documento.data();

        console.log("PRODUCTO CARGADO:", datos);

        setNombre(String(datos.nombre || ""));
        setDescripcion(String(datos.descripcion || ""));
        setPrecio(
          datos.precio !== undefined
            ? String(datos.precio)
            : "",
        );
        setCategoria(String(datos.categoria || ""));

        setDisponible(
          datos.disponible !== false,
        );

        setDestacado(
          datos.destacado === true,
        );

        setFotoActual(
          String(datos.foto || ""),
        );
      } catch (error) {
        console.error(
          "ERROR CARGANDO PRODUCTO:",
          error,
        );

        Alert.alert(
          "Error",
          "No pudimos cargar el producto.",
        );

        router.back();
      } finally {
        setCargando(false);
      }
    }

    cargarProducto();
  }, [negocioId, productoId]);

  const seleccionarFoto = async () => {
    try {
      const permiso =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permiso.granted) {
        Alert.alert(
          "Permiso requerido",
          "Necesitamos permiso para seleccionar una fotografía.",
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

      const uri =
        resultado.assets?.[0]?.uri;

      if (!uri) {
        return;
      }

      console.log(
        "NUEVA FOTO SELECCIONADA:",
        uri,
      );

      setFotoNueva(uri);
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

  const validarFormulario = () => {
    if (!nombre.trim()) {
      Alert.alert(
        "Falta información",
        "Ingresa el nombre del producto.",
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

  const guardarCambios = async () => {
    if (!validarFormulario()) {
      return;
    }

    if (!negocioId || !productoId) {
      Alert.alert(
        "Error",
        "No se identificó correctamente el producto.",
      );

      return;
    }

    try {
      setGuardando(true);

      console.log(
        "GUARDANDO CAMBIOS DEL PRODUCTO:",
        productoId,
      );

      let fotoURL = fotoActual;

      /*
       * ==============================
       * SUBIR NUEVA FOTO
       * ==============================
       */

      if (fotoNueva) {
        console.log(
          "SUBIENDO NUEVA FOTO...",
        );

        const blob =
          await uriToBlob(fotoNueva);

        const nombreArchivo =
          `${Date.now()}-${Math.random()
            .toString(36)
            .substring(2, 10)}.jpg`;

        const rutaStorage =
          `negocios/${negocioId}/productos/${nombreArchivo}`;

        console.log(
          "RUTA NUEVA FOTO:",
          rutaStorage,
        );

        const referenciaFoto =
          ref(
            storage,
            rutaStorage,
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
          "NUEVA FOTO SUBIDA:",
          fotoURL,
        );
      }

      /*
       * ==============================
       * ACTUALIZAR FIRESTORE
       * ==============================
       */

      const precioNumerico =
        Number(
          precio.replace(",", "."),
        );

      const referenciaProducto =
        doc(
          db,
          "negocios",
          negocioId,
          "productos",
          productoId,
        );

      await updateDoc(
        referenciaProducto,
        {
          nombre: nombre.trim(),
          descripcion: descripcion.trim(),
          precio: precioNumerico,
          categoria:
            categoria.trim() || "General",
          foto: fotoURL,
          disponible,
          destacado,
          estado: disponible
            ? "activo"
            : "agotado",
          actualizadoEn:
            serverTimestamp(),
        },
      );

      console.log(
        "PRODUCTO ACTUALIZADO CORRECTAMENTE",
      );

      Alert.alert(
        "Producto actualizado",
        "Los cambios se guardaron correctamente.",
        [
          {
            text: "Aceptar",
            onPress: () => router.back(),
          },
        ],
      );
    } catch (error: any) {
      console.error(
        "ERROR ACTUALIZANDO PRODUCTO:",
        error,
      );

      console.error(
        "CODIGO:",
        error?.code,
      );

      console.error(
        "MENSAJE:",
        error?.message,
      );

      Alert.alert(
        "Error al actualizar",
        error?.message ||
          "No pudimos guardar los cambios.",
      );
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) {
    return (
      <View
        style={
          styles.loadingContainer
        }
      >
        <ActivityIndicator
          size="large"
          color="#0066CC"
        />

        <Text
          style={
            styles.loadingText
          }
        >
          Cargando producto...
        </Text>
      </View>
    );
  }

  const imagenMostrar =
    fotoNueva || fotoActual;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={
        styles.contentContainer
      }
      showsVerticalScrollIndicator={
        false
      }
    >
      {/* HEADER */}

      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() =>
            router.back()
          }
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={26}
            color="#222"
          />
        </Pressable>

        <View
          style={styles.headerText}
        >
          <Text
            style={styles.title}
          >
            Editar producto
          </Text>

          <Text
            style={styles.subtitle}
          >
            Modifica la información
          </Text>
        </View>
      </View>

      {/* FOTO */}

      <View
        style={styles.photoSection}
      >
        {imagenMostrar ? (
          <Image
            source={{
              uri: imagenMostrar,
            }}
            style={styles.productPhoto}
          />
        ) : (
          <View
            style={
              styles.photoPlaceholder
            }
          >
            <MaterialCommunityIcons
              name="food"
              size={55}
              color="#0066CC"
            />
          </View>
        )}

        <Pressable
          style={styles.photoButton}
          onPress={seleccionarFoto}
        >
          <MaterialCommunityIcons
            name="camera-outline"
            size={20}
            color="#0066CC"
          />

          <Text
            style={
              styles.photoButtonText
            }
          >
            Cambiar fotografía
          </Text>
        </Pressable>
      </View>

      {/* NOMBRE */}

      <View
        style={styles.field}
      >
        <Text
          style={styles.label}
        >
          Nombre del producto
        </Text>

        <TextInput
          value={nombre}
          onChangeText={setNombre}
          placeholder="Ej. Arroz chaufa"
          style={styles.input}
          editable={!guardando}
        />
      </View>

      {/* DESCRIPCIÓN */}

      <View
        style={styles.field}
      >
        <Text
          style={styles.label}
        >
          Descripción
        </Text>

        <TextInput
          value={descripcion}
          onChangeText={setDescripcion}
          placeholder="Describe el producto"
          style={[
            styles.input,
            styles.textArea,
          ]}
          multiline
          numberOfLines={4}
          editable={!guardando}
        />
      </View>

      {/* PRECIO */}

      <View
        style={styles.field}
      >
        <Text
          style={styles.label}
        >
          Precio
        </Text>

        <TextInput
          value={precio}
          onChangeText={setPrecio}
          placeholder="0.00"
          keyboardType="decimal-pad"
          style={styles.input}
          editable={!guardando}
        />
      </View>

      {/* CATEGORÍA */}

      <View
        style={styles.field}
      >
        <Text
          style={styles.label}
        >
          Categoría
        </Text>

        <TextInput
          value={categoria}
          onChangeText={setCategoria}
          placeholder="Ej. Platos fuertes"
          style={styles.input}
          editable={!guardando}
        />
      </View>

      {/* DISPONIBILIDAD */}

      <View
        style={styles.switchRow}
      >
        <View
          style={styles.switchInfo}
        >
          <Text
            style={styles.switchTitle}
          >
            Disponible
          </Text>

          <Text
            style={styles.switchDescription}
          >
            Los clientes podrán
            comprar este producto.
          </Text>
        </View>

        <Switch
          value={disponible}
          onValueChange={
            setDisponible
          }
          disabled={guardando}
        />
      </View>

      {/* DESTACADO */}

      <View
        style={styles.switchRow}
      >
        <View
          style={styles.switchInfo}
        >
          <Text
            style={styles.switchTitle}
          >
            Producto destacado
          </Text>

          <Text
            style={styles.switchDescription}
          >
            Permite destacar este
            producto posteriormente.
          </Text>
        </View>

        <Switch
          value={destacado}
          onValueChange={
            setDestacado
          }
          disabled={guardando}
        />
      </View>

      {/* GUARDAR */}

      <Pressable
        style={[
          styles.saveButton,
          guardando &&
            styles.disabledButton,
        ]}
        onPress={guardarCambios}
        disabled={guardando}
      >
        {guardando ? (
          <ActivityIndicator
            color="#fff"
          />
        ) : (
          <>
            <MaterialCommunityIcons
              name="content-save-outline"
              size={23}
              color="#fff"
            />

            <Text
              style={
                styles.saveButtonText
              }
            >
              Guardar cambios
            </Text>
          </>
        )}
      </Pressable>

      {/* CANCELAR */}

      <Pressable
        style={styles.cancelButton}
        onPress={() =>
          router.back()
        }
        disabled={guardando}
      >
        <Text
          style={
            styles.cancelButtonText
          }
        >
          Cancelar
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  contentContainer: {
    padding: 20,
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
    fontSize: 16,
    color: "#666",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 25,
  },

  backButton: {
    width: 45,
    height: 45,
    borderRadius: 12,
    backgroundColor: "#F4F8FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  headerText: {
    flex: 1,
  },

  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#222",
  },

  subtitle: {
    marginTop: 3,
    fontSize: 14,
    color: "#777",
  },

  photoSection: {
    alignItems: "center",
    marginBottom: 25,
  },

  productPhoto: {
    width: 180,
    height: 180,
    borderRadius: 18,
    backgroundColor: "#F4F8FF",
  },

  photoPlaceholder: {
    width: 180,
    height: 180,
    borderRadius: 18,
    backgroundColor: "#F4F8FF",
    justifyContent: "center",
    alignItems: "center",
  },

  photoButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: "#F4F8FF",
  },

  photoButtonText: {
    marginLeft: 7,
    color: "#0066CC",
    fontWeight: "600",
  },

  field: {
    marginBottom: 18,
  },

  label: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    marginBottom: 7,
  },

  input: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 16,
    color: "#222",
    backgroundColor: "#FAFAFA",
  },

  textArea: {
    minHeight: 100,
    textAlignVertical: "top",
  },

  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },

  switchInfo: {
    flex: 1,
    paddingRight: 15,
  },

  switchTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#222",
  },

  switchDescription: {
    marginTop: 4,
    fontSize: 13,
    color: "#777",
  },

  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0066CC",
    paddingVertical: 15,
    borderRadius: 12,
    marginTop: 30,
  },

  disabledButton: {
    opacity: 0.6,
  },

  saveButtonText: {
    marginLeft: 8,
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },

  cancelButton: {
    alignItems: "center",
    paddingVertical: 15,
    marginTop: 8,
  },

  cancelButtonText: {
    color: "#666",
    fontSize: 15,
    fontWeight: "600",
  },
});
