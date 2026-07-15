import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

export default function HomeScreen() {

  return (

    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >

      {/* HEADER */}

      <View style={styles.header}>

        <View>

          <Text style={styles.saludo}>
            Hola, Francis 👋
          </Text>

          <Text style={styles.pregunta}>
            ¿Qué necesitas hoy?
          </Text>

        </View>


        <Image
          source={require('../../../assets/images/franciscorp-logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />

      </View>


      {/* DIRECCION */}

      <View style={styles.location}>

        <MaterialCommunityIcons
          name="map-marker"
          size={24}
          color="#0066CC"
        />

        <Text style={styles.locationText}>
          Selecciona tu dirección de entrega
        </Text>

      </View>


      {/* BUSCADOR */}

      <View style={styles.searchBox}>

        <MaterialCommunityIcons
          name="magnify"
          size={25}
          color="#777"
        />


        <TextInput
          placeholder="Buscar productos o servicios..."
          style={styles.buscar}
        />

      </View>



      {/* BANNER */}

      <View style={styles.banner}>

        <Text style={styles.bannerTitle}>
          FrancisCorp
        </Text>


        <Text style={styles.bannerText}>
          Delivery • Carreras • Compras
        </Text>


        <Text style={styles.bannerText}>
          Todo en una sola aplicación
        </Text>


      </View>



      {/* SERVICIOS */}

      <Text style={styles.sectionTitle}>
        Servicios
      </Text>


      <View style={styles.grid}>

        {[
          ['motorbike','Delivery'],
          ['taxi','Carreras'],
          ['cart','Compras'],
          ['silverware-fork-knife','Restaurantes'],
          ['pill','Farmacia'],
          ['store','Tiendas'],

        ].map((item,index)=>(


          <View
            style={styles.card}
            key={index}
          >

            <MaterialCommunityIcons
              name={item[0] as any}
              size={35}
              color="#0066CC"
            />


            <Text style={styles.cardText}>
              {item[1]}
            </Text>


          </View>


        ))}


      </View>



      {/* NEGOCIOS DESTACADOS */}

      <Text style={styles.sectionTitle}>
        ⭐ Negocios destacados
      </Text>



      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.horizontal}
      >


        <View style={styles.businessCard}>


          <Image
            source={require('../../../assets/images/franciscorp-logo.png')}
            style={styles.businessImage}
          />


          <Text style={styles.businessName}>
            Restaurante Francis
          </Text>


          <Text>
            ⭐ 4.8 • 25 min
          </Text>


        </View>





        <View style={styles.businessCard}>


          <Image
            source={require('../../../assets/images/franciscorp-logo.png')}
            style={styles.businessImage}
          />


          <Text style={styles.businessName}>
            Tienda Aliada
          </Text>


          <Text>
            ⭐ 4.6 • 15 min
          </Text>


        </View>


      </ScrollView>

      {/* PROMOCIONES */}

      <Text style={styles.sectionTitle}>
        🔥 Promociones
      </Text>


      <View style={styles.promo}>


        <Text style={styles.promoTitle}>
          Primera compra
        </Text>


        <Text style={styles.promoText}>
          Obtén descuentos exclusivos usando FrancisCorp
        </Text>


      </View>




      {/* PUBLICIDAD */}


      <View style={styles.ad}>


        <Text style={styles.adTitle}>
          📢 Publicidad para negocios aliados
        </Text>


        <Text style={styles.adText}>
          Tu negocio puede aparecer aquí
        </Text>


      </View>




      <View style={{height:40}} />


    </ScrollView>

  );

}






const styles = StyleSheet.create({


container:{
 flex:1,
 backgroundColor:'#fff',
},



header:{

 marginTop:50,

 paddingHorizontal:20,

 flexDirection:'row',

 justifyContent:'space-between',

 alignItems:'center',

},



saludo:{
 fontSize:18,
 color:'#555',
},



pregunta:{
 fontSize:25,
 fontWeight:'bold',
 color:'#0066CC',
},



logo:{
 width:70,
 height:70,
},




location:{

 margin:20,

 padding:15,

 backgroundColor:'#F2F7FF',

 borderRadius:15,

 flexDirection:'row',

 alignItems:'center',

},



locationText:{
 marginLeft:10,
 color:'#555',
},






searchBox:{

 marginHorizontal:20,

 height:50,

 backgroundColor:'#F5F5F5',

 borderRadius:15,

 flexDirection:'row',

 alignItems:'center',

 paddingHorizontal:15,

},



buscar:{
 flex:1,
 marginLeft:10,
},







banner:{


 margin:20,

 backgroundColor:'#0066CC',

 borderRadius:20,

 padding:25,

},



bannerTitle:{

 color:'#fff',

 fontSize:26,

 fontWeight:'bold',

},



bannerText:{

 color:'#fff',

 marginTop:8,

},






sectionTitle:{

 fontSize:22,

 fontWeight:'bold',

 marginHorizontal:20,

 marginTop:20,

},





grid:{

 flexDirection:'row',

 flexWrap:'wrap',

 justifyContent:'space-around',

 marginTop:15,

},




card:{

 width:'42%',

 backgroundColor:'#fff',

 padding:20,

 marginBottom:20,

 borderRadius:20,

 alignItems:'center',

 elevation:5,

},



cardText:{

 marginTop:10,

 fontSize:17,

 color:'#0066CC',

 fontWeight:'600',

},






horizontal:{

 paddingLeft:20,

 marginTop:15,

},



businessCard:{

 width:250,

 backgroundColor:'#fff',

 padding:15,

 borderRadius:20,

 marginRight:15,

 elevation:4,

},



businessImage:{

 width:220,

 height:100,

 resizeMode:'contain',

},



businessName:{

 fontSize:18,

 fontWeight:'bold',

 marginTop:10,

},






promo:{

 margin:20,

 backgroundColor:'#0066CC',

 padding:25,

 borderRadius:20,

},



promoTitle:{

 color:'#fff',

 fontSize:22,

 fontWeight:'bold',

},



promoText:{

 color:'#fff',

 marginTop:10,

},






ad:{

 marginHorizontal:20,

 backgroundColor:'#F2F7FF',

 padding:20,

 borderRadius:20,

},



adTitle:{

 color:'#0066CC',

 fontSize:18,

 fontWeight:'bold',

},



adText:{

 marginTop:8,

 color:'#555',

},



});