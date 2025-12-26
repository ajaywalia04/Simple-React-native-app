import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { UserPlus, Mail, Lock, LogIn } from 'lucide-react-native';
import { Colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const SignupScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, API_URL } = useAuth();
    const [loading, setLoading] = useState(false);

    const handleSignup = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post(`${API_URL}/signup`, { email, password });
            await login(response.data.user, response.data.access_token);
            navigation.reset({
                index: 0,
                routes: [{ name: 'MainTabs' }],
            });
        } catch (error) {
            Alert.alert('Signup Failed', error.response?.data?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.iconContainer}>
                <UserPlus color={Colors.primary} size={48} />
            </View>
            <Text style={styles.title}>Join Simple</Text>
            <Text style={styles.subtitle}>Tell us your email, we'll handle the rest (including your username).</Text>

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
                    placeholder="Password (min 8 characters)"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    placeholderTextColor={Colors.textMuted}
                />
            </View>

            <TouchableOpacity
                style={[styles.signupButton, loading && { opacity: 0.7 }]}
                onPress={handleSignup}
                disabled={loading}
                activeOpacity={0.8}
            >
                {loading ? (
                    <ActivityIndicator color={Colors.white} size={24} />
                ) : (
                    <UserPlus color={Colors.white} size={24} />
                )}
            </TouchableOpacity>

            <TouchableOpacity 
                style={styles.loginButton}
                onPress={() => navigation.navigate('MainTabs', { screen: 'Login' })}
                activeOpacity={0.7}
            >
                <LogIn color={Colors.accent} size={20} />
                <Text style={styles.loginText}>Login</Text>
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
        marginBottom: 10,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 14,
        color: Colors.secondary,
        textAlign: 'center',
        marginBottom: 32,
        paddingHorizontal: 20,
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
    signupButton: {
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
    loginButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 24,
        paddingVertical: 12,
        gap: 8,
    },
    loginText: {
        color: Colors.accent,
        fontSize: 16,
        fontWeight: '600',
    },
});

export default SignupScreen;
