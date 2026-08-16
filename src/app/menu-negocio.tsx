import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
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

interface Negocio {
  id: string;
  nombre?: string;
  tipo?: string;
  tipoNombre?: string;
  categoria?: string;
}

export default function MenuNegocioScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const negocioId = String(params.id || "");

  const [negocio, setNegocio] = useState<Negocio | null>(null);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function cargarDatos() {
      if (!negocioId) {
        Alert.alert(
          "Negocio no encontrado",
          "No se recibió el identificador del negocio.",
        );

        router.back();
        return;
      }

      try {
        console.log("CARGANDO MENÚ DEL NEGOCIO:", negocioId);

        const referenciaNegocio = doc(db, "negocios", negocioId);

        const documentoNegocio = await getDoc(referenciaNegocio);

        if (!documentoNegocio.exists()) {
          Alert.alert("Negocio no encontrado", "El negocio no existe.");

          router.back();
          return;
        }

        const datosNegocio = {
          id: documentoNegocio.id,
          ...documentoNegocio.data(),
        } as Negocio;

        setNegocio(datosNegocio);

        const productosRef = collection(db, "negocios", negocioId, "productos");

        const productosSnapshot = await getDocs(productosRef);

        const listaProductos = productosSnapshot.docs.map((documento) => ({
          id: documento.id,
          ...documento.data(),
        })) as Producto[];

        console.log("PRODUCTOS ENCONTRADOS:", listaProductos.length);

        setProductos(listaProductos);
      } catch (error) {
        console.error("ERROR CARGANDO MENÚ:", error);

        Alert.alert("Error", "No pudimos cargar el menú del negocio.");
      } finally {
        setCargando(false);
      }
    }

    cargarDatos();
  }, [negocioId]);

  const agregarProducto = () => {
    if (!negocioId) {
      Alert.alert("Error", "No se identificó el negocio.");
      return;
    }

    router.push({
      pathname: "/agregar-producto",
      params: {
        id: negocioId,
      },
    });
  };

  const editarProducto = (producto: Producto) => {
    Alert.alert(
      "Editar producto",
      `Aquí podrás editar "${producto.nombre || "este producto"}".`,
    );
  };

  const eliminarProducto = (producto: Producto) => {
    Alert.alert(
      "Eliminar producto",
      `¿Quieres eliminar "${producto.nombre || "este producto"}"?`,
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => {
            console.log("PRODUCTO A ELIMINAR:", producto.id);
          },
        },
      ],
    );
  };

  if (cargando) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066CC" />

        <Text style={styles.loadingText}>Cargando menú...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* ================= HEADER ================= */}

      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={26} color="#222" />
        </Pressable>

        <View style={styles.headerText}>
          <Text style={styles.title}>Menú del negocio</Text>

          <Text style={styles.subtitle}>{negocio?.nombre || "Mi negocio"}</Text>
        </View>
      </View>

      {/* ================= PRESENTACIÓN ================= */}

      <View style={styles.introBox}>
        <View style={styles.introIcon}>
          <MaterialCommunityIcons
            name="silverware-fork-knife"
            size={35}
            color="#0066CC"
          />
        </View>

        <View style={styles.introContent}>
          <Text style={styles.introTitle}>Productos y platos</Text>

          <Text style={styles.introText}>
            Administra lo que tus clientes podrán encontrar y comprar en tu
            negocio.
          </Text>
        </View>
      </View>

      {/* ================= AGREGAR ================= */}

      <Pressable style={styles.addButton} onPress={agregarProducto}>
        <MaterialCommunityIcons
          name="plus-circle-outline"
          size={25}
          color="#fff"
        />

        <Text style={styles.addButtonText}>Agregar producto</Text>
      </Pressable>

      {/* ================= TÍTULO ================= */}

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Mi menú</Text>

        <Text style={styles.countText}>
          {productos.length} {productos.length === 1 ? "producto" : "productos"}
        </Text>
      </View>

      {/* ================= SIN PRODUCTOS ================= */}

      {productos.length === 0 ? (
        <View style={styles.emptyBox}>
          <MaterialCommunityIcons
            name="food-off-outline"
            size={55}
            color="#999"
          />

          <Text style={styles.emptyTitle}>Todavía no tienes productos</Text>

          <Text style={styles.emptyText}>
            Agrega tus platos, productos o servicios para comenzar a mostrar tu
            oferta a los clientes.
          </Text>

          <Pressable style={styles.emptyButton} onPress={agregarProducto}>
            <MaterialCommunityIcons name="plus" size={20} color="#0066CC" />

            <Text style={styles.emptyButtonText}>Agregar el primero</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.productList}>
          {productos.map((producto) => (
            <View key={producto.id} style={styles.productCard}>
              {/* IMAGEN */}

              <View style={styles.productImage}>
                <MaterialCommunityIcons name="food" size={35} color="#0066CC" />
              </View>

              {/* INFORMACIÓN */}

              <View style={styles.productInfo}>
                <View style={styles.productTitleRow}>
                  <Text style={styles.productName} numberOfLines={1}>
                    {producto.nombre || "Producto sin nombre"}
                  </Text>

                  {producto.destacado ? (
                    <MaterialCommunityIcons
                      name="star"
                      size={18}
                      color="#F5A623"
                    />
                  ) : null}
                </View>

                {producto.categoria ? (
                  <Text style={styles.productCategory}>
                    {producto.categoria}
                  </Text>
                ) : null}

                {producto.descripcion ? (
                  <Text style={styles.productDescription} numberOfLines={2}>
                    {producto.descripcion}
                  </Text>
                ) : null}

                <View style={styles.productBottom}>
                  <Text style={styles.price}>
                    ${Number(producto.precio || 0).toFixed(2)}
                  </Text>

                  <Text
                    style={[
                      styles.availability,
                      producto.disponible === false
                        ? styles.unavailable
                        : styles.available,
                    ]}
                  >
                    {producto.disponible === false ? "Agotado" : "Disponible"}
                  </Text>
                </View>

                {/* ACCIONES */}

                <View style={styles.actions}>
                  <Pressable
                    style={styles.editButton}
                    onPress={() => editarProducto(producto)}
                  >
                    <MaterialCommunityIcons
                      name="pencil-outline"
                      size={18}
                      color="#0066CC"
                    />

                    <Text style={styles.editButtonText}>Editar</Text>
                  </Pressable>

                  <Pressable
                    style={styles.deleteButton}
                    onPress={() => eliminarProducto(producto)}
                  >
                    <MaterialCommunityIcons
                      name="trash-can-outline"
                      size={18}
                      color="#D32F2F"
                    />
                  </Pressable>
                </View>
              </View>
            </View>
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
          Los productos se almacenarán dentro de tu negocio en Firebase.
          Posteriormente podrás agregar fotografías, categorías, precios,
          disponibilidad y promociones.
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

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },

  loadingText: {
    marginTop: 12,
    color: "#666",
    fontSize: 15,
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
    fontSize: 25,
    fontWeight: "700",
    color: "#222",
  },

  subtitle: {
    marginTop: 3,
    fontSize: 14,
    color: "#777",
  },

  introBox: {
    margin: 20,
    padding: 18,
    borderRadius: 18,
    backgroundColor: "#F4F8FF",
    flexDirection: "row",
    alignItems: "center",
  },

  introIcon: {
    width: 62,
    height: 62,
    borderRadius: 16,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },

  introContent: {
    flex: 1,
    marginLeft: 13,
  },

  introTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#222",
  },

  introText: {
    marginTop: 5,
    fontSize: 13,
    lineHeight: 19,
    color: "#666",
  },

  addButton: {
    marginHorizontal: 20,
    minHeight: 54,
    borderRadius: 14,
    backgroundColor: "#0066CC",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  addButtonText: {
    marginLeft: 8,
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },

  sectionHeader: {
    marginTop: 28,
    marginBottom: 12,
    marginHorizontal: 20,
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

  emptyBox: {
    marginHorizontal: 20,
    padding: 30,
    borderRadius: 18,
    backgroundColor: "#F7F7F7",
    alignItems: "center",
  },

  emptyTitle: {
    marginTop: 12,
    fontSize: 19,
    fontWeight: "700",
    color: "#555",
    textAlign: "center",
  },

  emptyText: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 21,
    color: "#888",
    textAlign: "center",
  },

  emptyButton: {
    marginTop: 18,
    paddingHorizontal: 18,
    minHeight: 42,
    borderRadius: 10,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#0066CC",
    flexDirection: "row",
    alignItems: "center",
  },

  emptyButtonText: {
    marginLeft: 6,
    color: "#0066CC",
    fontWeight: "700",
  },

  productList: {
    marginHorizontal: 20,
  },

  productCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 13,
    marginBottom: 14,
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#eee",
    elevation: 2,
  },

  productImage: {
    width: 85,
    height: 85,
    borderRadius: 14,
    backgroundColor: "#F4F8FF",
    justifyContent: "center",
    alignItems: "center",
  },

  productInfo: {
    flex: 1,
    marginLeft: 12,
  },

  productTitleRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  productName: {
    flex: 1,
    fontSize: 17,
    fontWeight: "700",
    color: "#222",
  },

  productCategory: {
    marginTop: 3,
    fontSize: 12,
    fontWeight: "600",
    color: "#0066CC",
  },

  productDescription: {
    marginTop: 5,
    fontSize: 13,
    lineHeight: 18,
    color: "#666",
  },

  productBottom: {
    marginTop: 7,
    flexDirection: "row",
    alignItems: "center",
  },

  price: {
    fontSize: 17,
    fontWeight: "700",
    color: "#222",
  },

  availability: {
    marginLeft: 10,
    fontSize: 12,
    fontWeight: "600",
  },

  available: {
    color: "#22C55E",
  },

  unavailable: {
    color: "#D32F2F",
  },

  actions: {
    marginTop: 9,
    flexDirection: "row",
    alignItems: "center",
  },

  editButton: {
    minHeight: 34,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: "#F4F8FF",
    flexDirection: "row",
    alignItems: "center",
  },

  editButtonText: {
    marginLeft: 5,
    color: "#0066CC",
    fontSize: 12,
    fontWeight: "700",
  },

  deleteButton: {
    width: 34,
    height: 34,
    marginLeft: 8,
    borderRadius: 8,
    backgroundColor: "#FFF5F5",
    justifyContent: "center",
    alignItems: "center",
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
    lineHeight: 19,
    color: "#555",
  },
});
