import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
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

import { auth, db } from "../../../services/firebase";

export default function SolicitarDeliveryScreen() {
  const params = useLocalSearchParams<{
    deliveryId?: string;
    nombre?: string;
  }>();

  const deliveryId =
    typeof params.deliveryId === "string"
      ? params.deliveryId
      : "";

  const nombreDelivery =
    typeof params.nombre === "string"
      ? params.nombre
      : "Delivery";

  const [origen, setOrigen] = useState("");
  const [destino, setDestino] = useState("");
  const [descripcion, setDescripcion] = useState("");

  const [precio, setPrecio] = useState("");
  const [calculando, setCalculando] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const calcularPrecio = () => {
    if (!origen.trim()) {
      Alert.alert(
        "Falta el origen",
        "Ingresa el lugar donde debe recoger el pedido."
      );
      return;
    }

    if (!destino.trim()) {
      Alert.alert(
        "Falta el destino",
        "Ingresa el lugar donde debe entregar el pedido."
      );
      return;
    }

    setCalculando(true);

    /*
     * V1:
     * Usamos una tarifa estimada sencilla.
     *
     * Más adelante podremos reemplazar esto por:
     * - distancia real
     * - tiempo estimado
     * - zona
     * - tipo de vehículo
     * - tarifa mínima
     * - tarifa por kilómetro
     */

    setTimeout(() => {
      setPrecio("3.00");
      setCalculando(false);
    }, 500);
  };

  const enviarSolicitud = async () => {
    try {
      const usuario = auth.currentUser;

      if (!usuario) {
        Alert.alert(
          "Sesión",
          "Debes iniciar sesión para solicitar un Delivery."
        );
        return;
      }

      if (!deliveryId) {
        Alert.alert(
          "Error",
          "No se encontró el Delivery seleccionado."
        );
        return;
      }

      if (!origen.trim()) {
        Alert.alert(
          "Falta el origen",
          "Ingresa el lugar de recogida."
        );
        return;
      }

      if (!destino.trim()) {
        Alert.alert(
          "Falta el destino",
          "Ingresa el lugar de entrega."
        );
        return;
      }

      if (!descripcion.trim()) {
        Alert.alert(
          "Falta información",
          "Describe qué debe transportar el Delivery."
        );
        return;
      }

      const precioNumerico = Number(precio);

      if (!precioNumerico || precioNumerico <= 0) {
        Alert.alert(
          "Precio pendiente",
          "Primero calcula el precio estimado."
        );
        return;
      }

      setEnviando(true);

      /*
       * Verificamos nuevamente al Delivery antes de crear
       * la solicitud.
       */
      const deliveryRef = doc(
        db,
        "usuarios",
        deliveryId
      );

      const deliverySnapshot =
        await getDoc(deliveryRef);

      if (!deliverySnapshot.exists()) {
        Alert.alert(
          "Delivery no encontrado",
          "El Delivery seleccionado ya no está disponible."
        );
        return;
      }

      const deliveryData =
        deliverySnapshot.data();

      const disponible =
        deliveryData.roles?.Delivery === true &&
        deliveryData.delivery?.estadoVerificacion ===
          "aprobado" &&
        deliveryData.delivery?.activo === true &&
        deliveryData.delivery?.disponible === true;

      if (!disponible) {
        Alert.alert(
          "Delivery no disponible",
          "Este Delivery ya no está disponible. Regresa y selecciona otro."
        );
        return;
      }

      const solicitud = {
        clienteId: usuario.uid,

        deliveryId,

        estado: "solicitado",

        origen: origen.trim(),

        destino: destino.trim(),

        descripcion: descripcion.trim(),

        precioEstimado: precioNumerico,

        calificacion: null,

        comentarioCalificacion: "",

        ratingProcesada: false,

        fechaCreacion:
          serverTimestamp(),

        fechaActualizacion:
          serverTimestamp(),
      };

      const referencia =
        await addDoc(
          collection(
            db,
            "solicitudes_delivery"
          ),
          solicitud
        );

      Alert.alert(
        "Solicitud enviada",
        `Tu solicitud fue enviada a ${nombreDelivery}. Te notificaremos cuando responda.`,
        [
          {
            text: "Ver solicitud",
            onPress: () => {
              router.replace({
                pathname:
                  "/servicios/delivery/seguimiento" as any,
                params: {
                  solicitudId:
                    referencia.id,
                },
              });
            },
          },
        ]
      );
    } catch (error: any) {
      console.error(
        "ERROR CREANDO SOLICITUD DELIVERY:",
        error
      );

      Alert.alert(
        "Error",
        error?.message ||
          "No se pudo enviar la solicitud."
      );
    } finally {
      setEnviando(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.botonAtras}
          onPress={() => router.back()}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={27}
            color="#0066CC"
          />
        </TouchableOpacity>

        <View style={styles.headerTextos}>
          <Text style={styles.titulo}>
            Solicitar Delivery
          </Text>

          <Text style={styles.subtitulo}>
            Servicio con {nombreDelivery}
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.contenido}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.deliverySeleccionado}>
          <MaterialCommunityIcons
            name="truck-fast-outline"
            size={30}
            color="#0066CC"
          />

          <View style={styles.deliveryInfo}>
            <Text style={styles.deliveryLabel}>
              Delivery seleccionado
            </Text>

            <Text style={styles.deliveryNombre}>
              {nombreDelivery}
            </Text>
          </View>
        </View>

        <Text style={styles.seccionTitulo}>
          ¿Dónde debe recoger?
        </Text>

        <View style={styles.card}>
          <Text style={styles.label}>
            Lugar de origen
          </Text>

          <View style={styles.inputFila}>
            <MaterialCommunityIcons
              name="map-marker"
              size={22}
              color="#20A050"
            />

            <TextInput
              value={origen}
              onChangeText={setOrigen}
              placeholder="Ej. Mi casa, calle y referencia"
              style={styles.input}
              multiline
            />
          </View>
        </View>

        <Text style={styles.seccionTitulo}>
          ¿Dónde debe entregar?
        </Text>

        <View style={styles.card}>
          <Text style={styles.label}>
            Lugar de destino
          </Text>

          <View style={styles.inputFila}>
            <MaterialCommunityIcons
              name="map-marker-check"
              size={22}
              color="#D62828"
            />

            <TextInput
              value={destino}
              onChangeText={setDestino}
              placeholder="Ej. Dirección del destinatario"
              style={styles.input}
              multiline
            />
          </View>
        </View>

        <Text style={styles.seccionTitulo}>
          ¿Qué debe transportar?
        </Text>

        <View style={styles.card}>
          <Text style={styles.label}>
            Descripción
          </Text>

          <TextInput
            value={descripcion}
            onChangeText={setDescripcion}
            placeholder="Ej. Un paquete pequeño con ropa"
            style={styles.textarea}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />

          <Text style={styles.ayuda}>
            No envíes objetos peligrosos, ilegales o prohibidos.
          </Text>
        </View>

        <Text style={styles.seccionTitulo}>
          Precio estimado
        </Text>

        <View style={styles.precioCard}>
          <View style={styles.precioIcono}>
            <MaterialCommunityIcons
              name="cash"
              size={30}
              color="#159447"
            />
          </View>

          <View style={styles.precioInfo}>
            <Text style={styles.precioLabel}>
              Tarifa estimada
            </Text>

            <Text style={styles.precio}>
              {precio
                ? `$${Number(precio).toFixed(2)}`
                : "$0.00"}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.botonCalcular}
          onPress={calcularPrecio}
          disabled={calculando || enviando}
        >
          {calculando ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <MaterialCommunityIcons
                name="calculator"
                size={21}
                color="#FFFFFF"
              />

              <Text style={styles.botonCalcularTexto}>
                Calcular precio
              </Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.botonEnviar,
            enviando &&
              styles.botonDeshabilitado,
          ]}
          onPress={enviarSolicitud}
          disabled={enviando}
        >
          {enviando ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <MaterialCommunityIcons
                name="send-check"
                size={23}
                color="#FFFFFF"
              />

              <Text style={styles.botonEnviarTexto}>
                Enviar solicitud
              </Text>
            </>
          )}
        </TouchableOpacity>

        <Text style={styles.nota}>
          El Delivery recibirá una notificación y podrá aceptar o rechazar tu solicitud.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },

  header: {
    paddingTop: 55,
    paddingHorizontal: 18,
    paddingBottom: 18,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#E8E8E8",
  },

  botonAtras: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F0F6FF",
  },

  headerTextos: {
    marginLeft: 13,
    flex: 1,
  },

  titulo: {
    fontSize: 23,
    fontWeight: "800",
    color: "#222",
  },

  subtitulo: {
    marginTop: 3,
    fontSize: 14,
    color: "#777",
  },

  contenido: {
    padding: 16,
    paddingBottom: 45,
  },

  deliverySeleccionado: {
    backgroundColor: "#EAF4FF",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 22,
  },

  deliveryInfo: {
    marginLeft: 12,
    flex: 1,
  },

  deliveryLabel: {
    fontSize: 12,
    color: "#666",
  },

  deliveryNombre: {
    marginTop: 2,
    fontSize: 18,
    fontWeight: "800",
    color: "#222",
  },

  seccionTitulo: {
    fontSize: 18,
    fontWeight: "800",
    color: "#172033",
    marginBottom: 10,
    marginTop: 8,
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
    marginBottom: 8,
  },

  inputFila: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#D9E0E8",
    borderRadius: 11,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },

  input: {
    flex: 1,
    marginLeft: 8,
    minHeight: 45,
    fontSize: 15,
    color: "#222",
  },

  textarea: {
    minHeight: 105,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#D9E0E8",
    borderRadius: 11,
    paddingHorizontal: 13,
    paddingVertical: 12,
    fontSize: 15,
    color: "#222",
  },

  ayuda: {
    marginTop: 8,
    fontSize: 12,
    color: "#777",
    lineHeight: 17,
  },

  precioCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    elevation: 2,
  },

  precioIcono: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#EAF8EE",
    alignItems: "center",
    justifyContent: "center",
  },

  precioInfo: {
    marginLeft: 13,
  },

  precioLabel: {
    fontSize: 13,
    color: "#777",
  },

  precio: {
    marginTop: 2,
    fontSize: 27,
    fontWeight: "900",
    color: "#159447",
  },

  botonCalcular: {
    marginTop: 12,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#0066CC",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  botonCalcularTexto: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },

  botonEnviar: {
    marginTop: 14,
    minHeight: 54,
    borderRadius: 14,
    backgroundColor: "#159447",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
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

  nota: {
    marginTop: 14,
    textAlign: "center",
    color: "#777",
    fontSize: 12,
    lineHeight: 18,
  },
});
