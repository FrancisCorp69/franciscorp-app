import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system/legacy";
import { router } from "expo-router";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
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
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { auth, db, storage } from "../../services/firebase";

type DocumentoTipo =
  | "cedula"
  | "licencia"
  | "matricula"
  | "foto_verificacion";

type TipoVehiculo = "moto" | "auto" | "bicicleta";

type DocumentoEstado = {
  cedula: boolean;
  licencia: boolean;
  matricula: boolean;
  fotoVerificacion: boolean;
};

function uriToBlob(uri: string): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.onload = () => {
      if (xhr.response) {
        resolve(xhr.response);
      } else {
        reject(
          new Error("No se pudo leer la imagen seleccionada.")
        );
      }
    };

    xhr.onerror = () => {
      reject(
        new Error("No se pudo leer la imagen seleccionada.")
      );
    };

    xhr.responseType = "blob";
    xhr.open("GET", uri, true);
    xhr.send(null);
  });
}
export default function ExpresoScreen() {
  const [cargando, setCargando] = useState(true);
  const [rolExpresoAprobado, setRolExpresoAprobado] = useState(false);
  const [fechaAprobacion, setFechaAprobacion] = useState("");
  const [disponible, setDisponible] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [configurando, setConfigurando] = useState(false);

const cambiarDisponibilidadExpreso = async () => {
  if (!auth.currentUser) {
    Alert.alert("Error", "No hay una sesiÃƒÆ’Ã‚Â¯Ãƒâ€šÃ‚Â¿Ãƒâ€šÃ‚Â½n activa.");
    return;
  }

  try {
    const nuevoEstado = !disponible;

    await setDoc(
      doc(db, "usuarios", auth.currentUser.uid),
      {
        "expreso.disponible": nuevoEstado,
      },
      { merge: true }
    );

    setDisponible(nuevoEstado);
  } catch (error) {
    console.error("ERROR CAMBIANDO DISPONIBILIDAD:", error);
    Alert.alert(
      "Error",
      "No se pudo cambiar tu disponibilidad."
    );
  }
};

  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [ciudad, setCiudad] = useState("");

  const [tipoVehiculo, setTipoVehiculo] =
    useState<TipoVehiculo>("moto");

  const [marca, setMarca] = useState("");
  const [modelo, setModelo] = useState("");
  const [anio, setAño] = useState("");
  const [color, setColor] = useState("");
  const [placa, setPlaca] = useState("");

  const [documentos, setDocumentos] =
    useState<DocumentoEstado>({
      cedula: false,
      licencia: false,
      matricula: false,
      fotoVerificacion: false,
    });

  const [rutas, setRutas] = useState<Record<string, string>>({});

  useEffect(() => {
    cargarDatos();
  }, []);

  async function cargarDatos() {
    try {
      const usuario = auth.currentUser;

      if (!usuario) {
        router.replace("/login");
        return;
      }

      const usuarioRef = doc(db, "usuarios", usuario.uid);
      const snapshot = await getDoc(usuarioRef);

      if (snapshot.exists()) {
        const datos = snapshot.data();

        const expresoAprobado =
          datos.roles?.Expreso === true &&
          datos.expreso?.estadoVerificacion === "aprobado";

        setRolExpresoAprobado(expresoAprobado);

        setNombre(datos.nombre || "");
        setTelefono(datos.telefono || "");
        setCiudad(datos.ciudad || "");

        if (datos.expreso) {
          const expreso = datos.expreso;
          setDisponible(expreso.disponible === true);
          if (expreso.solicitud?.fechaRevision) {
            const fechaRevision = expreso.solicitud.fechaRevision;

            if (fechaRevision.toDate) {
              setFechaAprobacion(
                fechaRevision.toDate().toLocaleDateString("es-EC")
              );
            }
          }

          setTipoVehiculo(
            expreso.tipoVehiculo || "moto",
          );

          setMarca(expreso.marca || "");
          setModelo(expreso.modelo || "");
          setAño(expreso.anio || "");
          setColor(expreso.color || "");
          setPlaca(expreso.placa || "");

          if (expreso.documentos) {
            setDocumentos({
              cedula:
                expreso.documentos.cedula?.estado ===
                "subido",

              licencia:
                expreso.documentos.licencia?.estado ===
                "subido",

              matricula:
                expreso.documentos.matricula?.estado ===
                "subido",

              fotoVerificacion:
                expreso.documentos.fotoVerificacion
                  ?.estado === "subido",
            });

            setRutas({
              cedula:
                expreso.documentos.cedula?.path || "",

              licencia:
                expreso.documentos.licencia?.path || "",

              matricula:
                expreso.documentos.matricula?.path || "",

              fotoVerificacion:
                expreso.documentos.fotoVerificacion
                  ?.path || "",
            });
          }
        }
      }
    } catch (error) {
      console.log("ERROR CARGANDO EXPRESO:", error);

      Alert.alert(
        "Error",
        "No se pudo cargar la informaciÃƒÂ³n del Expreso.",
      );
    } finally {
      setCargando(false);
    }
  }

  async function seleccionarDocumento(
    tipo: DocumentoTipo,
  ) {
    try {
      const permiso =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permiso.granted) {
        Alert.alert(
          "Permiso necesario",
          "Necesitamos acceso a tus fotografÃƒÆ’Ã‚Â¯Ãƒâ€šÃ‚Â¿Ãƒâ€šÃ‚Â½as.",
        );

        return;
      }

      const resultado =
        await ImagePicker.launchImageLibraryAsync({
          mediaTypes:
            ImagePicker.MediaTypeOptions.Images,

          allowsEditing: false,
          quality: 0.8,
        });

      if (resultado.canceled) {
        return;
      }

      const uri = resultado.assets[0]?.uri;

      if (!uri) {
        Alert.alert(
          "Error",
          "No se encontrÃƒÆ’Ã‚Â¯Ãƒâ€šÃ‚Â¿Ãƒâ€šÃ‚Â½ la imagen.",
        );

        return;
      }

      await subirDocumento(tipo, uri);
    } catch (error: any) {
      console.log(
        "ERROR SELECCIONANDO DOCUMENTO EXPRESO:",
        error,
      );

      Alert.alert(
        "Error",
        error?.message ||
          "No se pudo seleccionar el documento.",
      );
    }
  }

  async function tomarFotoVerificacion() {
    try {
      const permiso =
        await ImagePicker.requestCameraPermissionsAsync();

      if (!permiso.granted) {
        Alert.alert(
          "Permiso necesario",
          "Necesitamos acceso a la cÃƒÆ’Ã‚Â¯Ãƒâ€šÃ‚Â¿Ãƒâ€šÃ‚Â½mara para realizar la verificaciÃƒÆ’Ã‚Â¯Ãƒâ€šÃ‚Â¿Ãƒâ€šÃ‚Â½n.",
        );

        return;
      }

      const resultado =
        await ImagePicker.launchCameraAsync({
          allowsEditing: true,
          aspect: [3, 4],
          quality: 0.8,
          cameraType: ImagePicker.CameraType.front,
        });

      if (resultado.canceled) {
        return;
      }

      const uri = resultado.assets[0]?.uri;

      if (!uri) {
        Alert.alert(
          "Error",
          "No se pudo obtener la fotografÃƒÆ’Ã‚Â¯Ãƒâ€šÃ‚Â¿Ãƒâ€šÃ‚Â½a.",
        );

        return;
      }

      await subirDocumento(
        "foto_verificacion",
        uri,
      );
    } catch (error: any) {
      console.log(
        "ERROR TOMANDO FOTO DE VERIFICACION EXPRESO:",
        error,
      );

      Alert.alert(
        "Error",
        error?.message ||
          "No se pudo tomar la fotografÃƒÆ’Ã‚Â¯Ãƒâ€šÃ‚Â¿Ãƒâ€šÃ‚Â½a.",
      );
    }
  }

  async function subirDocumento(
    tipo: DocumentoTipo,
    uri: string,
  ) {
    try {
      const usuario = auth.currentUser;

      if (!usuario) {
        Alert.alert(
          "SesiÃƒÆ’Ã‚Â¯Ãƒâ€šÃ‚Â¿Ãƒâ€šÃ‚Â½n",
          "Tu sesiÃƒÆ’Ã‚Â¯Ãƒâ€šÃ‚Â¿Ãƒâ€šÃ‚Â½n ha expirado.",
        );

        return;
      }

      setGuardando(true);

      const blob = await uriToBlob(uri);

      const nombreArchivo =
        `${tipo}-${Date.now()}.jpg`;

      let carpeta = "";

      if (tipo === "cedula") {
        carpeta = "identidad";
      }

      if (tipo === "foto_verificacion") {
        carpeta = "identidad";
      }

      if (tipo === "licencia") {
        carpeta = "licencia";
      }

      if (tipo === "matricula") {
        carpeta = "vehículo";
      }

      const ruta =
        `expreso_privado/${usuario.uid}/${carpeta}/${nombreArchivo}`;

      const referencia = ref(storage, ruta);

      console.log("=== DEBUG STORAGE EXPRESO ===");
      console.log("UID:", usuario.uid);
      console.log("RUTA:", ruta);
      console.log("CONTENT TYPE ENVIADO:", "image/jpeg");

      await usuario.getIdToken(true);

      console.log("TOKEN DE AUTENTICACION REFRESCADO");

      await uploadBytes(referencia, blob, {
        contentType: "image/jpeg",
      });

      /*
       * NO usamos getDownloadURL().
       *
       * Los documentos son privados y las Storage Rules
       * impiden que el usuario los lea.
       */

      setRutas((actual) => ({
        ...actual,
        [tipo]: ruta,
      }));

      setDocumentos((actual) => ({
        ...actual,
        [tipo === "foto_verificacion"
          ? "fotoVerificacion"
          : tipo]: true,
      }));

      await guardarDocumentoFirestore(
        usuario.uid,
        tipo,
        ruta,
      );

      Alert.alert(
        "Documento recibido",
        "El documento fue enviado correctamente.",
      );
    } catch (error: any) {
      console.log(
        "ERROR SUBIENDO DOCUMENTO EXPRESO:",
        error,
      );

      Alert.alert(
        "Error",
        error?.message ||
          "No se pudo subir el documento.",
      );
    } finally {
      setGuardando(false);
    }
  }

  async function guardarDocumentoFirestore(
    uid: string,
    tipo: DocumentoTipo,
    path: string,
  ) {
    const usuarioRef = doc(
      db,
      "usuarios",
      uid,
    );

    const snapshot =
      await getDoc(usuarioRef);

    const datos =
      snapshot.exists()
        ? snapshot.data()
        : {};

    const expresoActual =
      datos.expreso || {};

    const documentosActuales =
      expresoActual.documentos || {};

    const clave =
      tipo === "foto_verificacion"
        ? "fotoVerificacion"
        : tipo;

    await setDoc(
      usuarioRef,
      {

        expreso: {
      ...expresoActual,

      estadoVerificacion: expresoActual.estadoVerificacion || "pendiente",

      estado: expresoActual.estado || "en_revision",

      activo: expresoActual.activo ?? false,

      disponible: expresoActual.disponible ?? false,

      documentos: {
            ...documentosActuales,

            [clave]: {
              estado: "subido",
              path,
              fechaSubida: serverTimestamp(),
            },
          },
        },
      },
      {
        merge: true,
      },
    );
  }

  async function guardarConfiguraciónExpreso() {
    try {
      const usuario = auth.currentUser;

      if (!usuario) {
        Alert.alert(
          "SesiÃƒÆ’Ã‚Â¯Ãƒâ€šÃ‚Â¿Ãƒâ€šÃ‚Â½n",
          "Debes iniciar sesiÃƒÆ’Ã‚Â¯Ãƒâ€šÃ‚Â¿Ãƒâ€šÃ‚Â½n.",
        );
        return;
      }

      if (!rolExpresoAprobado) {
        Alert.alert(
          "No disponible",
          "La configuraciÃƒÆ’Ã‚Â¯Ãƒâ€šÃ‚Â¿Ãƒâ€šÃ‚Â½n estarÃƒÆ’Ã‚Â¯Ãƒâ€šÃ‚Â¿Ãƒâ€šÃ‚Â½ disponible cuando tu solicitud sea aprobada.",
        );
        return;
      }

      if (!marca.trim()) {
        Alert.alert(
          "Falta informaciÃƒÆ’Ã‚Â¯Ãƒâ€šÃ‚Â¿Ãƒâ€šÃ‚Â½n",
          "Ingresa la marca del vehÃƒÆ’Ã‚Â¯Ãƒâ€šÃ‚Â¿Ãƒâ€šÃ‚Â½culo.",
        );
        return;
      }

      if (!modelo.trim()) {
        Alert.alert(
          "Falta informaciÃƒÆ’Ã‚Â¯Ãƒâ€šÃ‚Â¿Ãƒâ€šÃ‚Â½n",
          "Ingresa el modelo del vehÃƒÆ’Ã‚Â¯Ãƒâ€šÃ‚Â¿Ãƒâ€šÃ‚Â½culo.",
        );
        return;
      }

      if (!anio.trim()) {
        Alert.alert(
          "Falta informaciÃƒÆ’Ã‚Â¯Ãƒâ€šÃ‚Â¿Ãƒâ€šÃ‚Â½n",
          "Ingresa el aÃƒÆ’Ã‚Â¯Ãƒâ€šÃ‚Â¿Ãƒâ€šÃ‚Â½o del vehÃƒÆ’Ã‚Â¯Ãƒâ€šÃ‚Â¿Ãƒâ€šÃ‚Â½culo.",
        );
        return;
      }

      if (!color.trim()) {
        Alert.alert(
          "Falta informaciÃƒÆ’Ã‚Â¯Ãƒâ€šÃ‚Â¿Ãƒâ€šÃ‚Â½n",
          "Ingresa el color del vehÃƒÆ’Ã‚Â¯Ãƒâ€šÃ‚Â¿Ãƒâ€šÃ‚Â½culo.",
        );
        return;
      }

      if (
        tipoVehiculo !== "bicicleta" &&
        !placa.trim()
      ) {
        Alert.alert(
          "Falta informaciÃƒÆ’Ã‚Â¯Ãƒâ€šÃ‚Â¿Ãƒâ€šÃ‚Â½n",
          "Ingresa la placa del vehÃƒÆ’Ã‚Â¯Ãƒâ€šÃ‚Â¿Ãƒâ€šÃ‚Â½culo.",
        );
        return;
      }

      setGuardando(true);

      await setDoc(
        doc(db, "usuarios", usuario.uid),
        {
          ciudad: ciudad.trim(),

          expreso: {
            tipoVehiculo,
            marca: marca.trim(),
            modelo: modelo.trim(),
            anio: anio.trim(),
            color: color.trim(),
            placa: placa.trim(),
            zonaTrabajo: ciudad.trim(),
          },
        },
        { merge: true },
      );

      setConfigurando(false);

      Alert.alert(
        "ConfiguraciÃƒÆ’Ã‚Â¯Ãƒâ€šÃ‚Â¿Ãƒâ€šÃ‚Â½n guardada",
        "Los cambios de tu informaciÃƒÂ³n Expreso fueron guardados correctamente.",
      );
    } catch (error) {
      console.error(
        "ERROR GUARDANDO CONFIGURACION EXPRESO:",
        error,
      );

      Alert.alert(
        "Error",
        "No se pudieron guardar los cambios.",
      );
    } finally {
      setGuardando(false);
    }
  }
  async function enviarSolicitud() {
    try {
      const usuario = auth.currentUser;

      if (!usuario) {
        Alert.alert(
          "SesiÃƒÆ’Ã‚Â¯Ãƒâ€šÃ‚Â¿Ãƒâ€šÃ‚Â½n",
          "Debes iniciar sesiÃƒÆ’Ã‚Â¯Ãƒâ€šÃ‚Â¿Ãƒâ€šÃ‚Â½n.",
        );

        return;
      }

      if (!marca.trim()) {
        Alert.alert(
          "Falta informaciÃƒÆ’Ã‚Â¯Ãƒâ€šÃ‚Â¿Ãƒâ€šÃ‚Â½n",
          "Ingresa la marca del vehÃƒÆ’Ã‚Â¯Ãƒâ€šÃ‚Â¿Ãƒâ€šÃ‚Â½culo.",
        );

        return;
      }

      if (!modelo.trim()) {
        Alert.alert(
          "Falta informaciÃƒÆ’Ã‚Â¯Ãƒâ€šÃ‚Â¿Ãƒâ€šÃ‚Â½n",
          "Ingresa el modelo del vehÃƒÆ’Ã‚Â¯Ãƒâ€šÃ‚Â¿Ãƒâ€šÃ‚Â½culo.",
        );

        return;
      }

      if (!anio.trim()) {
        Alert.alert(
          "Falta informaciÃƒÆ’Ã‚Â¯Ãƒâ€šÃ‚Â¿Ãƒâ€šÃ‚Â½n",
          "Ingresa el aÃƒÆ’Ã‚Â¯Ãƒâ€šÃ‚Â¿Ãƒâ€šÃ‚Â½o del vehÃƒÆ’Ã‚Â¯Ãƒâ€šÃ‚Â¿Ãƒâ€šÃ‚Â½culo.",
        );

        return;
      }

      if (!color.trim()) {
        Alert.alert(
          "Falta informaciÃƒÆ’Ã‚Â¯Ãƒâ€šÃ‚Â¿Ãƒâ€šÃ‚Â½n",
          "Ingresa el color del vehÃƒÆ’Ã‚Â¯Ãƒâ€šÃ‚Â¿Ãƒâ€šÃ‚Â½culo.",
        );

        return;
      }

      if (
        tipoVehiculo !== "bicicleta" &&
        !placa.trim()
      ) {
        Alert.alert(
          "Falta informaciÃƒÆ’Ã‚Â¯Ãƒâ€šÃ‚Â¿Ãƒâ€šÃ‚Â½n",
          "Ingresa la placa del vehÃƒÆ’Ã‚Â¯Ãƒâ€šÃ‚Â¿Ãƒâ€šÃ‚Â½culo.",
        );

        return;
      }

      if (!documentos.cedula) {
        Alert.alert(
          "Documento pendiente",
          "Debes subir la cÃƒÆ’Ã‚Â¯Ãƒâ€šÃ‚Â¿Ãƒâ€šÃ‚Â½dula.",
        );

        return;
      }

      if (!documentos.licencia) {
        Alert.alert(
          "Documento pendiente",
          "Debes subir la licencia.",
        );

        return;
      }

      if (
        tipoVehiculo !== "bicicleta" &&
        !documentos.matricula
      ) {
        Alert.alert(
          "Documento pendiente",
          "Debes subir la matrÃƒÆ’Ã‚Â¯Ãƒâ€šÃ‚Â¿Ãƒâ€šÃ‚Â½cula.",
        );

        return;
      }

      if (!documentos.fotoVerificacion) {
        Alert.alert(
          "VerificaciÃƒÆ’Ã‚Â¯Ãƒâ€šÃ‚Â¿Ãƒâ€šÃ‚Â½n pendiente",
          "Debes tomar la fotografÃƒÆ’Ã‚Â¯Ãƒâ€šÃ‚Â¿Ãƒâ€šÃ‚Â½a de verificaciÃƒÆ’Ã‚Â¯Ãƒâ€šÃ‚Â¿Ãƒâ€šÃ‚Â½n con la cÃƒÆ’Ã‚Â¯Ãƒâ€šÃ‚Â¿Ãƒâ€šÃ‚Â½mara.",
        );

        return;
      }

      setGuardando(true);

      const usuarioRef = doc(
        db,
        "usuarios",
        usuario.uid,
      );

      await setDoc(
        usuarioRef,
        {
          roles: {
            Cliente: true,

          },

          expreso: {
            activo: false,
            disponible: false,

            estadoVerificacion:
              "pendiente",

            estado:
              "en_revision",

            tipoVehiculo,

            marca: marca.trim(),
            modelo: modelo.trim(),
            anio: anio.trim(),
            color: color.trim(),
            placa: placa.trim(),

            zonaTrabajo:
              ciudad.trim(),

            calificacion: 0,
            totalEntregas: 0,

            ganancias: {
              diario: 0,
              semanal: 0,
              mensual: 0,
              total: 0,
            },

            documentos: {
              cedula: {
                estado: "subido",
                path: rutas.cedula || "",
              },

              licencia: {
                estado: "subido",
                path: rutas.licencia || "",
              },

              matricula: {
                estado:
                  tipoVehiculo ===
                  "bicicleta"
                    ? "no_aplica"
                    : "subido",

                path:
                  rutas.matricula || "",
              },

              fotoVerificacion: {
                estado: "subido",
                path:
                  rutas.fotoVerificacion ||
                  "",
              },
            },

            solicitud: {
              estado: "en_revision",
              fecha:
                serverTimestamp(),
            },
          },
        },
        {
          merge: true,
        },
      );

      Alert.alert(
        "Solicitud enviada",
        "Tu solicitud para trabajar como Expreso fue enviada a revisiÃƒÆ’Ã‚Â¯Ãƒâ€šÃ‚Â¿Ãƒâ€šÃ‚Â½n. PodrÃƒÆ’Ã‚Â¯Ãƒâ€šÃ‚Â¿Ãƒâ€šÃ‚Â½s comenzar a trabajar cuando FrancisCorp apruebe tu solicitud.",
        [
          {
            text: "Continuar",
            onPress: () =>
              router.back(),
          },
        ],
      );
    } catch (error: any) {
      console.log(
        "ERROR ENVIANDO SOLICITUD EXPRESO:",
        error,
      );

      Alert.alert(
        "Error",
        error?.message ||
          "No se pudo enviar la solicitud.",
      );
    } finally {
      setGuardando(false);
    }
  }

  function DocumentoCard({
    titulo,
    descripcion,
    tipo,
    subido,
  }: {
    titulo: string;
    descripcion: string;
    tipo: DocumentoTipo;
    subido: boolean;
  }) {
    return (
      <View style={styles.documentoCard}>
        <View style={styles.documentoIcono}>
          <MaterialCommunityIcons
            name={
              subido
                ? "check-circle"
                : "file-document-outline"
            }
            size={30}
            color={
              subido
                ? "#159447"
                : "#0066CC"
            }
          />
        </View>

        <View style={styles.documentoInfo}>
          <Text style={styles.documentoTitulo}>
            {titulo}
          </Text>

          <Text style={styles.documentoDescripcion}>
            {subido
              ? "Documento recibido correctamente."
              : descripcion}
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.documentoBoton,
            subido &&
              styles.documentoBotonSubido,
          ]}
          onPress={() =>
            seleccionarDocumento(tipo)
          }
          disabled={guardando}
        >
          <Text
            style={
              styles.documentoBotonTexto
            }
          >
            {subido
              ? "Cambiar"
              : "Subir"}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (cargando) {
    return (
      <View style={styles.cargando}>
        <ActivityIndicator
          size="large"
          color="#0066CC"
        />

        <Text style={styles.cargandoTexto}>
          Cargando informaciÃƒÆ’Ã‚Â¯Ãƒâ€šÃ‚Â¿Ãƒâ€šÃ‚Â½n...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={28}
            color="#FFFFFF"
          />
        </TouchableOpacity>

        <View>
          <Text style={styles.headerTitulo}>
            Expreso
          </Text>

          <Text style={styles.headerSubtitulo}>
            Solicitud y verificaciÃƒÂ³n
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={
          styles.contenido
        }
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          style={styles.botonSolicitudes}
          onPress={() =>
            router.push("/rol-expreso/solicitudes")
          }
        >
          <View style={styles.botonSolicitudesIcono}>
            <MaterialCommunityIcons
              name="clipboard-text-outline"
              size={28}
              color="#0066CC"
            />
          </View>

          <View style={styles.botonSolicitudesInfo}>
            <Text style={styles.botonSolicitudesTitulo}>
              Solicitudes de Expreso
            </Text>

            <Text style={styles.botonSolicitudesTexto}>
              Revisa y acepta nuevos servicios.
            </Text>
          </View>

          <MaterialCommunityIcons
            name="chevron-right"
            size={28}
            color="#0066CC"
          />
        </TouchableOpacity>

        <View style={styles.infoBox}>
          <MaterialCommunityIcons
            name="shield-check-outline"
            size={32}
            color="#0066CC"
          />

          <View style={styles.infoTexto}>
            <Text style={styles.infoTitulo}>
              VerificaciÃƒÆ’Ã‚Â¯Ãƒâ€šÃ‚Â¿Ãƒâ€šÃ‚Â½n de identidad
            </Text>

            <Text style={styles.infoDescripcion}>
              Para trabajar como Expreso,
              FrancisCorp debe verificar tu
              identidad y la informaciÃƒÆ’Ã‚Â¯Ãƒâ€šÃ‚Â¿Ãƒâ€šÃ‚Â½n de tu
              vehÃƒÆ’Ã‚Â¯Ãƒâ€šÃ‚Â¿Ãƒâ€šÃ‚Â½culo.
            </Text>
          </View>
        </View>

        {rolExpresoAprobado && (
          <>
          <View style={styles.card}>
            <Text style={styles.seccionTitulo}>
              Rol Expreso aceptado
            </Text>

            <Text style={styles.infoDescripcion}>
              Tu solicitud fue aprobada. Ya puedes trabajar como Expreso.
            </Text>

            {fechaAprobacion ? (
              <Text style={styles.infoDescripcion}>
                Fecha de aprobaciÃƒÆ’Ã‚Â¯Ãƒâ€šÃ‚Â¿Ãƒâ€šÃ‚Â½n: {fechaAprobacion}
              </Text>
            ) : null}

            <View style={styles.disponibilidadFila}>
              <Text style={styles.disponibilidadTexto}>
                Disponibilidad: {disponible ? "Activado" : "Desactivado"}
              </Text>

              <TouchableOpacity
                onPress={cambiarDisponibilidadExpreso}
                style={[
                  styles.disponibilidadControl,
                  disponible
                    ? styles.disponibilidadActivado
                    : styles.disponibilidadDesactivado,
                ]}
              >
                <View style={styles.disponibilidadPunto} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.franjaDorada} />

          <View style={[styles.card, styles.configuracionCard]}>
            <Text style={styles.seccionTitulo}>Configuración</Text>
            <Text style={styles.infoDescripcion}>Configura la información de tu rol Expreso.</Text>
            <TouchableOpacity
              onPress={() => setConfigurando(!configurando)}
              style={[styles.botonEnviar, styles.configuracionBoton]}
            >
              <Text style={styles.botonEnviarTexto}>
                {configurando ? "Cerrar configuracion" : "Configurar mi información"}
              </Text>
            </TouchableOpacity>

            {configurando && (
              <View style={{ marginTop: 16 }}>
                <Text style={styles.label}>
                  Ciudad / zona de trabajo
                </Text>

                <TextInput
                  value={ciudad}
                  onChangeText={setCiudad}
                  placeholder="Ej. Portoviejo"
                  style={styles.input}
                />

                <Text style={styles.label}>
                  Tipo de vehículo
                </Text>

                <View style={styles.vehículos}>
                  {[
                    { valor: "moto", nombre: "Moto", icono: "motorbike" },
                    { valor: "auto", nombre: "Auto", icono: "car" },
                    { valor: "bicicleta", nombre: "Bicicleta", icono: "bike" },
                  ].map((vehículo) => (
                    <TouchableOpacity
                      key={vehículo.valor}
                      style={[
                        styles.vehículo,
                        tipoVehiculo === vehículo.valor &&
                          styles.vehículoActivo,
                      ]}
                      onPress={() =>
                        setTipoVehiculo(
                          vehículo.valor as TipoVehiculo,
                        )
                      }
                    >
                      <MaterialCommunityIcons
                        name={vehículo.icono as any}
                        size={28}
                        color={
                          tipoVehiculo === vehículo.valor
                            ? "#FFFFFF"
                            : "#0066CC"
                        }
                      />

                      <Text
                        style={[
                          styles.vehículoTexto,
                          tipoVehiculo === vehículo.valor &&
                            styles.vehículoTextoActivo,
                        ]}
                      >
                        {vehículo.nombre}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.label}>Marca</Text>

                <TextInput
                  value={marca}
                  onChangeText={setMarca}
                  placeholder="Ej. Honda"
                  style={styles.input}
                />

                <Text style={styles.label}>Modelo</Text>

                <TextInput
                  value={modelo}
                  onChangeText={setModelo}
                  placeholder="Ej. CB190"
                  style={styles.input}
                />

                <Text style={styles.label}>Año</Text>

                <TextInput
                  value={anio}
                  onChangeText={setAño}
                  placeholder="Ej. 2024"
                  keyboardType="numeric"
                  style={styles.input}
                />

                <Text style={styles.label}>Color</Text>

                <TextInput
                  value={color}
                  onChangeText={setColor}
                  placeholder="Ej. Negro"
                  style={styles.input}
                />

                {tipoVehiculo !== "bicicleta" && (
                  <>
                    <Text style={styles.label}>Placa</Text>

                    <TextInput
                      value={placa}
                      onChangeText={setPlaca}
                      placeholder="Ej. ABC-1234"
                      autoCapitalize="characters"
                      style={styles.input}
                    />
                  </>
                )}

                <TouchableOpacity
                  style={[
                    styles.botonEnviar,
                    guardando && styles.botonDeshabilitado,
                  ]}
                  onPress={guardarConfiguraciónExpreso}
                  disabled={guardando}
                >
                  {guardando ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.botonEnviarTexto}>
                      Guardar cambios
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            )}          </View>
          </>
        )}

        {!rolExpresoAprobado && (
          <>
        <Text style={styles.seccionTitulo}>
          InformaciÃƒÆ’Ã‚Â¯Ãƒâ€šÃ‚Â¿Ãƒâ€šÃ‚Â½n personal
        </Text>

        <View style={styles.card}>
          <Text style={styles.label}>
            Nombre completo
          </Text>

          <TextInput
            value={nombre}
            editable={false}
            style={[
              styles.input,
              styles.inputBloqueado,
            ]}
          />

          <Text style={styles.label}>
            TelÃƒÆ’Ã‚Â¯Ãƒâ€šÃ‚Â¿Ãƒâ€šÃ‚Â½fono
          </Text>

          <TextInput
            value={telefono}
            editable={false}
            style={[
              styles.input,
              styles.inputBloqueado,
            ]}
          />

          <Text style={styles.label}>
            Ciudad / zona de trabajo
          </Text>

          <TextInput
            value={ciudad}
            onChangeText={setCiudad}
            placeholder="Ej. Portoviejo"
            style={styles.input}
          />
        </View>

        <Text style={styles.seccionTitulo}>
          VehÃƒÆ’Ã‚Â¯Ãƒâ€šÃ‚Â¿Ãƒâ€šÃ‚Â½culo
        </Text>

        <View style={styles.card}>
          <Text style={styles.label}>
            Tipo de vehÃƒÆ’Ã‚Â¯Ãƒâ€šÃ‚Â¿Ãƒâ€šÃ‚Â½culo
          </Text>

          <View style={styles.vehículos}>
            {[
              {
                valor: "moto",
                nombre: "Moto",
                icono: "motorbike",
              },
              {
                valor: "auto",
                nombre: "Auto",
                icono: "car",
              },
              {
                valor: "bicicleta",
                nombre: "Bicicleta",
                icono: "bike",
              },
            ].map((vehículo) => (
              <TouchableOpacity
                key={vehículo.valor}
                style={[
                  styles.vehículo,
                  tipoVehiculo ===
                    vehículo.valor &&
                    styles.vehículoActivo,
                ]}
                onPress={() =>
                  setTipoVehiculo(
                    vehículo.valor as TipoVehiculo,
                  )
                }
              >
                <MaterialCommunityIcons
                  name={
                    vehículo.icono as any
                  }
                  size={30}
                  color={
                    tipoVehiculo ===
                    vehículo.valor
                      ? "#FFFFFF"
                      : "#0066CC"
                  }
                />

                <Text
                  style={[
                    styles.vehículoTexto,
                    tipoVehiculo ===
                      vehículo.valor &&
                      styles.vehículoTextoActivo,
                  ]}
                >
                  {vehículo.nombre}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>
            Marca
          </Text>

          <TextInput
            value={marca}
            onChangeText={setMarca}
            placeholder="Ej. Honda"
            style={styles.input}
          />

          <Text style={styles.label}>
            Modelo
          </Text>

          <TextInput
            value={modelo}
            onChangeText={setModelo}
            placeholder="Ej. CB190"
            style={styles.input}
          />

          <Text style={styles.label}>
            AÃƒÆ’Ã‚Â¯Ãƒâ€šÃ‚Â¿Ãƒâ€šÃ‚Â½o
          </Text>

          <TextInput
            value={anio}
            onChangeText={setAño}
            placeholder="Ej. 2024"
            keyboardType="numeric"
            style={styles.input}
          />

          <Text style={styles.label}>
            Color
          </Text>

          <TextInput
            value={color}
            onChangeText={setColor}
            placeholder="Ej. Negro"
            style={styles.input}
          />

          {tipoVehiculo !==
            "bicicleta" && (
            <>
              <Text style={styles.label}>
                Placa
              </Text>

              <TextInput
                value={placa}
                onChangeText={setPlaca}
                placeholder="Ej. ABC-1234"
                autoCapitalize="characters"
                style={styles.input}
              />
            </>
          )}
        </View>

        <Text style={styles.seccionTitulo}>
          DocumentaciÃƒÆ’Ã‚Â¯Ãƒâ€šÃ‚Â¿Ãƒâ€šÃ‚Â½n
        </Text>

        <DocumentoCard
          titulo="CÃƒÆ’Ã‚Â¯Ãƒâ€šÃ‚Â¿Ãƒâ€šÃ‚Â½dula"
          descripcion="Sube una fotografÃƒÆ’Ã‚Â¯Ãƒâ€šÃ‚Â¿Ãƒâ€šÃ‚Â½a clara de tu cÃƒÆ’Ã‚Â¯Ãƒâ€šÃ‚Â¿Ãƒâ€šÃ‚Â½dula."
          tipo="cedula"
          subido={documentos.cedula}
        />

        <DocumentoCard
          titulo="Licencia de conducir"
          descripcion="Sube una fotografÃƒÆ’Ã‚Â¯Ãƒâ€šÃ‚Â¿Ãƒâ€šÃ‚Â½a clara de tu licencia."
          tipo="licencia"
          subido={documentos.licencia}
        />

        {tipoVehiculo !==
          "bicicleta" && (
          <DocumentoCard
            titulo="MatrÃƒÆ’Ã‚Â¯Ãƒâ€šÃ‚Â¿Ãƒâ€šÃ‚Â½cula"
            descripcion="Sube una fotografÃƒÆ’Ã‚Â¯Ãƒâ€šÃ‚Â¿Ãƒâ€šÃ‚Â½a clara de la matrÃƒÆ’Ã‚Â¯Ãƒâ€šÃ‚Â¿Ãƒâ€šÃ‚Â½cula."
            tipo="matricula"
            subido={documentos.matricula}
          />
        )}

        <View style={styles.verificacionCard}>
          <MaterialCommunityIcons
            name={
              documentos.fotoVerificacion
                ? "account-check"
                : "camera-account"
            }
            size={42}
            color={
              documentos.fotoVerificacion
                ? "#159447"
                : "#0066CC"
            }
          />

          <Text
            style={
              styles.verificacionTitulo
            }
          >
            FotografÃƒÆ’Ã‚Â¯Ãƒâ€šÃ‚Â¿Ãƒâ€šÃ‚Â½a de verificaciÃƒÆ’Ã‚Â¯Ãƒâ€šÃ‚Â¿Ãƒâ€šÃ‚Â½n
          </Text>

          <Text
            style={
              styles.verificacionDescripcion
            }
          >
            Esta fotografÃƒÆ’Ã‚Â¯Ãƒâ€šÃ‚Â¿Ãƒâ€šÃ‚Â½a debe tomarse
            directamente con la cÃƒÆ’Ã‚Â¯Ãƒâ€šÃ‚Â¿Ãƒâ€šÃ‚Â½mara
            frontal. No se puede seleccionar
            desde la galerÃƒÆ’Ã‚Â¯Ãƒâ€šÃ‚Â¿Ãƒâ€šÃ‚Â½a.
          </Text>

          <TouchableOpacity
            style={
              styles.botonCamara
            }
            onPress={
              tomarFotoVerificacion
            }
            disabled={guardando}
          >
            <MaterialCommunityIcons
              name="camera"
              size={22}
              color="#FFFFFF"
            />

            <Text
              style={
                styles.botonCamaraTexto
              }
            >
              {documentos.fotoVerificacion
                ? "Tomar nueva fotografÃƒÆ’Ã‚Â¯Ãƒâ€šÃ‚Â¿Ãƒâ€šÃ‚Â½a"
                : "Tomar fotografÃƒÆ’Ã‚Â¯Ãƒâ€šÃ‚Â¿Ãƒâ€šÃ‚Â½a"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.seguridad}>
          <MaterialCommunityIcons
            name="lock"
            size={22}
            color="#555"
          />

          <Text style={styles.seguridadTexto}>
            Tus documentos de identidad se
            almacenan en un ÃƒÆ’Ã‚Â¯Ãƒâ€šÃ‚Â¿Ãƒâ€šÃ‚Â½rea privada de
            FrancisCorp y no son pÃƒÆ’Ã‚Â¯Ãƒâ€šÃ‚Â¿Ãƒâ€šÃ‚Â½blicos.
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.botonEnviar,
            guardando &&
              styles.botonDeshabilitado,
          ]}
          onPress={enviarSolicitud}
          disabled={guardando}
        >
          {guardando ? (
            <ActivityIndicator
              color="#FFFFFF"
            />
          ) : (
            <>
              <MaterialCommunityIcons
                name="send-check"
                size={23}
                color="#FFFFFF"
              />

              <Text
                style={
                  styles.botonEnviarTexto
                }
              >
                Enviar solicitud
              </Text>
            </>
          )}
        </TouchableOpacity>

        <Text style={styles.notaFinal}>
          Tu cuenta seguirÃƒÆ’Ã‚Â¯Ãƒâ€šÃ‚Â¿Ãƒâ€šÃ‚Â½ siendo una sola
          cuenta FrancisCorp. El rol Expreso
          se aÃƒÆ’Ã‚Â¯Ãƒâ€šÃ‚Â¿Ãƒâ€šÃ‚Â½adirÃƒÆ’Ã‚Â¯Ãƒâ€šÃ‚Â¿Ãƒâ€šÃ‚Â½ a tu usuario existente.
        </Text>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
franjaDorada: {
  height: 6,
  backgroundColor: "#D4AF37",
  marginVertical: 12,
  borderRadius: 3,
},

configuracionCard: {
  marginTop: 0,
},

configuracionBoton: {
  marginTop: 12,
},
disponibilidadFila: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  marginTop: 16,
},
disponibilidadTexto: {
  fontSize: 16,
  fontWeight: "600",
  color: "#333",
},
disponibilidadControl: {
  width: 54,
  height: 30,
  borderRadius: 15,
  justifyContent: "center",
  paddingHorizontal: 3,
},
disponibilidadActivado: {
  backgroundColor: "#2e7d32",
  alignItems: "flex-end",
},
disponibilidadDesactivado: {
  backgroundColor: "#c62828",
  alignItems: "flex-start",
},
disponibilidadPunto: {
  width: 24,
  height: 24,
  borderRadius: 12,
  backgroundColor: "#fff",
},

  cargando: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F5F7FA",
  },

  cargandoTexto: {
    marginTop: 12,
    color: "#555",
    fontSize: 15,
  },

  header: {
    backgroundColor: "#0066CC",
    paddingTop: 55,
    paddingBottom: 18,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
  },

  backButton: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  headerTitulo: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "800",
  },

  headerSubtitulo: {
    color: "#DCEEFF",
    marginTop: 2,
    fontSize: 13,
  },

  contenido: {
    padding: 16,
    paddingBottom: 45,
  },

  botonSolicitudes: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 15,
    marginBottom: 18,
    flexDirection: "row",
    alignItems: "center",
    elevation: 2,
  },

  botonSolicitudesIcono: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#EAF4FF",
    alignItems: "center",
    justifyContent: "center",
  },

  botonSolicitudesInfo: {
    flex: 1,
    marginLeft: 12,
  },

  botonSolicitudesTitulo: {
    fontSize: 16,
    fontWeight: "800",
    color: "#172033",
  },

  botonSolicitudesTexto: {
    fontSize: 13,
    color: "#666",
    marginTop: 3,
  },

  infoBox: {
    backgroundColor: "#EAF4FF",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    marginBottom: 22,
  },

  infoTexto: {
    flex: 1,
    marginLeft: 12,
  },

  infoTitulo: {
    fontSize: 16,
    fontWeight: "800",
    color: "#123",
  },

  infoDescripcion: {
    color: "#555",
    lineHeight: 20,
    marginTop: 4,
  },

  seccionTitulo: {
    fontSize: 19,
    fontWeight: "800",
    color: "#172033",
    marginTop: 8,
    marginBottom: 10,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 18,
    elevation: 2,
  },

  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "#333",
    marginBottom: 7,
    marginTop: 8,
  },

  input: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#D9E0E8",
    borderRadius: 11,
    paddingHorizontal: 13,
    paddingVertical: 12,
    fontSize: 15,
    color: "#222",
  },

  inputBloqueado: {
    color: "#777",
    backgroundColor: "#EEF1F4",
  },

  vehículos: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 10,
  },

  vehículo: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 13,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D6E2F0",
    backgroundColor: "#F8FBFF",
  },

  vehículoActivo: {
    backgroundColor: "#0066CC",
    borderColor: "#0066CC",
  },

  vehículoTexto: {
    marginTop: 5,
    color: "#0066CC",
    fontWeight: "700",
  },

  vehículoTextoActivo: {
    color: "#FFFFFF",
  },

  documentoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    elevation: 1,
  },

  documentoIcono: {
    width: 45,
    alignItems: "center",
  },

  documentoInfo: {
    flex: 1,
    paddingHorizontal: 8,
  },

  documentoTitulo: {
    fontSize: 15,
    fontWeight: "800",
    color: "#222",
  },

  documentoDescripcion: {
    fontSize: 12,
    color: "#666",
    marginTop: 3,
    lineHeight: 17,
  },

  documentoBoton: {
    backgroundColor: "#0066CC",
    borderRadius: 9,
    paddingHorizontal: 13,
    paddingVertical: 9,
  },

  documentoBotonSubido: {
    backgroundColor: "#159447",
  },

  documentoBotonTexto: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 13,
  },

  verificacionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 20,
    alignItems: "center",
    marginTop: 10,
    elevation: 2,
  },

  verificacionTitulo: {
    fontSize: 18,
    fontWeight: "800",
    color: "#222",
    marginTop: 10,
  },

  verificacionDescripcion: {
    textAlign: "center",
    color: "#666",
    lineHeight: 20,
    marginTop: 7,
    marginBottom: 15,
  },

  botonCamara: {
    backgroundColor: "#0066CC",
    borderRadius: 11,
    paddingHorizontal: 18,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  botonCamaraTexto: {
    color: "#FFFFFF",
    fontWeight: "800",
  },

  seguridad: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ECEFF3",
    borderRadius: 12,
    padding: 13,
    marginTop: 15,
  },

  seguridadTexto: {
    flex: 1,
    marginLeft: 9,
    color: "#555",
    lineHeight: 18,
    fontSize: 12,
  },

  botonEnviar: {
    backgroundColor: "#159447",
    borderRadius: 14,
    minHeight: 52,
    marginTop: 22,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 9,
  },

  botonDeshabilitado: {
    opacity: 0.65,
  },

  botonEnviarTexto: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },

  notaFinal: {
    textAlign: "center",
    color: "#777",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 15,
  },
});













































