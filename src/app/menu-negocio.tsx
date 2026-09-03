import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
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

        const referenciaNegocio = doc(
          db,
          "negocios",
          negocioId,
        );

        const documentoNegocio = await getDoc(
          referenciaNegocio,
        );

        if (!documentoNegocio.exists()) {
          Alert.alert(
            "Negocio no encontrado",
            "El negocio no existe.",
          );

          router.back();
          return;
        }

        const datosNegocio = {
          id: documentoNegocio.id,
          ...documentoNegocio.data(),
        } as Negocio;

        setNegocio(datosNegocio);

        const productosRef = collection(
          db,
          "negocios",
          negocioId,
          "productos",
        );

        const productosSnapshot = await getDocs(
          productosRef,
        );

        const listaProductos =
          productosSnapshot.docs.map((documento) => ({
            id: documento.id,
            ...documento.data(),
          })) as Producto[];

        console.log(
          "PRODUCTOS ENCONTRADOS:",
          listaProductos.length,
        );

        console.log(
          "FOTOS ENCONTRADAS:",
          listaProductos.map((producto) => ({
            id: producto.id,
            nombre: producto.nombre,
            foto: producto.foto || "SIN FOTO",
          })),
        );

        setProductos(listaProductos);
      } catch (error) {
        console.error(
          "ERROR CARGANDO MENÚ:",
          error,
        );

        Alert.alert(
          "Error",
          "No pudimos cargar el menú del negocio.",
        );
      } finally {
        setCargando(false);
      }
    }

    cargarDatos();
  }, [negocioId]);

  const agregarProducto = () => {
    if (!negocioId) {
      Alert.alert(
        "Error",
        "No se identificó el negocio.",
      );

      return;
    }

    router.push({
      pathname: "/agregar-producto",
      params: {
        id: negocioId,
      },
    });
  };

  const abrirProducto = (producto: Producto) => {
    console.log(
      "ABRIENDO PRODUCTO:",
      producto.id,
    );

    console.log(
      "FOTO DEL PRODUCTO:",
      producto.foto || "SIN FOTO",
    );

    router.push({
      pathname: "/producto",
      params: {
        negocioId,
        productoId: producto.id,
      },
    });
  };

  const editarProducto = (producto: Producto) => {
    if (!negocioId || !producto.id) {
      Alert.alert(
        "Error",
        "No se pudo identificar el producto.",
      );

      return;
    }

    router.push({
      pathname: "/editar-producto",
      params: {
        negocioId,
        productoId: producto.id,
      },
    });
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
            console.log(
              "PRODUCTO A ELIMINAR:",
              producto.id,
            );
          },
        },
      ],
    );
  };

  if (cargando) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color="#0066CC"
        />

        <Text style={styles.loadingText}>
          Cargando menú...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={
        styles.contentContainer
      }
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
          <Text style={styles.title}>
            Menú del negocio
          </Text>

          <Text style={styles.subtitle}>
            {negocio?.nombre || "Mi negocio"}
          </Text>
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
          <Text style={styles.introTitle}>
            Productos y platos
          </Text>

          <Text style={styles.introText}>
            Administra lo que tus clientes podrán
            encontrar y comprar en tu negocio.
          </Text>
        </View>
      </View>

      {/* ================= AGREGAR ================= */}

      <Pressable
        style={styles.addButton}
        onPress={agregarProducto}
      >
        <MaterialCommunityIcons
          name="plus-circle-outline"
          size={25}
          color="#fff"
        />

        <Text style={styles.addButtonText}>
          Agregar producto
        </Text>
      </Pressable>

      {/* ================= TÍTULO ================= */}

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          Mi menú
        </Text>

        <Text style={styles.countText}>
          {productos.length}{" "}
          {productos.length === 1
            ? "producto"
            : "productos"}
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

          <Text style={styles.emptyTitle}>
            Todavía no tienes productos
          </Text>

          <Text style={styles.emptyText}>
            Agrega tus platos, productos o servicios
            para comenzar a mostrar tu oferta a los
            clientes.
          </Text>

          <Pressable
            style={styles.emptyButton}
            onPress={agregarProducto}
          >
            <MaterialCommunityIcons
              name="plus"
              size={20}
              color="#0066CC"
            />

            <Text style={styles.emptyButtonText}>
              Agregar el primero
            </Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.productList}>
          {productos.map((producto) => (
            <Pressable
              key={producto.id}
              style={({ pressed }) => [
                styles.productCard,
                pressed && styles.productCardPressed,
              ]}
              onPress={() =>
                abrirProducto(producto)
              }
            >
              {/* ================= IMAGEN ================= */}

              <View style={styles.productImage}>
                {producto.foto ? (
                  <Image
                    source={{
                      uri: producto.foto,
                    }}
                    style={styles.productImageReal}
                    resizeMode="cover"
                  />
                ) : (
                  <MaterialCommunityIcons
                    name="food"
                    size={35}
                    color="#0066CC"
                  />
                )}
              </View>

              {/* ================= INFORMACIÓN ================= */}

              <View style={styles.productInfo}>
                <View
                  style={styles.productTitleRow}
                >
                  <Text
                    style={styles.productName}
                    numberOfLines={1}
                  >
                    {producto.nombre ||
                      "Producto sin nombre"}
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
                  <Text
                    style={styles.productCategory}
                  >
                    {producto.categoria}
                  </Text>
                ) : null}

                {producto.descripcion ? (
                  <Text
                    style={
                      styles.productDescription
                    }
                    numberOfLines={2}
                  >
                    {producto.descripcion}
                  </Text>
                ) : null}

                <View
                  style={styles.productBottom}
                >
                  <Text style={styles.price}>
                    $
                    {Number(
                      producto.precio || 0,
                    ).toFixed(2)}
                  </Text>

                  <Text
                    style={[
                      styles.availability,
                      producto.disponible === false
                        ? styles.unavailable
                        : styles.available,
                    ]}
                  >
                    {producto.disponible === false
                      ? "Agotado"
                      : "Disponible"}
                  </Text>
                </View>

                {/* ================= ACCIONES ================= */}

                <View style={styles.actions}>
                  <Pressable
                    style={styles.editButton}
                    onPress={(event) => {
                      event.stopPropagation();
                      editarProducto(
                        producto,
                      );
                    }}
                  >
                    <MaterialCommunityIcons
                      name="pencil-outline"
                      size={18}
                      color="#0066CC"
                    />

                    <Text
                      style={
                        styles.editButtonText
                      }
                    >
                      Editar
                    </Text>
                  </Pressable>

                  <Pressable
                    style={styles.deleteButton}
                    onPress={(event) => {
                      event.stopPropagation();
                      eliminarProducto(
                        producto,
                      );
                    }}
                  >
                    <MaterialCommunityIcons
                      name="trash-can-outline"
                      size={18}
                      color="#D32F2F"
                    />
                  </Pressable>
                </View>
              </View>

              {/* INDICADOR DE APERTURA */}

              <View style={styles.openIndicator}>
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={22}
                  color="#999"
                />
              </View>
            </Pressable>
          ))}
        </View>
      )}

      {/* ================= INFORMACIÓN ================= */}

      <View style={styles.infoBox}>
        <MaterialCommunityIcons
          name="information-outline"
          size={24}
          color="#0066CC"
        />

        <Text style={styles.infoText}>
          Los productos se almacenan dentro de tu
          negocio en Firebase. Puedes agregar
          fotografías, categorías, precios,
          disponibilidad y promociones.
        </Text>
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
  },

  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },

  header: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
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

  headerText: {
    flex: 1,
    marginLeft: 8,
  },

  title: {
    fontSize: 21,
    fontWeight: "800",
    color: "#222",
  },

  subtitle: {
    marginTop: 3,
    fontSize: 14,
    color: "#777",
  },

  introBox: {
    margin: 16,
    padding: 16,
    backgroundColor: "#EEF5FF",
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
  },

  introIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },

  introContent: {
    flex: 1,
    marginLeft: 14,
  },

  introTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#222",
  },

  introText: {
    marginTop: 5,
    fontSize: 14,
    lineHeight: 20,
    color: "#666",
  },

  addButton: {
    marginHorizontal: 16,
    backgroundColor: "#0066CC",
    minHeight: 52,
    borderRadius: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 8,
  },

  sectionHeader: {
    marginTop: 24,
    marginHorizontal: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  sectionTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#222",
  },

  countText: {
    fontSize: 14,
    color: "#777",
  },

  emptyBox: {
    margin: 16,
    padding: 30,
    backgroundColor: "#fff",
    borderRadius: 18,
    alignItems: "center",
  },

  emptyTitle: {
    marginTop: 15,
    fontSize: 19,
    fontWeight: "800",
    color: "#222",
    textAlign: "center",
  },

  emptyText: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 21,
    color: "#666",
    textAlign: "center",
  },

  emptyButton: {
    marginTop: 20,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "#EEF5FF",
  },

  emptyButtonText: {
    marginLeft: 6,
    color: "#0066CC",
    fontWeight: "700",
  },

  productList: {
    marginTop: 12,
    paddingHorizontal: 16,
  },

  productCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 12,
    marginBottom: 12,
    flexDirection: "row",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 6,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    position: "relative",
  },

  productCardPressed: {
    opacity: 0.85,
  },

  productImage: {
    width: 85,
    height: 85,
    borderRadius: 14,
    backgroundColor: "#F4F8FF",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },

  productImageReal: {
    width: "100%",
    height: "100%",
    borderRadius: 14,
  },

  productInfo: {
    flex: 1,
    marginLeft: 12,
    paddingRight: 22,
  },

  productTitleRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  productName: {
    flex: 1,
    fontSize: 17,
    fontWeight: "800",
    color: "#222",
  },

  productCategory: {
    marginTop: 4,
    fontSize: 13,
    color: "#0066CC",
    fontWeight: "600",
  },

  productDescription: {
    marginTop: 5,
    fontSize: 13,
    lineHeight: 18,
    color: "#666",
  },

  productBottom: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  price: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0066CC",
  },

  availability: {
    fontSize: 12,
    fontWeight: "700",
  },

  available: {
    color: "#2E7D32",
  },

  unavailable: {
    color: "#D32F2F",
  },

  actions: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
  },

  editButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 9,
    backgroundColor: "#EEF5FF",
    borderRadius: 9,
  },

  editButtonText: {
    marginLeft: 5,
    color: "#0066CC",
    fontSize: 12,
    fontWeight: "700",
  },

  deleteButton: {
    marginLeft: 8,
    width: 34,
    height: 34,
    borderRadius: 9,
    backgroundColor: "#FFEBEE",
    justifyContent: "center",
    alignItems: "center",
  },

  openIndicator: {
    position: "absolute",
    right: 8,
    top: "50%",
    marginTop: -11,
  },

  infoBox: {
    marginHorizontal: 16,
    marginTop: 15,
    padding: 16,
    borderRadius: 16,
    backgroundColor: "#EEF5FF",
    flexDirection: "row",
    alignItems: "flex-start",
  },

  infoText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 13,
    lineHeight: 19,
    color: "#666",
  },
});

