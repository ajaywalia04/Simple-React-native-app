import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, Users, User, LogIn } from 'lucide-react-native';
import GlobalFeedScreen from '../screens/GlobalFeedScreen';
import FollowingFeedScreen from '../screens/FollowingFeedScreen';
import LoginScreen from '../screens/LoginScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { useAuth } from '../context/AuthContext';
import { Colors } from '../theme/colors';

const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => {
    const { user } = useAuth();

    return (
        <Tab.Navigator
            screenOptions={{
                tabBarActiveTintColor: Colors.primary,
                tabBarInactiveTintColor: Colors.secondary,
                tabBarShowLabel: false,
                tabBarStyle: {
                    backgroundColor: Colors.white,
                    borderTopColor: Colors.border,
                    borderTopWidth: 1,
                    height: 70,
                    paddingTop: 8,
                    paddingBottom: 8,
                    elevation: 8,
                    shadowColor: Colors.black,
                    shadowOffset: { width: 0, height: -2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                },
                headerStyle: {
                    backgroundColor: Colors.white,
                    elevation: 0,
                    shadowOpacity: 0,
                    borderBottomWidth: 1,
                    borderBottomColor: Colors.border,
                },
                headerTitleStyle: {
                    fontWeight: '800',
                    color: Colors.primary,
                },
            }}
        >
            <Tab.Screen
                name="Global"
                component={GlobalFeedScreen}
                options={{
                    tabBarIcon: ({ color, focused }) => (
                        <Home 
                            color={color} 
                            size={focused ? 28 : 24} 
                            fill={focused ? color : 'transparent'}
                        />
                    ),
                    title: 'Simple',
                }}
            />

            {user && (
                <Tab.Screen
                    name="Following"
                    component={FollowingFeedScreen}
                    options={{
                        tabBarIcon: ({ color, focused }) => (
                            <Users 
                                color={color} 
                                size={focused ? 28 : 24} 
                                fill={focused ? color : 'transparent'}
                            />
                        ),
                        title: 'Following',
                    }}
                />
            )}

            {user ? (
                <Tab.Screen
                    name="Profile"
                    component={ProfileScreen}
                    options={{
                        tabBarIcon: ({ color, focused }) => (
                            <User 
                                color={color} 
                                size={focused ? 28 : 24} 
                                fill={focused ? color : 'transparent'}
                            />
                        ),
                    }}
                />
            ) : (
                <Tab.Screen
                    name="Login"
                    component={LoginScreen}
                    options={{
                        tabBarIcon: ({ color, focused }) => (
                            <LogIn 
                                color={color} 
                                size={focused ? 28 : 24} 
                                fill={focused ? color : 'transparent'}
                            />
                        ),
                        title: 'Join',
                    }}
                />
            )}
        </Tab.Navigator>
    );
};

export default BottomTabNavigator;
