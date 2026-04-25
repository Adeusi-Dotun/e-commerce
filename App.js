import { NavigationContainer } from "@react-navigation/native";
import StackNavigator from "./src/navigation/stackNavigator";
import { AuthProvider } from "./src/context/AuthContext";

const App = () => {
  return (
    <AuthProvider>
    <NavigationContainer>
      <StackNavigator />
    </NavigationContainer>
    </AuthProvider>
  )
}

export default App
