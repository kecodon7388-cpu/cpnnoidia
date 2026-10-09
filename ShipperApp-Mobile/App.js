import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import './src/location'; // đăng ký task GPS chạy nền (bắt buộc ở cấp module)
import { AuthProvider, useAuth } from './src/auth';
import { colors } from './src/theme';
import { Loading } from './src/components/ui';
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import TasksScreen from './src/screens/TasksScreen';
import ScanScreen from './src/screens/ScanScreen';
import CodScreen from './src/screens/CodScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import OrderScreen from './src/screens/OrderScreen';
import DeliverScreen from './src/screens/DeliverScreen';
import FailScreen from './src/screens/FailScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import ChangePasswordScreen from './src/screens/ChangePasswordScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const navTheme = { ...DefaultTheme, colors: { ...DefaultTheme.colors, background: colors.bg, primary: colors.brand } };

const ICONS = { Home: 'home', Tasks: 'list', Cod: 'wallet', Profile: 'person-circle' };

function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.brand,
        tabBarInactiveTintColor: colors.faint,
        tabBarLabelStyle: { fontSize: 11.5, fontWeight: '600' },
        tabBarStyle: { height: Platform.OS === 'ios' ? 88 : 66, paddingTop: 6, paddingBottom: Platform.OS === 'ios' ? 28 : 10, borderTopColor: colors.border },
        tabBarIcon: ({ color, focused, size }) => route.name === 'Scan'
          ? <View style={styles.scanBtn}><Ionicons name="scan" size={26} color="#fff" /></View>
          : <Ionicons name={focused ? ICONS[route.name] : ICONS[route.name] + '-outline'} size={size} color={color} />,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Trang chủ' }} />
      <Tab.Screen name="Tasks" component={TasksScreen} options={{ title: 'Công việc' }} />
      <Tab.Screen name="Scan" component={ScanScreen} options={{ title: '', tabBarLabel: () => null }} />
      <Tab.Screen name="Cod" component={CodScreen} options={{ title: 'COD' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Tài khoản' }} />
    </Tab.Navigator>
  );
}

function Root() {
  const { loading, token } = useAuth();
  if (loading) return <Loading />;
  return (
    <Stack.Navigator screenOptions={{
      headerTintColor: colors.text, headerTitleStyle: { fontWeight: '700' }, headerShadowVisible: false,
      headerStyle: { backgroundColor: '#fff' }, headerBackTitle: 'Quay lại', contentStyle: { backgroundColor: colors.bg },
    }}>
      {!token ? (
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      ) : (
        <>
          <Stack.Screen name="Main" component={Tabs} options={{ headerShown: false }} />
          <Stack.Screen name="Order" component={OrderScreen} options={{ title: 'Chi tiết đơn' }} />
          <Stack.Screen name="Deliver" component={DeliverScreen} options={{ title: 'Xác nhận giao hàng' }} />
          <Stack.Screen name="Fail" component={FailScreen} options={{ title: 'Báo không thành công', presentation: 'modal' }} />
          <Stack.Screen name="History" component={HistoryScreen} options={{ title: 'Lịch sử công việc' }} />
          <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} options={{ title: 'Đổi mật khẩu' }} />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer theme={navTheme}>
          <StatusBar style="dark" />
          <Root />
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  scanBtn: {
    width: 58, height: 58, borderRadius: 20, backgroundColor: colors.brand, alignItems: 'center', justifyContent: 'center', marginTop: -26,
    borderWidth: 4, borderColor: '#fff',
    ...Platform.select({ ios: { shadowColor: colors.brand, shadowOpacity: 0.4, shadowRadius: 10, shadowOffset: { width: 0, height: 6 } }, android: { elevation: 6 } }),
  },
});
