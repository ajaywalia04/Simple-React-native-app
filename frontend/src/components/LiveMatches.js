import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { Colors } from '../theme/colors';
import axios from 'axios';

const LiveMatches = () => {
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const { API_URL } = useAuth();

    const fetchMatches = async () => {
        try {
            const response = await axios.get(`${API_URL}/matches`);
            setMatches(response.data.data || []);
        } catch (error) {
            console.error('Error fetching matches:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Fetch matches immediately on mount
        fetchMatches();

        // Set up auto-refresh every 15 seconds for live scores
        const intervalId = setInterval(() => {
            fetchMatches();
        }, 15000); // 15 seconds - good balance between freshness and server load

        // Cleanup interval on unmount
        return () => {
            clearInterval(intervalId);
        };
    }, []);

    if (loading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="small" color={Colors.primary} />
            </View>
        );
    }

    if (matches.length === 0) {
        return null;
    }

    return (
        <View style={styles.container}>
            <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {matches.map((match) => (
                    <View key={match.id} style={styles.matchCard}>
                        <View style={styles.matchHeader}>
                            <Text style={styles.matchName}>{match.match_name}</Text>
                            <View style={[
                                styles.statusBadge,
                                match.status === 'live' && styles.liveBadge,
                                match.status === 'scheduled' && styles.scheduledBadge
                            ]}>
                                <Text style={[
                                    styles.statusText,
                                    match.status === 'live' && styles.liveText
                                ]}>
                                    {match.status_label || match.status}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.teamsContainer}>
                            <View style={styles.teamRow}>
                                <View style={styles.team}>
                                    <Text style={styles.teamName}>{match.team_a}</Text>
                                    {match.score_a !== null && (
                                        <Text style={styles.score}>
                                            {match.score_a}/{match.wickets_a} ({match.overs_a})
                                        </Text>
                                    )}
                                </View>
                                <Text style={styles.vs}>VS</Text>
                                <View style={styles.team}>
                                    <Text style={styles.teamName}>{match.team_b}</Text>
                                    {match.score_b !== null && (
                                        <Text style={styles.score}>
                                            {match.score_b}/{match.wickets_b} ({match.overs_b})
                                        </Text>
                                    )}
                                </View>
                            </View>
                        </View>
                    </View>
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.white,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
        paddingVertical: 12,
    },
    scrollContent: {
        paddingHorizontal: 16,
        paddingRight: 16,
    },
    matchCard: {
        backgroundColor: Colors.white,
        borderRadius: 12,
        padding: 16,
        marginRight: 12,
        width: 280,
        borderWidth: 1,
        borderColor: Colors.border,
        shadowColor: Colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    matchHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    matchName: {
        fontSize: 12,
        fontWeight: '700',
        color: Colors.primary,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        backgroundColor: Colors.border,
    },
    liveBadge: {
        backgroundColor: '#FF4444',
    },
    scheduledBadge: {
        backgroundColor: Colors.secondary,
    },
    statusText: {
        fontSize: 10,
        fontWeight: '600',
        color: Colors.text,
        textTransform: 'uppercase',
    },
    liveText: {
        color: Colors.white,
    },
    teamsContainer: {
        marginTop: 4,
    },
    teamRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
    },
    team: {
        flex: 1,
        gap: 2,
        alignItems: 'flex-start',
    },
    teamName: {
        fontSize: 13,
        fontWeight: '600',
        color: Colors.text,
    },
    score: {
        fontSize: 11,
        color: Colors.textMuted,
        fontWeight: '500',
    },
    vs: {
        fontSize: 10,
        color: Colors.textMuted,
        fontWeight: '600',
        marginHorizontal: 8,
        alignSelf: 'center',
    },
});

export default LiveMatches;

