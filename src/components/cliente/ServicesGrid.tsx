import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import { router } from "expo-router";

const servicios = [
  {
    id: "expreso",
    nombre: "Carreras",
    icono: "🚕",
    ruta: "/expreso",
  },
  {
    id: "delivery",
    nombre: "Delivery",
    icono: "🚚",
    ruta: "/servicios",
  },
  {
    id: "compras",
    nombre: "Compras",
    icono: "🛒",
    ruta: "/servicios",
  },
  {
    id: "farmacia",
    nombre: "Farmacia",
    icono: "💊",
    ruta: "/farmacia",
  },
  {
    id: "flete",
    nombre: "Flete",
    icono: "📦",
    ruta: "/flete",
  },
  {
    id: "empleo",
    nombre: "Empleo",
    icono: "💼",
    ruta: "/empleo",
  },
];

export default function ServicesGrid() {
    console.log("SERVICES GRID CARGADO");

  const abrirServicio = (ruta:string) => {
    router.push(ruta as any);
  };

  return (
    <View style={styles.container}>

      <Text style={styles.titulo}>
        Servicios
      </Text>

      <View style={styles.grid}>

        {servicios.map((item)=>(
          <TouchableOpacity
            key={item.id}
            style={styles.card}
            onPress={()=>abrirServicio(item.ruta)}
          >

            <Text style={styles.icono}>
              {item.icono}
            </Text>

            <Text style={styles.nombre}>
              {item.nombre}
            </Text>

          </TouchableOpacity>
        ))}

      </View>

    </View>
  );
}


const styles = StyleSheet.create({

  container:{
    marginTop:20,
    paddingHorizontal:16,
  },

  titulo:{
    fontSize:20,
    fontWeight:"700",
    marginBottom:12,
  },

  grid:{
    flexDirection:"row",
    flexWrap:"wrap",
    justifyContent:"space-between",
  },

  card:{
    width:"31%",
    height:100,
    backgroundColor:"#ffffff",
    borderRadius:15,
    alignItems:"center",
    justifyContent:"center",
    marginBottom:15,

    elevation:3,
  },

  icono:{
    fontSize:35,
    marginBottom:8,
  },

  nombre:{
    fontSize:14,
    fontWeight:"600",
    textAlign:"center",
  }

});