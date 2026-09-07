import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { auth, db } from "../../../services/firebase";

const TARIFA_BASE = 2.5;
const TARIFA_POR_KM = 0.5;

export default function SolicitarDeliveryScreen() {
  const params = useLocalSearchParams<{
    deliveryId?: string;
    nombre?: string;
  }>();

  const deliveryId = String(params.deliveryId || "");
  const nombreDelivery = String(params.nombre || "Delivery");

  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);

  const [origen, setOrigen] = useState("");
  const [destino, setDestino] = useState("");
  const [descripcion, setDescripcion] = useState("");

  const [distancia, setDistancia] = useState("3");

  useEffect(() => {
    verificarDelivery();
  }, []);

  async function verificarDelivery() {
    try {
      if (!auth.currentUser) {
        router.replace("/login");
        return;
      }

      if (!deliveryId) {
        Alert.alert(
          "Delivery no válido",
          "No se recibió la información del Delivery."
        );
        router.back();
        return;
      }

      const referencia = doc(db, "usuarios", deliveryId);
      const snapshot = await getDoc(referencia);

      if (!snapshot.exists()) {
        Alert.alert(
          "Delivery no encontrado",
          "Este Delivery ya no está disponible."
        );
        router.back();
        return;
      }

      const datos = snapshot.data();

      const disponible =
        datos.roles?.Delivery === true &&
        datos.delivery?.estadoVerificacion === "aprobado" &&
        datos.delivery?.activo === true &&
        datos.delivery?.disponible === true;

      if (!disponible) {
        Alert.alert(
          "No disponible",
          "Este Delivery ya no está disponible. Regresa y selecciona otro."
        );
        router.back();
        return;
      }
    } catch (error) {
      console.error("ERROR VERIFICANDO DELIVERY:", error);

      Alert.alert(
        "Error",
        "No se pudo verificar la disponibilidad del Delivery."
      );

      router.back();
    } finally {
      setCargando(false);
    }
  }

  const precioEstimado = useMemo(() => {
    const km = Number(distancia.replace(",", "."));

    if (!Number.isFinite(km) || km <= 0) {
      return TARIFA_BASE;
    }

    return TARIFA_BASE + km * TARIFA_POR_KM;
  }, [distancia]);

  async function enviarSolicitud() {
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
          "No se identificó el Delivery."
        );
        return;
      }

      if (!origen.trim()) {
        Alert.alert(
          "Falta el origen",
          "Indica el lugar donde se recogerá el pedido."
        );
        return;
      }

      if (!destino.trim()) {
        Alert.alert(
          "Falta el destino",
          "Indica el lugar donde se entregará el pedido."
        );
        return;
      }

      if (!descripcion.trim()) {
        Alert.alert(
          "Falta información",
          "Indica qué debe transportar el Delivery."
        );
        return;
      }

      const km = Number(distancia.replace(",", "."));

      if (!Number.isFinite(km) || km <= 0) {
        Alert.alert(
          "Distancia inválida",
          "Ingresa una distancia válida."
        );
        return;
      }

      setEnviando(true);

      const solicitud = {
        clienteId: usuario.uid,
        deliveryId,

        clienteNombre:
          usuario.displayName || "Cliente",

        deliveryNombre: nombreDelivery,

        origen: origen.trim(),
        destino: destino.trim(),
        descripcion: descripcion.trim(),

        distanciaKm: km,

        precioEstimado: Number(
          precioEstimado.toFixed(2)
        ),

        precioFinal: null,

        estado: "solicitado",

        fechaCreacion: serverTimestamp(),
        fechaActualizacion: serverTimestamp(),

        aceptadoEn: null,
        recogidoEn: null,
        entregadoEn: null,
        completadoEn: null,

        calificacion: null,
        comentarioCalificacion: "",
      };

      const referencia = await addDoc(
        collection(db, "solicitudes_delivery"),
        solicitud
      );

      Alert.alert(
        "Solicitud enviada",
        `Tu solicitud fue enviada a ${nombreDelivery}.\n\nTe notificaremos cuando acepte el servicio.`,
        [
          {
            text: "Ver solicitud",
            onPress: () => {
              router.replace({
                pathname:
                  "/servicios/delivery/estado" as any,
                params: {
                  solicitudId: referencia.id,
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
  }

  if (cargando) {
    return (
      <View style={styles.cargando}>
        <ActivityIndicator
          size="large"
          color="#0066CC"
        />

        <Text style={styles.cargandoTexto}>
          Verificando Delivery...
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={
        Platform.OS === "ios"
          ? "padding"
          : undefined
      }
    >
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.back}
          onPress={() => router.back()}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={27}
            color="#FFFFFF"
          />
        </TouchableOpacity>

        <View style={styles.headerInfo}>
          <Text style={styles.headerTitulo}>
            Solicitar Delivery
          </Text>

          <Text style={styles.headerSubtitulo}>
            {nombreDelivery}
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.contenido}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.deliveryCard}>
          <View style={styles.deliveryIcono}>
            <MaterialCommunityIcons
              name="moped"
              size={30}
              color="#0066CC"
            />
          </View>

          <View style={styles.deliveryInfo}>
            <Text style={styles.deliveryLabel}>
              Delivery seleccionado
            </Text>

            <Text style={styles.deliveryNombre}>
              {nombreDelivery}
            </Text>

            <View style={styles.disponibleFila}>
              <View style={styles.punto} />

              <Text style={styles.disponible}>
                Disponible
              </Text>
            </View>
          </View>
        </View>

        <Text style={styles.seccionTitulo}>
          ¿Dónde recogemos?
        </Text>

        <View style={styles.card}>
          <View style={styles.labelFila}>
            <MaterialCommunityIcons
              name="map-marker"
              size={21}
              color="#159447"
            />

            <Text style={styles.label}>
              Origen
            </Text>
          </View>

          <TextInput
            value={origen}
            onChangeText={setOrigen}
            placeholder="Ej. Calle Olmedo y Sucre"
            style={styles.input}
            multiline
          />
        </View>

        <Text style={styles.seccionTitulo}>
          ¿Dónde entregamos?
        </Text>

        <View style={styles.card}>
          <View style={styles.labelFila}>
            <MaterialCommunityIcons
              name="map-marker-check"
              size={21}
              color="#D97706"
            />

            <Text style={styles.label}>
              Destino
            </Text>
          </View>

          <TextInput
            value={destino}
            onChangeText={setDestino}
            placeholder="Ej. Av. Manabí y América"
            style={styles.input}
            multiline
          />
        </View>

        <Text style={styles.seccionTitulo}>
          ¿Qué debemos transportar?
        </Text>

        <View style={styles.card}>
          <TextInput
            value={descripcion}
            onChangeText={setDescripcion}
            placeholder="Ej. Un paquete pequeño con documentos"
            style={[
              styles.input,
              styles.inputGrande,
            ]}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <Text style={styles.seccionTitulo}>
          Distancia aproximada
        </Text>

        <View style={styles.card}>
          <View style={styles.distanciaFila}>
            <View style={styles.distanciaIcono}>
              <MaterialCommunityIcons
                name="map-marker-distance"
                size={25}
                color="#0066CC"
              />
            </View>

            <View style={styles.distanciaInfo}>
              <Text style={styles.distanciaTitulo}>
                Kilómetros
              </Text>

              <TextInput
                value={distancia}
                onChangeText={setDistancia}
                keyboardType="decimal-pad"
                style={styles.distanciaInput}
              />
            </View>

            <Text style={styles.km}>
              km
            </Text>
          </View>
        </View>

        <View style={styles.precioCard}>
          <View>
            <Text style={styles.precioLabel}>
              Precio estimado
            </Text>

            <Text style={styles.precioNota}>
              Tarifa base + distancia
            </Text>
          </View>

          <Text style={styles.precio}>
            ${precioEstimado.toFixed(2)}
          </Text>
        </View>

        <View style={styles.aviso}>
          <MaterialCommunityIcons
            name="information-outline"
            size={21}
            color="#0066CC"
          />

          <Text style={styles.avisoTexto}>
            El precio mostrado es una estimación.
            El valor final podrá ajustarse si las
            condiciones del servicio cambian.
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.botonEnviar,
            enviando &&
              styles.botonDeshabilitado,
          ]}
          onPress={enviarSolicitud}
          disabled={enviando}
          activeOpacity={0.85}
        >
          {enviando ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <MaterialCommunityIcons
                name="truck-fast-outline"
                size={24}
                color="#FFFFFF"
              />

              <Text style={styles.botonTexto}>
                Solicitar Delivery
              </Text>
            </>
          )}
        </TouchableOpacity>

        <Text style={styles.nota}>
          El Delivery recibirá una notificación
          y podrá aceptar o rechazar tu solicitud.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },

  cargando: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F5F7FA",
  },

  cargandoTexto: {
    marginTop: 12,
    color: "#666",
  },

  header: {
    backgroundColor: "#0066CC",
    paddingTop: 55,
    paddingBottom: 18,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
  },

  back: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
  },

  headerInfo: {
    marginLeft: 10,
  },

  headerTitulo: {
    color: "#FFFFFF",
    fontSize: 21,
    fontWeight: "800",
  },

  headerSubtitulo: {
    color: "#DCEEFF",
    marginTop: 2,
  },

  contenido: {
    padding: 16,
    paddingBottom: 45,
  },

  deliveryCard: {
    backgroundColor: "#EAF4FF",
    borderRadius: 17,
    padding: 15,
    flexDirection: "row",
    marginBottom: 22,
  },

  deliveryIcono: {
    width: 55,
    height: 55,
    borderRadius: 28,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
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
    fontSize: 18,
    fontWeight: "800",
    color: "#222",
    marginTop: 2,
  },

  disponibleFila: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },

  punto: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#159447",
    marginRight: 5,
  },

  disponible: {
    color: "#159447",
    fontSize: 12,
    fontWeight: "700",
  },

  seccionTitulo: {
    fontSize: 18,
    fontWeight: "800",
    color: "#172033",
    marginBottom: 9,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 15,
    marginBottom: 18,
    elevation: 2,
  },

  labelFila: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },

  label: {
    marginLeft: 7,
    fontSize: 14,
    fontWeight: "800",
    color: "#333",
  },

  input: {
    borderWidth: 1,
    borderColor: "#D9E0E8",
    backgroundColor: "#F8FAFC",
    borderRadius: 11,
    paddingHorizontal: 13,
    paddingVertical: 12,
    fontSize: 15,
    color: "#222",
    minHeight: 48,
  },

  inputGrande: {
    minHeight: 105,
  },

  distanciaFila: {
    flexDirection: "row",
    alignItems: "center",
  },

  distanciaIcono: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#EAF4FF",
    alignItems: "center",
    justifyContent: "center",
  },

  distanciaInfo: {
    flex: 1,
    marginLeft: 12,
  },

  distanciaTitulo: {
    fontSize: 12,
    color: "#777",
  },

  distanciaInput: {
    fontSize: 20,
    fontWeight: "800",
    color: "#222",
    marginTop: 2,
    paddingVertical: 2,
  },

  km: {
    fontSize: 15,
    fontWeight: "700",
    color: "#555",
  },

  precioCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 17,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#DCE8F5",
  },

  precioLabel: {
    fontSize: 15,
    fontWeight: "800",
    color: "#333",
  },

  precioNota: {
    fontSize: 12,
    color: "#777",
    marginTop: 3,
  },

  precio: {
    fontSize: 28,
    fontWeight: "900",
    color: "#0066CC",
  },

  aviso: {
    flexDirection: "row",
    backgroundColor: "#EAF4FF",
    borderRadius: 12,
    padding: 13,
    marginTop: 13,
  },

  avisoTexto: {
    flex: 1,
    marginLeft: 8,
    color: "#555",
    fontSize: 12,
    lineHeight: 18,
  },

  botonEnviar: {
    minHeight: 54,
    borderRadius: 14,
    backgroundColor: "#159447",
    marginTop: 22,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
  },

  botonDeshabilitado: {
    opacity: 0.6,
  },

  botonTexto: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },

  nota: {
    textAlign: "center",
    color: "#777",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 12,
  },
});
