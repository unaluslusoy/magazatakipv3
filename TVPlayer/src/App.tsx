import React, { useState } from 'react';
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

const Stack = createStackNavigator();

const App = () => {
  const [permissionsGranted, setPermissionsGranted] = useState(false);

  React.useEffect(() => {
    if (permissionsGranted) {
      initializeApp();
    }
  }, [permissionsGranted]);

  if (!permissionsGranted) {
    return <PermissionScreen onPermissionsGranted={() => setPermissionsGranted(true)} />;
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="Login"
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
