import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, FlatList, RefreshControl, ScrollView, Modal, Pressable, Platform } from 'react-native';
import { LogOut, User, X, ChevronRight, Users, Mail, Lightbulb } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { Colors } from '../theme/colors';
import axios from 'axios';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import IdeaCard from '../components/IdeaCard';

const ProfileScreen = () => {
    const { user, token, logout, setUser, API_URL } = useAuth();
    const navigation = useNavigation();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [fullProfile, setFullProfile] = useState(null);
    const [userIdeas, setUserIdeas] = useState([]);
    const [ideasLoading, setIdeasLoading] = useState(false);

    const [listModalVisible, setListModalVisible] = useState(false);
    const [listType, setListType] = useState('followers'); // 'followers' or 'following'
    const [usersList, setUsersList] = useState([]);
    const [listLoading, setListLoading] = useState(false);

    const fetchData = async () => {
        if (!user) return;
        try {
            const [profileRes, ideasRes] = await Promise.all([
                axios.get(`${API_URL}/users/${user.id}`),
                axios.get(`${API_URL}/users/${user.id}/ideas`)
            ]);
            
            console.log('[ProfileScreen] Profile response:', JSON.stringify(profileRes.data, null, 2));
            
            // Handle Laravel resource response (wrapped in 'data' property)
            const profileData = profileRes.data?.data || profileRes.data;
            console.log('[ProfileScreen] Profile data:', JSON.stringify(profileData, null, 2));
            console.log('[ProfileScreen] Stats:', {
                ideas_count: profileData?.ideas_count,
                followers_count: profileData?.followers_count,
                following_count: profileData?.following_count
            });
            console.log('[ProfileScreen] User from context:', user);
            
            setFullProfile(profileData);
            setUserIdeas(ideasRes.data.data || []);
            
            // Update user context with username if it exists in profile
            if (profileData?.username && (!user.username || profileData.username !== user.username)) {
                setUser({ ...user, username: profileData.username });
            }
        } catch (error) {
            console.error('[ProfileScreen] Error fetching profile data:', error);
            console.error('[ProfileScreen] Error response:', error.response?.data);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchData();
        }, [])
    );


    const fetchUsersList = async (type) => {
        setListType(type);
        setListModalVisible(true);
        setListLoading(true);
        try {
            console.log(`[ProfileScreen] Fetching ${type} for userId:`, user.id);
            const response = await axios.get(`${API_URL}/users/${user.id}/${type}`);
            console.log(`[ProfileScreen] ${type} response:`, JSON.stringify(response.data, null, 2));
            
            // Handle Laravel resource collection response (wrapped in 'data' property)
            const usersData = response.data?.data || response.data || [];
            console.log(`[ProfileScreen] ${type} users data:`, usersData.length, 'users');
            setUsersList(Array.isArray(usersData) ? usersData : []);
        } catch (error) {
            console.error(`[ProfileScreen] Error fetching ${type}:`, error);
            console.error(`[ProfileScreen] Error response:`, error.response?.data);
            Alert.alert('Error', `Could not fetch ${type}`);
            setUsersList([]);
        } finally {
            setListLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
    };

    const handleEditIdea = (idea) => {
        navigation.navigate('CreateIdea', {
            ideaId: idea.id,
            content: idea.content,
        });
    };

    const handleDeleteIdea = async (ideaId) => {
        Alert.alert(
            'Delete Idea',
            'Are you sure you want to delete this idea? This action cannot be undone.',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await axios.delete(`${API_URL}/ideas/${ideaId}`);
                            setUserIdeas(prevIdeas => prevIdeas.filter(idea => idea.id !== ideaId));
                            // Update ideas count in profile
                            if (fullProfile) {
                                setFullProfile({
                                    ...fullProfile,
                                    ideas_count: Math.max(0, (fullProfile.ideas_count || 0) - 1)
                                });
                            }
                            Alert.alert('Success', 'Idea deleted successfully');
                        } catch (error) {
                            Alert.alert('Error', error.response?.data?.message || 'Failed to delete idea');
                        }
                    },
                },
            ]
        );
    };

    const handleLike = async (ideaId) => {
        if (!user || !token) {
            Alert.alert('Authentication Required', 'Please login to like ideas.');
            return;
        }

        try {
            const response = await axios.post(
                `${API_URL}/ideas/${ideaId}/like`,
                {},
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    }
                }
            );
            const { idea: updatedIdea, is_liked, likes_count } = response.data;
            
            setUserIdeas(prevIdeas => 
                prevIdeas.map(idea => {
                    if (idea.id === ideaId) {
                        const newLikesCount = likes_count !== undefined ? likes_count : (updatedIdea?.likes_count ?? idea.likes_count);
                        const newIsLiked = is_liked !== undefined ? is_liked : (updatedIdea?.is_liked ?? idea.is_liked);
                        return { 
                            ...idea, 
                            ...updatedIdea,
                            is_liked: newIsLiked, 
                            likes_count: newLikesCount 
                        };
                    }
                    return idea;
                })
            );
        } catch (error) {
            console.error('Error liking idea:', error);
            if (error.response?.status === 401) {
                Alert.alert('Authentication Error', 'Please login again to like ideas.');
            } else {
                Alert.alert('Error', error.response?.data?.message || 'Failed to like idea. Please try again.');
            }
        }
    };

    const renderHeader = () => {
        // Get username from profile (fetched from API) or user context (from login)
        const displayUsername = fullProfile?.username || user?.username || '';
        
        console.log('[ProfileScreen] Rendering header:', {
            fullProfile: fullProfile,
            fullProfileUsername: fullProfile?.username,
            user: user,
            userUsername: user?.username,
            displayUsername: displayUsername
        });
        
        return (
            <View style={styles.header}>
                <View style={styles.profileCard}>
                    <View style={styles.avatarLarge}>
                        <User color={Colors.secondary} size={40} />
                    </View>

                    <View style={styles.infoSection}>
                        <View style={styles.usernameEmailRow}>
                            <View style={styles.usernameContainer}>
                                <Text style={styles.label}>Username</Text>
                                <Text style={styles.username}>
                                    {displayUsername || (loading ? 'Loading...' : '')}
                                </Text>
                            </View>
                            <View style={styles.emailContainer}>
                                <View style={styles.labelRow}>
                                    <Mail color={Colors.textMuted} size={14} />
                                    <Text style={styles.label}>Email</Text>
                                </View>
                                <Text style={styles.email}>{user?.email || fullProfile?.email || ''}</Text>
                            </View>
                        </View>
                    </View>

                <View style={styles.statsRow}>
                    <TouchableOpacity style={styles.statItem} onPress={() => fetchUsersList('followers')}>
                        <Users color={Colors.primary} size={20} />
                        <Text style={styles.statNumber}>{Number(fullProfile?.followers_count) || 0}</Text>
                        <Text style={styles.statLabel}>Followers</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.statItem} onPress={() => fetchUsersList('following')}>
                        <Users color={Colors.primary} size={20} />
                        <Text style={styles.statNumber}>{Number(fullProfile?.following_count) || 0}</Text>
                        <Text style={styles.statLabel}>Following</Text>
                    </TouchableOpacity>
                    <View style={styles.statItem}>
                        <Lightbulb color={Colors.primary} size={20} />
                        <Text style={styles.statNumber}>{Number(fullProfile?.ideas_count) || 0}</Text>
                        <Text style={styles.statLabel}>Ideas</Text>
                    </View>
                </View>

                    <TouchableOpacity
                        style={styles.logoutButton}
                        onPress={handleLogout}
                        activeOpacity={0.7}
                    >
                        <LogOut color={Colors.error} size={24} />
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={userIdeas}
                keyExtractor={(item) => item.id.toString()}
                ListHeaderComponent={renderHeader}
                renderItem={({ item }) => (
                    <IdeaCard
                        idea={item}
                        isGuest={false}
                        onLike={() => handleLike(item.id)}
                        onComment={() => navigation.navigate('IdeaDetail', { ideaId: item.id, idea: item })}
                        onEdit={() => handleEditIdea(item)}
                        showEdit={true}
                    />
                )}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} tintColor={Colors.primary} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Lightbulb color={Colors.secondary} size={64} style={styles.emptyIcon} />
                        <Text style={styles.emptyText}>No ideas yet.</Text>
                        <Text style={styles.emptySubtext}>Post your first idea to get started!</Text>
                    </View>
                }
            />

            <Modal
                animationType="slide"
                transparent={true}
                visible={listModalVisible}
                onRequestClose={() => setListModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>{listType === 'followers' ? 'Followers' : 'Following'}</Text>
                            <TouchableOpacity onPress={() => setListModalVisible(false)}>
                                <X color={Colors.primary} size={24} />
                            </TouchableOpacity>
                        </View>

                        {listLoading ? (
                            <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 20 }} />
                        ) : (
                            <FlatList
                                data={usersList}
                                keyExtractor={(item) => item.id.toString()}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={styles.userListItem}
                                        onPress={() => {
                                            setListModalVisible(false);
                                            navigation.navigate('UserProfile', { userId: item.id });
                                        }}
                                    >
                                        <View style={styles.userListAvatar}>
                                            <User color={Colors.secondary} size={16} />
                                        </View>
                                        <Text style={styles.userListUsername}>{item.username}</Text>
                                        <ChevronRight color={Colors.border} size={20} />
                                    </TouchableOpacity>
                                )}
                                ListEmptyComponent={
                                    <Text style={styles.emptyListText}>No {listType} yet.</Text>
                                }
                            />
                        )}
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        padding: 16,
        paddingBottom: 40,
    },
    emptyContainer: {
        marginTop: 40,
        alignItems: 'center',
        paddingVertical: 40,
    },
    emptyIcon: {
        marginBottom: 16,
        opacity: 0.5,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.primary,
    },
    emptySubtext: {
        fontSize: 14,
        color: Colors.secondary,
        marginTop: 8,
        textAlign: 'center',
    },
    header: {
        marginBottom: 20,
    },
    profileCard: {
        backgroundColor: Colors.white,
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
        marginBottom: 24,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    avatarLarge: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: Colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    infoSection: {
        width: '100%',
        marginBottom: 15,
    },
    usernameEmailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        width: '100%',
    },
    usernameContainer: {
        flex: 1,
        marginRight: 16,
    },
    emailContainer: {
        flex: 1,
        alignItems: 'flex-end',
    },
    label: {
        fontSize: 12,
        fontWeight: '700',
        color: Colors.textMuted,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 4,
    },
    username: {
        fontSize: 20,
        fontWeight: '700',
        color: Colors.primary,
    },
    email: {
        fontSize: 16,
        color: Colors.secondary,
        textAlign: 'right',
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        marginVertical: 15,
        paddingVertical: 15,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: Colors.border,
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
        gap: 6,
    },
    statNumber: {
        fontSize: 20,
        fontWeight: '800',
        color: Colors.primary,
        marginTop: 4,
    },
    statLabel: {
        fontSize: 12,
        color: Colors.secondary,
        marginTop: 2,
    },
    labelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 4,
    },
    logoutButton: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: Colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
        alignSelf: 'center',
        borderWidth: 2,
        borderColor: Colors.error,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: Colors.white,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        height: '70%',
        padding: 24,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: Colors.primary,
    },
    userListItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    userListAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: Colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    userListUsername: {
        flex: 1,
        fontSize: 16,
        fontWeight: '600',
        color: Colors.text,
    },
    emptyListText: {
        textAlign: 'center',
        marginTop: 40,
        color: Colors.secondary,
        fontStyle: 'italic',
    },
});

export default ProfileScreen;
