import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";

import { getBusinesses, Business } from "../services/businessService";

export default function RestaurantesScreen() {
  const router = useRouter();

  const [restaurantes, setRestaurantes] = useState<Business[]>([]);
  const [cargando, setCargando] = useState(true);
  const [actualizando, setActualizando] = useState(false);

  const cargarRestaurantes = async (refrescando = false) => {
    try {
      if (refrescando) {
        setActualizando(true);
      } else {
        setCargando(true);
      }

      const negocios = await getBusinesses();

      const restaurantesActivos = negocios
        .filter(
          (negocio) =>
            negocio.tipo?.toLowerCase() === "restaurante" &&
            negocio.estado?.toLowerCase() === "activo",
        )
        .sort((a, b) => a.nombre.localeCompare(b.nombre));

      setRestaurantes(restaurantesActivos);
    } catch (error) {
      console.error("Error cargando restaurantes:", error);
      setRestaurantes([]);
    } finally {
      setCargando(false);
      setActualizando(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      cargarRestaurantes();
    }, []),
  );

  const abrirRestaurante = (restaurante: Business) => {
    router.push({
      pathname: "/vista-negocio",
      params: {
        id: restaurante.id,
      },
    });
  };

  const renderRestaurante = ({ item }: { item: Business }) => {
    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.85}
        onPress={() => abrirRestaurante(item)}
      >
        <View style={styles.imagenContainer}>
          {item.foto ? (
            <Image
              source={{ uri: item.foto }}
              style={styles.imagen}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.imagenSinFoto}>
              <Text style={styles.iconoSinFoto}>🍽️</Text>
            </View>
          )}
        </View>

        <View style={styles.informacion}>
          <Text style={styles.nombre} numberOfLines={1}>
            {item.nombre}
          </Text>

          {!!item.descripcion && (
            <Text style={styles.descripcion} numberOfLines={2}>
              {item.descripcion}
            </Text>
          )}

          {!!item.ubicacion?.ciudad && (
            <Text style={styles.ubicacion} numberOfLines={1}>
              📍 {item.ubicacion.ciudad}
            </Text>
          )}

          <View style={styles.detalles}>
            {typeof item.calificacion === "number" && (
              <Text style={styles.calificacion}>
                ⭐ {item.calificacion.toFixed(1)}
              </Text>
            )}

            {typeof item.tiempoEntrega === "number" && (
              <Text style={styles.tiempo}>
                🕐 {item.tiempoEntrega} min
              </Text>
            )}
          </View>
        </View>

        <Text style={styles.flecha}>›</Text>
      </TouchableOpacity>
    );
  };

  if (cargando) {
    return (
      <View style={styles.cargando}>
        <ActivityIndicator size="large" />
        <Text style={styles.textoCargando}>
          Cargando restaurantes...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.contenedor}>
      <View style={styles.encabezado}>
        <Text style={styles.titulo}>🍽️ Restaurantes</Text>
        <Text style={styles.subtitulo}>
          Encuentra restaurantes y pide tus platos favoritos
        </Text>
      </View>

      <FlatList
        data={restaurantes}
        keyExtractor={(item) => item.id}
        renderItem={renderRestaurante}
        contentContainerStyle={
          restaurantes.length === 0
            ? styles.listaVacia
            : styles.lista
        }
        refreshControl={
          <RefreshControl
            refreshing={actualizando}
            onRefresh={() => cargarRestaurantes(true)}
          />
        }
        ListEmptyComponent={
          <View style={styles.vacio}>
            <Text style={styles.iconoVacio}>🍽️</Text>
            <Text style={styles.tituloVacio}>
              No hay restaurantes disponibles
            </Text>
            <Text style={styles.textoVacio}>
              Cuando haya restaurantes activos registrados en FrancisCorp,
              aparecerán aquí.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: "#F7F7F7",
  },

  encabezado: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 14,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },

  titulo: {
    fontSize: 26,
    fontWeight: "800",
    color: "#222222",
  },

  subtitulo: {
    marginTop: 5,
    fontSize: 14,
    color: "#777777",
  },

  lista: {
    padding: 16,
    paddingBottom: 30,
  },

  listaVacia: {
    flexGrow: 1,
    padding: 16,
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginBottom: 12,
    padding: 12,
    shadowOpacity: 0.06,
    shadowRadius: 5,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    elevation: 2,
  },

  imagenContainer: {
    width: 82,
    height: 82,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "#EEEEEE",
  },

  imagen: {
    width: "100%",
    height: "100%",
  },

  imagenSinFoto: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  iconoSinFoto: {
    fontSize: 34,
  },

  informacion: {
    flex: 1,
    marginLeft: 13,
    paddingRight: 6,
  },

  nombre: {
    fontSize: 18,
    fontWeight: "700",
    color: "#222222",
  },

  descripcion: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 18,
    color: "#666666",
  },

  ubicacion: {
    marginTop: 5,
    fontSize: 12,
    color: "#777777",
  },

  detalles: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    gap: 12,
  },

  calificacion: {
    fontSize: 12,
    fontWeight: "600",
    color: "#555555",
  },

  tiempo: {
    fontSize: 12,
    color: "#555555",
  },

  flecha: {
    fontSize: 32,
    color: "#AAAAAA",
    paddingLeft: 4,
  },

  cargando: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F7F7F7",
  },

  textoCargando: {
    marginTop: 12,
    fontSize: 15,
    color: "#666666",
  },

  vacio: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },

  iconoVacio: {
    fontSize: 54,
    marginBottom: 14,
  },

  tituloVacio: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333333",
    textAlign: "center",
  },

  textoVacio: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
    color: "#777777",
    textAlign: "center",
  },
});
