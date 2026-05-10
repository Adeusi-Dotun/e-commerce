import { NavigationContainer } from "@react-navigation/native";
import StackNavigator from "./src/navigation/stackNavigator";
import { AuthProvider } from "./src/context/AuthContext";

import { useFonts, Inter_300Light, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold, Inter_800ExtraBold } from '@expo-google-fonts/inter';
import { ActivityIndicator, View } from 'react-native';

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
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#FF6B00" />
      </View>
    );
  }

  return (
    <AuthProvider>
    <NavigationContainer>
      <StackNavigator />
    </NavigationContainer>
    </AuthProvider>
  )
}

export default App
