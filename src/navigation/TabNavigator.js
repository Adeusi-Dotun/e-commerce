import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeScreen from '../screens/HomeScreen';
import SearchScreen from '../screens/SearchScreen';
import AccountScreen from "../screens/AccountScreen";
import { Ionicons } from '@expo/vector-icons';
import { useContext } from 'react';
import { CartContext } from '../context/CartContext';
import { Pressable, View, Text } from 'react-native';

const Tab = createBottomTabNavigator();

function CartHeaderButton({ navigation }) {
    const { cartCount } = useContext(CartContext);

    return (
        <Pressable
            onPress={() => navigation.navigate('Cart')}
            style={{ marginRight: 16 }}
        >
            <View style={{
                width: 42,
                height: 42,
                borderRadius: 21,
                backgroundColor: '#F0F0F0',
                alignItems: 'center',
                justifyContent: 'center',
            }}>
                <Ionicons name="cart-outline" size={26} color="#111" />
                {cartCount > 0 && (
                    <View style={{
                        position: 'absolute',
                        top: -2,
                        right: -2,
                        backgroundColor: '#FF6B00',
                        borderRadius: 10,
                        minWidth: 18,
                        height: 18,
                        justifyContent: 'center',
                        alignItems: 'center',
                        paddingHorizontal: 4,
                        borderWidth: 1.5,
                        borderColor: '#FFFFFF',
                    }}>
                        <Text style={{
                            color: '#FFFFFF',
                            fontSize: 10,
                            fontWeight: '700',
                            textAlign: 'center',
                            includeFontPadding: false,
                        }}>
                            {cartCount > 99 ? '99+' : cartCount}
                        </Text>
                    </View>
                )}
            </View>
        </Pressable>
    );
}

export default function TabNavigator(){

    return(
        <Tab.Navigator>
            <Tab.Screen name= 'Home' component={HomeScreen} 
            options={({ navigation }) => ({
                headerShown: false,
                tabBarLabel:'Home',
                tabBarLabelStyle: {
                    fontSize: 13,
                    fontWeight: '500'
                },
                tabBarIcon: ({focused, color, size}) =>{
                    return(
                        <Ionicons 
                            name={focused ? 'home' : "home-outline"}
                            size= {size}
                            color= {color}
                        />
                    )
                },
                headerRight: () => <CartHeaderButton navigation={navigation} />,
            })} />
            <Tab.Screen name= 'Search' component={SearchScreen} 
            options={{
                headerShown: false,
                tabBarLabel:'Search',
                tabBarLabelStyle: {
                    fontSize: 13,
                    fontWeight: '500'
                },
                tabBarIcon: ({focused, color, size}) =>{
                    return(
                        <Ionicons 
                            name={focused ? 'grid' : "search-outline"}
                            size= {size}
                            color= {color}
                        />
                    )
                }
            }}/>
            
            <Tab.Screen name="Account" component={AccountScreen} 
            options={{
                tabBarLabel:'Account',
                tabBarLabelStyle: {
                    fontSize: 13,
                    fontWeight: '500'
                },
                tabBarIcon: ({focused, color, size}) =>{
                    return(
                        <Ionicons 
                            name={focused ? 'person' : "person-outline"}
                            size= {size}
                            color= {color}
                        />
                    )
                }
            }}/>
        </Tab.Navigator>
    );
}
