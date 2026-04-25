import { Pressable, StyleSheet, Text, TextInput, View,KeyboardAvoidingView, Platform,ScrollView } from 'react-native'
import React, { useState }from 'react'
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';



const RegisterScreen = () => {

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');

    const {register} = useContext(AuthContext);
    const [showPasword, setShowPassword] = useState(false);
    const [agreed, setAgreed] = useState(false);
    const navigation =useNavigation();

    const handleRegister =() =>{
        if (!firstName || !lastName || !email || !phoneNumber || !password) {
            alert('Fill all Fields');
            return;
        }

        if (!agreed) {
            alert("Accept terms first");
            return;
        }

        register(firstName,lastName,phoneNumber, email, password)

        navigation.replace('MainTabs');
    };



  return (

    <KeyboardAvoidingView
        style={{flex:1}}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
        <ScrollView contentContainerStyle= {{flexGrow:1}}>
                <View style={styles.registerScreen}>
                    <View style={{gap:2, alignItems:'center', justifyContent:'center'}}>
                        <Text style={{fontSize: 45, fontWeight: 600, }}>Create Account</Text>
                        <Text style={{fontSize:14 }}>Join the pulse of Lagos e-commerce</Text>
                    </View>
                    <View style={styles.form}>
                        
                        <View style={styles.name}>
                                <View style={[{flex:1}, styles.inputContainer]}>
                                    <Text style={{fontWeight:600}}>FIRST NAME</Text>
                                    <TextInput
                                        placeholder=''
                                        value={firstName}
                                        onChangeText={setFirstName}
                                        style={styles.input}
                                    />
                                </View>
                                <View style={[{flex:1}, styles.inputContainer]}>
                                    <Text style={{fontWeight:600}}>LAST NAME</Text>
                                    <TextInput
                                        placeholder=''
                                        value={lastName}
                                        onChangeText={setLastName}
                                        style={styles.input}
                                    />
                                </View>
                        </View>
                        <View style={styles.inputContainer}>
                            <Text style={{fontWeight:600}}>EMAIL ADDRESS</Text>
                            <TextInput
                                placeholder=''
                                value={email}
                                onChangeText={setEmail}
                                style={styles.input}
                            />
                        </View>
                        <View style={styles.inputContainer}>
                            <Text style={{fontWeight:600}}>PHONE NUMBER</Text>
                            <TextInput
                                placeholder=''
                                value={phoneNumber}
                                onChangeText={setPhoneNumber}
                                style={styles.input}
                            />
                        </View>
                        <View style={styles.inputContainer}>
                            <Text style={{fontWeight:700}}>PASSWORD</Text>
                            <View style={styles.passwordContainer}>
                                <TextInput
                                    placeholder=''
                                    secureTextEntry={!showPasword}
                                    value={password}
                                    onChangeText={setPassword}
                                    style={[styles.input, {flex:1}]}
                                />
                                <Pressable
                                    onPress={() => setShowPassword(!showPasword)}
                                    style={styles.eyeIcon}
                                >
                                    <Ionicons
                                        name={showPasword ? 'eye-outline' : 'eye-off-outline'}
                                        size={22}
                                        color='#888'
                                    />
                                </Pressable>
                            </View>
                        </View>
                    </View>
                    <Pressable onPress={() => setAgreed(!agreed)} style={styles.termsRow}>
                        <Ionicons
                            name={agreed ? 'checkbox' : 'square-outline'}
                            size={22}
                            color={agreed ? '#4F46E5' : '#888'}
                        />
                        <Text style={styles.termsText}>I agree to the Terms and Privacy Policy</Text>
                    </Pressable>
                    <Pressable
                        onPress={handleRegister}
                        style={styles.register}
                    >
                        <Text>Register</Text>
                    </Pressable>
                    <View style={{flexWrap:'wrap',flexDirection:'row'}}>
                        <Text style={{fontSize:16, fontWeight:600}}>Already have an account? </Text>
                        <Pressable onPress={()=> navigation.navigate('Signin')} android_ripple={null}>
                            <Text style={{color:'#FF6B00', fontSize:16, fontWeight:600}}>Sign in</Text>
                        </Pressable>
                    </View>
                </View>
        </ScrollView>
    </KeyboardAvoidingView>
);
}
            

export default RegisterScreen

const styles = StyleSheet.create({

    registerScreen:{
        flex:1,
        alignItems: 'center',
        justifyContent:'center',
        width:'100%',
        paddingHorizontal:25,
        gap:20
    },
    form:{
        width:'100%',
        gap:20,

    },
    input:{
        width:'100%',
        padding:15,
        backgroundColor:'white',
        borderRadius:7,
    },
    name:{
        flexDirection:'row',
        justifyContent:'space-between',
        gap:5
    },
    inputContainer:{
        gap:10
    },
    passwordContainer:{
        flexDirection:'row',
        alignItems:'center',
        backgroundColor:'white',
        borderRadius:7,
    },
    termsRow:{
        flexDirection:'row',
        alignItems:'center',
        gap:10,
    },
    termsText:{
        fontSize:14,
        color:'#333',
        flexShrink:1,
        fontWeight:500,
    },
    eyeIcon:{
        paddingHorizontal:12,
        justifyContent:'center',
        alignItems:'center',
    },
    register:{
        width:'100%',
        backgroundColor:'#FF6B00',
        alignItems:'center',
        height:45,
        justifyContent:'center',
        borderRadius:10,
        marginBottom:50
    },
    
})