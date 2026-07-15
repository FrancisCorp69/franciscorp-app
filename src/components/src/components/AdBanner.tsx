import { StyleSheet, Text, View } from 'react-native';

export default function AdBanner(){

return(

<View style={styles.banner}>

<Text style={styles.title}>
📢 Publicidad para negocios aliados
</Text>


<Text style={styles.text}>
Tu negocio puede aparecer aquí
</Text>

</View>

);

}



const styles=StyleSheet.create({

banner:{
backgroundColor:'#F2F7FF',
marginTop:20,
marginHorizontal:20,
padding:20,
borderRadius:18,
},

title:{
fontSize:18,
fontWeight:'bold',
color:'#0066CC',
},

text:{
marginTop:8,
color:'#555',
},

});