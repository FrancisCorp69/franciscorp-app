import { MaterialCommunityIcons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
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
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { db } from "../services/firebase";

interface HorarioDia {
  abierto: boolean;
  apertura: string;
  cierre: string;
}

interface Horarios {
  lunes: HorarioDia;
  martes: HorarioDia;
  miercoles: HorarioDia;
  jueves: HorarioDia;
  viernes: HorarioDia;
  sabado: HorarioDia;
  domingo: HorarioDia;
}

const horariosIniciales: Horarios = {
  lunes: {
    abierto: true,
    apertura: "08:00",
    cierre: "20:00",
  },
  martes: {
    abierto: true,
    apertura: "08:00",
    cierre: "20:00",
  },
  miercoles: {
    abierto: true,
    apertura: "08:00",
    cierre: "20:00",
  },
  jueves: {
    abierto: true,
    apertura: "08:00",
    cierre: "20:00",
  },
  viernes: {
    abierto: true,
    apertura: "08:00",
    cierre: "20:00",
  },
  sabado: {
    abierto: true,
    apertura: "09:00",
    cierre: "21:00",
  },
  domingo: {
    abierto: false,
    apertura: "09:00",
    cierre: "18:00",
  },
};

const dias: {
  clave: keyof Horarios;
  nombre: string;
}[] = [
  { clave: "lunes", nombre: "Lunes" },
  { clave: "martes", nombre: "Martes" },
  { clave: "miercoles", nombre: "Miércoles" },
  { clave: "jueves", nombre: "Jueves" },
  { clave: "viernes", nombre: "Viernes" },
  { clave: "sabado", nombre: "Sábado" },
  { clave: "domingo", nombre: "Domingo" },
];

function horaAFecha(hora: string) {
  const [horas, minutos] = hora.split(":").map(Number);

  const fecha = new Date();

  fecha.setHours(horas || 0);
  fecha.setMinutes(minutos || 0);
  fecha.setSeconds(0);
  fecha.setMilliseconds(0);

  return fecha;
}

function fechaAHora(fecha: Date) {
  const horas = String(fecha.getHours()).padStart(2, "0");
  const minutos = String(fecha.getMinutes()).padStart(2, "0");

  return `${horas}:${minutos}`;
}

export default function HorariosNegocioScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const negocioId = String(params.id || "");

  const [horarios, setHorarios] =
    useState<Horarios>(horariosIniciales);

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  const [selectorVisible, setSelectorVisible] = useState(false);
  const [diaSeleccionado, setDiaSeleccionado] =
    useState<keyof Horarios | null>(null);
  const [tipoHora, setTipoHora] =
    useState<"apertura" | "cierre" | null>(null);

  useEffect(() => {
    async function cargarHorarios() {
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

        if (datos.horarios) {
          setHorarios({
            ...horariosIniciales,
            ...datos.horarios,
          });
        }
      } catch (error) {
        console.error("ERROR CARGANDO HORARIOS:", error);

        Alert.alert(
          "Error",
          "No pudimos cargar los horarios del negocio.",
        );
      } finally {
        setCargando(false);
      }
    }

    cargarHorarios();
  }, [negocioId]);

  const cambiarEstadoDia = (dia: keyof Horarios) => {
    setHorarios((actuales) => ({
      ...actuales,
      [dia]: {
        ...actuales[dia],
        abierto: !actuales[dia].abierto,
      },
    }));
  };

  const abrirSelectorHora = (
    dia: keyof Horarios,
    tipo: "apertura" | "cierre",
  ) => {
    setDiaSeleccionado(dia);
    setTipoHora(tipo);
    setSelectorVisible(true);
  };

  const cambiarHora = (_event: any, fechaSeleccionada?: Date) => {
    if (Platform.OS === "android") {
      setSelectorVisible(false);
    }

    if (!fechaSeleccionada || !diaSeleccionado || !tipoHora) {
      return;
    }

    const nuevaHora = fechaAHora(fechaSeleccionada);

    setHorarios((actuales) => ({
      ...actuales,
      [diaSeleccionado]: {
        ...actuales[diaSeleccionado],
        [tipoHora]: nuevaHora,
      },
    }));

    if (Platform.OS === "ios") {
      setSelectorVisible(false);
    }
  };

  const guardarHorarios = async () => {
    if (!negocioId) {
      Alert.alert(
        "Error",
        "No se pudo identificar el negocio.",
      );

      return;
    }

    setGuardando(true);

    try {
      const referencia = doc(db, "negocios", negocioId);

      await updateDoc(referencia, {
        horarios,
        actualizadoEn: serverTimestamp(),
      });

      Alert.alert(
        "Horarios guardados",
        "Los horarios de atención se actualizaron correctamente.",
        [
          {
            text: "Aceptar",
            onPress: () => router.back(),
          },
        ],
      );
    } catch (error) {
      console.error("ERROR GUARDANDO HORARIOS:", error);

      Alert.alert(
        "Error",
        "No pudimos guardar los horarios. Inténtalo nuevamente.",
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
          Cargando horarios...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
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

        <View style={styles.headerText}>
          <Text style={styles.title}>
            Horarios de atención
          </Text>

          <Text style={styles.subtitle}>
            Configura cuándo está disponible tu negocio
          </Text>
        </View>
      </View>

      <View style={styles.infoBox}>
        <MaterialCommunityIcons
          name="information-outline"
          size={22}
          color="#0066CC"
        />

        <Text style={styles.infoText}>
          Los clientes podrán consultar estos horarios
          antes de realizar un pedido.
        </Text>
      </View>

      <View style={styles.daysContainer}>
        {dias.map((dia) => {
          const horario = horarios[dia.clave];

          return (
            <View
              key={dia.clave}
              style={styles.dayCard}
            >
              <View style={styles.dayHeader}>
                <View style={styles.dayNameContainer}>
                  <View
                    style={[
                      styles.dayIndicator,
                      horario.abierto
                        ? styles.dayIndicatorOpen
                        : styles.dayIndicatorClosed,
                    ]}
                  />

                  <Text style={styles.dayName}>
                    {dia.nombre}
                  </Text>
                </View>

                <View style={styles.switchContainer}>
                  <Text
                    style={[
                      styles.statusText,
                      horario.abierto
                        ? styles.statusOpen
                        : styles.statusClosed,
                    ]}
                  >
                    {horario.abierto
                      ? "Abierto"
                      : "Cerrado"}
                  </Text>

                  <Switch
                    value={horario.abierto}
                    onValueChange={() =>
                      cambiarEstadoDia(dia.clave)
                    }
                    trackColor={{
                      false: "#D6D6D6",
                      true: "#9CC9F5",
                    }}
                    thumbColor={
                      horario.abierto
                        ? "#0066CC"
                        : "#F4F4F4"
                    }
                  />
                </View>
              </View>

              {horario.abierto ? (
                <View style={styles.hoursRow}>
                  <Pressable
                    style={styles.hourButton}
                    onPress={() =>
                      abrirSelectorHora(
                        dia.clave,
                        "apertura",
                      )
                    }
                  >
                    <MaterialCommunityIcons
                      name="clock-time-four-outline"
                      size={21}
                      color="#0066CC"
                    />

                    <View>
                      <Text style={styles.hourLabel}>
                        Apertura
                      </Text>

                      <Text style={styles.hourValue}>
                        {horario.apertura}
                      </Text>
                    </View>
                  </Pressable>

                  <View style={styles.arrowContainer}>
                    <MaterialCommunityIcons
                      name="arrow-right"
                      size={22}
                      color="#999"
                    />
                  </View>

                  <Pressable
                    style={styles.hourButton}
                    onPress={() =>
                      abrirSelectorHora(
                        dia.clave,
                        "cierre",
                      )
                    }
                  >
                    <MaterialCommunityIcons
                      name="clock-time-eight-outline"
                      size={21}
                      color="#0066CC"
                    />

                    <View>
                      <Text style={styles.hourLabel}>
                        Cierre
                      </Text>

                      <Text style={styles.hourValue}>
                        {horario.cierre}
                      </Text>
                    </View>
                  </Pressable>
                </View>
              ) : (
                <View style={styles.closedBox}>
                  <MaterialCommunityIcons
                    name="store-off-outline"
                    size={20}
                    color="#999"
                  />

                  <Text style={styles.closedText}>
                    El negocio estará cerrado este día
                  </Text>
                </View>
              )}
            </View>
          );
        })}
      </View>

      <Pressable
        style={[
          styles.saveButton,
          guardando && styles.disabledButton,
        ]}
        disabled={guardando}
        onPress={guardarHorarios}
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
              Guardar horarios
            </Text>
          </>
        )}
      </Pressable>

      <View style={styles.bottomSpace} />

      {selectorVisible &&
      diaSeleccionado &&
      tipoHora ? (
        <DateTimePicker
          value={horaAFecha(
            horarios[diaSeleccionado][tipoHora],
          )}
          mode="time"
          is24Hour={true}
          display="default"
          onChange={cambiarHora}
        />
      ) : null}
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
    fontSize: 15,
    color: "#666",
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
    fontSize: 13,
    color: "#777",
  },

  infoBox: {
    marginHorizontal: 20,
    marginTop: 20,
    padding: 15,
    borderRadius: 14,
    backgroundColor: "#F4F8FF",
    flexDirection: "row",
    alignItems: "flex-start",
  },

  infoText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 13,
    lineHeight: 19,
    color: "#555",
  },

  daysContainer: {
    marginHorizontal: 20,
    marginTop: 20,
  },

  dayCard: {
    marginBottom: 12,
    padding: 15,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E7E7E7",
    backgroundColor: "#fff",
  },

  dayHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  dayNameContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  dayIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 9,
  },

  dayIndicatorOpen: {
    backgroundColor: "#22C55E",
  },

  dayIndicatorClosed: {
    backgroundColor: "#999",
  },

  dayName: {
    fontSize: 17,
    fontWeight: "700",
    color: "#222",
  },

  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
  },

  statusText: {
    marginRight: 7,
    fontSize: 12,
    fontWeight: "700",
  },

  statusOpen: {
    color: "#16A34A",
  },

  statusClosed: {
    color: "#777",
  },

  hoursRow: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
  },

  hourButton: {
    flex: 1,
    minHeight: 62,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: "#F7F9FC",
    flexDirection: "row",
    alignItems: "center",
  },

  hourLabel: {
    marginLeft: 8,
    fontSize: 11,
    color: "#777",
  },

  hourValue: {
    marginLeft: 8,
    marginTop: 1,
    fontSize: 18,
    fontWeight: "700",
    color: "#222",
  },

  arrowContainer: {
    width: 35,
    alignItems: "center",
  },

  closedBox: {
    marginTop: 13,
    minHeight: 48,
    borderRadius: 12,
    backgroundColor: "#F7F7F7",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
  },

  closedText: {
    marginLeft: 8,
    fontSize: 13,
    color: "#777",
  },

  saveButton: {
    marginHorizontal: 20,
    marginTop: 10,
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
