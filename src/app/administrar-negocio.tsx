import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import {
  collection,
  doc,
  getDoc,
  getDocs,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { db } from "../services/firebase";

interface Negocio {
  id: string;
  nombre?: string;
  tipo?: string;
  tipoNombre?: string;
  categoria?: string;
  descripcion?: string;
  estado?: string;

  contacto?: {
    telefono?: string;
    whatsapp?: string;
    correo?: string;
    redesSociales?: string;
    paginaWeb?: string;
  };

  ubicacion?: {
    direccion?: string;
    ciudad?: string;
    provincia?: string;
  };
}

export default function AdministrarNegocioScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const negocioId = String(params.id || "");

  const [negocio, setNegocio] = useState<Negocio | null>(null);
  const [cargando, setCargando] = useState(true);
  const [cantidadProductos, setCantidadProductos] = useState(0);

  useEffect(() => {
    async function cargarNegocio() {
      if (!negocioId) {
        setCargando(false);

        Alert.alert(
          "Negocio no encontrado",
          "No se recibió el identificador del negocio.",
          [
            {
              text: "Volver",
              onPress: () => router.back(),
            },
          ],
        );

        return;
      }

      try {
        console.log("CARGANDO NEGOCIO PARA ADMINISTRAR:", negocioId);

        const referencia = doc(db, "negocios", negocioId);
        const documento = await getDoc(referencia);

        if (!documento.exists()) {
          console.error("EL NEGOCIO NO EXISTE:", negocioId);

          Alert.alert(
            "Negocio no encontrado",
            "El negocio que intentas administrar no existe.",
            [
              {
                text: "Volver",
                onPress: () => router.back(),
              },
            ],
          );

          return;
        }

        const datos = {
          id: documento.id,
          ...documento.data(),
        } as Negocio;

        console.log("NEGOCIO CARGADO:", datos);

        setNegocio(datos);

        try {
          const productosSnapshot = await getDocs(
            collection(db, "negocios", negocioId, "productos"),
          );

          setCantidadProductos(productosSnapshot.size);

          console.log(
            "PRODUCTOS DEL NEGOCIO:",
            productosSnapshot.size,
          );
        } catch (error) {
          console.log(
            "Todavía no existe la colección de productos:",
            error,
          );

          setCantidadProductos(0);
        }
      } catch (error) {
        console.error(
          "ERROR CARGANDO NEGOCIO PARA ADMINISTRAR:",
          error,
        );

        Alert.alert(
          "Error",
          "No pudimos cargar la información del negocio.",
        );
      } finally {
        setCargando(false);
      }
    }

    cargarNegocio();
  }, [negocioId]);

  const abrirEditar = () => {
    if (!negocioId) return;

    router.push({
      pathname: "/editar-negocio",
      params: {
        id: negocioId,
      },
    });
  };

  const abrirMenu = () => {
    if (!negocioId) return;

    router.push({
      pathname: "/menu-negocio",
      params: {
        id: negocioId,
      },
    });
  };

  const verNegocio = () => {
    if (!negocioId) return;

    router.push({
      pathname: "/negocio",
      params: {
        id: negocioId,
      },
    });
  };

  if (cargando) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066CC" />

        <Text style={styles.loadingText}>
          Cargando negocio...
        </Text>
      </View>
    );
  }

  if (!negocio) {
    return (
      <View style={styles.loadingContainer}>
        <MaterialCommunityIcons
          name="store-alert-outline"
          size={60}
          color="#999"
        />

        <Text style={styles.loadingText}>
          No encontramos este negocio.
        </Text>

        <Pressable
          style={styles.backMainButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backMainButtonText}>
            Volver
          </Text>
        </Pressable>
      </View>
    );
  }

  const nombreNegocio =
    negocio.nombre || "Sin nombre";

  const tipoNegocio =
    negocio.tipoNombre ||
    negocio.tipo ||
    negocio.categoria ||
    "Negocio";

  const ciudad =
    negocio.ubicacion?.ciudad ||
    "Ubicación no registrada";

  const negocioActivo =
    negocio.estado === "activo";

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
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
          <Text style={styles.headerTitle}>
            Administrar negocio
          </Text>

          <Text style={styles.headerSubtitle}>
            Gestiona tu negocio en FrancisCorp
          </Text>
        </View>
      </View>

      {/* ================= NEGOCIO ================= */}

      <View style={styles.businessHeader}>
        <View style={styles.businessLogo}>
          <MaterialCommunityIcons
            name="store"
            size={38}
            color="#0066CC"
          />
        </View>

        <View style={styles.businessHeaderInfo}>
          <Text
            style={styles.businessName}
            numberOfLines={1}
          >
            {nombreNegocio}
          </Text>

          <Text style={styles.businessType}>
            {tipoNegocio}
          </Text>

          <View style={styles.statusRow}>
            <View
              style={[
                styles.statusDot,
                negocioActivo
                  ? styles.statusActive
                  : styles.statusInactive,
              ]}
            />

            <Text
              style={[
                styles.statusText,
                negocioActivo
                  ? styles.statusTextActive
                  : styles.statusTextInactive,
              ]}
            >
              {negocioActivo
                ? "Activo"
                : negocio.estado || "Sin estado"}
            </Text>
          </View>
        </View>
      </View>

      {/* ================= VER NEGOCIO ================= */}

      <Pressable
        style={styles.viewBusinessButton}
        onPress={verNegocio}
      >
        <MaterialCommunityIcons
          name="eye-outline"
          size={21}
          color="#0066CC"
        />

        <Text style={styles.viewBusinessText}>
          Ver mi negocio como cliente
        </Text>
      </Pressable>

      {/* ================= RESUMEN ================= */}

      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <MaterialCommunityIcons
            name="package-variant-closed"
            size={25}
            color="#0066CC"
          />

          <Text style={styles.summaryNumber}>
            {cantidadProductos}
          </Text>

          <Text style={styles.summaryLabel}>
            Productos
          </Text>
        </View>

        <View style={styles.summaryCard}>
          <MaterialCommunityIcons
            name="map-marker-outline"
            size={25}
            color="#0066CC"
          />

          <Text
            style={styles.summaryLocation}
            numberOfLines={1}
          >
            {ciudad}
          </Text>

          <Text style={styles.summaryLabel}>
            Ubicación
          </Text>
        </View>
      </View>

      {/* ================= GESTIÓN ================= */}

      <Text style={styles.sectionTitle}>
        Gestión
      </Text>

      <View style={styles.optionsContainer}>
        <OptionButton
          icon="store-edit-outline"
          title="Editar información"
          description="Nombre, descripción, contacto y ubicación"
          onPress={abrirEditar}
        />

        <OptionButton
          icon="silverware-fork-knife"
          title="Menú y productos"
          description="Administra categorías, platos, precios y fotos"
          badge={
            cantidadProductos > 0
              ? String(cantidadProductos)
              : undefined
          }
          onPress={abrirMenu}
        />

        <OptionButton
          icon="image-multiple-outline"
          title="Fotos"
          description="Logo, portada y galería del negocio"
          onPress={() => {
            Alert.alert(
              "Fotos",
              "Esta sección la conectaremos con Firebase Storage.",
            );
          }}
        />

        <OptionButton
          icon="clock-outline"
          title="Horarios"
          description="Configura tus días y horarios de atención"
          onPress={() => {
            Alert.alert(
              "Horarios",
              "Aquí administraremos los horarios del negocio.",
            );
          }}
        />

        <OptionButton
          icon="clipboard-list-outline"
          title="Pedidos"
          description="Consulta y administra los pedidos"
          onPress={() => {
            Alert.alert(
              "Pedidos",
              "El sistema de pedidos será conectado en la siguiente etapa.",
            );
          }}
        />
      </View>

      {/* ================= NEGOCIO ================= */}

      <Text style={styles.sectionTitle}>
        Negocio
      </Text>

      <View style={styles.optionsContainer}>
        <OptionButton
          icon="tag-multiple-outline"
          title="Promociones"
          description="Crea promociones y ofertas"
          onPress={() => {
            Alert.alert(
              "Promociones",
              "Aquí podremos crear promociones para tus productos.",
            );
          }}
        />

        <OptionButton
          icon="chart-line"
          title="Estadísticas"
          description="Consulta visitas, pedidos y rendimiento"
          onPress={() => {
            Alert.alert(
              "Estadísticas",
              "Las estadísticas se conectarán cuando tengamos pedidos y visitas.",
            );
          }}
        />

        <OptionButton
          icon="star-outline"
          title="Calificaciones"
          description="Consulta las opiniones de tus clientes"
          onPress={() => {
            Alert.alert(
              "Calificaciones",
              "Aquí aparecerán las calificaciones y reseñas.",
            );
          }}
        />

        <OptionButton
          icon="cog-outline"
          title="Configuración"
          description="Configuración general del negocio"
          onPress={() => {
            Alert.alert(
              "Configuración",
              "Aquí colocaremos la configuración avanzada.",
            );
          }}
        />
      </View>

      {/* ================= INFORMACIÓN ================= */}

      <View style={styles.infoBox}>
        <MaterialCommunityIcons
          name="information-outline"
          size={23}
          color="#0066CC"
        />

        <Text style={styles.infoText}>
          Este es el panel privado de administración de tu
          negocio. Los cambios que realices aquí podrán
          reflejarse en la vista que utilizan tus clientes.
        </Text>
      </View>
    </ScrollView>
  );
}

