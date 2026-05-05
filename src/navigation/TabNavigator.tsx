import React from 'react';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/HomeScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { TabParamList } from '../types/navigation';
import Icon from 'react-native-vector-icons/Ionicons';

const Tab = createBottomTabNavigator<TabParamList>();

const TabNavigator = () => {
  const insets = useSafeAreaInsets();
  // En Android con botones de navegación gestuales/por botones el inset.bottom
  // ya incluye el espacio necesario. Añadimos 10px extra de padding visual.
  const tabBarHeight = 56 + insets.bottom;
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
            backgroundColor: '#1a1a1a',
            borderTopColor: '#333',
            height: tabBarHeight,
            paddingBottom: insets.bottom + 6,
            paddingTop: 6,
          },
        tabBarActiveTintColor: '#5c5cff',
        tabBarInactiveTintColor: '#666',
        tabBarIcon: ({ color, size }) => {
          let iconName = 'home';
          if (route.name === 'Home') iconName = 'home';
          else if (route.name === 'Favorites') iconName = 'star';
          else if (route.name === 'Profile') iconName = 'person';
          return <Icon name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Inicio' }} />
      <Tab.Screen name="Favorites" component={FavoritesScreen} options={{ title: 'Favoritos' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Perfil' }} />
    </Tab.Navigator>
  );
};

export default TabNavigator;