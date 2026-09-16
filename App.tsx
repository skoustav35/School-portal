import 'react-native-gesture-handler';
import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
} from '@expo-google-fonts/inter';
import {
  PlayfairDisplay_700Bold,
  PlayfairDisplay_800ExtraBold,
} from '@expo-google-fonts/playfair-display';

import { AppProvider, useApp } from './lib/store';
import { C, F } from './lib/theme';
import { ToastHost } from './components/ui';

import LandingScreen from './screens/LandingScreen';
import AuthScreen from './screens/AuthScreen';
import FeedScreen from './screens/FeedScreen';
import NoticeDetailScreen from './screens/NoticeDetailScreen';
import ComposeScreen from './screens/ComposeScreen';
import StudioScreen from './screens/StudioScreen';
import DraftsScreen from './screens/DraftsScreen';
import BookmarksScreen from './screens/BookmarksScreen';
import ProfileScreen from './screens/ProfileScreen';
import MyNoticesScreen from './screens/MyNoticesScreen';
import AdminDashboardScreen from './screens/AdminDashboardScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function CreatePlaceholder() {
  return null;
}

function Tabs() {
  const { user, unreadCount } = useApp();
  const isStaff = user && user.role !== 'student';

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: C.primary,
        tabBarInactiveTintColor: C.faint,
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopColor: C.line,
          height: Platform.OS === 'web' ? 64 : 82,
          paddingTop: 8,
          paddingBottom: Platform.OS === 'web' ? 10 : 26,
        },
        tabBarLabelStyle: { fontFamily: F.semibold, fontSize: 10.5 },
      }}
    >
      <Tab.Screen
        name="Home"
        component={FeedScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={22} color={color} />
          ),
          tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
          tabBarBadgeStyle: { backgroundColor: C.danger, fontFamily: F.bold, fontSize: 10 },
        }}
      />
      {isStaff ? (
        <Tab.Screen
          name="Drafts"
          component={DraftsScreen}
          options={{
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'documents' : 'documents-outline'} size={22} color={color} />
            ),
          }}
        />
      ) : null}
      {isStaff ? (
        <Tab.Screen
          name="Create"
          component={CreatePlaceholder}
          options={{
            tabBarLabel: '',
            tabBarIcon: () => (
              <View style={ap.createWrap}>
                <LinearGradient colors={['#4F46E5', '#7C3AED']} style={ap.createBtn}>
                  <Ionicons name="add" size={26} color="#fff" />
                </LinearGradient>
              </View>
            ),
          }}
          listeners={({ navigation }) => ({
            tabPress: (e) => {
              e.preventDefault();
              navigation.getParent()?.navigate('Compose', {});
            },
          })}
        />
      ) : null}
      <Tab.Screen
        name="Saved"
        component={BookmarksScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'bookmark' : 'bookmark-outline'} size={21} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'person' : 'person-outline'} size={21} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

function Splash() {
  return (
    <View style={ap.splash}>
      <LinearGradient colors={['#0B1120', '#1E1B4B']} style={StyleSheet.absoluteFill} />
      <LinearGradient colors={['#4F46E5', '#7C3AED']} style={ap.splashLogo}>
        <Ionicons name="school" size={30} color="#fff" />
      </LinearGradient>
      <Text style={ap.splashTxt}>Crestwood Academy</Text>
    </View>
  );
}

function Root() {
  const { booted, user } = useApp();

  if (!booted) return <Splash />;

  return (
    <NavigationContainer
      theme={{
        ...DefaultTheme,
        colors: { ...DefaultTheme.colors, background: C.bg, primary: C.primary },
      }}
    >
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <>
            <Stack.Screen name="Landing" component={LandingScreen} />
            <Stack.Screen name="Auth" component={AuthScreen} options={{ animation: 'slide_from_right' }} />
          </>
        ) : (
          <>
            <Stack.Screen name="Tabs" component={Tabs} />
            <Stack.Screen name="Detail" component={NoticeDetailScreen} options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="Compose" component={ComposeScreen} options={{ animation: 'slide_from_bottom' }} />
            <Stack.Screen name="Studio" component={StudioScreen} options={{ animation: 'slide_from_bottom' }} />
            <Stack.Screen name="MyNotices" component={MyNoticesScreen} options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="Admin" component={AdminDashboardScreen} options={{ animation: 'slide_from_right' }} />
          </>
        )}
      </Stack.Navigator>
      <ToastHost />
    </NavigationContainer>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    ...Ionicons.font,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
    PlayfairDisplay_700Bold,
    PlayfairDisplay_800ExtraBold,
  });

  if (!fontsLoaded) return <Splash />;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AppProvider>
          <StatusBar style="light" />
          <Root />
        </AppProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const ap = StyleSheet.create({
  createWrap: {
    marginTop: -22,
    shadowColor: '#4F46E5',
    shadowOpacity: 0.45,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  createBtn: {
    width: 52,
    height: 52,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#fff',
  },
  splash: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  splashLogo: {
    width: 72,
    height: 72,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  splashTxt: { fontSize: 16, color: '#C7D2FE', fontWeight: '700', letterSpacing: 1 },
});
