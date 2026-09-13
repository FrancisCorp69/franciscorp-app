import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { auth } from "../../services/firebase";

type Modulo = {
  titulo: string;
  icono: keyof typeof MaterialCommunityIcons.glyphMap;
  activo: boolean;
  ruta?: string;
};

const MODULOS: Modulo[] = [
  {
    titulo: "Solicitudes Delivery",
    icono: "moped-outline",
    activo: true,
    ruta: "/administrador/delivery",
  },
  {
    titulo: "Solicitudes Expreso",
    icono: "car-outline",
    activo: true,
    ruta: "/administrador/expreso",
  },
  {
    titulo: "Usuarios",
    icono: "account-group-outline",
    activo: false,
  },
  {
    titulo: "Negocios",
    icono: "storefront-outline",
    activo: false,
  },
  {
    titulo: "Pedidos",
    icono: "clipboard-list-outline",
    activo: false,
  },
  {
    titulo: "Pagos",
    icono: "cash-multiple",
    activo: false,
  },
  {
    titulo: "Calificaciones",
    icono: "star-outline",
    activo: false,
  },
  {
    titulo: "Administradores",
    icono: "shield-account-outline",
    activo: false,
  },
];

export default function Administrador() {
  const [cargando, setCargando] = useState(true);
  const [esAdmin, setEsAdmin] = useState(false);

  useEffect(() => {
    verificarAdministrador();
  }, []);

  const verificarAdministrador = async () => {
    try {
      const usuario = auth.currentUser;

      if (!usuario) {
        setEsAdmin(false);
        return;
      }

      const tokenResult = await usuario.getIdTokenResult(true);

      setEsAdmin(tokenResult.claims.admin === true);
    } catch (error) {
      console.error("ERROR VERIFICANDO ADMIN:", error);
      setEsAdmin(false);
    } finally {
      setCargando(false);
    }
  };

  const abrirModulo = (modulo: Modulo) => {
    if (!modulo.activo || !modulo.ruta) {
      Alert.alert(
        "Próximamente",
        "Este módulo estará disponible en una próxima versión."
      );
      return;
    }

    router.push(modulo.ruta as any);
  };

  if (cargando) {
    return (
      <View style={styles.cargando}>
        <ActivityIndicator size="large" color="#0066CC" />
        <Text style={styles.textoCargando}>
          Verificando permisos...
        </Text>
      </View>
    );
  }

  if (!esAdmin) {
    return (
      <View style={styles.noAutorizado}>
        <MaterialCommunityIcons
          name="shield-alert-outline"
          size={70}
          color="#D32F2F"
        />

        <Text style={styles.noAutorizadoTitulo}>
          Acceso no autorizado
        </Text>

        <Text style={styles.noAutorizadoTexto}>
          No tienes permisos para acceder al panel administrativo.
        </Text>

        <TouchableOpacity
          style={styles.botonVolver}
          onPress={() => router.back()}
        >
          <Text style={styles.botonVolverTexto}>
            Volver
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contenido}
    >
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.botonAtras}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={28}
            color="#0066CC"
          />
        </TouchableOpacity>

        <View>
          <Text style={styles.titulo}>
            🛡️ ADMINISTRACIÓN
          </Text>

          <Text style={styles.subtitulo}>
            FrancisCorp
          </Text>
        </View>
      </View>

      <View style={styles.linea} />

      <Text style={styles.descripcion}>
        Panel de control administrativo
      </Text>

      <View style={styles.grid}>
        {MODULOS.map((modulo) => (
          <TouchableOpacity
            key={modulo.titulo}
            style={[
              styles.tarjeta,
              !modulo.activo && styles.tarjetaDeshabilitada,
            ]}
            activeOpacity={0.8}
            onPress={() => abrirModulo(modulo)}
          >
            <MaterialCommunityIcons
              name={modulo.icono}
              size={34}
              color={modulo.activo ? "#0066CC" : "#AAAAAA"}
            />

            <Text
              style={[
                styles.tarjetaTitulo,
                !modulo.activo &&
                  styles.tarjetaTituloDeshabilitado,
              ]}
            >
              {modulo.titulo}
            </Text>

            {!modulo.activo && (
              <Text style={styles.proximamente}>
                Próximamente
              </Text>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },

  contenido: {
    padding: 20,
    paddingTop: 55,
    paddingBottom: 40,
  },

  cargando: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F5F7FA",
  },

  textoCargando: {
    marginTop: 12,
    color: "#666",
    fontSize: 15,
  },

  noAutorizado: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
    backgroundColor: "#F5F7FA",
  },

  noAutorizadoTitulo: {
    marginTop: 18,
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
  },

  noAutorizadoTexto: {
    marginTop: 10,
    fontSize: 15,
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
  },

  botonVolver: {
    marginTop: 25,
    backgroundColor: "#0066CC",
    paddingHorizontal: 30,
    paddingVertical: 13,
    borderRadius: 12,
  },

  botonVolverTexto: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
  },

  botonAtras: {
    marginRight: 12,
    padding: 4,
  },

  titulo: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#0066CC",
  },

  subtitulo: {
    marginTop: 3,
    fontSize: 16,
    color: "#666",
  },

  linea: {
    height: 1,
    backgroundColor: "#DDE3EA",
    marginTop: 20,
  },

  descripcion: {
    marginTop: 18,
    marginBottom: 15,
    fontSize: 15,
    color: "#666",
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  tarjeta: {
    width: "48%",
    minHeight: 145,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
    marginBottom: 15,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 5,
  },

  tarjetaDeshabilitada: {
    opacity: 0.6,
  },

  tarjetaTitulo: {
    marginTop: 12,
    fontSize: 15,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
  },

  tarjetaTituloDeshabilitado: {
    color: "#888",
  },

  proximamente: {
    marginTop: 7,
    fontSize: 11,
    color: "#999",
  },
});

