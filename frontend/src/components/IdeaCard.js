import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Heart, MessageCircle, User, Trash2, Edit } from 'lucide-react-native';
import { Colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';

const IdeaCard = ({ idea, onLike, onComment, onDelete, onEdit, isGuest, showDelete = false, showEdit = false }) => {
    const navigation = useNavigation();
    const { user } = useAuth();
    const [liked, setLiked] = React.useState(idea.is_liked);
    const [count, setCount] = React.useState(idea.likes_count || 0);
    
    // Check if current user owns this idea
    const isOwner = user && idea.user_id === user.id;

    // Sync state when props change (on refresh)
    React.useEffect(() => {
        setLiked(idea.is_liked ?? false);
        setCount(idea.likes_count ?? 0);
    }, [idea.is_liked, idea.likes_count, idea.id]);

    const handleLike = () => {
        if (onLike) {
            onLike();
            // State will be updated via useEffect when parent updates idea prop
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.userContainer}
                    onPress={() => navigation.navigate('UserProfile', { userId: idea.user_id })}
                    activeOpacity={0.7}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <View style={styles.avatar}>
                        <User color={Colors.secondary} size={16} />
                    </View>
                    <Text style={styles.username}>{idea.user?.username || 'anonymous'}</Text>
                </TouchableOpacity>
                <View style={styles.headerRight}>
                    {showEdit && isOwner && onEdit && (
                        <TouchableOpacity
                            style={styles.editButton}
                            onPress={onEdit}
                            activeOpacity={0.6}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                            <Edit color={Colors.primary} size={18} />
                        </TouchableOpacity>
                    )}
                    {showDelete && isOwner && onDelete && (
                        <TouchableOpacity
                            style={styles.deleteButton}
                            onPress={onDelete}
                            activeOpacity={0.6}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                            <Trash2 color={Colors.error} size={18} />
                        </TouchableOpacity>
                    )}
                    <Text style={styles.time}>{new Date(idea.created_at).toLocaleDateString()}</Text>
                </View>
            </View>

            <Text style={styles.content}>{idea.content}</Text>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={isGuest ? null : handleLike}
                    disabled={isGuest}
                    activeOpacity={0.6}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <Heart color={liked ? Colors.error : Colors.secondary} size={22} fill={liked ? Colors.error : 'transparent'} />
                    <Text style={[styles.actionText, liked && { color: Colors.error }]}>{count}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={onComment}
                    activeOpacity={0.6}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <MessageCircle color={Colors.secondary} size={22} />
                    <Text style={styles.actionText}>{idea.comments_count || 0}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.white,
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: Colors.border,
        shadowColor: Colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    userContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: Colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    username: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.primary,
    },
    time: {
        fontSize: 12,
        color: Colors.textMuted,
    },
    content: {
        fontSize: 16,
        lineHeight: 24,
        color: Colors.text,
        marginBottom: 16,
    },
    footer: {
        flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: Colors.border,
        paddingTop: 12,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 24,
        paddingVertical: 4,
        paddingHorizontal: 4,
        minHeight: 44,
        minWidth: 44,
        justifyContent: 'center',
    },
    actionText: {
        fontSize: 14,
        color: Colors.secondary,
        marginLeft: 8,
        fontWeight: '600',
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    editButton: {
        padding: 4,
    },
    deleteButton: {
        padding: 4,
    },
});

export default IdeaCard;
