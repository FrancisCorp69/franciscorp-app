import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

export default function MainBanner() {
  return (
    <View style={styles.container}>

      <View style={styles.content}>

        <Text style={styles.title}>
          FrancisCorp
        </Text>

        <Text style={styles.subtitle}>
          Todo lo que necesitas,
          en una sola aplicación.
        </Text>


        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>
            Explorar servicios
          </Text>
        </TouchableOpacity>

      </View>


      <View style={styles.circle}>
        <Text style={styles.icon}>
          🚀
        </Text>
      </View>


    </View>
  );
}


const styles = StyleSheet.create({

  container:{
    marginHorizontal:20,
    marginTop:20,
    backgroundColor:"#0066CC",
    borderRadius:24,
    padding:22,
    flexDirection:"row",
    overflow:"hidden",
    alignItems:"center",
  },


  content:{
    flex:1,
  },


  title:{
    color:"#fff",
    fontSize:28,
    fontWeight:"800",
  },


  subtitle:{
    marginTop:8,
    color:"#fff",
    fontSize:15,
    lineHeight:21,
    width:"90%",
  },


  button:{
    marginTop:18,
    backgroundColor:"#fff",
    paddingHorizontal:18,
    paddingVertical:10,
    borderRadius:20,
    alignSelf:"flex-start",
  },


  buttonText:{
    color:"#0066CC",
    fontWeight:"700",
  },


  circle:{
    width:70,
    height:70,
    borderRadius:35,
    backgroundColor:"#ffffff33",
    justifyContent:"center",
    alignItems:"center",
  },


  icon:{
    fontSize:38,
  },

});