import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator, Text, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import axios from 'axios';
import { Plus, Lightbulb } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { Colors } from '../theme/colors';
import IdeaCard from '../components/IdeaCard';
import LiveMatches from '../components/LiveMatches';

const GlobalFeedScreen = ({ navigation }) => {
    const [ideas, setIdeas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const { user, token, loading: authLoading, API_URL } = useAuth();
    const flatListRef = useRef(null);
    const isEndReachedRef = useRef(false);

    const fetchIdeas = async (page = 1, append = false) => {
        try {
            // Build query string
            const url = `${API_URL}/ideas?page=${page}`;
            
            console.log('[GlobalFeedScreen] Fetching ideas - URL:', url);
            
            // Axios interceptor will automatically add the token
            const response = await axios.get(url);
            
            // Log full response to debug
            console.log('[GlobalFeedScreen] Full API Response:', JSON.stringify(response.data, null, 2));
            
            // Laravel Resource collection preserves pagination structure
            const newIdeas = response.data.data || [];
            
            // Extract pagination metadata - check multiple possible locations
            const currentPageNum = response.data.current_page ?? response.data.meta?.current_page ?? page;
            const lastPageNum = response.data.last_page ?? response.data.meta?.last_page ?? 1;
            const totalItems = response.data.total ?? response.data.meta?.total ?? 0;
            
            const paginationMeta = {
                currentPage: currentPageNum,
                lastPage: lastPageNum,
                total: totalItems,
            };

            // Calculate hasMore correctly
            const calculatedHasMore = currentPageNum < lastPageNum;
            
            console.log('[GlobalFeedScreen] Fetched ideas:', {
                page,
                received: newIdeas.length,
                currentPage: paginationMeta.currentPage,
                lastPage: paginationMeta.lastPage,
                total: paginationMeta.total,
                hasMore: calculatedHasMore,
                calculation: `${currentPageNum} < ${lastPageNum} = ${calculatedHasMore}`
            });
            
            // If append is false (page 1 or refresh), replace ideas
            // If append is true (loading more), append new ideas
            if (!append) {
                setIdeas(newIdeas);
            } else {
                setIdeas(prevIdeas => {
                    // Prevent duplicates by checking IDs
                    const existingIds = new Set(prevIdeas.map(idea => idea.id));
                    const uniqueNewIdeas = newIdeas.filter(idea => !existingIds.has(idea.id));
                    const combined = [...prevIdeas, ...uniqueNewIdeas];
                    console.log('[GlobalFeedScreen] Appended ideas:', {
                        previous: prevIdeas.length,
                        new: newIdeas.length,
                        unique: uniqueNewIdeas.length,
                        total: combined.length
                    });
                    return combined;
                });
            }

            // Update pagination state AFTER updating ideas
            setCurrentPage(paginationMeta.currentPage);
            setHasMore(calculatedHasMore);
            
            console.log('[GlobalFeedScreen] Updated state:', {
                currentPage: paginationMeta.currentPage,
                hasMore: calculatedHasMore,
                totalIdeas: append ? 'appended' : newIdeas.length
            });
            
            // Reset end reached flag if we successfully loaded
            if (append) {
                setTimeout(() => {
                    isEndReachedRef.current = false;
                }, 500);
            }
        } catch (error) {
            console.error('[GlobalFeedScreen] Error fetching ideas:', error);
            console.error('[GlobalFeedScreen] Error response:', error.response?.data);
            if (!append) {
                Alert.alert('Error', 'Failed to load ideas. Please try again.');
            }
        } finally {
            setLoading(false);
            setRefreshing(false);
            setLoadingMore(false);
        }
    };

    useEffect(() => {
        // Wait for auth to finish loading before making the first request
        if (!authLoading) {
            fetchIdeas(1, false);
        }
    }, [authLoading]);

    // Auto-refresh when screen is active (Instagram-like behavior)
    React.useEffect(() => {
        let intervalId = null;

        const unsubscribeFocus = navigation.addListener('focus', () => {
            if (!authLoading) {
                // Reset to first page when screen comes into focus
                setCurrentPage(1);
                setHasMore(true);
                fetchIdeas(1, false);

                // Start auto-refresh every 30 seconds when screen is active
                intervalId = setInterval(() => {
                    setCurrentPage(1);
                    setHasMore(true);
                    fetchIdeas(1, false);
                }, 30000); // 30 seconds
            }
        });

        const unsubscribeBlur = navigation.addListener('blur', () => {
            // Stop auto-refresh when screen is not active
            if (intervalId) {
                clearInterval(intervalId);
                intervalId = null;
            }
        });

        return () => {
            unsubscribeFocus();
            unsubscribeBlur();
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, [navigation, authLoading]);

    const onRefresh = () => {
        setRefreshing(true);
        setCurrentPage(1);
        setHasMore(true);
        fetchIdeas(1, false);
    };

    const loadMoreIdeas = useCallback(() => {
        // Prevent multiple calls
        if (isEndReachedRef.current) {
            return;
        }
        
        console.log('[GlobalFeedScreen] onEndReached called', {
            hasMore,
            loadingMore,
            loading,
            refreshing,
            currentPage,
            ideasCount: ideas.length
        });
        
        // Only load more if there are more pages and not already loading
        if (hasMore && !loadingMore && !loading && !refreshing) {
            isEndReachedRef.current = true;
            console.log('[GlobalFeedScreen] Loading more ideas - page:', currentPage + 1);
            setLoadingMore(true);
            const nextPage = currentPage + 1;
            fetchIdeas(nextPage, true);
        } else {
            console.log('[GlobalFeedScreen] Skipping load - conditions not met', {
                hasMore,
                loadingMore,
                loading,
                refreshing
            });
        }
    }, [hasMore, loadingMore, loading, refreshing, currentPage]);
    
    const handleScroll = useCallback((event) => {
        const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
        const paddingToBottom = 20;
        const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;
        
        if (isCloseToBottom && hasMore && !loadingMore && !loading && !refreshing) {
            loadMoreIdeas();
        }
    }, [hasMore, loadingMore, loading, refreshing, loadMoreIdeas]);

    const handlePostPress = () => {
        if (!user) {
            navigation.navigate('Login');
        } else {
            navigation.navigate('CreateIdea');
        }
    };

    const handleEdit = (idea) => {
        navigation.navigate('CreateIdea', {
            ideaId: idea.id,
            content: idea.content,
        });
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
            if (error.response?.status === 401) {
                Alert.alert('Authentication Error', 'Please login again to like ideas.');
            } else {
                Alert.alert('Error', error.response?.data?.message || 'Failed to like idea. Please try again.');
            }
        }
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
            <LiveMatches />
            <FlatList
                ref={flatListRef}
                data={ideas}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <IdeaCard
                        idea={item}
                        isGuest={!user}
                        onLike={() => handleLike(item.id)}
                        onComment={() => navigation.navigate('IdeaDetail', { ideaId: item.id, idea: item })}
                        onEdit={() => handleEdit(item)}
                        showEdit={true}
                    />
                )}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
                }
                onEndReached={loadMoreIdeas}
                onEndReachedThreshold={0.5}
                onScroll={handleScroll}
                scrollEventThrottle={400}
                removeClippedSubviews={false}
                initialNumToRender={10}
                maxToRenderPerBatch={10}
                windowSize={10}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Lightbulb color={Colors.secondary} size={64} style={styles.emptyIcon} />
                        <Text style={styles.emptyText}>No ideas yet.</Text>
                        <Text style={styles.emptySubtext}>Be the first to post an idea!</Text>
                    </View>
                }
                ListFooterComponent={
                    loadingMore ? (
                        <View style={styles.footerLoader}>
                            <ActivityIndicator size="small" color={Colors.primary} />
                            <Text style={styles.loadingText}>Loading more ideas...</Text>
                        </View>
                    ) : hasMore && ideas.length > 0 ? (
                        <TouchableOpacity 
                            style={styles.loadMoreButton}
                            onPress={() => {
                                console.log('[GlobalFeedScreen] Manual load more pressed');
                                loadMoreIdeas();
                            }}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.loadMoreButtonText}>Load More Ideas ({currentPage}/{Math.max(currentPage, 1)})</Text>
                        </TouchableOpacity>
                    ) : !hasMore && ideas.length > 0 && currentPage > 1 ? (
                        <View style={styles.footerLoader}>
                            <Text style={styles.endText}>No more ideas to load</Text>
                        </View>
                    ) : null
                }
            />

            {user && (
                <TouchableOpacity style={styles.fab} onPress={handlePostPress}>
                    <Plus color={Colors.white} size={32} />
                </TouchableOpacity>
            )}
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
        paddingBottom: 100,
    },
    emptyContainer: {
        marginTop: 100,
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
    },
    footerLoader: {
        paddingVertical: 20,
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 8,
        color: Colors.secondary,
        fontSize: 12,
    },
    loadMoreHint: {
        color: Colors.textMuted,
        fontSize: 12,
        fontStyle: 'italic',
    },
    loadMoreButton: {
        backgroundColor: Colors.primary,
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        marginVertical: 16,
        alignSelf: 'center',
    },
    loadMoreButtonText: {
        color: Colors.white,
        fontSize: 14,
        fontWeight: '600',
    },
    endText: {
        color: Colors.textMuted,
        fontSize: 12,
        fontStyle: 'italic',
        marginTop: 8,
    },
    fab: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        backgroundColor: Colors.primary,
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 8,
        shadowColor: Colors.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
    },
});

export default GlobalFeedScreen;
