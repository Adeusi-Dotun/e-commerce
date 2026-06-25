import TabNavigator from './TabNavigator';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SigninScreen from '../screens/SigninScreen';
import TermsScreen from '../screens/TermsScreen';
import PrivacyScreen from '../screens/PrivacyScreen';
import RegisterScreen from '../screens/RegisterScreen';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import AccountInformationScreen from '../screens/AccountInformationScreen';
import PaymentMethodScreen from '../screens/PaymentMethodScreen';
import AddressManagementScreen from '../screens/AddressManagementScreen';
import AddNewAddress from '../screens/AddNewAddress';
import AddCardScreen from '../screens/AddCardScreen';
import VendorDetailsScreen from '../screens/VendorDetailsScreen';
import CartScreen from '../screens/CartScreen'
import CheckoutScreen from '../screens/CheckoutScreen';
import PlacedOrderScreen from '../screens/PlacedOrderScreen';
import MyOrdersScreen from '../screens/MyOrdersScreen';
import TrackOrderScreen from '../screens/TrackOrderScreen';
import VendorApplicationScreen from '../screens/VendorApplicationScreen';



const Stack = createNativeStackNavigator();


const StackNavigator = () => {
  
    return (
    
      <Stack.Navigator>
        <Stack.Screen name='MainTabs' component={TabNavigator} options={{headerShown:false}} />

        <Stack.Screen name='Signin' component={SigninScreen} options={{presentation: 'modal', animation:'slide_from_bottom', gestureEnabled: true, headerShown: false}} />
        <Stack.Screen name="Terms" component={TermsScreen} options={{presentation:'modal', animation:'slide_from_bottom', gestureEnabled:true}} />
        <Stack.Screen name="Privacy" component={PrivacyScreen} options={{presentation:'modal', animation:'slide_from_bottom', gestureEnabled:true}} />
        <Stack.Screen name="Register" component={RegisterScreen} options={{presentation:'modal', animation:'slide_from_bottom', gestureEnabled:true}} />
        <Stack.Screen name="AccountInfo" component={AccountInformationScreen} options={{headerShown: false, animation:'slide_from_right', gestureEnabled:true}} />
        <Stack.Screen name="paymentMethod" component={PaymentMethodScreen} options={{headerShown: false, animation:'slide_from_right', gestureEnabled:true}} />
        <Stack.Screen name="AddressManagement" component={AddressManagementScreen} options={{headerShown: false, animation:'slide_from_right', gestureEnabled:true}} />
        <Stack.Screen name="AddNewAddress" component={AddNewAddress} options={{headerShown: false, animation:'slide_from_right', gestureEnabled:true}} />
        <Stack.Screen name="AddCard" component={AddCardScreen} options={{headerShown: false, animation:'slide_from_right', gestureEnabled:true}} />
        <Stack.Screen name="VendorDetails" component={VendorDetailsScreen} options={{headerShown: false, animation:'slide_from_right', gestureEnabled:true}} />
        <Stack.Screen name="Cart" component={CartScreen} options={{headerShown: false, animation:'slide_from_right', gestureEnabled:true}} />
        <Stack.Screen name="Checkout" component={CheckoutScreen} options={{headerShown: false, animation:'slide_from_right', gestureEnabled:true}} />
        <Stack.Screen name="PlacedOrder" component={PlacedOrderScreen} options={{headerShown: false, animation:'slide_from_right', gestureEnabled: false}} />
        <Stack.Screen name="MyOrders" component={MyOrdersScreen} options={{headerShown: false, animation:'slide_from_right', gestureEnabled: true}} />
        <Stack.Screen name="TrackOrder" component={TrackOrderScreen} options={{headerShown: false, animation:'slide_from_right', gestureEnabled: true}} />
        <Stack.Screen
          name="VendorApplication"
          component={VendorApplicationScreen}
          options={{
            title: 'Become a Vendor',
            headerShown: true,
            headerStyle: { backgroundColor: 'white' },
            headerTintColor: '#111',
            headerTitleStyle: { fontWeight: '800', fontSize: 20 },
            animation:'slide_from_right',
            gestureEnabled: true
          }}
        />
      </Stack.Navigator>
      
  )
}

export default StackNavigator;
