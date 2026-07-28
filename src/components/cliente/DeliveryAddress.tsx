import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function DeliveryAddress() {
  return (
    <TouchableOpacity style={styles.container}>

      <Ionicons 
        name="location-outline" 
        size={22} 
        color="#333" 
      />

      <View style={styles.textContainer}>
        <Text style={styles.title}>
          Dirección de entrega
        </Text>

        <Text style={styles.subtitle}>
          Selecciona tu ubicación
        </Text>
      </View>

      <Ionicons 
        name="chevron-forward" 
        size={20} 
        color="#777" 
      />

    </TouchableOpacity>
  );
}


const styles = StyleSheet.create({

  container:{
    flexDirection:"row",
    alignItems:"center",
    backgroundColor:"#fff",
    padding:12,
    marginHorizontal:16,
    marginTop:10,
    borderRadius:12,
    elevation:2,
  },

  textContainer:{
    flex:1,
    marginLeft:10,
  },

  title:{
    fontSize:14,
    fontWeight:"600",
    color:"#222",
  },

  subtitle:{
    fontSize:12,
    color:"#777",
    marginTop:2,
  },

});