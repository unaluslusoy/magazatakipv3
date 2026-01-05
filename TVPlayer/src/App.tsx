import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native';

// Screens
import LoginScreen from '@screens/LoginScreen';
import PlayerScreen from '@screens/PlayerScreen';
import SettingsScreen from '@screens/SettingsScreen';
import { PermissionScreen } from '@screens/PermissionScreen';

// Services
import { initializeApp } from '@services/AppInitializer';
import StorageService from '@services/StorageService';

const Stack = createStackNavigator();

const App = () => {
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const [initialRoute, setInitialRoute] = useState<string | null>(null);

  useEffect(() => {
    if (permissionsGranted) {
      const init = async () => {
        await initializeApp();

        // Startup teşhis logu (sadece logcat): token/deviceCode/route
        try {
          const token = await StorageService.getAuthToken();
          const savedCode = await StorageService.getDeviceCode();
          console.log('[BOOT]', {
            hasToken: !!token,
            tokenExp: token?.expires_at,
            hasDeviceCode: !!savedCode,
          });
        } catch {
          // ignore
        }

        const isLoggedIn = await StorageService.isLoggedIn();
        const route = isLoggedIn ? 'Player' : 'Login';
        console.log('[BOOT] initialRoute=', route);
        setInitialRoute(route);
      };
      init();
    }
  }, [permissionsGranted]);

  if (!permissionsGranted) {
    return <PermissionScreen onPermissionsGranted={() => setPermissionsGranted(true)} />;
  }

  if (!initialRoute) {
    return null; // Or a loading spinner
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName={initialRoute}
            screenOptions={{
              headerShown: false,
              gestureEnabled: false,
            }}>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Player" component={PlayerScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
