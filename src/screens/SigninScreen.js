import { AppText as Text } from '../components/CustomText';
import { StyleSheet, Pressable, View } from 'react-native'
import { TextInput } from 'react-native'
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';

const SigninScreen = () => {

    const navigation = useNavigation();

    const [email, setEmail] =  useState('');
    const [password, setPassword] =  useState('');
    const [showPassword, setShowPassword] = useState(false);

    const { login } = useContext(AuthContext);

    const handleLogin = async () => {
        const success = await login(email, password);
        if (success) {
            navigation.goBack();
        }      
    };

    return (
        <View style={styles.signinPage}>
            <View style={styles.exitContainer}>
                <Pressable
                    onPress={() => navigation.goBack()} style={styles.exitButton}>
                    <Ionicons name='arrow-back' size={28} color='black' />
                </Pressable>
            </View>
            <View style={{ marginTop: 50 }}>
                <Text style={{ fontSize: 40, fontWeight: 700 }}>Welcome Back.</Text>
                <Text style={{ fontSize: 14, fontWeight: 400 }}>Join the heartbeat of the Nigerian Marketplace</Text>
            </View>
            <View style={{ width: '100%', marginTop: 20 }}>
                <Text style={{ fontSize: 25, fontWeight: 700 }}>Log In</Text>
            </View>
            <View style={styles.form}>
                <View style={{ gap: 10 }}>
                    <Text style={styles.inputLabel}>EMAIL ADDRESS</Text>
                    <TextInput
                        placeholder='name@example.com'
                        style={styles.input}
                        value={email}
                        onChangeText={setEmail}
                    />
                </View>
                <View style={{ gap: 10 }}>
                    <View style={{ justifyContent: 'space-between', flexDirection: 'row' }}>
                        <Text style={styles.inputLabel}>PASSWORD</Text>
                        <Text style={{ color: 'blue', fontWeight: 400 }}>Forgot password?</Text>
                    </View>
                    <View style={styles.passwordInputContainer}>
                        <TextInput
                            placeholder='Password'
                            secureTextEntry={!showPassword}
                            style={styles.passwordTextInput}
                            value={password}
                            onChangeText={setPassword}
                        />
                        <Pressable 
                            onPress={() => setShowPassword(!showPassword)} 
                            style={styles.eyeIcon}
                            hitSlop={8}
                        >
                            <Ionicons 
                                name={showPassword ? 'eye-outline' : 'eye-off-outline'} 
                                size={22} 
                                color='grey' 
                            />
                        </Pressable>
                    </View>
                </View>
                <Pressable
                    onPress={handleLogin}
                    style={styles.signinButton}
                    
                >
                    <Text style={{ color: 'white', fontWeight: 700, fontSize: 18 }}>Sign in</Text>
                </Pressable>
            </View>
            <View style={styles.signInOption}>
                <View style={{ height: 2, flex: 1, backgroundColor: 'grey', opacity: 0.2 }}></View>
                <View style={{ marginHorizontal: 10 }}><Text style={{ fontWeight: 600 }}>OR CONTINUE WITH</Text></View>
                <View style={{ height: 2, flex: 1, backgroundColor: 'grey', opacity: 0.2 }}></View>
            </View>
            <View style={{ width: '100%', gap: 10 }}>
                <View style={styles.signInBox}>
                    <Ionicons name='logo-google' size={20} />
                    <Text style={styles.toggleButtonText}>Sign in with Google</Text>
                </View>

                <View style={styles.signInBox}>
                    <Ionicons name='logo-apple' size={20} />
                    <Text style={styles.toggleButtonText}>Sign in with Apple</Text>
                </View>
            </View>
            <View style={{ width: 280, marginTop: 15, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' }}>
                <Text style={{ fontSize: 16, fontWeight: '500' }}>By proceeding, you agree to the </Text>
                <Pressable onPress={() => navigation.navigate('Terms')} android_ripple={null}>
                    <Text style={{ color: '#FF6B00', fontWeight: '500', textDecorationLine: 'underline', fontSize: 16 }}>Terms of Service</Text>
                </Pressable>
                <Text style={{ fontSize: 16, fontWeight: '500' }}> and </Text>
                <Pressable onPress={() => navigation.navigate('Privacy')} android_ripple={null}>
                    <Text style={{ color: '#FF6B00', fontWeight: '500', textDecorationLine: 'underline', fontSize: 16 }}>Privacy Policy</Text>
                </Pressable>
            </View>
            <View style={{ marginTop: 10, gap: 5, alignItems: 'center' }}>
                <Text style={{ fontSize: 16, fontWeight: 500 }}>Don't have an account?</Text>
                <Pressable onPress={() => navigation.navigate('Register')}>
                    <Text style={{ color: '#FF6B00', fontWeight: 800, fontSize: 16 }}>Create Account</Text>
                </Pressable>
            </View>

        </View>
    )
}

export default SigninScreen

const styles = StyleSheet.create({

    signinPage: {
        flex: 1,
        paddingHorizontal: 20,
        paddingVertical: 15,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 5 },
    toggle: {
        flexDirection: 'row',
        height: 45,
        width: 300,
        alignItems: 'stretch',
        marginTop: 20,
        backgroundColor: 'white',
        paddingVertical: 3,
        borderRadius: 10 },
    toggleButton: {
        flex: 1,
        justifyContent: 'center',
        borderRadius: 7 },
    toggleButtonText: {
        color: 'black',
        textAlign: 'center',
        fontWeight: 600 },
    form: {
        alignSelf: 'flex-start',
        gap: 20,
        width: '100%',
        marginTop: 20 },
    input: {
        width: '100%',
        padding: 20,
        backgroundColor: 'white',
        borderRadius: 7 },
    passwordInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        backgroundColor: 'white',
        borderRadius: 7,
        paddingHorizontal: 20 },
    passwordTextInput: {
        flex: 1,
        paddingVertical: 20 },
    eyeIcon: {
        marginLeft: 10 },
    inputLabel: {
        fontWeight: 500 },
    signinButton: {
        width: '100%',
        backgroundColor: '#FF6B00',
        alignItems: 'center',
        height: 45,
        justifyContent: 'center',
        borderRadius: 10
    },
    exitContainer: {
        width: '100%',
        position: 'absolute',
        top: 50
    },
    signInOption: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 15 },
    signInBox: {
        backgroundColor: 'white',
        padding: 10,
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        flexDirection: 'row',
        gap: 10
    }
})