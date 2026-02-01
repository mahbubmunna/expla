import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, Layout } from '../constants/Colors';
import { Question } from '../types/question';
import { Play, Clock, Square } from 'lucide-react-native';
import { formatDistanceToNow } from 'date-fns';

interface RecentListProps {
    questions: Question[];
    onPlay: (question: Question) => void;
    playingId: string | null;
}

export const RecentList: React.FC<RecentListProps> = ({ questions, onPlay, playingId }) => {
    const renderItem = ({ item }: { item: Question }) => (
        <TouchableOpacity style={styles.item} onPress={() => onPlay(item)}>
            <View style={styles.iconContainer}>
                {playingId === item.id ? (
                    <View style={styles.playingDot} />
                ) : (
                    <Play size={20} color={Colors.secondary} fill={Colors.secondary} />
                )}
            </View>
            <View style={styles.content}>
                <Text style={styles.date}>
                    {formatDistanceToNow(item.createdAt, { addSuffix: true })}
                </Text>
                <Text style={styles.meta}>
                    {item.tags.length > 0 ? item.tags.join(', ') : 'Untagged'} • {item.revisitCount} revisits
                </Text>
            </View>
            <View style={styles.duration}>
                <Text style={styles.durationText}>
                    {item.durationMs ? Math.round(item.durationMs / 1000) + 's' : ''}
                </Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Recent Captures</Text>
            {questions.length === 0 ? (
                <View style={styles.empty}>
                    <Text style={styles.emptyText}>No questions yet. Start asking.</Text>
                </View>
            ) : (
                <FlatList
                    data={questions.slice(0, 5)} // Show only top 5 recent
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: Layout.spacing.l,
    },
    header: {
        fontSize: 20,
        fontWeight: '700',
        color: Colors.text,
        marginBottom: Layout.spacing.m,
        paddingHorizontal: Layout.spacing.m,
    },
    listContent: {
        paddingHorizontal: Layout.spacing.m,
        paddingBottom: 100, // Space for button
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.surface,
        padding: Layout.spacing.m,
        marginBottom: Layout.spacing.s,
        borderRadius: Layout.borderRadius.m,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.background,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: Layout.spacing.m,
    },
    content: {
        flex: 1,
    },
    date: {
        color: Colors.text,
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    meta: {
        color: Colors.textDim,
        fontSize: 12,
    },
    empty: {
        alignItems: 'center',
        padding: Layout.spacing.xl,
    },
    emptyText: {
        color: Colors.textDim,
    },
    duration: {

    },
    durationText: {
        color: Colors.textDim,
        fontSize: 12,
    },
    playingDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: Colors.primary,
    }
});
