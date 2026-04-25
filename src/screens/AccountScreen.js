import { StyleSheet, Pressable, Text, View, Button } from 'react-native'
import React from 'react'
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const AccountScreen = () => {

  const navigation = useNavigation();

  return ( 

      <View style={styles.accountPage}>
        <View style={styles.top}>
          <Text style={{fontSize: 20 , fontWeight:700}}>Ready to Shop?</Text>
          <Text style={{fontSize:15, color: 'grey', lineHeight:23}}>Join thousand of shoppers in Nigeria's most vibrant marketplace. Secure, fast and local.</Text>
          <Pressable
            onPress={()=> navigation.navigate('Signin')}
            style={styles.button}>
            <Text style={{color:'white', fontSize: 15}}>Sign in / Register <Ionicons name="arrow-forward-outline" /> </Text>
          </Pressable>
        </View>
        <View style={styles.middle}>
          <View>
            <Text style={{fontSize:20, fontWeight:700 }}>Why join us?</Text>
          </View>
          <View style={styles.second}>
            <View style={styles.box}>
              <Ionicons name="receipt-outline"  size={25} />
              <Text style={{fontWeight:800}}>Track Orders</Text>
              <Text >Real-Time updates on every delivery.</Text>
            </View>
            <View style={styles.box}>
              <Ionicons name="heart-outline" size={25} />
              <Text style={{fontWeight:800}}>Save Items</Text>
              <Text style={{color:'grey'}}>Keep your wishlist synced across devices</Text>
            </View>
          </View>
        </View>
        <View style={styles.bottom}>
          <Text style={{fontWeight:500, fontSize:15, color:'grey'}}>QUICK SERVICES</Text>
          <View style={styles.boxContainer}>
            <View style={styles.bottomBox}>
              <Ionicons name='help'  size={25} />
              <Text style={{fontWeight:600, fontSize:15}}>Help Center</Text>
            </View>
            <View style={styles.bottomBox}>
              <Ionicons name='headset'  size={25} />
              <Text style={{fontWeight:600, fontSize:15}}>Customer Support</Text>
            </View>
            <View style={styles.bottomBox}>
              <Ionicons name='document'  size={25} />
              <Text style={{fontWeight:600, fontSize:15}}>Terms & Conditions</Text>
            </View>
          </View>

        </View>
      </View>
      
  )
}

export default AccountScreen

const styles = StyleSheet.create({

  accountPage:{
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  top: {
    gap: 10,
    backgroundColor: 'white',
    padding:30,
    borderRadius: 10,
    borderBottomColor: 'orange',
    borderBottomWidth: 5
  },
  button:{
    backgroundColor: '#FF6B00',
    alignItems:'center',
    padding: 15,
    borderRadius: 10
  },
  middle: {
    gap: 10,
    marginTop: 20,
  },
  second:{
    flexDirection: 'row',
    justifyContent:'space-between'
  },
  box:{
    backgroundColor: 'white',
    width: 150,
    gap: 10,
    padding:10,
    borderRadius:20,
  },
  bottom:{
    marginTop: 35,
    gap:20
  },
  boxContainer:{
    gap: 15,
  },
  bottomBox:{
    flexDirection:'row',
    alignItems:'center',
    gap:10,
    backgroundColor:'white',
    padding:10,
    borderRadius:15
  }

  
})