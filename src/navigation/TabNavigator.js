import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeScreen from '../screens/HomeScreen';
import CategoriesScreen from '../screens/CategoriesScreen';
import AccountScreen from "../screens/AccountScreen";
import { Ionicons } from '@expo/vector-icons';
import { Pressable, View } from 'react-native';

const Tab = createBottomTabNavigator();

export default function TabNavigator(){

    return(
        <Tab.Navigator>
            <Tab.Screen name= 'Home' component={HomeScreen} 
            options={({ navigation }) => ({
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
                headerRight: () => (
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
                        </View>
                    </Pressable>
                ),
            })} />
            <Tab.Screen name= 'Categories' component={CategoriesScreen} 
            options={{
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