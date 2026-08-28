import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { db } from "../services/firebase";

interface Producto {
  id: string;
  negocioId?: string;
  nombre?: string;
  descripcion?: string;
  precio?: number;
  categoria?: string;
  foto?: string;
  disponible?: boolean;
  destacado?: boolean;
  estado?: string;
}

export default function ProductoScreen() {
  const params = useLocalSearchParams<{
    negocioId?: string;
    productoId?: string;
  }>();

  const negocioId = String(params.negocioId || "");
  const productoId = String(params.productoId || "");

  const [producto, setProducto] = useState<Producto | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function cargarProducto() {
      if (!negocioId || !productoId) {
        Alert.alert(
          "Producto no encontrado",
          "No se recibió correctamente la información del producto.",
        );

        router.back();
        return;
      }

      try {
        console.log("CARGANDO PRODUCTO:", productoId);
        console.log("NEGOCIO:", negocioId);

        const referenciaProducto = doc(
          db,
          "negocios",
          negocioId,
          "productos",
          productoId,
        );

        const documento = await getDoc(referenciaProducto);

        if (!documento.exists()) {
          console.error("PRODUCTO NO EXISTE:", productoId);

          Alert.alert(
            "Producto no encontrado",
            "El producto que intentas abrir no existe.",
          );

          router.back();
          return;
        }

        const datosProducto = {
          id: documento.id,
          ...documento.data(),
        } as Producto;

        console.log("PRODUCTO CARGADO:", datosProducto);
        console.log("FOTO DEL PRODUCTO:", datosProducto.foto);

        setProducto(datosProducto);
      } catch (error) {
        console.error("ERROR CARGANDO PRODUCTO:", error);

        Alert.alert(
          "Error",
          "No pudimos cargar la información del producto.",
        );
      } finally {
        setCargando(false);
      }
    }

    cargarProducto();
  }, [negocioId, productoId]);

  if (cargando) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066CC" />

        <Text style={styles.loadingText}>
          Cargando producto...
        </Text>
      </View>
    );
  }

  if (!producto) {
    return (
      <View style={styles.loadingContainer}>
        <MaterialCommunityIcons
          name="food-off-outline"
          size={60}
          color="#999"
        />

        <Text style={styles.loadingText}>
          Producto no disponible.
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
      {/* HEADER */}

      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={27}
            color="#222"
          />
        </Pressable>

        <Text style={styles.headerTitle}>
          Producto
        </Text>
      </View>

      {/* FOTO */}

      <View style={styles.imageContainer}>
        {producto.foto ? (
          <Image
            source={{ uri: producto.foto }}
            style={styles.productImage}
            resizeMode="cover"
            onError={(error) => {
              console.error(
                "ERROR MOSTRANDO FOTO:",
                error.nativeEvent,
              );
            }}
          />
        ) : (
          <View style={styles.noImage}>
            <MaterialCommunityIcons
              name="food-outline"
              size={75}
              color="#0066CC"
            />

            <Text style={styles.noImageText}>
              Este producto no tiene fotografía
            </Text>
          </View>
        )}
      </View>

      {/* INFORMACIÓN */}

      <View style={styles.infoCard}>
        <View style={styles.titleRow}>
          <Text style={styles.productName}>
            {producto.nombre || "Producto sin nombre"}
          </Text>

          {producto.destacado ? (
            <MaterialCommunityIcons
              name="star"
              size={25}
              color="#F5A623"
            />
          ) : null}
        </View>

        {producto.categoria ? (
          <View style={styles.categoryContainer}>
            <MaterialCommunityIcons
              name="tag-outline"
              size={18}
              color="#0066CC"
            />

            <Text style={styles.category}>
              {producto.categoria}
            </Text>
          </View>
        ) : null}

        <Text style={styles.price}>
          ${Number(producto.precio || 0).toFixed(2)}
        </Text>

        <View
          style={[
            styles.status,
            producto.disponible === false
              ? styles.statusUnavailable
              : styles.statusAvailable,
          ]}
        >
          <MaterialCommunityIcons
            name={
              producto.disponible === false
                ? "close-circle-outline"
                : "check-circle-outline"
            }
            size={19}
            color={
              producto.disponible === false
                ? "#D32F2F"
                : "#2E7D32"
            }
          />

          <Text
            style={[
              styles.statusText,
              producto.disponible === false
                ? styles.statusTextUnavailable
                : styles.statusTextAvailable,
            ]}
          >
            {producto.disponible === false
              ? "Agotado"
              : "Disponible"}
          </Text>
        </View>

        {producto.descripcion ? (
          <View style={styles.descriptionSection}>
            <Text style={styles.sectionTitle}>
              Descripción
            </Text>

            <Text style={styles.description}>
              {producto.descripcion}
            </Text>
          </View>
        ) : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F8FA",
  },

  contentContainer: {
    paddingBottom: 40,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F7F8FA",
    padding: 30,
  },

  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: "#666",
  },

  header: {
    height: 65,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: "center",
    alignItems: "center",
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#222",
    marginLeft: 8,
  },

  imageContainer: {
    width: "100%",
    height: 300,
    backgroundColor: "#EEF3F8",
  },

  productImage: {
    width: "100%",
    height: "100%",
  },

  noImage: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  noImageText: {
    marginTop: 12,
    color: "#777",
    fontSize: 15,
  },

  infoCard: {
    backgroundColor: "#fff",
    margin: 16,
    borderRadius: 18,
    padding: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },
  },

  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  productName: {
    flex: 1,
    fontSize: 27,
    fontWeight: "800",
    color: "#222",
    marginRight: 10,
  },

  categoryContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },

  category: {
    fontSize: 15,
    color: "#0066CC",
    marginLeft: 7,
    fontWeight: "600",
  },

  price: {
    fontSize: 29,
    fontWeight: "800",
    color: "#0066CC",
    marginTop: 18,
  },

  status: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    marginTop: 15,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
  },

  statusAvailable: {
    backgroundColor: "#E8F5E9",
  },

  statusUnavailable: {
    backgroundColor: "#FFEBEE",
  },

  statusText: {
    marginLeft: 6,
    fontWeight: "700",
    fontSize: 14,
  },

  statusTextAvailable: {
    color: "#2E7D32",
  },

  statusTextUnavailable: {
    color: "#D32F2F",
  },

  descriptionSection: {
    marginTop: 25,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 20,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#222",
    marginBottom: 8,
  },

  description: {
    fontSize: 16,
    lineHeight: 24,
    color: "#555",
  },
});
