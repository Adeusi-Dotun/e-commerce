import { AppText as Text } from '../components/CustomText';
import { Pressable, StyleSheet, TextInput, View, SafeAreaView } from 'react-native'
import React from 'react'
import CustomHeader from '../components/CustomHeader'

const AccountInformationScreen = () => {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <CustomHeader title="Account Information" />
      <View style={styles.accountInfo}>
        <View style={styles.topInfo}>
            <View style={styles.profilePic}></View>
            <Text>Adeusi Adedotun</Text>
            <Text>adeusidotun102@gmail.com</Text>
        </View>
        <View style={styles.personalInfo}>
            <Text style={{fontSize:20, fontWeight:700}}>Personal Info</Text>
            <View style={styles.personalForm}>
                <View style={styles.firstName}>
                    <Text style={{fontWeight:500}}>FIRST NAME</Text>
                    <TextInput
                        style={styles.infoInput}
                    />
                </View>
                <View style={styles.firstName}>
                    <Text style={{fontWeight:500}}>LAST NAME</Text>
                    <TextInput
                        style={styles.infoInput}
                    />
                </View>
            </View>
        </View>
        <View style={styles.personalInfo}>
            <Text style={{fontSize:20, fontWeight:700}}>Contact Info</Text>
            <View style={styles.personalForm}>
                <View style={styles.firstName}>
                    <Text style={{fontWeight:500}}>EMAIL ADDRESS</Text>
                    <TextInput
                        style={styles.infoInput}
                    />
                </View>
                <View style={styles.firstName}>
                    <Text style={{fontWeight:500}}>PHONE NUMBER</Text>
                    <TextInput
                        style={styles.infoInput}
                    />
                </View>
            </View>
        </View>
        <Pressable
            onPress={()=>{}}
            style={styles.saveInfo}
        >
            <Text style={{color:'white'}}>Save Changes</Text>
        </Pressable>
    </View>
    </SafeAreaView>
  )
}

export default AccountInformationScreen

const styles = StyleSheet.create({

    topInfo:{
        gap:5,
        alignItems:'center'
    },
    profilePic:{
        width:80,
        height:80,
        borderRadius:100,
        backgroundColor:'grey'
    },
    accountInfo:{
        paddingHorizontal:30,
        paddingVertical:20,
        gap:30 },
    personalInfo:{
        gap:25 },
    infoInput:{
        width:'100%',
        height:45,
        backgroundColor:'rgba(200, 200, 200, 0.3)',
        borderRadius: 7
    },
    firstName:{
       gap:10 
    },
    personalForm:{
        gap:10
    },
    saveInfo:{
        width:'100%',
        height: 45,
        backgroundColor:'#FF6B00',
        padding:10,
        alignItems:'center',
        justifyContent:'center',
        borderRadius:10
    }

})