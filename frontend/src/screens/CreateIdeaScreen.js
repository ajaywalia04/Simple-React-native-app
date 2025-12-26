import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { Send, X, Lightbulb } from 'lucide-react-native';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Colors } from '../theme/colors';

const CreateIdeaScreen = ({ navigation, route }) => {
    const ideaId = route?.params?.ideaId;
    const initialContent = route?.params?.content || '';
    const isEditMode = !!ideaId;
    
    const [content, setContent] = useState(initialContent);
    const [loading, setLoading] = useState(false);
    const { token, API_URL } = useAuth();

    useEffect(() => {
        if (isEditMode && initialContent) {
            setContent(initialContent);
        }
    }, [isEditMode, initialContent]);

    const handleSubmit = async () => {
        if (!content.trim()) {
            Alert.alert('Empty Idea', "You can't create an empty idea.");
            return;
        }

        if (!token) {
            Alert.alert('Authentication Required', 'Please login to create ideas.');
            navigation.navigate('Login');
            return;
        }

        setLoading(true);
        try {
            if (isEditMode) {
                // Update existing idea
                await axios.put(
                    `${API_URL}/ideas/${ideaId}`,
                    { content },
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        }
                    }
                );
            } else {
                // Create new idea
                await axios.post(
                    `${API_URL}/ideas`,
                    { content },
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        }
                    }
                );
            }
            // Force reset to MainTabs to ensure user is redirected to the feed
            navigation.reset({
                index: 0,
                routes: [{ name: 'MainTabs' }],
            });
        } catch (error) {
            if (error.response?.status === 401) {
                Alert.alert('Authentication Error', 'Please login again.');
                navigation.navigate('Login');
            } else {
                Alert.alert('Error', error.response?.data?.message || `Could not ${isEditMode ? 'update' : 'create'} your idea.`);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <TouchableOpacity 
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <X color={Colors.primary} size={24} />
                    </TouchableOpacity>
                    <View style={styles.titleContainer}>
                        <Lightbulb color={Colors.primary} size={24} />
                        <Text style={styles.title}>{isEditMode ? 'Edit Idea' : 'Create Idea'}</Text>
                    </View>
                </View>
                <Text style={styles.charCount}>{content.length}/254</Text>
            </View>

            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Share your idea..."
                    multiline
                    autoFocus
                    maxLength={254}
                    value={content}
                    onChangeText={setContent}
                    placeholderTextColor={Colors.secondary}
                />
            </View>

            <TouchableOpacity
                style={[styles.sendButton, (!content.trim() || loading) && styles.buttonDisabled]}
                onPress={handleSubmit}
                disabled={!content.trim() || loading}
                activeOpacity={0.7}
            >
                {loading ? (
                    <ActivityIndicator color={Colors.white} size={24} />
                ) : (
                    <Send color={Colors.white} size={24} />
                )}
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.white,
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
        paddingTop: 8,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    backButton: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    title: {
        fontSize: 22,
        fontWeight: '800',
        color: Colors.primary,
    },
    charCount: {
        fontSize: 12,
        color: Colors.secondary,
        fontWeight: '600',
    },
    inputContainer: {
        flex: 1,
        marginBottom: 20,
    },
    input: {
        flex: 1,
        fontSize: 18,
        color: Colors.text,
        textAlignVertical: 'top',
        paddingTop: 10,
        minHeight: 200,
    },
    sendButton: {
        backgroundColor: Colors.primary,
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'flex-end',
        elevation: 4,
        shadowColor: Colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    buttonDisabled: {
        opacity: 0.5,
    },
});

export default CreateIdeaScreen;

