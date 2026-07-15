import { StyleSheet, Text, View } from 'react-native';


export default function Favoritos(){

return(

<View style={styles.container}>

<Text style={styles.title}>
⭐ Favoritos
</Text>

<Text>
Tus negocios favoritos aparecerán aquí.
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