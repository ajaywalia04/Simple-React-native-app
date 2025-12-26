import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, Modal } from 'react-native';
import axios from 'axios';
import { User, Plus, Check, X, ChevronRight, Lightbulb, Users } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { Colors } from '../theme/colors';
import IdeaCard from '../components/IdeaCard';

const UserProfileScreen = ({ route, navigation }) => {
    const { userId } = route.params;
    const [profile, setProfile] = useState(null);
    const [ideas, setIdeas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [following, setFollowing] = useState(false);
    const [followLoading, setFollowLoading] = useState(false);
    const { user, API_URL } = useAuth();

    const [listModalVisible, setListModalVisible] = useState(false);
    const [listType, setListType] = useState('followers');
    const [usersList, setUsersList] = useState([]);
    const [listLoading, setListLoading] = useState(false);

    const fetchProfile = async () => {
        try {
            console.log('[UserProfileScreen] Fetching profile for userId:', userId);
            const [profileRes, ideasRes] = await Promise.all([
                axios.get(`${API_URL}/users/${userId}`),
                axios.get(`${API_URL}/users/${userId}/ideas`)
            ]);
            
            console.log('[UserProfileScreen] Profile response:', JSON.stringify(profileRes.data, null, 2));
            
            // Handle Laravel resource response (wrapped in 'data' property)
            const profileData = profileRes.data?.data || profileRes.data;
            console.log('[UserProfileScreen] Profile data:', JSON.stringify(profileData, null, 2));
            console.log('[UserProfileScreen] Profile username:', profileData?.username);
            console.log('[UserProfileScreen] Stats:', {
                ideas_count: profileData?.ideas_count,
                followers_count: profileData?.followers_count,
                following_count: profileData?.following_count
            });
            
            setProfile(profileData);
            setIdeas(ideasRes.data.data || []);
            setFollowing(profileData?.is_following || false);
        } catch (error) {
            console.error('[UserProfileScreen] Error fetching profile:', error);
            console.error('[UserProfileScreen] Error response:', error.response?.data);
            Alert.alert('Error', 'Could not load profile');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, [userId]);

    // Debug: Log profile whenever it changes
    useEffect(() => {
        console.log('[UserProfileScreen] Profile state updated:', {
            hasProfile: !!profile,
            profileId: profile?.id,
            username: profile?.username,
            ideas_count: profile?.ideas_count,
            followers_count: profile?.followers_count,
            following_count: profile?.following_count,
            fullProfile: profile
        });
    }, [profile]);

    const fetchUsersList = async (type) => {
        setListType(type);
        setListModalVisible(true);
        setListLoading(true);
        try {
            console.log(`[UserProfileScreen] Fetching ${type} for userId:`, userId);
            const response = await axios.get(`${API_URL}/users/${userId}/${type}`);
            console.log(`[UserProfileScreen] ${type} response:`, JSON.stringify(response.data, null, 2));
            
            // Handle Laravel resource collection response (wrapped in 'data' property)
            const usersData = response.data?.data || response.data || [];
            console.log(`[UserProfileScreen] ${type} users data:`, usersData.length, 'users');
            setUsersList(Array.isArray(usersData) ? usersData : []);
        } catch (error) {
            console.error(`[UserProfileScreen] Error fetching ${type}:`, error);
            console.error(`[UserProfileScreen] Error response:`, error.response?.data);
            Alert.alert('Error', `Could not fetch ${type}`);
            setUsersList([]);
        } finally {
            setListLoading(false);
        }
    };

    const handleFollow = async () => {
        if (!user) {
            navigation.navigate('Login');
            return;
        }

        setFollowLoading(true);
        try {
            const response = await axios.post(`${API_URL}/users/${userId}/follow`);
            setFollowing(response.data.following);
            setProfile(prev => ({
                ...prev,
                followers_count: response.data.following
                    ? prev.followers_count + 1
                    : prev.followers_count - 1
            }));
        } catch (error) {
            Alert.alert('Error', 'Could not update follow status');
        } finally {
            setFollowLoading(false);
        }
    };

    const handleLike = async (ideaId) => {
        try {
            const response = await axios.post(`${API_URL}/ideas/${ideaId}/like`);
            const { idea: updatedIdea, is_liked, likes_count } = response.data;
            
            // Update local state immediately
            setIdeas(prevIdeas => 
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
            // Fallback to refresh on error
            fetchProfile();
        }
    };

    if (loading || !profile) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    // Check if viewing own profile
    const isOwnProfile = user && profile && user.id === profile.id;

    return (
        <View style={styles.container}>
            <FlatList
                data={ideas}
                keyExtractor={(item) => item.id.toString()}
                ListHeaderComponent={
                    <View style={styles.header}>
                        <View style={styles.avatarLarge}>
                            <User color={Colors.secondary} size={40} />
                        </View>
                        <Text style={styles.username}>
                            {profile?.username || (loading ? 'Loading...' : 'User')}
                        </Text>

                        <View style={styles.statsRow}>
                            <View style={styles.statItem}>
                                <Lightbulb color={Colors.primary} size={18} />
                                <Text style={styles.statNumber}>{Number(profile?.ideas_count) || 0}</Text>
                                <Text style={styles.statLabel}>Ideas</Text>
                            </View>
                            <TouchableOpacity style={styles.statItem} onPress={() => fetchUsersList('followers')}>
                                <Users color={Colors.primary} size={18} />
                                <Text style={styles.statNumber}>{Number(profile?.followers_count) || 0}</Text>
                                <Text style={styles.statLabel}>Followers</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.statItem} onPress={() => fetchUsersList('following')}>
                                <Users color={Colors.primary} size={18} />
                                <Text style={styles.statNumber}>{Number(profile?.following_count) || 0}</Text>
                                <Text style={styles.statLabel}>Following</Text>
                            </TouchableOpacity>
                        </View>

                        {!isOwnProfile && user && (
                            <TouchableOpacity
                                style={[
                                    styles.followButton,
                                    following && styles.followingButton,
                                    followLoading && { opacity: 0.7 }
                                ]}
                                onPress={handleFollow}
                                disabled={followLoading}
                            >
                                {followLoading ? (
                                    <ActivityIndicator size="small" color={following ? Colors.primary : Colors.white} />
                                ) : (
                                    <>
                                        {following ? (
                                            <Check color={Colors.primary} size={18} />
                                        ) : (
                                            <Plus color={Colors.white} size={18} />
                                        )}
                                        <Text style={[styles.followButtonText, following && styles.followingButtonText]}>
                                            {following ? 'Following' : 'Follow'}
                                        </Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        )}

                        <Text style={styles.sectionTitle}>Ideas by {profile?.username || 'User'}</Text>
                    </View>
                }
                renderItem={({ item }) => (
                    <IdeaCard
                        idea={item}
                        isGuest={!user}
                        onLike={() => handleLike(item.id)}
                        onComment={() => navigation.navigate('IdeaDetail', { ideaId: item.id, idea: item })}
                    />
                )}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Lightbulb color={Colors.secondary} size={64} style={styles.emptyIcon} />
                        <Text style={styles.emptyText}>No ideas shared yet.</Text>
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
                                keyExtractor={(item) => item?.id?.toString() || Math.random().toString()}
                                renderItem={({ item }) => {
                                    if (!item || !item.id) {
                                        return null;
                                    }
                                    return (
                                        <TouchableOpacity
                                            style={styles.userListItem}
                                            onPress={() => {
                                                setListModalVisible(false);
                                                // Only navigate if it's a different user
                                                if (item.id !== userId) {
                                                    navigation.navigate('UserProfile', { userId: item.id });
                                                }
                                            }}
                                        >
                                            <View style={styles.userListAvatar}>
                                                <User color={Colors.secondary} size={16} />
                                            </View>
                                            <Text style={styles.userListUsername}>{item.username || 'User'}</Text>
                                            <ChevronRight color={Colors.border} size={20} />
                                        </TouchableOpacity>
                                    );
                                }}
                                ListEmptyComponent={
                                    <View style={styles.emptyListContainer}>
                                        <Text style={styles.emptyListText}>No {listType} yet.</Text>
                                    </View>
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
    header: {
        alignItems: 'center',
        paddingVertical: 30,
        backgroundColor: Colors.white,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
        marginBottom: 16,
    },
    avatarLarge: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: Colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
    },
    username: {
        fontSize: 22,
        fontWeight: '800',
        color: Colors.primary,
        marginBottom: 20,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        width: '100%',
        marginBottom: 25,
    },
    statItem: {
        alignItems: 'center',
        marginHorizontal: 20,
        gap: 6,
    },
    statNumber: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.primary,
        marginTop: 4,
    },
    statLabel: {
        fontSize: 12,
        color: Colors.secondary,
        marginTop: 2,
    },
    followButton: {
        backgroundColor: Colors.primary,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 30,
        paddingVertical: 12,
        borderRadius: 25,
        elevation: 3,
        shadowColor: Colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    followingButton: {
        backgroundColor: Colors.white,
        borderWidth: 1,
        borderColor: Colors.primary,
        elevation: 0,
    },
    followButtonText: {
        color: Colors.white,
        fontWeight: '700',
        fontSize: 16,
        marginLeft: 8,
    },
    followingButtonText: {
        color: Colors.primary,
    },
    sectionTitle: {
        width: '100%',
        paddingHorizontal: 20,
        fontSize: 16,
        fontWeight: '700',
        color: Colors.secondary,
        marginTop: 20,
        textAlign: 'left',
    },
    listContent: {
        paddingBottom: 30,
    },
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: 40,
    },
    emptyIcon: {
        marginBottom: 16,
        opacity: 0.5,
    },
    emptyText: {
        textAlign: 'center',
        color: Colors.secondary,
        fontStyle: 'italic',
        fontSize: 14,
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
    emptyListContainer: {
        paddingVertical: 40,
        alignItems: 'center',
    },
    emptyListText: {
        textAlign: 'center',
        color: Colors.secondary,
        fontStyle: 'italic',
        fontSize: 16,
    },
});

export default UserProfileScreen;
