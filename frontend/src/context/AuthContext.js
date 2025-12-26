import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { ENV } from '../config/env';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);
    const tokenRef = React.useRef(null); // Use ref to store token for interceptor

    // Get API URL from environment variables
    const API_URL = ENV.API_URL;

    useEffect(() => {
        loadStorageData();
        
        // Add axios request interceptor that dynamically adds token
        const requestInterceptor = axios.interceptors.request.use(
            async (config) => {
                // First check if token is in the ref (from state)
                let authToken = tokenRef.current;
                
                // If not in ref, try to get from AsyncStorage (for initial requests)
                if (!authToken) {
                    try {
                        authToken = await AsyncStorage.getItem('access_token');
                    } catch (e) {
                        console.error('Error reading token from storage:', e);
                    }
                }
                
                // Add Authorization header if token exists and not already set
                if (authToken && !config.headers.Authorization) {
                    config.headers.Authorization = `Bearer ${authToken}`;
                }
                
                console.log('[Axios Request]', {
                    url: config.url,
                    method: config.method,
                    hasAuthHeader: !!config.headers?.Authorization,
                    authHeader: config.headers?.Authorization ? 
                        config.headers.Authorization.substring(0, 30) + '...' : null,
                });
                
                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );
        
        // Cleanup interceptor on unmount
        return () => {
            axios.interceptors.request.eject(requestInterceptor);
        };
    }, []);

    const loadStorageData = async () => {
        try {
            const storedToken = await AsyncStorage.getItem('access_token');
            const storedUser = await AsyncStorage.getItem('user');

            console.log('[AuthContext] Loading storage data:', {
                hasToken: !!storedToken,
                tokenLength: storedToken?.length,
                tokenPreview: storedToken ? `${storedToken.substring(0, 20)}...` : null,
                hasUser: !!storedUser
            });

            if (storedToken && storedUser) {
                setToken(storedToken);
                tokenRef.current = storedToken; // Update ref for interceptor
                setUser(JSON.parse(storedUser));
                axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
                console.log('[AuthContext] Token set in axios defaults:', {
                    headerSet: !!axios.defaults.headers.common['Authorization'],
                    headerValue: axios.defaults.headers.common['Authorization']?.substring(0, 30) + '...'
                });
            } else {
                console.log('[AuthContext] No token or user found in storage');
            }
        } catch (e) {
            console.error('Failed to load storage data:', e);
        } finally {
            setLoading(false);
        }
    };

    const login = async (userData, userToken) => {
        console.log('[AuthContext] Login called:', {
            userId: userData?.id,
            tokenLength: userToken?.length,
            tokenPreview: userToken ? `${userToken.substring(0, 20)}...` : null
        });
        setUser(userData);
        setToken(userToken);
        tokenRef.current = userToken; // Update ref for interceptor
        await AsyncStorage.setItem('access_token', userToken);
        await AsyncStorage.setItem('user', JSON.stringify(userData));
        axios.defaults.headers.common['Authorization'] = `Bearer ${userToken}`;
        console.log('[AuthContext] Token set after login:', {
            headerSet: !!axios.defaults.headers.common['Authorization'],
            headerValue: axios.defaults.headers.common['Authorization']?.substring(0, 30) + '...'
        });
    };

    const logout = async () => {
        setUser(null);
        setToken(null);
        tokenRef.current = null; // Clear ref
        await AsyncStorage.removeItem('access_token');
        await AsyncStorage.removeItem('user');
        delete axios.defaults.headers.common['Authorization'];
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, logout, setUser, API_URL }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
