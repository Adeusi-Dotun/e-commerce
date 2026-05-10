import { StyleSheet, TextInput, View } from 'react-native'
import React from 'react'
import { Ionicons } from '@expo/vector-icons';
import { AppText as Text } from '../components/CustomText';
import { SafeAreaView } from 'react-native-safe-area-context'
import CustomHeader from '../components/CustomHeader'

const AddNewAddress = () => {
  return (
    <SafeAreaView style={{flex:1, backgroundColor: 'white',}}>
      <CustomHeader title="Addresses" />
      <View style={{alignItems:'center',paddingTop:20}}>
        <View style={styles.inputContainer}>
          <Ionicons name="location-outline" size={24} color="#888" style={styles.icon} />
          <TextInput
              placeholder='Add New Address'
              style={styles.enterAddress}
          />
        </View>
      </View>
    </SafeAreaView>
  )
}

export default AddNewAddress

const styles = StyleSheet.create({

    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '90%',
        height: 50,
        backgroundColor: 'rgba(200, 200, 200, 0.3)',
        borderRadius: 10,
        paddingHorizontal: 10,
    },
    icon: {
        marginRight: 8,
    },
    enterAddress: {
        flex: 1,
        height: '100%',
        fontSize: 16,
    }
})