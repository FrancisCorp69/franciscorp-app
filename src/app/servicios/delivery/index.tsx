import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
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

import { auth, db } from "../../../services/firebase";

type Delivery = {
  id: string;
  nombre: string;
  fotoPerfil: string | null;
  calificacion: number;
  totalEntregas: number;
  tipoVehiculo: string;
  zonaTrabajo: string;
};

export default function DeliveryServiciosScreen() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [cargando, setCargando] = useState(true);
  const [actualizando, setActualizando] = useState(false);

  const cargarDeliveries = async () => {
    try {
      setCargando(true);

      const q = query(
        collection(db, "usuarios"),
        where("roles.Delivery", "==", true),
        where("delivery.estadoVerificacion", "==", "aprobado"),
        where("delivery.activo", "==", true),
        where("delivery.disponible", "==", true)
      );

      const snapshot = await getDocs(q);

      const lista: Delivery[] = snapshot.docs
        .filter((docSnap) => docSnap.id !== auth.currentUser?.uid)
        .map((docSnap) => {
          const data = docSnap.data();

          return {
            id: docSnap.id,
            nombre: data.nombre || "Delivery",
            fotoPerfil: data.fotoPerfil || null,
            calificacion: Number(data.delivery?.calificacion || 0),
            totalEntregas: Number(data.delivery?.totalEntregas || 0),
            tipoVehiculo: data.delivery?.tipoVehiculo || "No especificado",
            zonaTrabajo: data.delivery?.zonaTrabajo || "Zona no especificada",
          };
        });

      setDeliveries(lista);
    } catch (error) {
      console.error("ERROR AL CARGAR DELIVERIES:", error);
      setDeliveries([]);
    } finally {
      setCargando(false);
      setActualizando(false);
    }
  };

  useEffect(() => {
    cargarDeliveries();
  }, []);

  const actualizar = () => {
    setActualizando(true);
    cargarDeliveries();
  };

  const solicitarDelivery = (delivery: Delivery) => {
    router.push({
      pathname: "/servicios/delivery/solicitar" as any,
      params: {
        deliveryId: delivery.id,
        nombre: delivery.nombre,
      },
    });
  };

  const renderDelivery = ({ item }: { item: Delivery }) => {
    return (
      <View style={styles.card}>
        <View style={styles.cardSuperior}>
          <Image
            source={
              item.fotoPerfil
                ? { uri: item.fotoPerfil }
                : require("../../../../assets/images/franciscorp-logo.png")
            }
            style={styles.foto}
          />

          <View style={styles.informacion}>
            <View style={styles.nombreFila}>
              <Text style={styles.nombre} numberOfLines={1}>
                {item.nombre}
              </Text>

              <View style={styles.disponible}>
                <View style={styles.punto} />
                <Text style={styles.disponibleTexto}>Disponible</Text>
              </View>
            </View>

            <View style={styles.calificacionFila}>
              <MaterialCommunityIcons
                name="star"
                size={18}
                color="#F2B705"
              />

              <Text style={styles.calificacion}>
                {item.calificacion > 0
                  ? item.calificacion.toFixed(1)
                  : "Nuevo"}
              </Text>

              <Text style={styles.entregas}>
                • {item.totalEntregas} entregas
              </Text>
            </View>

            <View style={styles.datoFila}>
              <MaterialCommunityIcons
                name="map-marker-outline"
                size={18}
                color="#666"
              />

              <Text style={styles.dato} numberOfLines={1}>
                {item.zonaTrabajo}
              </Text>
            </View>

            <View style={styles.datoFila}>
              <MaterialCommunityIcons
                name="moped-outline"
                size={18}
                color="#666"
              />

              <Text style={styles.dato}>
                {item.tipoVehiculo}
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={styles.boton}
          activeOpacity={0.8}
          onPress={() => solicitarDelivery(item)}
        >
          <MaterialCommunityIcons
            name="truck-fast-outline"
            size={21}
            color="#fff"
          />

          <Text style={styles.botonTexto}>Solicitar Delivery</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* ================= HEADER ================= */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.botonAtras}
          activeOpacity={0.7}
          onPress={() => router.back()}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={27}
            color="#0066CC"
          />
        </TouchableOpacity>

        <View style={styles.headerTextos}>
          <Text style={styles.titulo}>Delivery</Text>
          <Text style={styles.subtitulo}>
            Encuentra un Delivery disponible
          </Text>
        </View>
      </View>

      {/* ================= CONTENIDO ================= */}
      {cargando ? (
        <View style={styles.cargando}>
          <ActivityIndicator size="large" color="#0066CC" />

          <Text style={styles.cargandoTexto}>
            Buscando Delivery disponibles...
          </Text>
        </View>
      ) : (
        <FlatList
          data={deliveries}
          keyExtractor={(item) => item.id}
          renderItem={renderDelivery}
          contentContainerStyle={[
            styles.lista,
            deliveries.length === 0 && styles.listaVacia,
          ]}
          refreshControl={
            <RefreshControl
              refreshing={actualizando}
              onRefresh={actualizar}
              tintColor="#0066CC"
            />
          }
          ListHeaderComponent={
            deliveries.length > 0 ? (
              <View style={styles.resumen}>
                <MaterialCommunityIcons
                  name="account-group-outline"
                  size={22}
                  color="#0066CC"
                />

                <Text style={styles.resumenTexto}>
                  {deliveries.length} Delivery
                  {deliveries.length !== 1 ? "s" : ""} disponible
                  {deliveries.length !== 1 ? "s" : ""}
                </Text>
              </View>
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.vacio}>
              <MaterialCommunityIcons
                name="moped-outline"
                size={70}
                color="#BDBDBD"
              />

              <Text style={styles.vacioTitulo}>
                No hay Delivery disponibles
              </Text>

              <Text style={styles.vacioTexto}>
                En este momento no encontramos Delivery aprobados y disponibles
                en tu zona.
              </Text>

              <TouchableOpacity
                style={styles.botonActualizar}
                activeOpacity={0.8}
                onPress={actualizar}
              >
                <MaterialCommunityIcons
                  name="refresh"
                  size={20}
                  color="#fff"
                />

                <Text style={styles.botonActualizarTexto}>
                  Actualizar
                </Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },

  header: {
    paddingTop: 55,
    paddingHorizontal: 18,
    paddingBottom: 18,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#E8E8E8",
  },

  botonAtras: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F0F6FF",
  },

  headerTextos: {
    marginLeft: 13,
    flex: 1,
  },

  titulo: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#222",
  },

  subtitulo: {
    marginTop: 3,
    fontSize: 14,
    color: "#777",
  },

  lista: {
    padding: 16,
    paddingBottom: 30,
  },

  resumen: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    paddingHorizontal: 4,
  },

  resumenTexto: {
    marginLeft: 8,
    fontSize: 15,
    fontWeight: "600",
    color: "#444",
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  cardSuperior: {
    flexDirection: "row",
  },

  foto: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#EAEAEA",
    borderWidth: 2,
    borderColor: "#0066CC",
  },

  informacion: {
    flex: 1,
    marginLeft: 13,
  },

  nombreFila: {
    flexDirection: "row",
    alignItems: "center",
  },

  nombre: {
    flex: 1,
    fontSize: 18,
    fontWeight: "bold",
    color: "#222",
    marginRight: 8,
  },

  disponible: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EAF8EE",
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 10,
  },

  punto: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#20A050",
    marginRight: 4,
  },

  disponibleTexto: {
    fontSize: 10,
    fontWeight: "700",
    color: "#16803A",
  },

  calificacionFila: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },

  calificacion: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: "700",
    color: "#444",
  },

  entregas: {
    marginLeft: 5,
    fontSize: 13,
    color: "#777",
  },

  datoFila: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },

  dato: {
    marginLeft: 5,
    fontSize: 13,
    color: "#666",
    flexShrink: 1,
  },

  boton: {
    marginTop: 15,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#0066CC",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  botonTexto: {
    marginLeft: 8,
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },

  cargando: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  cargandoTexto: {
    marginTop: 12,
    color: "#666",
    fontSize: 15,
  },

  listaVacia: {
    flexGrow: 1,
  },

  vacio: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },

  vacioTitulo: {
    marginTop: 18,
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
  },

  vacioTexto: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 21,
    color: "#777",
    textAlign: "center",
  },

  botonActualizar: {
    marginTop: 22,
    paddingHorizontal: 22,
    height: 45,
    borderRadius: 12,
    backgroundColor: "#0066CC",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  botonActualizarTexto: {
    marginLeft: 7,
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
});


