import { AppText as Text } from '../components/CustomText';
import { StyleSheet, View, SafeAreaView } from 'react-native'
import React from 'react'
import CustomHeader from '../components/CustomHeader'; 

const PrivacyScreen = () => {
  return (
    <SafeAreaView style={{flex:1, backgroundColor: 'white'}}>
      <CustomHeader title="Privacy Policy" />
      <View style={{flex:1, justifyContent:'center', alignItems:'center'}}>
        <Text>PrivacyScreen</Text>
      </View>
    </SafeAreaView>
  )
} 

export default PrivacyScreen

const styles = StyleSheet.create({})