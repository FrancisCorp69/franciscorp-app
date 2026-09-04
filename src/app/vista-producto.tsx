import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import {
  doc,
  getDoc,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
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
import { useCart } from "../context/CartContext";
import { db } from "../services/firebase";

interface Producto {
  id: string;
  nombre?: string;
  descripcion?: string;
  precio?: number;
  categoria?: string;
  foto?: string;
  disponible?: boolean;
  destacado?: boolean;
}

export default function VistaProductoScreen() {
  const { negocioId, productoId } =
    useLocalSearchParams<{
      negocioId?: string;
      productoId?: string;
    }>();

  const { agregarProducto } = useCart();

  const [producto, setProducto] =
    useState<Producto | null>(null);

  const [negocioNombre, setNegocioNombre] =
    useState("Negocio");

  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarProducto();
  }, [negocioId, productoId]);

  async function cargarProducto() {
    if (!negocioId || !productoId) {
      setCargando(false);
      return;
    }

    try {
      setCargando(true);

      const productoRef = doc(
        db,
        "negocios",
        negocioId,
        "productos",
        productoId
      );

      const negocioRef = doc(
        db,
        "negocios",
        negocioId
      );

      const [productoSnap, negocioSnap] =
        await Promise.all([
          getDoc(productoRef),
          getDoc(negocioRef),
        ]);

      if (negocioSnap.exists()) {
        const datosNegocio = negocioSnap.data();

        setNegocioNombre(
          datosNegocio.nombre || "Negocio"
        );
      }

      if (!productoSnap.exists()) {
        setProducto(null);
        return;
      }

      const datos = productoSnap.data();

      setProducto({
        id: productoSnap.id,
        nombre: datos.nombre,
        descripcion: datos.descripcion,
        precio:
          typeof datos.precio === "number"
            ? datos.precio
            : Number(datos.precio) || 0,
        categoria: datos.categoria,
        foto: datos.foto,
        disponible:
          datos.disponible !== false,
        destacado:
          datos.destacado === true,
      });
    } catch (error) {
      console.error(
        "ERROR CARGANDO PRODUCTO:",
        error
      );

      Alert.alert(
        "Error",
        "No fue posible cargar la información del producto."
      );
    } finally {
      setCargando(false);
    }
  }

  function volver() {
    router.back();
  }

  function agregarAlCarrito() {
    if (!producto || !negocioId) return;

    const agregado = agregarProducto(
      String(negocioId),
      negocioNombre,
      {
        id: producto.id,
        nombre: producto.nombre,
        precio: producto.precio,
        foto: producto.foto,
      }
    );

    if (agregado) {
      Alert.alert(
        "Producto agregado",
        `"${producto.nombre || "Producto"}" fue agregado al carrito.`
      );
    } else {
      Alert.alert(
        "Carrito de otro negocio",
        `Tu carrito pertenece a "${negocioNombre}" y no puedes agregar productos de otro negocio al mismo carrito.`
      );
    }
  }

  if (cargando) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />

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
          size={64}
        />

        <Text style={styles.emptyTitle}>
          Producto no encontrado
        </Text>

        <Text style={styles.emptyText}>
          No pudimos encontrar la información de este producto.
        </Text>

        <Pressable
          style={styles.backButtonSimple}
          onPress={volver}
        >
          <Text style={styles.backButtonSimpleText}>
            Volver
          </Text>
        </Pressable>
      </View>
    );
  }

  const nombreProducto =
    producto.nombre || "Producto";

  const precio =
    (Number(producto.precio) || 0).toFixed(2);

  const disponible =
    producto.disponible !== false;

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.imageContainer}>
          {producto.foto ? (
            <Image
              source={{ uri: producto.foto }}
              style={styles.productImage}
            />
          ) : (
            <View
              style={styles.imagePlaceholder}
            >
              <MaterialCommunityIcons
                name="food-outline"
                size={90}
              />
            </View>
          )}

          <View style={styles.imageOverlay} />

          <Pressable
            style={styles.backButton}
            onPress={volver}
          >
            <MaterialCommunityIcons
              name="arrow-left"
              size={25}
              color="#fff"
            />
          </Pressable>
        </View>

        <View style={styles.content}>
          {producto.destacado ? (
            <View style={styles.destacadoBadge}>
              <MaterialCommunityIcons
                name="star"
                size={15}
              />

              <Text style={styles.destacadoText}>
                Producto destacado
              </Text>
            </View>
          ) : null}

          <Text style={styles.nombre}>
            {nombreProducto}
          </Text>

          {producto.categoria ? (
            <Text style={styles.categoria}>
              {producto.categoria}
            </Text>
          ) : null}

          <Text style={styles.precio}>
            ${precio}
          </Text>

          <View
            style={[
              styles.disponibilidad,
              disponible
                ? styles.disponible
                : styles.agotado,
            ]}
          >
            <View
              style={[
                styles.disponibilidadDot,
                !disponible &&
                  styles.agotadoDot,
              ]}
            />

            <Text style={styles.disponibilidadText}>
              {disponible
                ? "Disponible"
                : "Agotado"}
            </Text>
          </View>

          <View style={styles.separator} />

          <Text style={styles.sectionTitle}>
            Descripción
          </Text>

          {producto.descripcion ? (
            <Text style={styles.descripcion}>
              {producto.descripcion}
            </Text>
          ) : (
            <Text style={styles.sinDescripcion}>
              Este producto no tiene una descripción.
            </Text>
          )}

          {disponible ? (
            <Pressable
              style={styles.addButton}
              onPress={agregarAlCarrito}
            >
              <MaterialCommunityIcons
                name="cart-plus"
                size={23}
                color="#fff"
              />

              <Text style={styles.addButtonText}>
                Agregar al carrito
              </Text>
            </Pressable>
          ) : (
            <View style={styles.unavailableButton}>
              <Text style={styles.unavailableButtonText}>
                Producto agotado
              </Text>
            </View>
          )}
        </View>

        <View style={styles.bottomSpace} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  scrollContent: {
    paddingBottom: 30,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
    backgroundColor: "#fff",
  },

  loadingText: {
    marginTop: 12,
    fontSize: 15,
  },

  emptyTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginTop: 16,
  },

  emptyText: {
    fontSize: 15,
    textAlign: "center",
    marginTop: 8,
    opacity: 0.7,
  },

  backButtonSimple: {
    marginTop: 25,
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "#111",
  },

  backButtonSimpleText: {
    color: "#fff",
    fontWeight: "600",
  },

  imageContainer: {
    height: 320,
    position: "relative",
  },

  productImage: {
    width: "100%",
    height: "100%",
  },

  imagePlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
  },

  imageOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.15)",
  },

  backButton: {
    position: "absolute",
    top: 48,
    left: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    alignItems: "center",
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 22,
  },

  destacadoBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  destacadoText: {
    fontSize: 12,
    fontWeight: "700",
    marginLeft: 5,
  },

  nombre: {
    fontSize: 29,
    fontWeight: "800",
  },

  categoria: {
    marginTop: 6,
    fontSize: 15,
    opacity: 0.55,
  },

  precio: {
    marginTop: 16,
    fontSize: 27,
    fontWeight: "800",
  },

  disponibilidad: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 20,
  },

  disponible: {
    backgroundColor: "#e9f8ed",
  },

  agotado: {
    backgroundColor: "#f1f1f1",
  },

  disponibilidadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#35a853",
    marginRight: 6,
  },

  agotadoDot: {
    backgroundColor: "#888",
  },

  disponibilidadText: {
    fontSize: 12,
    fontWeight: "700",
  },

  separator: {
    height: 1,
    backgroundColor: "#e9e9e9",
    marginTop: 25,
    marginBottom: 22,
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: "800",
  },

  descripcion: {
    fontSize: 15,
    lineHeight: 23,
    marginTop: 10,
    opacity: 0.7,
  },

  sinDescripcion: {
    fontSize: 14,
    marginTop: 10,
    opacity: 0.5,
  },

  addButton: {
    marginTop: 30,
    height: 54,
    borderRadius: 14,
    backgroundColor: "#111",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 9,
  },

  unavailableButton: {
    marginTop: 30,
    height: 54,
    borderRadius: 14,
    backgroundColor: "#e9e9e9",
    alignItems: "center",
    justifyContent: "center",
  },

  unavailableButtonText: {
    fontSize: 15,
    fontWeight: "700",
    opacity: 0.55,
  },

  bottomSpace: {
    height: 25,
  },
});
