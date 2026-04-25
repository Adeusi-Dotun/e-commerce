import { StyleSheet,Pressable, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React from 'react'

const CartScreen = () => {

  const navigation = useNavigation()


  return (
    <View style={styles.cartPage}>
      <Ionicons name='cart-outline' size={150} />
      <Text style={{fontSize:25, fontWeight:500 }}>Your cart is empty</Text>
      <Text style={{maxWidth:300, textAlign:'center', fontSize:18, color:'black', fontWeight:300, lineHeight:25}}>Looks like you haven't added anything to your cart yet. Start exploring our amazing deals!</Text>
      <Pressable
        onPress={()=> navigation.navigate('Home')}
        style={styles.button}>
        <Text style={{color:'white', fontWeight:'700', fontSize:'18'}}>Start Shopping</Text>
      </Pressable>

    </View>
  )
}

export default CartScreen

const styles = StyleSheet.create({

  cartPage:{
    flex:1,
    alignItems:'center',
    justifyContent:'center',
    backgroundColor: '',
    gap: 12,

  },

  button:{
    backgroundColor:'#FF6B00',
    paddingVertical:18,
    paddingHorizontal:40,
    borderRadius: 7,
  }



})