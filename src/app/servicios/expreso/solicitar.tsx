import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";
import { useState } from "react";
import {
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "../../../services/firebase";

export default function SolicitarExpresoScreen() {
  const [origen, setOrigen] = useState("");
  const [destino, setDestino] = useState("");
  const [pasajeros, setPasajeros] = useState("1");
  const [miOferta, setMiOferta] = useState("");
  const [detalles, setDetalles] = useState("");
  const [guardando, setGuardando] = useState(false);

  const continuar = async () => {
    const cantidadPasajeros = Number(pasajeros);
    const precio = Number(miOferta);

    if (!origen.trim()) {
      Alert.alert(
        "Falta informacion",
        "Ingresa el punto de recogida."
      );
      return;
    }

    if (!destino.trim()) {
      Alert.alert(
        "Falta informacion",
        "Ingresa el destino."
      );
      return;
    }

    if (
      !Number.isInteger(cantidadPasajeros) ||
      cantidadPasajeros < 1
    ) {
      Alert.alert(
        "Cantidad de pasajeros",
        "Ingresa una cantidad valida de pasajeros."
      );
      return;
    }

    if (!Number.isFinite(precio) || precio <= 0) {
      Alert.alert(
        "Oferta invalida",
        "Ingresa el precio que estas dispuesto a pagar."
      );
      return;
    }

    if (!auth.currentUser) {
      Alert.alert(
        "Sesion requerida",
        "Debes iniciar sesion para solicitar un Expreso."
      );
      return;
    }

    if (guardando) {
      return;
    }

    try {
      setGuardando(true);

      const solicitudRef = await addDoc(
        collection(db, "solicitudes_expreso"),
        {
          clienteId: auth.currentUser.uid,
          origen: origen.trim(),
          destino: destino.trim(),
          pasajeros: cantidadPasajeros,
          ofertaCliente: precio,
          detalles: detalles.trim(),
          estado: "buscando",
          fechaCreacion: serverTimestamp(),
          fechaActualizacion: serverTimestamp(),
        }
      );

      router.replace({
        pathname: "/servicios/expreso/estado",
        params: {
          solicitudId: solicitudRef.id,
        },
      });
    } catch (error) {
      console.error(
        "Error al crear solicitud de Expreso:",
        error
      );

      Alert.alert(
        "No se pudo crear la solicitud",
        "Ocurrio un problema al publicar tu viaje. Intenta nuevamente."
      );
    } finally {
      setGuardando(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          Solicitar Expreso
        </Text>

        <Text style={styles.headerSubtitle}>
          Publica tu viaje y recibe ofertas de Expresos disponibles.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>
          Informacion del viaje
        </Text>

        <Text style={styles.label}>
          Punto de recogida
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Ejemplo: Centro de Portoviejo"
          placeholderTextColor="#888"
          value={origen}
          onChangeText={setOrigen}
        />

        <Text style={styles.label}>
          Destino
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Ejemplo: Manta"
          placeholderTextColor="#888"
          value={destino}
          onChangeText={setDestino}
        />

        <Text style={styles.label}>
          Numero de pasajeros
        </Text>

        <TextInput
          style={styles.input}
          placeholder="1"
          placeholderTextColor="#888"
          keyboardType="number-pad"
          value={pasajeros}
          onChangeText={setPasajeros}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>
          Tu oferta
        </Text>

        <Text style={styles.cardDescription}>
          Indica cuanto estas dispuesto a pagar por el viaje.
          Los Expresos podran aceptar tu oferta o proponerte
          un precio diferente.
        </Text>

        <Text style={styles.label}>
          Precio que deseas pagar
        </Text>

        <View style={styles.priceContainer}>
          <Text style={styles.currency}>
            $
          </Text>

          <TextInput
            style={styles.priceInput}
            placeholder="0.00"
            placeholderTextColor="#888"
            keyboardType="decimal-pad"
            value={miOferta}
            onChangeText={setMiOferta}
          />
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>
          Detalles adicionales
        </Text>

        <TextInput
          style={[
            styles.input,
            styles.detailsInput,
          ]}
          placeholder="Indica alguna informacion importante para el viaje..."
          placeholderTextColor="#888"
          multiline
          textAlignVertical="top"
          value={detalles}
          onChangeText={setDetalles}
        />
      </View>

      <View style={styles.summary}>
        <Text style={styles.summaryTitle}>
          Resumen
        </Text>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>
            Origen
          </Text>

          <Text style={styles.summaryValue}>
            {origen.trim() || "Pendiente"}
          </Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>
            Destino
          </Text>

          <Text style={styles.summaryValue}>
            {destino.trim() || "Pendiente"}
          </Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>
            Pasajeros
          </Text>

          <Text style={styles.summaryValue}>
            {pasajeros || "1"}
          </Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>
            Tu oferta
          </Text>

          <Text style={styles.summaryPrice}>
            {miOferta ? `$${miOferta}` : "$0.00"}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={[
          styles.boton,
          guardando && styles.botonDesactivado,
        ]}
        onPress={continuar}
        disabled={guardando}
      >
        <Text style={styles.botonTexto}>
          {guardando
            ? "Publicando solicitud..."
            : "Buscar Expresos"}
        </Text>
      </TouchableOpacity>

      <Text style={styles.info}>
        Tu solicitud se mostrara a los Expresos disponibles.
        Podras revisar sus ofertas antes de elegir uno.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },

  content: {
    paddingBottom: 40,
  },

  header: {
    backgroundColor: "#111111",
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 24,
  },

  headerTitle: {
    color: "#D4AF37",
    fontSize: 26,
    fontWeight: "800",
  },

  headerSubtitle: {
    color: "#ffffff",
    fontSize: 15,
    lineHeight: 21,
    marginTop: 8,
  },

  card: {
    backgroundColor: "#ffffff",
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 14,
    padding: 18,
    elevation: 2,
    shadowColor: "#000000",
    shadowOpacity: 0.08,
    shadowRadius: 5,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#222222",
    marginBottom: 16,
  },

  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "#444444",
    marginBottom: 7,
    marginTop: 10,
  },

  input: {
    borderWidth: 1,
    borderColor: "#dddddd",
    borderRadius: 10,
    paddingHorizontal: 13,
    paddingVertical: 12,
    fontSize: 15,
    color: "#222222",
    backgroundColor: "#fafafa",
  },

  detailsInput: {
    minHeight: 100,
  },

  cardDescription: {
    color: "#666666",
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },

  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D4AF37",
    borderRadius: 10,
    backgroundColor: "#fffdf5",
    paddingHorizontal: 14,
  },

  currency: {
    fontSize: 24,
    fontWeight: "800",
    color: "#D4AF37",
  },

  priceInput: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 12,
    fontSize: 20,
    fontWeight: "700",
    color: "#222222",
  },

  summary: {
    backgroundColor: "#111111",
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 14,
    padding: 18,
  },

  summaryTitle: {
    color: "#D4AF37",
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 14,
  },

  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },

  summaryLabel: {
    color: "#bbbbbb",
    fontSize: 14,
  },

  summaryValue: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
    maxWidth: "60%",
    textAlign: "right",
  },

  summaryPrice: {
    color: "#D4AF37",
    fontSize: 17,
    fontWeight: "800",
  },

  boton: {
    marginHorizontal: 16,
    marginTop: 20,
    backgroundColor: "#D4AF37",
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
  },

  botonDesactivado: {
    opacity: 0.6,
  },

  botonTexto: {
    color: "#111111",
    fontSize: 17,
    fontWeight: "800",
  },

  info: {
    textAlign: "center",
    color: "#777777",
    fontSize: 12,
    lineHeight: 18,
    marginHorizontal: 30,
    marginTop: 12,
  },
});
