import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { AuthProvider, useAuth } from './src/context/AuthContext';
import { CartProvider } from './src/context/CartContext';

import LoginScreen from './src/screens/LoginScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import CatalogScreen from './src/screens/CatalogScreen';
import CartScreen from './src/screens/CartScreen';
import InquiryHistoryScreen from './src/screens/InquiryHistoryScreen';
import TraderDashboardScreen from './src/screens/TraderDashboardScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Bottom tabs navigation wrapper based on user role
function HomeTabs() {
  const { user } = useAuth();

  if (user?.role === 'trader') {
    return (
      <Tab.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: '#080d1a', borderBottomWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
          headerTintColor: '#ffffff',
          tabBarStyle: { backgroundColor: '#0f172a', borderTopWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
          tabBarActiveTintColor: '#06b6d4',
          tabBarInactiveTintColor: '#64748b',
        }}
      >
        <Tab.Screen name="Dashboard" component={TraderDashboardScreen} options={{ title: 'Trader Dashboard' }} />
        <Tab.Screen name="Catalog" component={CatalogScreen} options={{ title: 'Product Catalog' }} />
      </Tab.Navigator>
    );
  }

  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#080d1a', borderBottomWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
        headerTintColor: '#ffffff',
        tabBarStyle: { backgroundColor: '#0f172a', borderTopWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
        tabBarActiveTintColor: '#06b6d4',
        tabBarInactiveTintColor: '#64748b',
      }}
    >
      <Tab.Screen name="Catalog" component={CatalogScreen} options={{ title: 'Product Catalog' }} />
      <Tab.Screen name="Inquiry Cart" component={CartScreen} options={{ title: 'Cart Checkout' }} />
      <Tab.Screen name="Inquiries" component={InquiryHistoryScreen} options={{ title: 'My Inquiries' }} />
    </Tab.Navigator>
  );
}

// Inner stack manager to switch screens based on auth status
function AppNavigator() {
  const { user } = useAuth();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#080d1a' },
        headerTintColor: '#ffffff',
        cardStyle: { backgroundColor: '#080d1a' },
      }}
    >
      {!user ? (
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      ) : !user.onboardingComplete ? (
        <Stack.Screen name="Onboarding" component={OnboardingScreen} options={{ title: 'Profile Setup', headerLeft: null }} />
      ) : (
        <Stack.Screen name="HomeTabs" component={HomeTabs} options={{ headerShown: false }} />
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <CartProvider>
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
        </CartProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
