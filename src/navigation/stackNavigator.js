import TabNavigator from './TabNavigator';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SigninScreen from '../screens/SigninScreen';
import TermsScreen from '../screens/TermsScreen';
import PrivacyScreen from '../screens/PrivacyScreen';
import RegisterScreen from '../screens/RegisterScreen';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const Stack = createNativeStackNavigator();


const StackNavigator = () => {
  
    return (
    
      <Stack.Navigator>
        <Stack.Screen name='MainTabs' component={TabNavigator} options={{headerShown:false}} />

        <Stack.Screen name='Signin' component={SigninScreen} options={{presentation: 'modal', animation:'slide_from_bottom', gestureEnabled: true, headerShown: false}} />
        <Stack.Screen name="Terms" component={TermsScreen} options={{presentation:'modal', animation:'slide_from_bottom', gestureEnabled:true}} />
       <Stack.Screen name="Privacy" component={PrivacyScreen} options={{presentation:'modal', animation:'slide_from_bottom', gestureEnabled:true}} />
       <Stack.Screen name="Register" component={RegisterScreen} options={{presentation:'modal', animation:'slide_from_bottom', gestureEnabled:true}} />
      </Stack.Navigator>
  )
}

export default StackNavigator;
