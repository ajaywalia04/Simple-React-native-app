import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Mail, KeyRound, ArrowLeft } from 'lucide-react-native';
import { Colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const ForgotPasswordScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const { API_URL } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleForgotPassword = async () => {
        setError('');
        setSuccess(false);
        
        if (!email) {
            setError('Please enter your email address');
            return;
        }

        if (!email.includes('@')) {
            setError('Please enter a valid email address');
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post(`${API_URL}/forgot-password`, { email });
            setSuccess(true);
            // Navigate to code verification screen with email
            navigation.navigate('VerifyResetCode', { email });
        } catch (err) {
            setError(err.response?.data?.message || 'Unable to send password reset code. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.iconContainer}>
                <KeyRound color={Colors.primary} size={48} />
            </View>
            <Text style={styles.title}>Forgot Password</Text>
            <Text style={styles.subtitle}>
                Enter your email address and we'll send you a 4-letter code to reset your password.
            </Text>

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
                    editable={!loading}
                />
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            {success ? <Text style={styles.successText}>Check your email for the reset link!</Text> : null}

            <TouchableOpacity
                style={[styles.submitButton, loading && { opacity: 0.7 }]}
                onPress={handleForgotPassword}
                disabled={loading}
                activeOpacity={0.8}
            >
                {loading ? (
                    <ActivityIndicator color={Colors.white} size={24} />
                ) : (
                    <Text style={styles.submitButtonText}>Send Reset Link</Text>
                )}
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
                activeOpacity={0.7}
            >
                <ArrowLeft color={Colors.secondary} size={20} />
                <Text style={styles.backButtonText}>Back to Login</Text>
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
    submitButton: {
        backgroundColor: Colors.primary,
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
        elevation: 4,
        shadowColor: Colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    submitButtonText: {
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
    successText: {
        color: Colors.success,
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: 10,
    },
});

export default ForgotPasswordScreen;

