import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";

import { auth, db } from "../../services/firebase";

type PedidoItem = {
  productoId?: string;
  nombre?: string;
  precio?: number;
  cantidad?: number;
  subtotal?: number;
  foto?: string;
};

type Pedido = {
  id: string;
  usuarioId: string;
  negocioId?: string;
  negocioNombre?: string;
  items?: PedidoItem[];
  subtotal?: number;
  costoEntrega?: number;
  total?: number;
  direccionEntrega?: string;
  referencia?: string;
  metodoPago?: string;
  estado?: string;
  fechaCreacion?: any;
};

export default function Pedidos() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    cargarPedidos();
  }, []);

  const cargarPedidos = async () => {
    const usuario = auth.currentUser;

    if (!usuario) {
      setPedidos([]);
      setCargando(false);
      return;
    }

    try {
      setError("");

      const pedidosRef = collection(db, "pedidos");

      /*
       * Solamente filtramos por usuario.
       * No usamos orderBy() para evitar necesitar
       * un índice compuesto de Firestore.
       */
      const consulta = query(
        pedidosRef,
        where("usuarioId", "==", usuario.uid)
      );

      const snapshot = await getDocs(consulta);

      const pedidosObtenidos: Pedido[] = snapshot.docs.map(
        (documento) => ({
          id: documento.id,
          ...(documento.data() as Omit<Pedido, "id">),
        })
      );

      /*
       * Ordenamos los pedidos en el dispositivo,
       * del más reciente al más antiguo.
       */
      pedidosObtenidos.sort((a, b) => {
        const fechaA = convertirFecha(a.fechaCreacion);
        const fechaB = convertirFecha(b.fechaCreacion);

        return fechaB - fechaA;
      });

      setPedidos(pedidosObtenidos);

      console.log("MIS PEDIDOS:", pedidosObtenidos);
    } catch (error) {
      console.error("ERROR CARGANDO PEDIDOS:", error);

      setError(
        "No pudimos cargar tus pedidos. Intenta nuevamente."
      );
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  };

  const convertirFecha = (fecha: any): number => {
    if (!fecha) {
      return 0;
    }

    try {
      if (typeof fecha.toDate === "function") {
        return fecha.toDate().getTime();
      }

      if (fecha instanceof Date) {
        return fecha.getTime();
      }

      const fechaConvertida = new Date(fecha);

      if (!isNaN(fechaConvertida.getTime())) {
        return fechaConvertida.getTime();
      }

      return 0;
    } catch {
      return 0;
    }
  };

  const refrescar = async () => {
    setRefrescando(true);
    await cargarPedidos();
  };

  const obtenerEstado = (estado?: string) => {
    switch (estado) {
      case "pendiente":
        return "Pendiente";

      case "aceptado":
        return "Pedido aceptado";

      case "preparando":
        return "Preparando";

      case "listo":
        return "Listo para entregar";

      case "en_camino":
        return "En camino";

      case "entregado":
        return "Entregado";

      case "cancelado":
        return "Cancelado";

      default:
        return estado || "Pendiente";
    }
  };

  const obtenerFecha = (fecha?: any) => {
    if (!fecha) {
      return "Fecha no disponible";
    }

    try {
      const fechaReal =
        typeof fecha.toDate === "function"
          ? fecha.toDate()
          : new Date(fecha);

      return fechaReal.toLocaleString("es-EC", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Fecha no disponible";
    }
  };

  const obtenerMetodoPago = (metodo?: string) => {
    switch (metodo) {
      case "efectivo":
        return "Efectivo";

      case "tarjeta":
        return "Tarjeta";

      case "transferencia":
        return "Transferencia";

      default:
        return metodo || "No especificado";
    }
  };

  const renderPedido = ({ item }: { item: Pedido }) => {
    return (
      <View style={styles.card}>

        <View style={styles.cardHeader}>

          <View style={styles.negocioContainer}>

            <Text style={styles.negocio}>
              {item.negocioNombre || "Negocio"}
            </Text>

            <Text style={styles.fecha}>
              {obtenerFecha(item.fechaCreacion)}
            </Text>

          </View>

          <View style={styles.estadoContainer}>

            <Text style={styles.estado}>
              {obtenerEstado(item.estado)}
            </Text>

          </View>

        </View>

        <View style={styles.separador} />

        <Text style={styles.productosTitulo}>
          Productos
        </Text>

        {item.items && item.items.length > 0 ? (
          item.items.map((producto, index) => (

            <View
              key={`${producto.productoId || "producto"}-${index}`}
              style={styles.producto}
            >

              <View style={styles.productoInfo}>

                <Text style={styles.cantidad}>
                  {producto.cantidad || 0}x
                </Text>

                <Text style={styles.productoNombre}>
                  {producto.nombre || "Producto"}
                </Text>

              </View>

              <Text style={styles.productoPrecio}>
                ${(producto.subtotal || 0).toFixed(2)}
              </Text>

            </View>

          ))
        ) : (

          <Text style={styles.sinProductos}>
            No hay productos registrados.
          </Text>

        )}

        <View style={styles.separador} />

        <View style={styles.detalle}>

          <Text style={styles.detalleLabel}>
            Subtotal
          </Text>

          <Text style={styles.detalleValor}>
            ${(item.subtotal || 0).toFixed(2)}
          </Text>

        </View>

        <View style={styles.detalle}>

          <Text style={styles.detalleLabel}>
            Costo de entrega
          </Text>

          <Text style={styles.detalleValor}>
            ${(item.costoEntrega || 0).toFixed(2)}
          </Text>

        </View>

        <View style={styles.totalContainer}>

          <Text style={styles.totalLabel}>
            Total
          </Text>

          <Text style={styles.total}>
            ${(item.total || 0).toFixed(2)}
          </Text>

        </View>

        <View style={styles.infoExtra}>

          <Text style={styles.infoLabel}>
            Método de pago
          </Text>

          <Text style={styles.infoValue}>
            {obtenerMetodoPago(item.metodoPago)}
          </Text>

        </View>

        {item.direccionEntrega ? (

          <View style={styles.infoExtra}>

            <Text style={styles.infoLabel}>
              Dirección
            </Text>

            <Text style={styles.infoValue}>
              {item.direccionEntrega}
            </Text>

          </View>

        ) : null}

        {item.referencia ? (

          <View style={styles.infoExtra}>

            <Text style={styles.infoLabel}>
              Referencia
            </Text>

            <Text style={styles.infoValue}>
              {item.referencia}
            </Text>

          </View>

        ) : null}

      </View>
    );
  };

  if (cargando) {
    return (
      <View style={styles.cargandoContainer}>

        <ActivityIndicator
          size="large"
          color="#0066CC"
        />

        <Text style={styles.cargandoTexto}>
          Cargando tus pedidos...
        </Text>

      </View>
    );
  }

  return (
    <View style={styles.container}>

      <View style={styles.header}>

        <Text style={styles.title}>
          ?? Mis pedidos
        </Text>

        <Text style={styles.subtitle}>
          Aquí puedes consultar tus pedidos realizados.
        </Text>

      </View>

      {error ? (

        <View style={styles.errorContainer}>

          <Text style={styles.errorTexto}>
            {error}
          </Text>

        </View>

      ) : null}

      {pedidos.length === 0 && !error ? (

        <View style={styles.vacioContainer}>

          <Text style={styles.vacioIcono}>
            ???
          </Text>

          <Text style={styles.vacioTitulo}>
            Aún no tienes pedidos
          </Text>

          <Text style={styles.vacioTexto}>
            Cuando realices tu primer pedido,
            aparecerá aquí.
          </Text>

        </View>

      ) : (

        <FlatList
          data={pedidos}
          keyExtractor={(item) => item.id}
          renderItem={renderPedido}
          contentContainerStyle={styles.lista}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refrescando}
              onRefresh={refrescar}
            />
          }
        />

      )}

    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#F5F6F8",
  },

  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
    backgroundColor: "#FFFFFF",
  },

  title: {
    fontSize: 25,
    fontWeight: "bold",
    color: "#0066CC",
  },

  subtitle: {
    marginTop: 5,
    fontSize: 14,
    color: "#666666",
  },

  lista: {
    padding: 15,
    paddingBottom: 30,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 15,
    elevation: 3,
    shadowColor: "#000000",
    shadowOpacity: 0.08,
    shadowRadius: 5,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  negocioContainer: {
    flex: 1,
    paddingRight: 10,
  },

  negocio: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#222222",
  },

  fecha: {
    marginTop: 4,
    fontSize: 12,
    color: "#777777",
  },

  estadoContainer: {
    backgroundColor: "#E8F3FF",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },

  estado: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#0066CC",
  },

  separador: {
    height: 1,
    backgroundColor: "#EEEEEE",
    marginVertical: 14,
  },

  productosTitulo: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 8,
  },

  producto: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },

  productoInfo: {
    flexDirection: "row",
    flex: 1,
    alignItems: "center",
  },

  cantidad: {
    width: 30,
    fontSize: 14,
    fontWeight: "bold",
    color: "#0066CC",
  },

  productoNombre: {
    flex: 1,
    fontSize: 14,
    color: "#333333",
  },

  productoPrecio: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333333",
  },

  sinProductos: {
    fontSize: 13,
    color: "#888888",
  },

  detalle: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 7,
  },

  detalleLabel: {
    fontSize: 14,
    color: "#666666",
  },

  detalleValor: {
    fontSize: 14,
    color: "#333333",
  },

  totalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 5,
  },

  totalLabel: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#222222",
  },

  total: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#0066CC",
  },

  infoExtra: {
    marginTop: 12,
  },

  infoLabel: {
    fontSize: 12,
    color: "#888888",
    marginBottom: 2,
  },

  infoValue: {
    fontSize: 14,
    color: "#333333",
  },

  cargandoContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F6F8",
  },

  cargandoTexto: {
    marginTop: 10,
    fontSize: 14,
    color: "#666666",
  },

  vacioContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },

  vacioIcono: {
    fontSize: 55,
    marginBottom: 15,
  },

  vacioTitulo: {
    fontSize: 21,
    fontWeight: "bold",
    color: "#222222",
    textAlign: "center",
  },

  vacioTexto: {
    marginTop: 8,
    fontSize: 14,
    color: "#777777",
    textAlign: "center",
    lineHeight: 20,
  },

  errorContainer: {
    margin: 15,
    padding: 15,
    backgroundColor: "#FFECEC",
    borderRadius: 12,
  },

  errorTexto: {
    color: "#CC0000",
    fontSize: 14,
    textAlign: "center",
  },

});
