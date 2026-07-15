import { Image, StyleSheet, Text, View } from 'react-native';

export default function BusinessCard() {

  return (
    <View style={styles.card}>

      <Image
        source={require('../../assets/images/franciscorp-logo.png')}
        style={styles.image}
      />

      <View>
        <Text style={styles.name}>
          Restaurante Francis
        </Text>

        <Text style={styles.info}>
          ⭐ 4.8  •  20-30 min
        </Text>

        <Text style={styles.category}>
          Comida ecuatoriana
        </Text>
      </View>

    </View>
  );
}



const styles = StyleSheet.create({

card:{
  backgroundColor:'#fff',
  borderRadius:18,
  padding:15,
  marginRight:15,
  width:260,
  elevation:4,
},


image:{
  width:230,
  height:120,
  borderRadius:15,
},


name:{
  fontSize:18,
  fontWeight:'bold',
  marginTop:10,
},


info:{
  marginTop:5,
  color:'#555',
},


category:{
  marginTop:5,
  color:'#0066CC',
},

});