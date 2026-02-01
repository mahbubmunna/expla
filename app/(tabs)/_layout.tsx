import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';
import { Mic, Calendar } from 'lucide-react-native';

export default function TabLayout() {
    const insets = useSafeAreaInsets();

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: Colors.background,
                    borderTopColor: Colors.border,
                    height: 60 + insets.bottom,
                    paddingBottom: insets.bottom + 8,
                    paddingTop: 8,
                },
                tabBarActiveTintColor: Colors.primary,
                tabBarInactiveTintColor: Colors.textDim,
            }}>
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Capture',
                    tabBarIcon: ({ color }) => <Mic color={color} />,
                }}
            />
            <Tabs.Screen
                name="review"
                options={{
                    title: 'Weekly Review',
                    tabBarIcon: ({ color }) => <Calendar color={color} />,
                }}
            />
        </Tabs>
    );
}
