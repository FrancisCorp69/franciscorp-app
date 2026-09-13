import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Location from "expo-location";
import * as PlacePicker from "react-native-place-autocomplete-picker";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

export interface UbicacionSeleccionada {
  direccion: string;
  ciudad: string;
  provincia: string;
  latitud: number;
  longitud: number;
}

interface SelectorUbicacionProps {
  valorInicial?: Partial<UbicacionSeleccionada>;
  onUbicacionSeleccionada: (ubicacion: UbicacionSeleccionada) => void;
  titulo?: string;
}

function obtenerComponente(
  componentes: Array<{
    longName?: string;
    shortName?: string;
    types?: string[];
  }>,
  tipos: string[],
) {
  const encontrado = componentes.find((componente) =>
    tipos.some((tipo) => componente.types?.includes(tipo)),
  );

  return encontrado?.longName || encontrado?.shortName || "";
}

export default function SelectorUbicacion({
  valorInicial,
  onUbicacionSeleccionada,
  titulo = "Ubicación",
}: SelectorUbicacionProps) {
  const [inicializando, setInicializando] = useState(true);
  const [usandoUbicacion, setUsandoUbicacion] = useState(false);
  const [direccion, setDireccion] = useState(
    valorInicial?.direccion || "",
  );

  useEffect(() => {
    let activo = true;

    async function inicializarPlaces() {
      try {
        const apiKey = process.env.GOOGLE_MAPS_API_KEY;

        if (!apiKey) {
          throw new Error(
            "No se encontró GOOGLE_MAPS_API_KEY en el entorno.",
          );
        }

        await PlacePicker.initialize(apiKey);

        if (activo) {
          setInicializando(false);
        }
      } catch (error) {
        console.error("Error inicializando Google Places:", error);

        if (activo) {
          setInicializando(false);
          Alert.alert(
            "Google Maps",
            "No se pudo inicializar la búsqueda de ubicaciones.",
          );
        }
      }
    }

    inicializarPlaces();

    return () => {
      activo = false;
    };
  }, []);

  async function buscarEnMapa() {
    if (inicializando) {
      Alert.alert(
        "Google Maps",
        "Espera un momento mientras se prepara la búsqueda.",
      );
      return;
    }

    try {
      const resultado = await PlacePicker.open({
        mode: "fullscreen",
        countries: ["EC"],
      });

      if (!resultado) {
        return;
      }

      const componentes = resultado.addressComponents || [];

      const ciudad =
        obtenerComponente(componentes, [
          "locality",
          "postal_town",
          "administrative_area_level_2",
        ]) || valorInicial?.ciudad || "";

      const provincia =
        obtenerComponente(componentes, [
          "administrative_area_level_1",
        ]) || valorInicial?.provincia || "";

      const nuevaUbicacion: UbicacionSeleccionada = {
        direccion:
          resultado.address ||
          resultado.name ||
          "",
        ciudad,
        provincia,
        latitud: Number(resultado.latitude),
        longitud: Number(resultado.longitude),
      };

      if (
        !nuevaUbicacion.direccion ||
        !Number.isFinite(nuevaUbicacion.latitud) ||
        !Number.isFinite(nuevaUbicacion.longitud)
      ) {
        Alert.alert(
          "Ubicación incompleta",
          "No se pudo obtener toda la información de la ubicación seleccionada.",
        );
        return;
      }

      setDireccion(nuevaUbicacion.direccion);
      onUbicacionSeleccionada(nuevaUbicacion);
    } catch (error) {
      console.log("Búsqueda de ubicación cancelada o fallida:", error);
    }
  }

  async function usarMiUbicacion() {
    try {
      setUsandoUbicacion(true);

      const { status } =
        await Location.requestForegroundPermissionsAsync();

      if (status !== Location.PermissionStatus.GRANTED) {
        Alert.alert(
          "Permiso de ubicación",
          "Necesitamos permiso para usar tu ubicación actual.",
        );
        return;
      }

      const ubicacionActual = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const latitud = ubicacionActual.coords.latitude;
      const longitud = ubicacionActual.coords.longitude;

      const resultado =
        await Location.reverseGeocodeAsync({
          latitude: latitud,
          longitude: longitud,
        });

      const lugar = resultado[0];

      const partes = [
        lugar?.street,
        lugar?.name,
        lugar?.streetNumber,
      ].filter(Boolean);

      const direccionActual =
        partes.join(" ").trim() ||
        lugar?.formattedAddress ||
        "Ubicación actual";

      const ciudadActual =
        lugar?.city ||
        lugar?.district ||
        lugar?.subregion ||
        "";

      const provinciaActual =
        lugar?.region || "";

      const nuevaUbicacion: UbicacionSeleccionada = {
        direccion: direccionActual,
        ciudad: ciudadActual,
        provincia: provinciaActual,
        latitud,
        longitud,
      };

      setDireccion(direccionActual);
      onUbicacionSeleccionada(nuevaUbicacion);
    } catch (error) {
      console.error(
        "Error obteniendo ubicación actual:",
        error,
      );

      Alert.alert(
        "Ubicación",
        "No pudimos obtener tu ubicación actual. Intenta nuevamente.",
      );
    } finally {
      setUsandoUbicacion(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>{titulo}</Text>

      <View style={styles.ubicacionCard}>
        <View style={styles.iconoContainer}>
          <MaterialCommunityIcons
            name="map-marker"
            size={28}
            color="#D4AF37"
          />
        </View>

        <View style={styles.textoContainer}>
          <Text style={styles.etiqueta}>
            Dirección seleccionada
          </Text>

          <Text style={styles.direccion}>
            {direccion || "Aún no has seleccionado una ubicación"}
          </Text>
        </View>
      </View>

      <Pressable
        style={styles.botonMapa}
        onPress={buscarEnMapa}
        disabled={inicializando}
      >
        {inicializando ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <MaterialCommunityIcons
            name="map-search"
            size={22}
            color="#FFFFFF"
          />
        )}

        <Text style={styles.textoBoton}>
          {inicializando
            ? "Preparando mapa..."
            : "Buscar dirección en Google Maps"}
        </Text>
      </Pressable>

      <Pressable
        style={styles.botonUbicacion}
        onPress={usarMiUbicacion}
        disabled={usandoUbicacion}
      >
        {usandoUbicacion ? (
          <ActivityIndicator size="small" color="#222222" />
        ) : (
          <MaterialCommunityIcons
            name="crosshairs-gps"
            size={22}
            color="#222222"
          />
        )}

        <Text style={styles.textoBotonUbicacion}>
          {usandoUbicacion
            ? "Obteniendo ubicación..."
            : "Usar mi ubicación actual"}
        </Text>
      </Pressable>

      <Text style={styles.ayuda}>
        Selecciona exactamente dónde se encuentra tu negocio.
        La ubicación se utilizará posteriormente para calcular
        la distancia del servicio de delivery.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
  },

  titulo: {
    fontSize: 17,
    fontWeight: "700",
    color: "#222",
    marginBottom: 10,
  },

  ubicacionCard: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#DDDDDD",
    borderRadius: 12,
    padding: 14,
    backgroundColor: "#FAFAFA",
    marginBottom: 12,
  },

  iconoContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF8DF",
    marginRight: 12,
  },

  textoContainer: {
    flex: 1,
  },

  etiqueta: {
    fontSize: 12,
    color: "#777",
    marginBottom: 4,
  },

  direccion: {
    fontSize: 15,
    color: "#222",
    lineHeight: 21,
  },

  botonMapa: {
    minHeight: 50,
    borderRadius: 12,
    backgroundColor: "#222222",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    marginBottom: 10,
    gap: 8,
  },

  textoBoton: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },

  botonUbicacion: {
    minHeight: 50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D4AF37",
    backgroundColor: "#FFFDF5",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    gap: 8,
  },

  textoBotonUbicacion: {
    color: "#222222",
    fontSize: 15,
    fontWeight: "700",
  },

  ayuda: {
    marginTop: 10,
    fontSize: 12,
    color: "#777",
    lineHeight: 18,
  },
});


