import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Lock, ArrowLeft, CheckCircle } from 'lucide-react-native';
import { Colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const ResetPasswordScreen = ({ route, navigation }) => {
    const { email, code } = route.params || {};
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const { API_URL, login } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleResetPassword = async () => {
        setError('');
        
        if (!password || !passwordConfirmation) {
            setError('Please fill in all fields');
            return;
        }

        if (password.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }

        if (password !== passwordConfirmation) {
            setError('Passwords do not match');
            return;
        }

        if (!email || !code) {
            setError('Missing email or code. Please start over.');
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post(`${API_URL}/reset-password`, {
                email,
                code,
                password,
                password_confirmation: passwordConfirmation,
            });

            // Login the user automatically with the returned token
            if (response.data.user && response.data.access_token) {
                await login(response.data.user, response.data.access_token);
                
                // Navigate to global feed (MainTabs)
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'MainTabs' }],
                });
            } else {
                // Fallback if token not returned
                Alert.alert(
                    'Success',
                    'Your password has been reset successfully. Please login with your new password.',
                    [
                        {
                            text: 'OK',
                            onPress: () => {
                                navigation.reset({
                                    index: 0,
                                    routes: [{ name: 'MainTabs' }],
                                });
                            },
                        },
                    ]
                );
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Unable to reset password. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.iconContainer}>
                <Lock color={Colors.primary} size={48} />
            </View>
            <Text style={styles.title}>Reset Password</Text>
            <Text style={styles.subtitle}>
                Enter your new password below.
            </Text>

            <View style={styles.inputWrapper}>
                <Lock color={Colors.secondary} size={20} style={styles.inputIcon} />
                <TextInput
                    style={styles.input}
                    placeholder="New Password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    placeholderTextColor={Colors.textMuted}
                    editable={!loading}
                />
            </View>

            <View style={styles.inputWrapper}>
                <Lock color={Colors.secondary} size={20} style={styles.inputIcon} />
                <TextInput
                    style={styles.input}
                    placeholder="Confirm New Password"
                    value={passwordConfirmation}
                    onChangeText={setPasswordConfirmation}
                    secureTextEntry
                    placeholderTextColor={Colors.textMuted}
                    editable={!loading}
                />
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <TouchableOpacity
                style={[styles.resetButton, loading && { opacity: 0.7 }]}
                onPress={handleResetPassword}
                disabled={loading}
                activeOpacity={0.8}
            >
                {loading ? (
                    <ActivityIndicator color={Colors.white} size={24} />
                ) : (
                    <>
                        <CheckCircle color={Colors.white} size={20} style={styles.buttonIcon} />
                        <Text style={styles.resetButtonText}>Reset Password</Text>
                    </>
                )}
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
                activeOpacity={0.7}
            >
                <ArrowLeft color={Colors.secondary} size={20} />
                <Text style={styles.backButtonText}>Back</Text>
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
        marginBottom: 12,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 14,
        color: Colors.textMuted,
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
    resetButton: {
        backgroundColor: Colors.primary,
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
        flexDirection: 'row',
        gap: 8,
        elevation: 4,
        shadowColor: Colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    buttonIcon: {
        marginRight: 4,
    },
    resetButtonText: {
        color: Colors.white,
        fontSize: 16,
        fontWeight: '700',
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 24,
        paddingVertical: 12,
        gap: 8,
    },
    backButtonText: {
        color: Colors.secondary,
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
});

export default ResetPasswordScreen;

