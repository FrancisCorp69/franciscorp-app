import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect, useState } from "react";

import { auth, db } from "../../services/firebase";

import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";

import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function HomeScreen() {
  const [nombre, setNombre] = useState("Usuario");
  const [fotoPerfil, setFotoPerfil] = useState<string | null>(null);
  const [negocios, setNegocios] = useState<any[]>([]);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [roles, setRoles] = useState<any>({});
  const [rolActivo, setRolActivo] = useState("Cliente");

  useEffect(() => {
    cargarUsuario();
    cargarNegocios();
  }, []);

  async function cargarUsuario() {
    try {
      const usuario = auth.currentUser;

      if (!usuario) return;

      const documento = await getDoc(doc(db, "usuarios", usuario.uid));

      if (documento.exists()) {
        const datos = documento.data();
        console.log("DATOS USUARIO:", datos);

        setNombre(datos.nombre || "Usuario");
        if (datos.roles) {
          setRoles(datos.roles);
        }

        if (datos.fotoPerfil) {
          setFotoPerfil(datos.fotoPerfil);
        }
      }
    } catch (error) {
      console.log(error);
    }
  }

  async function cargarNegocios() {
    try {
      const consulta = query(
        collection(db, "negocios"),

        where("activo", "==", true),
      );

      const resultado = await getDocs(consulta);

      const lista: any[] = [];

      resultado.forEach((doc) => {
        lista.push({
          id: doc.id,

          ...doc.data(),
        });
      });

      setNegocios(lista);

      console.log("Negocios encontrados:", lista.length);
    } catch (error) {
      console.log(error);
    }
  }
  const listaRoles = [
    {
      nombre: "Cliente",
      icono: "👤",
      campo: "Cliente",
    },
    {
      nombre: "Mi Empresa",
      icono: "🏪",
      campo: "Mi Empresa",
    },
    {
      nombre: "Repartidor",
      icono: "🏍",
      campo: "Repartidor",
    },
    {
      nombre: "Expreso",
      icono: "🚗",
      campo: "Expreso",
    },
    {
      nombre: "Flete",
      icono: "🚚",
      campo: "Flete",
    },
    {
      nombre: "Mis Servicios",
      icono: "🔧",
      campo: "Mis Servicios",
    },
    {
      nombre: "Salud",
      icono: "⚕️",
      campo: "Salud",
    },
    {
      nombre: "Farmacia",
      icono: "💊",
      campo: "Farmacia",
    },
    {
      nombre: "Instructor",
      icono: "📚",
      campo: "Instructor",
    },
    {
      nombre: "Empleo",
      icono: "💼",
      campo: "Empleo",
    },
  ];

  return (
    <View style={styles.container}>
      {/* MENU LATERAL */}

      {menuAbierto && (
        <View style={styles.menu}>
          <TouchableOpacity onPress={() => setMenuAbierto(false)}>
            <Text style={styles.cerrar}>✕</Text>
          </TouchableOpacity>

          <Text style={styles.tituloMenu}>FrancisCorp</Text>

          <Text style={styles.seccion}>ROLES</Text>

          {listaRoles.map((rol, index) => {
            if (roles[rol.campo] !== true) {
              return null;
            }

            return (
              <TouchableOpacity
                key={index}
                onPress={() => {
                  setRolActivo(rol.nombre);
                  setMenuAbierto(false);
                }}
              >
                <Text style={styles.itemMenu}>
                  {rol.icono} {rol.nombre}
                  {rolActivo === rol.nombre ? " 🟡" : ""}
                </Text>
              </TouchableOpacity>
            );
          })}

          <Text style={styles.seccion}>BILLETERAS</Text>

          <Text style={styles.itemMenu}>💵 Billetera Principal</Text>

          <Text style={styles.itemMenu}>🪙 FranciCoins</Text>
        </View>
      )}

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setMenuAbierto(true)}>
            <MaterialCommunityIcons name="menu" size={35} color="#0066CC" />
          </TouchableOpacity>

          <View style={styles.textoHeader}>
            <Text style={styles.saludo}>Hola, {nombre} 👋</Text>

            <Text style={styles.pregunta}>¿Qué necesitas hoy?</Text>
          </View>

          <Image
            source={
              fotoPerfil
                ? { uri: fotoPerfil }
                : require("../../../assets/images/franciscorp-logo.png")
            }
            style={styles.logo}
          />
        </View>

        <View style={styles.location}>
          <MaterialCommunityIcons name="map-marker" size={24} color="#0066CC" />

          <Text style={styles.locationText}>
            Selecciona tu dirección de entrega
          </Text>
        </View>

        <View style={styles.searchBox}>
          <MaterialCommunityIcons name="magnify" size={25} color="#777" />

          <TextInput
            placeholder="Buscar productos o servicios..."
            style={styles.buscar}
          />
        </View>

        <View style={styles.banner}>
          <Text style={styles.bannerTitle}>FrancisCorp</Text>

          <Text style={styles.bannerText}>Delivery • Carreras • Compras</Text>

          <Text style={styles.bannerText}>Todo en una sola aplicación</Text>
        </View>
        {/* SERVICIOS */}

        <Text style={styles.sectionTitle}>Servicios</Text>

        <View style={styles.grid}>
          {[
            ["motorbike", "Delivery"],

            ["taxi", "Carreras"],

            ["cart", "Compras"],

            ["silverware-fork-knife", "Restaurantes"],

            ["pill", "Farmacia"],

            ["store", "Tiendas"],
          ].map((item, index) => (
            <View style={styles.card} key={index}>
              <MaterialCommunityIcons
                name={item[0] as any}
                size={35}
                color="#0066CC"
              />

              <Text style={styles.cardText}>{item[1]}</Text>
            </View>
          ))}
        </View>

        {/* NEGOCIOS DESTACADOS */}

        <Text style={styles.sectionTitle}>⭐ Negocios destacados</Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.horizontal}
        >
          {negocios.map((negocio) => (
            <View key={negocio.id} style={styles.businessCard}>
              <Image
                source={
                  negocio.foto
                    ? { uri: negocio.foto }
                    : require("../../../assets/images/franciscorp-logo.png")
                }
                style={styles.businessImage}
              />

              <Text style={styles.businessName}>{negocio.nombre}</Text>

              <Text>
                ⭐ {negocio.calificacion} • {negocio.tiempoEntrega} min
              </Text>

              <Text
                style={{
                  color: "#666",
                  marginTop: 5,
                }}
              >
                {negocio.categoria}
              </Text>
            </View>
          ))}
        </ScrollView>

        {/* PROMOCIONES */}

        <Text style={styles.sectionTitle}>🔥 Promociones</Text>

        <View style={styles.promo}>
          <Text style={styles.promoTitle}>Primera compra</Text>

          <Text style={styles.promoText}>
            Obtén descuentos exclusivos usando FrancisCorp
          </Text>
        </View>

        {/* PUBLICIDAD */}

        <View style={styles.ad}>
          <Text style={styles.adTitle}>
            📢 Publicidad para negocios aliados
          </Text>

          <Text style={styles.adText}>Tu negocio puede aparecer aquí</Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,

    backgroundColor: "#fff",
  },

  menu: {
    position: "absolute",

    top: 0,

    left: 0,

    width: "80%",

    height: "100%",

    backgroundColor: "#fff",

    paddingTop: 60,

    paddingHorizontal: 25,

    elevation: 10,

    zIndex: 10,
  },

  cerrar: {
    fontSize: 30,

    color: "#0066CC",
  },

  tituloMenu: {
    fontSize: 28,

    fontWeight: "bold",

    color: "#0066CC",

    marginVertical: 20,
  },

  seccion: {
    marginTop: 25,

    fontSize: 18,

    fontWeight: "bold",

    color: "#555",
  },

  itemMenu: {
    fontSize: 17,

    marginTop: 15,

    color: "#333",
  },

  header: {
    marginTop: 50,

    paddingHorizontal: 20,

    flexDirection: "row",

    alignItems: "center",
  },

  textoHeader: {
    flex: 1,

    marginLeft: 15,
  },

  saludo: {
    fontSize: 18,

    color: "#555",
  },

  pregunta: {
    fontSize: 25,

    fontWeight: "bold",

    color: "#0066CC",
  },

  logo: {
    width: 70,

    height: 70,

    borderRadius: 35,

    borderWidth: 2,

    borderColor: "#0066CC",
  },

  location: {
    margin: 20,

    padding: 15,

    backgroundColor: "#F2F7FF",

    borderRadius: 15,

    flexDirection: "row",

    alignItems: "center",
  },

  locationText: {
    marginLeft: 10,

    color: "#555",
  },

  searchBox: {
    marginHorizontal: 20,

    height: 50,

    backgroundColor: "#F5F5F5",

    borderRadius: 15,

    flexDirection: "row",

    alignItems: "center",

    paddingHorizontal: 15,
  },

  buscar: {
    flex: 1,

    marginLeft: 10,
  },

  banner: {
    margin: 20,

    backgroundColor: "#0066CC",

    borderRadius: 20,

    padding: 25,
  },

  bannerTitle: {
    color: "#fff",

    fontSize: 26,

    fontWeight: "bold",
  },

  bannerText: {
    color: "#fff",

    marginTop: 8,
  },

  sectionTitle: {
    fontSize: 22,

    fontWeight: "bold",

    marginHorizontal: 20,

    marginTop: 20,
  },

  grid: {
    flexDirection: "row",

    flexWrap: "wrap",

    justifyContent: "space-around",

    marginTop: 15,
  },

  card: {
    width: "42%",

    backgroundColor: "#fff",

    padding: 20,

    marginBottom: 20,

    borderRadius: 20,

    alignItems: "center",

    elevation: 5,
  },

  cardText: {
    marginTop: 10,

    fontSize: 17,

    color: "#0066CC",

    fontWeight: "600",
  },

  horizontal: {
    paddingLeft: 20,

    marginTop: 15,
  },

  businessCard: {
    width: 250,

    backgroundColor: "#fff",

    padding: 15,

    borderRadius: 20,

    marginRight: 15,

    elevation: 4,
  },

  businessImage: {
    width: 220,

    height: 100,

    resizeMode: "contain",
  },

  businessName: {
    fontSize: 18,

    fontWeight: "bold",

    marginTop: 10,
  },

  promo: {
    margin: 20,

    backgroundColor: "#0066CC",

    padding: 25,

    borderRadius: 20,
  },

  promoTitle: {
    color: "#fff",

    fontSize: 22,

    fontWeight: "bold",
  },

  promoText: {
    color: "#fff",

    marginTop: 10,
  },

  ad: {
    marginHorizontal: 20,

    backgroundColor: "#F2F7FF",

    padding: 20,

    borderRadius: 20,
  },

  adTitle: {
    color: "#0066CC",

    fontSize: 18,

    fontWeight: "bold",
  },

  adText: {
    marginTop: 8,

    color: "#555",
  },
});