interface OptionButtonProps {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
  description: string;
  badge?: string;
  onPress: () => void;
}

function OptionButton({
  icon,
  title,
  description,
  badge,
  onPress,
}: OptionButtonProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.optionButton,
        pressed && styles.optionPressed,
      ]}
      onPress={onPress}
    >
      <View style={styles.optionIcon}>
        <MaterialCommunityIcons
          name={icon}
          size={25}
          color="#0066CC"
        />
      </View>

      <View style={styles.optionInfo}>
        <Text style={styles.optionTitle}>
          {title}
        </Text>

        <Text
          style={styles.optionDescription}
          numberOfLines={2}
        >
          {description}
        </Text>
      </View>

      {badge ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {badge}
          </Text>
        </View>
      ) : null}

      <MaterialCommunityIcons
        name="chevron-right"
        size={25}
        color="#999"
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  contentContainer: {
    paddingBottom: 45,
  },

  loadingContainer: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
  },

  loadingText: {
    marginTop: 14,
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },

  backMainButton: {
    marginTop: 20,
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#0066CC",
  },

  backMainButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
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

  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#222",
  },

  headerSubtitle: {
    marginTop: 3,
    fontSize: 13,
    color: "#777",
  },

  businessHeader: {
    marginHorizontal: 20,
    marginTop: 20,
    flexDirection: "row",
    alignItems: "center",
  },

  businessLogo: {
    width: 76,
    height: 76,
    borderRadius: 22,
    backgroundColor: "#F4F8FF",
    justifyContent: "center",
    alignItems: "center",
  },

  businessHeaderInfo: {
    flex: 1,
    marginLeft: 14,
  },

  businessName: {
    fontSize: 23,
    fontWeight: "700",
    color: "#222",
  },

  businessType: {
    marginTop: 4,
    fontSize: 14,
    color: "#0066CC",
    fontWeight: "600",
  },

  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 7,
  },

  statusDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    marginRight: 6,
  },

  statusActive: {
    backgroundColor: "#22C55E",
  },

  statusInactive: {
    backgroundColor: "#999",
  },

  statusText: {
    fontSize: 13,
    fontWeight: "600",
  },

  statusTextActive: {
    color: "#16A34A",
  },

  statusTextInactive: {
    color: "#777",
  },

  viewBusinessButton: {
    marginHorizontal: 20,
    marginTop: 18,
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#B8D5F5",
    backgroundColor: "#F8FBFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  viewBusinessText: {
    marginLeft: 8,
    color: "#0066CC",
    fontSize: 15,
    fontWeight: "700",
  },

  summaryRow: {
    marginHorizontal: 20,
    marginTop: 14,
    flexDirection: "row",
    gap: 12,
  },

  summaryCard: {
    flex: 1,
    minHeight: 90,
    borderRadius: 16,
    backgroundColor: "#F7F9FC",
    padding: 14,
    justifyContent: "center",
  },

  summaryNumber: {
    marginTop: 5,
    fontSize: 19,
    fontWeight: "700",
    color: "#222",
  },

  summaryLocation: {
    marginTop: 5,
    fontSize: 15,
    fontWeight: "700",
    color: "#222",
  },

  summaryLabel: {
    marginTop: 2,
    fontSize: 12,
    color: "#777",
  },

  sectionTitle: {
    marginHorizontal: 20,
    marginTop: 28,
    marginBottom: 12,
    fontSize: 20,
    fontWeight: "700",
    color: "#222",
  },

  optionsContainer: {
    marginHorizontal: 20,
  },

  optionButton: {
    minHeight: 76,
    marginBottom: 10,
    paddingHorizontal: 13,
    paddingVertical: 11,
    borderRadius: 16,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E8E8E8",
    flexDirection: "row",
    alignItems: "center",
  },

  optionPressed: {
    opacity: 0.7,
  },

  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#F4F8FF",
    justifyContent: "center",
    alignItems: "center",
  },

  optionInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },

  optionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#222",
  },

  optionDescription: {
    marginTop: 3,
    fontSize: 12,
    lineHeight: 17,
    color: "#777",
  },

  badge: {
    minWidth: 25,
    height: 25,
    paddingHorizontal: 7,
    borderRadius: 13,
    backgroundColor: "#0066CC",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 7,
  },

  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },

  infoBox: {
    marginHorizontal: 20,
    marginTop: 22,
    padding: 16,
    borderRadius: 15,
    backgroundColor: "#F4F8FF",
    flexDirection: "row",
    alignItems: "flex-start",
  },

  infoText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 13,
    lineHeight: 20,
    color: "#555",
  },
});
