import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { LogIn, Mail, Lock, UserPlus } from 'lucide-react-native';
import { Colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const LoginScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, API_URL } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async () => {
        setError('');
        if (!email || !password) {
            setError('Please fill in all fields');
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post(`${API_URL}/login`, { email, password });
            await login(response.data.user, response.data.access_token);
            navigation.reset({
                index: 0,
                routes: [{ name: 'MainTabs' }],
            });
        } catch (err) {
            setError(err.response?.data?.message || 'Please enter the correct credentials');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.iconContainer}>
                <LogIn color={Colors.primary} size={48} />
            </View>
            <Text style={styles.title}>Welcome Back</Text>
            
            <View style={styles.inputWrapper}>
                <Mail color={Colors.secondary} size={20} style={styles.inputIcon} />
                <TextInput
                    style={styles.input}
                    placeholder="Email"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    placeholderTextColor={Colors.textMuted}
                />
            </View>

            <View style={styles.inputWrapper}>
                <Lock color={Colors.secondary} size={20} style={styles.inputIcon} />
                <TextInput
                    style={styles.input}
                    placeholder="Password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    placeholderTextColor={Colors.textMuted}
                />
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <TouchableOpacity
                onPress={() => navigation.navigate('ForgotPassword')}
                style={styles.forgotPasswordButton}
                activeOpacity={0.7}
            >
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.loginButton, loading && { opacity: 0.7 }]}
                onPress={handleLogin}
                disabled={loading}
                activeOpacity={0.8}
            >
                {loading ? (
                    <ActivityIndicator color={Colors.white} size={24} />
                ) : (
                    <LogIn color={Colors.white} size={24} />
                )}
            </TouchableOpacity>

            <TouchableOpacity 
                style={styles.signupButton}
                onPress={() => navigation.navigate('Signup')}
                activeOpacity={0.7}
            >
                <UserPlus color={Colors.accent} size={20} />
                <Text style={styles.signupText}>Sign up</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
        padding: 20,
        justifyContent: 'center',
    },
    iconContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: Colors.primary,
        marginBottom: 32,
        textAlign: 'center',
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.white,
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: 12,
        marginBottom: 16,
        paddingHorizontal: 16,
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        paddingVertical: 16,
        fontSize: 16,
        color: Colors.text,
    },
    loginButton: {
        backgroundColor: Colors.primary,
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        marginTop: 8,
        elevation: 4,
        shadowColor: Colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    signupButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 24,
        paddingVertical: 12,
        gap: 8,
    },
    signupText: {
        color: Colors.accent,
        fontSize: 16,
        fontWeight: '600',
    },
    errorText: {
        color: Colors.error,
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: 10,
    },
    forgotPasswordButton: {
        alignSelf: 'flex-end',
        marginBottom: 16,
        paddingVertical: 4,
    },
    forgotPasswordText: {
        color: Colors.accent,
        fontSize: 14,
        fontWeight: '600',
    },
});

export default LoginScreen;
