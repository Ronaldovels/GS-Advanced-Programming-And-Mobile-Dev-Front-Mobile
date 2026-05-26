import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import React from 'react';
import { Text } from 'react-native';
import AlertsScreen from '../pages/AlertsScreen';
import EventsScreen from '../pages/EventsScreen';
import SensorsScreen from '../pages/SensorsScreen';

const Tab = createBottomTabNavigator();

function Icon({ label, focused }: { label: string; focused: boolean }) {
  const icons: Record<string, string> = {
    Sensores: '📡',
    Eventos: '🛰️',
    Alertas: '🚨',
  };
  return (
    <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5 }}>
      {icons[label] ?? '●'}
    </Text>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused }) => <Icon label={route.name} focused={focused} />,
          tabBarStyle: { backgroundColor: '#1e293b', borderTopColor: '#334155' },
          tabBarActiveTintColor: '#38bdf8',
          tabBarInactiveTintColor: '#64748b',
          tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
          headerStyle: { backgroundColor: '#0f172a' },
          headerTintColor: '#f1f5f9',
          headerTitleStyle: { fontWeight: '700' },
        })}
      >
        <Tab.Screen
          name="Sensores"
          component={SensorsScreen}
          options={{ title: 'Sensores', headerTitle: 'Sensores da Missão' }}
        />
        <Tab.Screen
          name="Eventos"
          component={EventsScreen}
          options={{ title: 'Eventos', headerTitle: 'Eventos Operacionais' }}
        />
        <Tab.Screen
          name="Alertas"
          component={AlertsScreen}
          options={{ title: 'Alertas', headerTitle: 'Alertas Críticos' }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
