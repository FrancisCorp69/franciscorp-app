import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  doc,
  getDoc,
  setDoc,
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

import { auth, db } from "../../services/firebase";

type TramoTarifa = {
  id: string;
  desde: number;
  hasta: number | null;
  tarifa: number;
  etiqueta: string;
};

const TRAMOS_INICIALES: TramoTarifa[] = [
  {
    id: "0_1_5",
    desde: 0,
    hasta: 1.5,
    tarifa: 1.5,
    etiqueta: "0 – 1.5 km",
  },
  {
    id: "1_6_2_5",
    desde: 1.6,
    hasta: 2.5,
    tarifa: 1.75,
    etiqueta: "1.6 – 2.5 km",
  },
  {
    id: "2_6_3_5",
    desde: 2.6,
    hasta: 3.5,
    tarifa: 2,
    etiqueta: "2.6 – 3.5 km",
  },
  {
    id: "3_6_4_5",
    desde: 3.6,
    hasta: 4.5,
    tarifa: 2.25,
    etiqueta: "3.6 – 4.5 km",
  },
  {
    id: "4_6_5_5",
    desde: 4.6,
    hasta: 5.5,
    tarifa: 2.5,
    etiqueta: "4.6 – 5.5 km",
  },
  {
    id: "5_6_6_5",
    desde: 5.6,
    hasta: 6.5,
    tarifa: 2.75,
    etiqueta: "5.6 – 6.5 km",
  },
  {
    id: "6_6_7_5",
    desde: 6.6,
    hasta: 7.5,
    tarifa: 3,
    etiqueta: "6.6 – 7.5 km",
  },
  {
    id: "7_6_8_5",
    desde: 7.6,
    hasta: 8.5,
    tarifa: 3.5,
    etiqueta: "7.6 – 8.5 km",
  },
  {
    id: "8_6_9_5",
    desde: 8.6,
    hasta: 9.5,
    tarifa: 4,
    etiqueta: "8.6 – 9.5 km",
  },
  {
    id: "9_6_12",
    desde: 9.6,
    hasta: 12,
    tarifa: 4.5,
    etiqueta: "9.6 – 12 km",
  },
];

function numeroValido(valor: string): number {
  const numero = Number(valor.replace(",", "."));
  return Number.isFinite(numero) ? numero : 0;
}

