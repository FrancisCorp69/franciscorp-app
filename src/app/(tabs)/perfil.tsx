import { useEffect, useState } from "react";

import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { router } from "expo-router";

import { signOut } from "firebase/auth";

import { auth, db, storage } from "../../services/firebase";

import * as FileSystem from "expo-file-system/legacy";

import * as ImagePicker from "expo-image-picker";

import { doc, getDoc, updateDoc } from "firebase/firestore";

import { getDownloadURL, ref } from "firebase/storage";

export default function PerfilScreen() {
  const [cargando, setCargando] = useState(true);

  const [nombre, setNombre] = useState("");

  const [correo, setCorreo] = useState("");

  const [telefono, setTelefono] = useState("");

  const [direccion, setDireccion] = useState("");

  const [ciudad, setCiudad] = useState("");

  const [fotoPerfil, setFotoPerfil] = useState<string | null>(null);

  useEffect(() => {
    cargarPerfil();
  }, []);

  async function cargarPerfil() {
    try {
      const usuario = auth.currentUser;

      if (!usuario) {
        router.replace("/login");

        return;
      }

      const documento = await getDoc(doc(db, "usuarios", usuario.uid));

      if (documento.exists()) {
        const datos = documento.data();

        setNombre(datos.nombre || "");

        setCorreo(datos.correo || usuario.email || "");

        setTelefono(datos.telefono || "");

        setDireccion(datos.direccion || "");

        setCiudad(datos.ciudad || "");

        if (datos.fotoPerfil) {
          setFotoPerfil(datos.fotoPerfil);
        }
      }
    } catch (error) {
      console.log(error);

      Alert.alert("Error", "No se pudo cargar el perfil.");
    } finally {
      setCargando(false);
    }
  }

  async function seleccionarFoto() {
    try {
      const permiso = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permiso.granted) {
        Alert.alert("Permiso necesario", "Debes permitir acceso a tus fotos.");

        return;
      }

      const resultado = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],

        allowsEditing: true,

        aspect: [1, 1],

        quality: 0.7,
      });

      if (resultado.canceled) {
        return;
      }

      const imagen = resultado.assets[0];

      const usuario = auth.currentUser;

      if (!usuario) {
        return;
      }

      console.log("Preparando imagen...");

      const base64 = await FileSystem.readAsStringAsync(
        imagen.uri,

        {
          encoding: FileSystem.EncodingType.Base64,
        },
      );

      console.log("Imagen convertida");

      const rutaArchivo = `usuarios/${usuario.uid}/fotoPerfil.jpg`;

      console.log("Subiendo imagen...");

      const token = await usuario.getIdToken();

      const bytes = Uint8Array.from(
        atob(base64),

        (c) => c.charCodeAt(0),
      );

      const respuesta = await fetch(
        `https://firebasestorage.googleapis.com/v0/b/${storage.app.options.storageBucket}/o?uploadType=media&name=${encodeURIComponent(rutaArchivo)}`,

        {
          method: "POST",

          headers: {
            "Content-Type": "image/jpeg",

            Authorization: `Firebase ${token}`,
          },

          body: bytes,
        },
      );

      if (!respuesta.ok) {
        const errorTexto = await respuesta.text();

        throw new Error(errorTexto);
      }

      console.log("Imagen subida correctamente");

      const referencia = ref(storage, rutaArchivo);

      const urlFoto = await getDownloadURL(referencia);

      await updateDoc(
        doc(db, "usuarios", usuario.uid),

        {
          fotoPerfil: urlFoto,
        },
      );

      setFotoPerfil(urlFoto);

      Alert.alert(
        "Éxito",

        "Foto de perfil guardada.",
      );
    } catch (error) {
      console.log("ERROR FOTO:", error);

      Alert.alert(
        "Error",

        "No se pudo guardar la foto.",
      );
    }
  }
  async function cerrarSesion() {
    try {
      await signOut(auth);

      router.replace("/login");
    } catch {
      Alert.alert("Error", "No se pudo cerrar sesión.");
    }
  }

  if (cargando) {
    return (
      <View style={styles.cargando}>
        <ActivityIndicator size="large" color="#208AEF" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contenido}
      showsVerticalScrollIndicator={false}
    >
      <TouchableOpacity onPress={seleccionarFoto}>
        <Image
          source={
            fotoPerfil
              ? {
                  uri: fotoPerfil,
                }
              : require("../../../assets/images/franciscorp-logo.png")
          }
          style={styles.foto}
        />
      </TouchableOpacity>

      <Text style={styles.titulo}>Mi Perfil</Text>

      <View style={styles.info}>
        <Text style={styles.label}>Nombre</Text>

        <Text style={styles.valor}>{nombre || "No registrado"}</Text>

        <Text style={styles.label}>Correo</Text>

        <Text style={styles.valor}>{correo || "No registrado"}</Text>

        <Text style={styles.label}>Teléfono</Text>

        <Text style={styles.valor}>{telefono || "No registrado"}</Text>

        <Text style={styles.label}>Dirección</Text>

        <Text style={styles.valor}>{direccion || "No registrada"}</Text>

        <Text style={styles.label}>Ciudad</Text>

        <Text style={styles.valor}>{ciudad || "No registrada"}</Text>
      </View>

      <TouchableOpacity
        style={styles.botonEditar}
        onPress={() => router.push("/editar-perfil")}
      >
        <Text style={styles.textoBotonEditar}>Editar perfil</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.botonCerrar} onPress={cerrarSesion}>
        <Text style={styles.textoBotonCerrar}>Cerrar sesión</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,

    backgroundColor: "#ffffff",
  },

  contenido: {
    alignItems: "center",

    padding: 25,

    paddingBottom: 120,
  },

  cargando: {
    flex: 1,

    justifyContent: "center",

    alignItems: "center",

    backgroundColor: "#ffffff",
  },

  foto: {
    width: 120,

    height: 120,

    marginTop: 40,

    borderRadius: 60,
  },

  titulo: {
    fontSize: 30,

    fontWeight: "bold",

    color: "#208AEF",

    marginVertical: 25,
  },

  info: {
    width: "100%",

    backgroundColor: "#F5F8FC",

    borderRadius: 15,

    padding: 20,
  },

  label: {
    fontWeight: "bold",

    color: "#208AEF",

    marginTop: 12,
  },

  valor: {
    fontSize: 16,

    color: "#333333",

    marginTop: 5,
  },

  botonEditar: {
    width: "100%",

    height: 55,

    backgroundColor: "#208AEF",

    borderRadius: 12,

    justifyContent: "center",

    alignItems: "center",

    marginTop: 25,
  },

  textoBotonEditar: {
    color: "#ffffff",

    fontSize: 18,

    fontWeight: "bold",
  },

  botonCerrar: {
    width: "100%",

    height: 55,

    backgroundColor: "#555555",

    borderRadius: 12,

    justifyContent: "center",

    alignItems: "center",

    marginTop: 15,
  },

  textoBotonCerrar: {
    color: "#ffffff",

    fontSize: 18,

    fontWeight: "bold",
  },
});
