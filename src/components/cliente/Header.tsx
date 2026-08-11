import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type HeaderProps = {
  nombre: string;
  fotoPerfil: string | null;
};

type Rol = "Delivery" | "Expreso" | "Negocios" | "Flete";

export default function Header({ nombre, fotoPerfil }: HeaderProps) {
  const [menuAbierto, setMenuAbierto] = useState(false);

  // Rol que actualmente está utilizando el usuario
  const [rolActivo, setRolActivo] = useState<Rol | null>(null);

  const seleccionarRol = (rol: Rol) => {
    setRolActivo(rol);
  };

  return (
    <>
      {/* ================= HEADER ================= */}
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.menu}
          activeOpacity={0.7}
          onPress={() => setMenuAbierto(true)}
        >
          <MaterialCommunityIcons name="menu" size={30} color="#0066CC" />
        </TouchableOpacity>

        <View style={styles.textos}>
          <Text style={styles.saludo}>Hola, {nombre} 👋</Text>

          <Text style={styles.subtitulo}>Bienvenido a FrancisCorp</Text>
        </View>

        <Image
          source={
            fotoPerfil
              ? { uri: fotoPerfil }
              : require("../../../assets/images/franciscorp-logo.png")
          }
          style={styles.foto}
        />
      </View>

      {/* ================= MENÚ LATERAL ================= */}
      <Modal
        visible={menuAbierto}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuAbierto(false)}
      >
        <View style={styles.modalContainer}>
          {/* ================= FONDO ================= */}
          <Pressable
            style={styles.fondo}
            onPress={() => setMenuAbierto(false)}
          />

          {/* ================= PANEL ================= */}
          <View style={styles.panel}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.panelContenido}
            >
              {/* ================= CABECERA ================= */}
              <View style={styles.panelHeader}>
                <View style={styles.panelUsuario}>
                  <Image
                    source={
                      fotoPerfil
                        ? { uri: fotoPerfil }
                        : require("../../../assets/images/franciscorp-logo.png")
                    }
                    style={styles.panelFoto}
                  />

                  <View style={styles.panelDatos}>
                    <Text style={styles.panelNombre}>{nombre}</Text>

                    <Text style={styles.panelSubtitulo}>Mi cuenta</Text>
                  </View>
                </View>

                <TouchableOpacity
                  onPress={() => setMenuAbierto(false)}
                  activeOpacity={0.7}
                >
                  <MaterialCommunityIcons name="close" size={28} color="#555" />
                </TouchableOpacity>
              </View>

              {/* ================= MI PERFIL ================= */}
              <TouchableOpacity
                style={styles.opcionPrincipal}
                activeOpacity={0.7}
                onPress={() => setMenuAbierto(false)}
              >
                <MaterialCommunityIcons
                  name="account-outline"
                  size={24}
                  color="#0066CC"
                />

                <Text style={styles.opcionTexto}>Mi perfil</Text>
              </TouchableOpacity>

              {/* ================= SEPARADOR ================= */}
              <View style={styles.separador} />

              {/* ================= ROLES ================= */}
              <Text style={styles.tituloSeccion}>ROLES</Text>

              {/* DELIVERY */}
              <TouchableOpacity
                style={styles.rol}
                activeOpacity={0.7}
                onPress={() => seleccionarRol("Delivery")}
              >
                <MaterialCommunityIcons
                  name="moped-outline"
                  size={23}
                  color="#0066CC"
                />

                <Text style={styles.rolTexto}>Delivery</Text>

                {rolActivo === "Delivery" && (
                  <View style={styles.puntoActivo} />
                )}
              </TouchableOpacity>

              {/* EXPRESO */}
              <TouchableOpacity
                style={styles.rol}
                activeOpacity={0.7}
                onPress={() => seleccionarRol("Expreso")}
              >
                <MaterialCommunityIcons
                  name="car-outline"
                  size={23}
                  color="#0066CC"
                />

                <Text style={styles.rolTexto}>Expreso</Text>

                {rolActivo === "Expreso" && <View style={styles.puntoActivo} />}
              </TouchableOpacity>

              {/* NEGOCIOS */}
              <TouchableOpacity
                style={styles.rol}
                activeOpacity={0.7}
                onPress={() => seleccionarRol("Negocios")}
              >
                <MaterialCommunityIcons
                  name="storefront-outline"
                  size={23}
                  color="#0066CC"
                />

                <Text style={styles.rolTexto}>Negocios</Text>

                {rolActivo === "Negocios" && (
                  <View style={styles.puntoActivo} />
                )}
              </TouchableOpacity>

              {/* FLETE */}
              <TouchableOpacity
                style={styles.rol}
                activeOpacity={0.7}
                onPress={() => seleccionarRol("Flete")}
              >
                <MaterialCommunityIcons
                  name="truck-outline"
                  size={23}
                  color="#0066CC"
                />

                <Text style={styles.rolTexto}>Flete</Text>

                {rolActivo === "Flete" && <View style={styles.puntoActivo} />}
              </TouchableOpacity>

              {/* ================= SEPARADOR ================= */}
              <View style={styles.separador} />

              {/* ================= BILLETERA ================= */}
              <TouchableOpacity
                style={styles.opcion}
                activeOpacity={0.7}
                onPress={() => setMenuAbierto(false)}
              >
                <MaterialCommunityIcons
                  name="wallet-outline"
                  size={24}
                  color="#0066CC"
                />

                <Text style={styles.opcionTexto}>Billetera</Text>
              </TouchableOpacity>

              {/* ================= FRANCICOINS ================= */}
              <TouchableOpacity
                style={styles.opcion}
                activeOpacity={0.7}
                onPress={() => setMenuAbierto(false)}
              >
                <MaterialCommunityIcons
                  name="circle-multiple-outline"
                  size={24}
                  color="#F2B705"
                />

                <Text style={styles.opcionTexto}>FranciCoins</Text>
              </TouchableOpacity>

              {/* ================= SEPARADOR ================= */}
              <View style={styles.separador} />

              {/* ================= HISTORIAL ================= */}
              <TouchableOpacity
                style={styles.opcion}
                activeOpacity={0.7}
                onPress={() => setMenuAbierto(false)}
              >
                <MaterialCommunityIcons
                  name="history"
                  size={24}
                  color="#0066CC"
                />

                <Text style={styles.opcionTexto}>Historial</Text>
              </TouchableOpacity>

              {/* ================= SEPARADOR ================= */}
              <View style={styles.separador} />

              {/* ================= CONFIGURACIÓN ================= */}
              <TouchableOpacity
                style={styles.opcion}
                activeOpacity={0.7}
                onPress={() => setMenuAbierto(false)}
              >
                <MaterialCommunityIcons
                  name="cog-outline"
                  size={24}
                  color="#0066CC"
                />

                <Text style={styles.opcionTexto}>
                  Configuración y privacidad
                </Text>
              </TouchableOpacity>

              {/* ================= AYUDA ================= */}
              <TouchableOpacity
                style={styles.opcion}
                activeOpacity={0.7}
                onPress={() => setMenuAbierto(false)}
              >
                <MaterialCommunityIcons
                  name="help-circle-outline"
                  size={24}
                  color="#0066CC"
                />

                <Text style={styles.opcionTexto}>Ayuda y soporte técnico</Text>
              </TouchableOpacity>

              {/* ================= SEPARADOR ================= */}
              <View style={styles.separador} />

              {/* ================= CERRAR SESIÓN ================= */}
              <TouchableOpacity
                style={styles.opcionPrincipal}
                activeOpacity={0.7}
                onPress={() => {
                  setMenuAbierto(false);
                  router.push("/(tabs)/perfil");
                }}
              >
                <MaterialCommunityIcons
                  name="logout"
                  size={24}
                  color="#D32F2F"
                />

                <Text style={[styles.opcionTexto, styles.cerrarSesionTexto]}>
                  Cerrar sesión
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  /* ================= HEADER ================= */

  container: {
    marginTop: 55,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
  },

  menu: {
    marginRight: 15,
  },

  textos: {
    flex: 1,
  },

  saludo: {
    fontSize: 18,
    color: "#555",
  },

  subtitulo: {
    marginTop: 4,
    fontSize: 26,
    fontWeight: "bold",
    color: "#0066CC",
  },

  foto: {
    width: 65,
    height: 65,
    borderRadius: 32.5,
    borderWidth: 2,
    borderColor: "#0066CC",
  },

  /* ================= MODAL ================= */

  modalContainer: {
    flex: 1,
    flexDirection: "row",
  },

  fondo: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.35)",
  },

  /* ================= PANEL ================= */

  panel: {
    width: "78%",
    backgroundColor: "#fff",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 2,
      height: 0,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },

  panelContenido: {
    paddingBottom: 30,
  },

  /* ================= CABECERA ================= */

  panelHeader: {
    paddingTop: 55,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  panelUsuario: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  panelFoto: {
    width: 55,
    height: 55,
    borderRadius: 27.5,
    borderWidth: 2,
    borderColor: "#0066CC",
  },

  panelDatos: {
    marginLeft: 12,
    flex: 1,
  },

  panelNombre: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#222",
  },

  panelSubtitulo: {
    marginTop: 3,
    fontSize: 14,
    color: "#777",
  },

  /* ================= OPCIONES ================= */

  opcionPrincipal: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 22,
    paddingVertical: 17,
  },

  opcion: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 22,
    paddingVertical: 16,
  },

  opcionTexto: {
    marginLeft: 15,
    fontSize: 16,
    color: "#333",
  },

  /* ================= SECCIONES ================= */

  separador: {
    height: 1,
    backgroundColor: "#E5E5E5",
    marginHorizontal: 20,
    marginVertical: 7,
  },

  tituloSeccion: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#888",
    paddingHorizontal: 22,
    paddingTop: 8,
    paddingBottom: 4,
    letterSpacing: 1,
  },

  /* ================= ROLES ================= */

  rol: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 22,
    paddingVertical: 15,
  },

  rolTexto: {
    marginLeft: 15,
    fontSize: 16,
    color: "#333",
    flex: 1,
  },

  puntoActivo: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#F2B705",
  },

  /* ================= CERRAR SESIÓN ================= */

  cerrarSesionTexto: {
    color: "#D32F2F",
  },
});