export default function TarifasDeliveryScreen() {
  const [tramos, setTramos] =
    useState<TramoTarifa[]>(TRAMOS_INICIALES);

  const [tarifaExtraKm, setTarifaExtraKm] = useState("0.25");
  const [tarifaBaseMas12, setTarifaBaseMas12] = useState("4.50");
  const [minutoEspera, setMinutoEspera] = useState("0.25");

  const [activo, setActivo] = useState(true);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    cargarConfiguracion();
  }, []);

  async function cargarConfiguracion() {
    try {
      const usuario = auth.currentUser;

      if (!usuario) {
        router.replace("/login");
        return;
      }

      const referencia = doc(db, "configuracion", "delivery");
      const documento = await getDoc(referencia);

      if (!documento.exists()) {
        setCargando(false);
        return;
      }

      const datos = documento.data();

      if (Array.isArray(datos.tramos)) {
        setTramos(
          datos.tramos.map((tramo: any, index: number) => ({
            id: String(tramo.id || `tramo_${index}`),
            desde: Number(tramo.desde) || 0,
            hasta:
              tramo.hasta === null ||
              tramo.hasta === undefined
                ? null
                : Number(tramo.hasta),
            tarifa: Number(tramo.tarifa) || 0,
            etiqueta:
              String(tramo.etiqueta || "").trim() ||
              `Tramo ${index + 1}`,
          })),
        );
      }

      if (datos.tarifaExtraKm !== undefined) {
        setTarifaExtraKm(
          Number(datos.tarifaExtraKm).toFixed(2),
        );
      }

      if (datos.tarifaBaseMas12 !== undefined) {
        setTarifaBaseMas12(
          Number(datos.tarifaBaseMas12).toFixed(2),
        );
      }

      if (datos.minutoEspera !== undefined) {
        setMinutoEspera(
          Number(datos.minutoEspera).toFixed(2),
        );
      }

      if (typeof datos.activo === "boolean") {
        setActivo(datos.activo);
      }
    } catch (error) {
      console.error(
        "ERROR CARGANDO TARIFAS DELIVERY:",
        error,
      );

      Alert.alert(
        "Error",
        "No se pudo cargar la configuración de tarifas.",
      );
    } finally {
      setCargando(false);
    }
  }

  function cambiarTarifaTramo(
    id: string,
    valor: string,
  ) {
    setTramos((actuales) =>
      actuales.map((tramo) =>
        tramo.id === id
          ? {
              ...tramo,
              tarifa: numeroValido(valor),
            }
          : tramo,
      ),
    );
  }

  async function guardarConfiguracion() {
    try {
      const usuario = auth.currentUser;

      if (!usuario) {
        router.replace("/login");
        return;
      }

      if (!usuario) {
        return;
      }

      for (const tramo of tramos) {
        if (
          !Number.isFinite(tramo.tarifa) ||
          tramo.tarifa < 0
        ) {
          Alert.alert(
            "Tarifa inválida",
            `Revisa la tarifa del tramo ${tramo.etiqueta}.`,
          );
          return;
        }
      }

      const extraKm = numeroValido(tarifaExtraKm);
      const baseMas12 = numeroValido(tarifaBaseMas12);
      const espera = numeroValido(minutoEspera);

      if (extraKm < 0 || baseMas12 < 0 || espera < 0) {
        Alert.alert(
          "Valores inválidos",
          "Las tarifas no pueden ser negativas.",
        );
        return;
      }

      setGuardando(true);

      await setDoc(
        doc(db, "configuracion", "delivery"),
        {
          tipo: "delivery",
          activo,
          tramos,
          tarifaBaseMas12: baseMas12,
          tarifaExtraKm: extraKm,
          minutoEspera: espera,
          actualizadoPor: usuario.uid,
          actualizadoEn: serverTimestamp(),
        },
        {
          merge: true,
        },
      );

      Alert.alert(
        "Configuración guardada",
        "Las tarifas de Delivery fueron guardadas correctamente.",
      );
    } catch (error) {
      console.error(
        "ERROR GUARDANDO TARIFAS DELIVERY:",
        error,
      );

      Alert.alert(
        "Error",
        "No se pudo guardar la configuración de tarifas.",
      );
    } finally {
      setGuardando(false);
    }
  }

  if (cargando) {
    return (
      <View style={styles.cargando}>
        <ActivityIndicator
          size="large"
          color="#0066CC"
        />

        <Text style={styles.textoCargando}>
          Cargando tarifas...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contenido}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.botonAtras}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={28}
            color="#0066CC"
          />
        </TouchableOpacity>

        <View style={styles.headerTexto}>
          <Text style={styles.titulo}>
            Tarifas de Delivery
          </Text>

          <Text style={styles.subtitulo}>
            Configuración por distancia
          </Text>
        </View>
      </View>

      <View style={styles.linea} />

      <View style={styles.infoCard}>
        <MaterialCommunityIcons
          name="information-outline"
          size={26}
          color="#0066CC"
        />

        <Text style={styles.infoTexto}>
          Estas tarifas serán utilizadas para calcular el
          costo de envío según la distancia entre el negocio
          y el cliente.
        </Text>
      </View>

      <View style={styles.estadoCard}>
        <View style={styles.estadoTextoContainer}>
          <Text style={styles.seccionTitulo}>
            Servicio Delivery
          </Text>

          <Text style={styles.estadoDescripcion}>
            {activo
              ? "Las tarifas están activas."
              : "Las tarifas están desactivadas."}
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.botonEstado,
            activo
              ? styles.botonActivo
              : styles.botonInactivo,
          ]}
          onPress={() => setActivo(!activo)}
        >
          <Text style={styles.botonEstadoTexto}>
            {activo ? "ACTIVO" : "INACTIVO"}
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.seccionPrincipal}>
        Tarifas por distancia
      </Text>

      {tramos.map((tramo) => (
        <View
          key={tramo.id}
          style={styles.tramoCard}
        >
          <View style={styles.tramoEncabezado}>
            <MaterialCommunityIcons
              name="map-marker-distance"
              size={24}
              color="#0066CC"
            />

            <Text style={styles.tramoEtiqueta}>
              {tramo.etiqueta}
            </Text>
          </View>

          <View style={styles.tarifaFila}>
            <Text style={styles.tarifaLabel}>
              Costo de envío
            </Text>

            <View style={styles.precioInputContainer}>
              <Text style={styles.simbolo}>
                $
              </Text>

              <TextInput
                style={styles.precioInput}
                value={tramo.tarifa.toFixed(2)}
                onChangeText={(valor) =>
                  cambiarTarifaTramo(
                    tramo.id,
                    valor,
                  )
                }
                keyboardType="decimal-pad"
                selectTextOnFocus
              />
            </View>
          </View>
        </View>
      ))}

      <View style={styles.seccionExtra}>
        <Text style={styles.seccionPrincipal}>
          Distancias superiores a 12 km
        </Text>

        <View style={styles.tramoCard}>
          <Text style={styles.descripcionCampo}>
            Tarifa base desde 12.1 km
          </Text>

          <View style={styles.precioInputContainer}>
            <Text style={styles.simbolo}>
              $
            </Text>

            <TextInput
              style={styles.precioInput}
              value={tarifaBaseMas12}
              onChangeText={setTarifaBaseMas12}
              keyboardType="decimal-pad"
            />
          </View>

          <Text style={styles.descripcionCampo}>
            Valor adicional por cada km extra
          </Text>

          <View style={styles.precioInputContainer}>
            <Text style={styles.simbolo}>
              $
            </Text>

            <TextInput
              style={styles.precioInput}
              value={tarifaExtraKm}
              onChangeText={setTarifaExtraKm}
              keyboardType="decimal-pad"
            />

            <Text style={styles.porKm}>
              / km
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.seccionExtra}>
        <Text style={styles.seccionPrincipal}>
          Tiempo de espera
        </Text>

        <View style={styles.tramoCard}>
          <Text style={styles.descripcionCampo}>
            Costo por minuto desde el minuto 6
          </Text>

          <View style={styles.precioInputContainer}>
            <Text style={styles.simbolo}>
              $
            </Text>

            <TextInput
              style={styles.precioInput}
              value={minutoEspera}
              onChangeText={setMinutoEspera}
              keyboardType="decimal-pad"
            />

            <Text style={styles.porKm}>
              / minuto
            </Text>
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={[
          styles.botonGuardar,
          guardando && styles.botonDeshabilitado,
        ]}
        onPress={guardarConfiguracion}
        disabled={guardando}
      >
        {guardando ? (
          <ActivityIndicator
            size="small"
            color="#FFFFFF"
          />
        ) : (
          <MaterialCommunityIcons
            name="content-save-outline"
            size={22}
            color="#FFFFFF"
          />
        )}

        <Text style={styles.textoBotonGuardar}>
          {guardando
            ? "Guardando..."
            : "Guardar tarifas"}
        </Text>
      </TouchableOpacity>

      <View style={styles.nota}>
        <MaterialCommunityIcons
          name="shield-check-outline"
          size={20}
          color="#555"
        />

        <Text style={styles.notaTexto}>
          Esta configuración debe ser modificable
          únicamente por el administrador.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },

  contenido: {
    padding: 18,
    paddingBottom: 40,
  },

  cargando: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F7FA",
  },

  textoCargando: {
    marginTop: 12,
    color: "#555",
    fontSize: 16,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  botonAtras: {
    width: 42,
    height: 42,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },

  headerTexto: {
    flex: 1,
  },

  titulo: {
    fontSize: 23,
    fontWeight: "800",
    color: "#1B1B1B",
  },

  subtitulo: {
    marginTop: 3,
    color: "#666",
    fontSize: 14,
  },

  linea: {
    height: 1,
    backgroundColor: "#D9DEE5",
    marginBottom: 16,
  },

  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EAF3FF",
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },

  infoTexto: {
    flex: 1,
    marginLeft: 10,
    color: "#24415F",
    lineHeight: 20,
    fontSize: 14,
  },

  estadoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    marginBottom: 22,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    elevation: 2,
  },

  estadoTextoContainer: {
    flex: 1,
    marginRight: 12,
  },

  seccionTitulo: {
    fontSize: 17,
    fontWeight: "700",
    color: "#222",
  },

  estadoDescripcion: {
    marginTop: 4,
    color: "#666",
    fontSize: 13,
  },

  botonEstado: {
    minWidth: 86,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignItems: "center",
  },

  botonActivo: {
    backgroundColor: "#2E8B57",
  },

  botonInactivo: {
    backgroundColor: "#999",
  },

  botonEstadoTexto: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 12,
  },

  seccionPrincipal: {
    fontSize: 19,
    fontWeight: "800",
    color: "#222",
    marginBottom: 12,
  },

  tramoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
  },

  tramoEncabezado: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },

  tramoEtiqueta: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: "700",
    color: "#222",
  },

  tarifaFila: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  tarifaLabel: {
    color: "#555",
    fontSize: 14,
  },

  precioInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#CDD3DA",
    borderRadius: 10,
    backgroundColor: "#FAFAFA",
    minWidth: 125,
    paddingHorizontal: 10,
  },

  simbolo: {
    fontSize: 17,
    fontWeight: "700",
    color: "#333",
  },

  precioInput: {
    flex: 1,
    minWidth: 75,
    paddingVertical: 10,
    paddingHorizontal: 6,
    fontSize: 17,
    fontWeight: "700",
    color: "#222",
    textAlign: "right",
  },

  porKm: {
    color: "#666",
    fontSize: 13,
    marginLeft: 3,
  },

  seccionExtra: {
    marginTop: 10,
  },

  descripcionCampo: {
    color: "#555",
    fontSize: 14,
    marginBottom: 8,
  },

  botonGuardar: {
    marginTop: 20,
    backgroundColor: "#0066CC",
    borderRadius: 12,
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
  },

  botonDeshabilitado: {
    opacity: 0.65,
  },

  textoBotonGuardar: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
    marginLeft: 9,
  },

  nota: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 18,
    paddingHorizontal: 4,
  },

  notaTexto: {
    flex: 1,
    marginLeft: 8,
    color: "#666",
    fontSize: 13,
    lineHeight: 18,
  },
});
