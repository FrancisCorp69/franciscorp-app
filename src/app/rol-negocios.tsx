import { MaterialCommunityIcons } from "@expo/vector-icons";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { auth, db } from "../services/firebase";

interface Negocio {
  id: string;
  nombre?: string;
  tipo?: string;
  tipoNombre?: string;
  categoria?: string;
  descripcion?: string;
  estado?: string;

  ubicacion?: {
    direccion?: string;
    ciudad?: string;
    provincia?: string;
  };
}

export default function RolNegociosScreen() {
  const [negocios, setNegocios] = useState<Negocio[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (usuario) => {
      if (!usuario) {
        console.log("NO HAY USUARIO AUTENTICADO");
        setNegocios([]);
        setCargando(false);
        return;
      }

      try {
        console.log("USUARIO EN NEGOCIOS:", usuario.uid);

        const consulta = query(
          collection(db, "negocios"),
          where("propietarioId", "==", usuario.uid),
        );

        const snapshot = await getDocs(consulta);

        const misNegocios: Negocio[] = snapshot.docs.map((documento) => ({
          id: documento.id,
          ...documento.data(),
        })) as Negocio[];

        console.log("MIS NEGOCIOS:", misNegocios);
        console.log("CANTIDAD DE NEGOCIOS:", misNegocios.length);

        setNegocios(misNegocios);
      } catch (error) {
        console.error("ERROR CARGANDO MIS NEGOCIOS:", error);
        setNegocios([]);
      } finally {
        setCargando(false);
      }
    });

    return unsubscribe;
  }, []);

  const abrirNegocio = (negocio: Negocio) => {
    console.log("ABRIENDO MI NEGOCIO:", negocio.id);

    router.push({
      pathname: "/negocio",
      params: {
        id: negocio.id,
        nombre: negocio.nombre || "",
        categoria: negocio.categoria || "",
        descripcion: negocio.descripcion || "",
        direccion: negocio.ubicacion?.direccion || "",
        ciudad: negocio.ubicacion?.ciudad || "",
        estado: negocio.estado || "",
      },
    });
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* ================= ENCABEZADO ================= */}

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
          <Text style={styles.title}>Negocios</Text>

          <Text style={styles.subtitle}>
            Tu espacio para ofrecer productos y servicios
          </Text>
        </View>
      </View>

      {/* ================= PRESENTACIÓN ================= */}

      <View style={styles.welcomeBox}>
        <View style={styles.iconCircle}>
          <MaterialCommunityIcons
            name="storefront-outline"
            size={42}
            color="#0066CC"
          />
        </View>

        <Text style={styles.welcomeTitle}>
          Bienvenido a Negocios
        </Text>

        <Text style={styles.welcomeText}>
          Crea y administra tus negocios dentro de FrancisCorp.
          Puedes ofrecer productos, servicios o ambos.
        </Text>
      </View>

      {/* ================= CREAR NEGOCIO ================= */}

      <Pressable
        style={styles.createButton}
        onPress={() => router.push("/crear-negocio")}
      >
        <MaterialCommunityIcons
          name="plus-circle-outline"
          size={25}
          color="#fff"
        />

        <Text style={styles.createButtonText}>
          Crear mi negocio
        </Text>
      </Pressable>

      {/* ================= MIS NEGOCIOS ================= */}

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          Mis negocios
        </Text>

        {!cargando && negocios.length > 0 && (
          <Text style={styles.countText}>
            {negocios.length} negocio
            {negocios.length !== 1 ? "s" : ""}
          </Text>
        )}
      </View>

      {cargando ? (
        <View style={styles.emptyBox}>
          <MaterialCommunityIcons
            name="loading"
            size={42}
            color="#0066CC"
          />

          <Text style={styles.emptyTitle}>
            Cargando tus negocios...
          </Text>
        </View>
      ) : negocios.length === 0 ? (
        <View style={styles.emptyBox}>
          <MaterialCommunityIcons
            name="store-off-outline"
            size={48}
            color="#999"
          />

          <Text style={styles.emptyTitle}>
            Todavía no tienes negocios
          </Text>

          <Text style={styles.emptyText}>
            Cuando crees un negocio aparecerá aquí para que
            puedas administrarlo.
          </Text>
        </View>
      ) : (
        <View style={styles.businessList}>
          {negocios.map((negocio) => (
            <Pressable
              key={negocio.id}
              style={styles.businessCard}
              onPress={() => abrirNegocio(negocio)}
            >
              <View style={styles.businessIcon}>
                <MaterialCommunityIcons
                  name="store"
                  size={32}
                  color="#0066CC"
                />
              </View>

              <View style={styles.businessInfo}>
                <Text
                  style={styles.businessName}
                  numberOfLines={1}
                >
                  {negocio.nombre || "Sin nombre"}
                </Text>

                <Text style={styles.businessCategory}>
                  {negocio.categoria ||
                    negocio.tipoNombre ||
                    negocio.tipo ||
                    "Negocio"}
                </Text>

                {negocio.descripcion ? (
                  <Text
                    style={styles.businessDescription}
                    numberOfLines={2}
                  >
                    {negocio.descripcion}
                  </Text>
                ) : null}

                {negocio.ubicacion?.ciudad ? (
                  <View style={styles.locationRow}>
                    <MaterialCommunityIcons
                      name="map-marker-outline"
                      size={16}
                      color="#777"
                    />

                    <Text style={styles.locationText}>
                      {negocio.ubicacion.ciudad}
                      {negocio.ubicacion.provincia
                        ? `, ${negocio.ubicacion.provincia}`
                        : ""}
                    </Text>
                  </View>
                ) : null}

                <View style={styles.statusRow}>
                  <View
                    style={[
                      styles.statusDot,
                      negocio.estado === "activo"
                        ? styles.statusActive
                        : styles.statusInactive,
                    ]}
                  />

                  <Text style={styles.statusText}>
                    {negocio.estado === "activo"
                      ? "Activo"
                      : negocio.estado || "Sin estado"}
                  </Text>
                </View>
              </View>

              <MaterialCommunityIcons
                name="chevron-right"
                size={28}
                color="#999"
              />
            </Pressable>
          ))}
        </View>
      )}

      {/* ================= INFORMACIÓN ================= */}

      <View style={styles.infoBox}>
        <MaterialCommunityIcons
          name="information-outline"
          size={23}
          color="#0066CC"
        />

        <Text style={styles.infoText}>
          En FrancisCorp puedes crear diferentes tipos de
          negocios y ofrecer cualquier producto o servicio
          permitido dentro de la plataforma.
        </Text>
      </View>
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

  title: {
    fontSize: 27,
    fontWeight: "700",
    color: "#222",
  },

  subtitle: {
    marginTop: 3,
    fontSize: 14,
    color: "#777",
  },

  welcomeBox: {
    margin: 20,
    padding: 24,
    borderRadius: 20,
    backgroundColor: "#F4F8FF",
    alignItems: "center",
  },

  iconCircle: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },

  welcomeTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#222",
    textAlign: "center",
  },

  welcomeText: {
    marginTop: 10,
    fontSize: 15,
    lineHeight: 22,
    color: "#666",
    textAlign: "center",
  },

  createButton: {
    marginHorizontal: 20,
    minHeight: 54,
    borderRadius: 14,
    backgroundColor: "#0066CC",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  createButtonText: {
    marginLeft: 9,
    fontSize: 17,
    fontWeight: "700",
    color: "#fff",
  },

  sectionHeader: {
    paddingHorizontal: 20,
    marginTop: 30,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  sectionTitle: {
    fontSize: 21,
    fontWeight: "700",
    color: "#222",
  },

  countText: {
    fontSize: 14,
    color: "#0066CC",
    fontWeight: "600",
  },

  businessList: {
    marginHorizontal: 20,
  },

  businessCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 15,
    marginBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#eee",
    elevation: 2,
  },

  businessIcon: {
    width: 62,
    height: 62,
    borderRadius: 16,
    backgroundColor: "#F4F8FF",
    justifyContent: "center",
    alignItems: "center",
  },

  businessInfo: {
    flex: 1,
    marginLeft: 13,
    marginRight: 8,
  },

  businessName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#222",
  },

  businessCategory: {
    marginTop: 3,
    fontSize: 14,
    fontWeight: "600",
    color: "#0066CC",
  },

  businessDescription: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 18,
    color: "#666",
  },

  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 7,
  },

  locationText: {
    marginLeft: 4,
    fontSize: 12,
    color: "#777",
  },

  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 7,
  },

  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },

  statusActive: {
    backgroundColor: "#22C55E",
  },

  statusInactive: {
    backgroundColor: "#999",
  },

  statusText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "600",
  },

  emptyBox: {
    marginHorizontal: 20,
    padding: 28,
    borderRadius: 18,
    backgroundColor: "#F7F7F7",
    alignItems: "center",
  },

  emptyTitle: {
    marginTop: 12,
    fontSize: 18,
    fontWeight: "700",
    color: "#555",
    textAlign: "center",
  },

  emptyText: {
    marginTop: 7,
    fontSize: 14,
    lineHeight: 20,
    color: "#888",
    textAlign: "center",
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
    fontSize: 14,
    lineHeight: 20,
    color: "#555",
  },
});
