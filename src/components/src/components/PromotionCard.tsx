import { StyleSheet, Text, View } from 'react-native';

export default function PromotionCard(){

return(

<View style={styles.card}>

<Text style={styles.title}>
🔥 Promoción especial
</Text>

<Text style={styles.text}>
10% de descuento en tu primer pedido
</Text>

</View>

);

}


const styles=StyleSheet.create({

card:{
backgroundColor:'#0066CC',
borderRadius:18,
padding:20,
marginRight:15,
width:260,
},

title:{
color:'#fff',
fontSize:20,
fontWeight:'bold',
},

text:{
color:'#fff',
marginTop:10,
}

});