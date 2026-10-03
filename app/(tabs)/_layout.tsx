import { Tabs } from 'expo-router';
import { Flame, LayoutDashboard, History, Plus, Settings } from 'lucide-react-native';
import { StyleSheet } from 'react-native';
import { THEME } from '@/lib/constants';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: THEME.primary,
        tabBarInactiveTintColor: THEME.textMuted,
        tabBarLabelStyle: styles.tabBarLabel,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Painel',
          tabBarIcon: ({ size, color }) => (
            <LayoutDashboard size={size} color={color} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="ocorrencias"
        options={{
          title: 'Ocorrências',
          tabBarIcon: ({ size, color }) => (
            <Flame size={size} color={color} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="nova"
        options={{
          title: 'Nova',
          tabBarIcon: ({ size, color }) => (
            <Plus size={size} color={color} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="historico"
        options={{
          title: 'Histórico',
          tabBarIcon: ({ size, color }) => (
            <History size={size} color={color} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="configuracoes"
        options={{
          title: 'Definições',
          tabBarIcon: ({ size, color }) => (
            <Settings size={size} color={color} strokeWidth={2} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#FFFFFF',
    borderTopColor: THEME.border,
    borderTopWidth: 1,
    paddingBottom: 4,
    paddingTop: 4,
    height: 60,
  },
  tabBarLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 11,
    marginTop: 2,
  },
});
