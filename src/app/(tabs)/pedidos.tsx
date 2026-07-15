import { StyleSheet, Text, View } from 'react-native';


export default function Pedidos(){

return(

<View style={styles.container}>

<Text style={styles.title}>
🛒 Mis pedidos
</Text>


<Text>
Aquí aparecerán tus pedidos realizados.
</Text>


</View>

)

}


const styles=StyleSheet.create({

container:{
flex:1,
alignItems:'center',
justifyContent:'center',
},

title:{
fontSize:25,
fontWeight:'bold',
color:'#0066CC',
}

});