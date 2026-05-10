import { AppText as Text } from '../components/CustomText';
import { StyleSheet, View, SafeAreaView } from 'react-native'
import React from 'react'
import CustomHeader from '../components/CustomHeader';

const TermsScreen = () => {
  return (
    <SafeAreaView style={{flex:1, backgroundColor: 'white'}}>
      <CustomHeader title="Terms and Conditions" />
      <View style={{flex:1, justifyContent:'center', alignItems:'center'}}>
        <Text>TermsScreen</Text>
      </View>
    </SafeAreaView>
  )
}

export default TermsScreen

const styles = StyleSheet.create({})