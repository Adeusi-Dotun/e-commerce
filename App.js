import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import StackNavigator from "./src/navigation/stackNavigator";
import { AuthProvider } from "./src/context/AuthContext";
import { CartProvider } from "./src/context/CartContext";
import { AddressProvider } from "./src/context/AddressContext";
import { NotificationProvider } from "./src/context/NotificationsContext";

import NotificationBanner from "./src/components/NotificationBanner";

import {
  useFonts,
  Inter_300Light,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
} from "@expo-google-fonts/inter";

import { ActivityIndicator, View } from "react-native";

const App = () => {
  const [fontsLoaded] = useFonts({
    Inter_300Light,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
  });

  if (!fontsLoaded) {
    return (
      <SafeAreaProvider>
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <ActivityIndicator size="large" color="#FF6B00" />
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NotificationProvider>
          <CartProvider>
            <AddressProvider>
              <NavigationContainer>
                <View style={{ flex: 1 }}>
                  <StackNavigator />
                  <NotificationBanner />
                </View>
              </NavigationContainer>
            </AddressProvider>
          </CartProvider>
        </NotificationProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
};

export default App