import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import axios from 'axios';
import { Send, User, MessageCircle, Edit, X, Check } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { Colors } from '../theme/colors';
import IdeaCard from '../components/IdeaCard';

const IdeaDetailScreen = ({ route, navigation }) => {
    const ideaId = route?.params?.ideaId;
    const initialIdea = route?.params?.idea; // Pass idea data directly if available
    const [idea, setIdea] = useState(initialIdea || null);
    const [comments, setComments] = useState([]);
    const [commentText, setCommentText] = useState('');
    const [loading, setLoading] = useState(!initialIdea); // Don't show loading if we have initial data
    const [commentsLoading, setCommentsLoading] = useState(false); // Separate loading state for comments - start as false
    const [sending, setSending] = useState(false);
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editingText, setEditingText] = useState('');
    const [updating, setUpdating] = useState(false);
    const { user, token, loading: authLoading, API_URL } = useAuth();

    // Debug: Log comments whenever they change
    useEffect(() => {
        console.log('[IdeaDetailScreen] Comments state updated:', {
            count: comments.length,
            isArray: Array.isArray(comments),
            firstCommentId: comments[0]?.id,
            allIds: comments.map(c => c?.id)
        });
    }, [comments]);

    const fetchData = async () => {
        if (!ideaId) {
            console.error('No ideaId provided');
            Alert.alert('Error', 'Invalid idea ID');
            setLoading(false);
            return;
        }

        try {
            console.log('[IdeaDetailScreen] Fetching idea:', ideaId);
            setCommentsLoading(true); // Start loading comments
            const [ideaRes, commentsRes] = await Promise.all([
                axios.get(`${API_URL}/ideas/${ideaId}`),
                axios.get(`${API_URL}/ideas/${ideaId}/comments`)
            ]);
            
            // Process IDEA response - be flexible with structure
            console.log('[IdeaDetailScreen] RAW Idea response:', JSON.stringify(ideaRes.data, null, 2));
            let ideaData = ideaRes.data;
            
            // Check if wrapped in data property
            if (ideaData && ideaData.data && ideaData.data.id) {
                ideaData = ideaData.data;
                console.log('[IdeaDetailScreen] Extracted idea from data.data');
            }
            
            // Validate and set idea
            if (ideaData && ideaData.id) {
                if (!ideaData.user) {
                    console.warn('[IdeaDetailScreen] User not loaded in idea data');
                }
                setIdea(ideaData);
                console.log('[IdeaDetailScreen] Idea set successfully:', ideaData.id);
            } else {
                console.warn('[IdeaDetailScreen] Idea response invalid, using initialIdea or keeping current:', {
                    hasIdeaData: !!ideaData,
                    hasId: !!ideaData?.id,
                    hasInitialIdea: !!initialIdea,
                    currentIdea: idea?.id
                });
                // Don't throw error - use initialIdea or keep current idea
                if (initialIdea && initialIdea.id) {
                    setIdea(initialIdea);
                } else if (!idea || !idea.id) {
                    console.error('[IdeaDetailScreen] No valid idea data available');
                    // Still continue to load comments
                }
            }
            
            // Process COMMENTS response - this is working, so process it carefully
            console.log('[IdeaDetailScreen] RAW Comments response:', JSON.stringify(commentsRes.data, null, 2));
            console.log('[IdeaDetailScreen] Comments response type:', typeof commentsRes.data);
            console.log('[IdeaDetailScreen] Is array?', Array.isArray(commentsRes.data));
            console.log('[IdeaDetailScreen] Has data property?', !!commentsRes.data?.data);
            console.log('[IdeaDetailScreen] Response keys:', commentsRes.data ? Object.keys(commentsRes.data) : 'null');
            
            let commentsData = [];
            
            // Try multiple extraction methods
            if (commentsRes.data) {
                // Method 1: Paginated structure { data: [...], links: {...}, meta: {...} }
                if (commentsRes.data.data && Array.isArray(commentsRes.data.data)) {
                    commentsData = commentsRes.data.data;
                    console.log('[IdeaDetailScreen] ✓ Extracted from data.data:', commentsData.length);
                }
                // Method 2: Direct array (non-paginated)
                else if (Array.isArray(commentsRes.data)) {
                    commentsData = commentsRes.data;
                    console.log('[IdeaDetailScreen] ✓ Extracted as direct array:', commentsData.length);
                }
                // Method 3: Check all properties for arrays
                else if (typeof commentsRes.data === 'object') {
                    for (const key of Object.keys(commentsRes.data)) {
                        if (Array.isArray(commentsRes.data[key]) && key !== 'links' && key !== 'meta') {
                            commentsData = commentsRes.data[key];
                            console.log('[IdeaDetailScreen] ✓ Extracted from', key, ':', commentsData.length);
                            break;
                        }
                    }
                }
            }
            
            // Log extracted comments
            console.log('[IdeaDetailScreen] Extracted comments count:', commentsData.length);
            if (commentsData.length > 0) {
                console.log('[IdeaDetailScreen] First comment:', {
                    id: commentsData[0]?.id,
                    content: commentsData[0]?.content?.substring(0, 50),
                    hasUser: !!commentsData[0]?.user,
                    userId: commentsData[0]?.user_id
                });
            } else {
                console.warn('[IdeaDetailScreen] NO COMMENTS EXTRACTED! Full response structure:', {
                    type: typeof commentsRes.data,
                    isArray: Array.isArray(commentsRes.data),
                    keys: commentsRes.data ? Object.keys(commentsRes.data) : null
                });
            }
            
            // Set comments - ensure it's an array and create a new reference
            const finalComments = Array.isArray(commentsData) ? [...commentsData] : [];
            console.log('[IdeaDetailScreen] ✓ Setting comments to state:', finalComments.length);
            setComments(finalComments);
            setCommentsLoading(false); // Comments loaded
        } catch (error) {
            console.error('[IdeaDetailScreen] Error fetching detail data:', error);
            console.error('[IdeaDetailScreen] Error response:', error.response?.data);
            console.error('[IdeaDetailScreen] Error status:', error.response?.status);
            
            if (error.response?.status === 404) {
                Alert.alert('Not Found', 'Idea not found');
            } else {
                Alert.alert('Error', error.response?.data?.message || 'Could not load idea details. Please try again.');
            }
            setLoading(false);
            setCommentsLoading(false); // Stop loading comments on error
        } finally {
            setLoading(false);
            setCommentsLoading(false); // Ensure comments loading is stopped
        }
    };

    useEffect(() => {
        // If we have initial idea data, we still need to fetch fresh data and comments
        // Wait for auth to finish loading and ensure ideaId exists before making the first request
        if (!authLoading) {
            if (ideaId) {
                fetchData();
            } else {
                console.error('[IdeaDetailScreen] No ideaId in route params');
                Alert.alert('Error', 'Invalid idea ID');
                setLoading(false);
            }
        }
    }, [ideaId, authLoading]);

    const handleLike = async () => {
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
            
            // Update local state immediately
            if (updatedIdea) {
                const newLikesCount = likes_count !== undefined ? likes_count : updatedIdea.likes_count;
                const newIsLiked = is_liked !== undefined ? is_liked : updatedIdea.is_liked;
                setIdea({ ...idea, ...updatedIdea, is_liked: newIsLiked, likes_count: newLikesCount });
            } else {
                const newLikesCount = likes_count !== undefined ? likes_count : idea.likes_count;
                const newIsLiked = is_liked !== undefined ? is_liked : idea.is_liked;
                setIdea({ ...idea, is_liked: newIsLiked, likes_count: newLikesCount });
            }
        } catch (error) {
            console.error('Error liking idea:', error);
            if (error.response?.status === 401) {
                Alert.alert('Authentication Error', 'Please login again to like ideas.');
            } else {
                Alert.alert('Error', error.response?.data?.message || 'Failed to like idea. Please try again.');
                // Fallback to refresh on error
                try {
                    const ideaRes = await axios.get(`${API_URL}/ideas/${ideaId}`);
                    setIdea(ideaRes.data);
                } catch (refreshError) {
                    console.error('Error refreshing idea:', refreshError);
                }
            }
        }
    };

    const handlePostComment = async () => {
        const trimmedText = commentText.trim();
        
        if (!trimmedText) {
            return;
        }

        if (!token || !user) {
            Alert.alert('Authentication Required', 'Please login to comment.');
            return;
        }

        if (!ideaId) {
            Alert.alert('Error', 'Invalid idea ID');
            return;
        }

        if (sending) {
            return; // Prevent double submission
        }

        const commentToPost = trimmedText;
        setSending(true);
        
        // Clear text immediately for better UX
        setCommentText('');
        
        try {
            const response = await axios.post(
                `${API_URL}/ideas/${ideaId}/comments`,
                { content: commentToPost },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    }
                }
            );
            
            console.log('[IdeaDetailScreen] Comment POST response:', JSON.stringify(response.data, null, 2));
            
            // CommentResource returns the comment directly (not wrapped in pagination)
            let newComment = response.data;
            
            // Check if wrapped in data property
            if (newComment && newComment.data && newComment.data.id) {
                newComment = newComment.data;
                console.log('[IdeaDetailScreen] Extracted comment from data.data');
            }
            
            // Ensure the comment has all required fields
            if (newComment && newComment.id && newComment.content) {
                // Ensure user object exists (it should be loaded by the service)
                if (!newComment.user && newComment.user_id && user) {
                    // If user is missing but we have user_id and current user, use current user data
                    if (newComment.user_id === user.id) {
                        newComment = {
                            ...newComment,
                            user: {
                                id: user.id,
                                username: user.username
                            }
                        };
                    }
                }
                
                console.log('[IdeaDetailScreen] ✓ New comment ready:', {
                    id: newComment.id,
                    content: newComment.content?.substring(0, 50),
                    hasUser: !!newComment.user,
                    userId: newComment.user_id
                });
                
                // Add the new comment to the beginning of the list
                setComments(prevComments => {
                    // Check if comment already exists to prevent duplicates
                    const exists = prevComments.some(c => c && c.id === newComment.id);
                    if (exists) {
                        console.log('[IdeaDetailScreen] Comment already exists, skipping duplicate');
                        return prevComments;
                    }
                    const updated = [newComment, ...prevComments];
                    console.log('[IdeaDetailScreen] ✓ Comments updated from', prevComments.length, 'to', updated.length);
                    return updated;
                });
                
                // Update idea comment count locally
                setIdea(prevIdea => {
                    if (!prevIdea) {
                        console.error('[IdeaDetailScreen] Idea is null when updating comment count');
                        return prevIdea;
                    }
                    return { 
                        ...prevIdea, 
                        comments_count: (prevIdea.comments_count || 0) + 1 
                    };
                });
                
                // Ensure input is cleared (in case it wasn't)
                setCommentText('');
            } else {
                console.error('[IdeaDetailScreen] Invalid comment response structure:', {
                    hasId: !!newComment?.id,
                    hasContent: !!newComment?.content,
                    response: response.data
                });
                // Restore comment text if failed
                setCommentText(commentToPost);
                Alert.alert('Error', 'Invalid response from server. Please try again.');
            }
        } catch (error) {
            console.error('[IdeaDetailScreen] Error posting comment:', error);
            console.error('[IdeaDetailScreen] Error response:', error.response?.data);
            
            // Restore comment text on error
            setCommentText(commentToPost);
            
            if (error.response?.status === 401) {
                Alert.alert('Authentication Error', 'Please login again to comment.');
            } else {
                Alert.alert('Error', error.response?.data?.message || 'Could not post comment. Please try again.');
            }
        } finally {
            setSending(false);
        }
    };

    const handleEditComment = (comment) => {
        setEditingCommentId(comment.id);
        setEditingText(comment.content || '');
    };

    const handleCancelEdit = () => {
        setEditingCommentId(null);
        setEditingText('');
    };

    const handleUpdateComment = async (commentId) => {
        const trimmedText = editingText.trim();
        
        if (!trimmedText) {
            Alert.alert('Error', 'Comment cannot be empty');
            return;
        }

        if (!token || !user) {
            Alert.alert('Authentication Required', 'Please login to edit comments.');
            return;
        }

        if (updating) {
            return;
        }

        setUpdating(true);

        try {
            const response = await axios.put(
                `${API_URL}/comments/${commentId}`,
                { content: trimmedText },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    }
                }
            );

            let updatedComment = response.data;
            
            // Check if wrapped in data property
            if (updatedComment && updatedComment.data && updatedComment.data.id) {
                updatedComment = updatedComment.data;
            }

            if (updatedComment && updatedComment.id) {
                // Ensure user object exists
                if (!updatedComment.user && updatedComment.user_id && user && updatedComment.user_id === user.id) {
                    updatedComment = {
                        ...updatedComment,
                        user: {
                            id: user.id,
                            username: user.username
                        }
                    };
                }

                // Update comment in the list
                setComments(prevComments =>
                    prevComments.map(comment =>
                        comment.id === commentId ? updatedComment : comment
                    )
                );

                // Cancel edit mode
                setEditingCommentId(null);
                setEditingText('');
            } else {
                throw new Error('Invalid response');
            }
        } catch (error) {
            console.error('[IdeaDetailScreen] Error updating comment:', error);
            if (error.response?.status === 401) {
                Alert.alert('Authentication Error', 'Please login again to edit comments.');
            } else if (error.response?.status === 403) {
                Alert.alert('Unauthorized', 'You can only edit your own comments.');
            } else {
                Alert.alert('Error', error.response?.data?.message || 'Could not update comment. Please try again.');
            }
        } finally {
            setUpdating(false);
        }
    };

    const handleDeleteComment = async (commentId) => {
        Alert.alert(
            'Delete Comment',
            'Are you sure you want to delete this comment?',
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
                            await axios.delete(`${API_URL}/comments/${commentId}`, {
                                headers: {
                                    'Authorization': `Bearer ${token}`,
                                }
                            });
                            setComments(prevComments => prevComments.filter(comment => comment.id !== commentId));
                            // Update idea comment count locally
                            setIdea({ ...idea, comments_count: Math.max(0, (idea.comments_count || 0) - 1) });
                        } catch (error) {
                            Alert.alert('Error', error.response?.data?.message || 'Failed to delete comment');
                        }
                    },
                },
            ]
        );
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    if (!idea || !idea.id) {
        return (
            <View style={styles.center}>
                <Text style={styles.errorText}>Idea not found</Text>
                <TouchableOpacity 
                    style={styles.retryButton}
                    onPress={() => {
                        if (ideaId) {
                            setLoading(true);
                            fetchData();
                        }
                    }}
                >
                    <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={100}
        >
            <FlatList
                data={Array.isArray(comments) ? comments : []}
                extraData={`${comments.length}-${comments.map(c => c?.id || '').join(',')}`}
                keyExtractor={(item, index) => {
                    if (item && item.id) {
                        return `comment-${item.id}`;
                    }
                    return `comment-${index}`;
                }}
                removeClippedSubviews={false}
                initialNumToRender={10}
                maxToRenderPerBatch={10}
                windowSize={10}
                ListHeaderComponent={
                    <View style={styles.header}>
                        {idea && idea.id && (
                            <>
                                <IdeaCard idea={idea} isGuest={!user} onLike={handleLike} />
                                <Text style={styles.commentTitle}>
                                    Comments ({comments?.length || 0})
                                </Text>
                            </>
                        )}
                    </View>
                }
                renderItem={({ item, index }) => {
                    if (!item || !item.id) {
                        return null;
                    }
                    const isCommentOwner = user && item.user_id === user.id;
                    return (
                        <View style={styles.commentItem}>
                            <TouchableOpacity
                                style={styles.avatarSmall}
                                onPress={() => {
                                    if (item.user_id) {
                                        navigation.navigate('UserProfile', { userId: item.user_id });
                                    }
                                }}
                            >
                                <User color={Colors.secondary} size={14} />
                            </TouchableOpacity>
                            <View style={styles.commentContent}>
                                <View style={styles.commentHeader}>
                                    <TouchableOpacity 
                                        onPress={() => {
                                            if (item.user_id) {
                                                navigation.navigate('UserProfile', { userId: item.user_id });
                                            }
                                        }}
                                    >
                                        <Text style={styles.commentUser}>
                                            {item.user?.username || (item.user_id ? `User ${item.user_id}` : 'anonymous')}
                                        </Text>
                                    </TouchableOpacity>
                                    {isCommentOwner && editingCommentId !== item.id && (
                                        <TouchableOpacity
                                            style={styles.commentActionButton}
                                            onPress={() => handleEditComment(item)}
                                            activeOpacity={0.6}
                                        >
                                            <Edit color={Colors.primary} size={16} />
                                        </TouchableOpacity>
                                    )}
                                </View>
                                {editingCommentId === item.id ? (
                                    <View style={styles.editCommentContainer}>
                                        <TextInput
                                            style={styles.editCommentInput}
                                            value={editingText}
                                            onChangeText={setEditingText}
                                            multiline
                                            placeholderTextColor={Colors.textMuted}
                                            editable={!updating}
                                        />
                                        <View style={styles.editCommentActions}>
                                            <TouchableOpacity
                                                style={[styles.editActionButton, styles.cancelButton]}
                                                onPress={handleCancelEdit}
                                                disabled={updating}
                                                activeOpacity={0.6}
                                            >
                                                <X color={Colors.error} size={18} />
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                style={[styles.editActionButton, styles.saveButton, !editingText.trim() && { opacity: 0.5 }]}
                                                onPress={() => handleUpdateComment(item.id)}
                                                disabled={updating || !editingText.trim()}
                                                activeOpacity={0.6}
                                            >
                                                {updating ? (
                                                    <ActivityIndicator size="small" color={Colors.white} />
                                                ) : (
                                                    <Check color={Colors.white} size={18} />
                                                )}
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                ) : (
                                    <Text style={styles.commentText}>{item.content || 'No content'}</Text>
                                )}
                            </View>
                        </View>
                    );
                }}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    commentsLoading ? (
                        <View style={styles.emptyCommentsContainer}>
                            <ActivityIndicator size="large" color={Colors.primary} />
                            <Text style={styles.emptyComments}>Loading comments...</Text>
                        </View>
                    ) : comments.length === 0 ? (
                        <View style={styles.emptyCommentsContainer}>
                            <MessageCircle color={Colors.secondary} size={64} style={styles.emptyIcon} />
                            <Text style={styles.emptyComments}>No comments yet. Start the conversation!</Text>
                        </View>
                    ) : null
                }
            />

            {user && (
                <View style={styles.inputContainer}>
                    <View style={styles.inputWrapper}>
                        <MessageCircle color={Colors.secondary} size={18} style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Write a comment..."
                            value={commentText}
                            onChangeText={(text) => {
                                if (!sending) {
                                    setCommentText(text);
                                }
                            }}
                            multiline
                            placeholderTextColor={Colors.textMuted}
                            onSubmitEditing={(e) => {
                                e.preventDefault();
                                const trimmed = commentText.trim();
                                if (trimmed && !sending) {
                                    handlePostComment();
                                }
                            }}
                            blurOnSubmit={false}
                            returnKeyType="send"
                            editable={!sending}
                            keyboardType="default"
                        />
                    </View>
                    <TouchableOpacity
                        style={[styles.sendButton, !commentText.trim() && { opacity: 0.5 }]}
                        onPress={handlePostComment}
                        disabled={sending || !commentText.trim()}
                        activeOpacity={0.7}
                    >
                        {sending ? <ActivityIndicator size="small" color={Colors.white} /> : <Send color={Colors.white} size={20} />}
                    </TouchableOpacity>
                </View>
            )}
        </KeyboardAvoidingView>
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
    },
    header: {
        marginBottom: 16,
    },
    commentTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.primary,
        marginTop: 8,
        marginBottom: 16,
    },
    commentItem: {
        flexDirection: 'row',
        marginBottom: 20,
        backgroundColor: Colors.white,
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    avatarSmall: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: Colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    commentContent: {
        flex: 1,
    },
    commentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    commentUser: {
        fontSize: 13,
        fontWeight: '700',
        color: Colors.primary,
    },
    commentActions: {
        flexDirection: 'row',
        gap: 8,
    },
    commentActionButton: {
        padding: 4,
    },
    editCommentContainer: {
        marginTop: 8,
    },
    editCommentInput: {
        backgroundColor: Colors.background,
        borderRadius: 8,
        padding: 10,
        fontSize: 15,
        color: Colors.text,
        borderWidth: 1,
        borderColor: Colors.border,
        minHeight: 60,
        textAlignVertical: 'top',
    },
    editCommentActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 8,
        marginTop: 8,
    },
    editActionButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: Colors.background,
        borderWidth: 1,
        borderColor: Colors.error,
    },
    saveButton: {
        backgroundColor: Colors.primary,
    },
    commentText: {
        fontSize: 15,
        color: Colors.text,
        lineHeight: 20,
    },
    emptyCommentsContainer: {
        alignItems: 'center',
        paddingVertical: 40,
        marginTop: 20,
    },
    emptyIcon: {
        marginBottom: 16,
        opacity: 0.5,
    },
    emptyComments: {
        textAlign: 'center',
        color: Colors.secondary,
        fontStyle: 'italic',
        fontSize: 14,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        padding: 12,
        backgroundColor: Colors.white,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
        gap: 10,
    },
    inputWrapper: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.background,
        borderRadius: 24,
        paddingHorizontal: 16,
        paddingVertical: 8,
        minHeight: 44,
    },
    inputIcon: {
        marginRight: 8,
    },
    input: {
        flex: 1,
        fontSize: 15,
        color: Colors.text,
        maxHeight: 100,
        paddingVertical: 4,
    },
    sendButton: {
        backgroundColor: Colors.primary,
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        fontSize: 16,
        color: Colors.error,
        textAlign: 'center',
        marginBottom: 16,
    },
    retryButton: {
        backgroundColor: Colors.primary,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
        marginTop: 16,
    },
    retryButtonText: {
        color: Colors.white,
        fontSize: 16,
        fontWeight: '600',
    },
});

export default IdeaDetailScreen;
