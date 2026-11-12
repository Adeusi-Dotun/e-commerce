import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import NetInfo from "@react-native-community/netinfo";
import {
  QueryClient,
  QueryClientProvider,
  focusManager,
  onlineManager,
} from "@tanstack/react-query";
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

import { ActivityIndicator, AppState, Platform, View } from "react-native";

// Tell TanStack Query when the phone goes online or offline.
onlineManager.setEventListener((setOnline) =>
  NetInfo.addEventListener((state) => setOnline(Boolean(state.isConnected)))
);

// Refresh stale data when the user comes back to the app.
const onAppStateChange = (status) => {
  if (Platform.OS !== "web") focusManager.setFocused(status === "active");
};

// Created once, outside the component, so it isn't rebuilt on every render.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000, // treat data as fresh for 30 seconds
      retry: 1,
    },
  },
});

const App = () => {
  const [fontsLoaded] = useFonts({
    Inter_300Light,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
  });

  useEffect(() => {
    const subscription = AppState.addEventListener("change", onAppStateChange);
    return () => subscription.remove();
  }, []);

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
      <QueryClientProvider client={queryClient}>
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
      </QueryClientProvider>
    </SafeAreaProvider>
  );
};

export default App;