import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { KeyRound, ArrowLeft, CheckCircle } from 'lucide-react-native';
import { Colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const VerifyResetCodeScreen = ({ route, navigation }) => {
    const { email } = route.params || {};
    const [code, setCode] = useState('');
    const { API_URL } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleVerifyCode = async () => {
        setError('');
        
        if (!code || code.length !== 4) {
            setError('Please enter the 4-digit code');
            return;
        }

        if (!email) {
            setError('Email is required');
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post(`${API_URL}/verify-reset-code`, { 
                email, 
                code: code.toUpperCase() 
            });
            
            // Navigate to reset password screen with email and code
            navigation.navigate('ResetPassword', { email, code: code.toUpperCase() });
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid or expired code. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleCodeChange = (text) => {
        // Only allow alphanumeric characters and limit to 4
        const cleaned = text.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 4);
        setCode(cleaned);
    };

    return (
        <View style={styles.container}>
            <View style={styles.iconContainer}>
                <KeyRound color={Colors.primary} size={48} />
            </View>
            <Text style={styles.title}>Enter Reset Code</Text>
            <Text style={styles.subtitle}>
                We've sent a 4-letter code to {email}. Please enter it below.
            </Text>

            <View style={styles.inputWrapper}>
                <KeyRound color={Colors.secondary} size={20} style={styles.inputIcon} />
                <TextInput
                    style={styles.codeInput}
                    placeholder="Enter 4-letter code"
                    value={code}
                    onChangeText={handleCodeChange}
                    autoCapitalize="characters"
                    maxLength={4}
                    placeholderTextColor={Colors.textMuted}
                    editable={!loading}
                />
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <TouchableOpacity
                style={[styles.verifyButton, loading && { opacity: 0.7 }]}
                onPress={handleVerifyCode}
                disabled={loading || code.length !== 4}
                activeOpacity={0.8}
            >
                {loading ? (
                    <ActivityIndicator color={Colors.white} size={24} />
                ) : (
                    <>
                        <CheckCircle color={Colors.white} size={20} style={styles.buttonIcon} />
                        <Text style={styles.verifyButtonText}>Verify Code</Text>
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
    codeInput: {
        flex: 1,
        paddingVertical: 16,
        fontSize: 24,
        fontWeight: '700',
        color: Colors.text,
        letterSpacing: 8,
        textAlign: 'center',
    },
    verifyButton: {
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
    verifyButtonText: {
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

export default VerifyResetCodeScreen;

