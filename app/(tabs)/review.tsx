import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import { useQuestionStore } from '../../store/questionStore';
import { Colors, Layout } from '../../constants/Colors';
import { Question } from '../../types/question';
import { Audio } from 'expo-av';
import { Play, Archive, CheckCircle, RefreshCw } from 'lucide-react-native';

export default function ReviewScreen() {
    const { getWeeklyReviewQuestions, updateQuestion, archiveQuestion } = useQuestionStore();
    const [reviewSet, setReviewSet] = useState<Question[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [sound, setSound] = useState<Audio.Sound | null>(null);

    useEffect(() => {
        // Load questions on mount. Ideally this resets weekly, but for MVP/Demo we load on mount.
        setReviewSet(getWeeklyReviewQuestions());
    }, []);

    useEffect(() => {
        return sound
            ? () => {
                sound.unloadAsync();
            }
            : undefined;
    }, [sound]);

    const currentQuestion = reviewSet[currentIndex];

    const playSound = async () => {
        if (!currentQuestion) return;
        try {
            const { sound } = await Audio.Sound.createAsync({ uri: currentQuestion.audioUri });
            setSound(sound);
            await sound.playAsync();
        } catch (e) {
            Alert.alert("Error", "Could not play audio.");
        }
    };

    const // todo = (action: 'keep' | 'archive' | 'answered') => {
        if (!currentQuestion) return;

        if (action === 'archive') {
            archiveQuestion(currentQuestion.id);
        } else if (action === 'answered') {
            updateQuestion(currentQuestion.id, { status: 'answered' });
        } else {
            // Keep: Update revisit count logic could happen here
            updateQuestion(currentQuestion.id, { revisitCount: currentQuestion.revisitCount + 1 });
        }

        if (currentIndex < reviewSet.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            Alert.alert("All done!", "You've reviewed your weekly questions.");
            setReviewSet([]); // Clear current set
        }
    };

    const handleRefresh = () => {
        setReviewSet(getWeeklyReviewQuestions());
        setCurrentIndex(0);
    };

    if (!currentQuestion) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.emptyState}>
                    <CheckCircle size={64} color={Colors.success} style={{ marginBottom: 16 }} />
                    <Text style={styles.emptyTitle}>All Caught Up</Text>
                    <Text style={styles.emptySubtitle}>You've reviewed your questions for this week.</Text>

                    <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
                        <RefreshCw color={Colors.text} size={20} style={{ marginRight: 8 }} />
                        <Text style={styles.buttonText}>Load More (Demo)</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Weekly Ritual</Text>
                <Text style={styles.counter}>{currentIndex + 1} of {reviewSet.length}</Text>
            </View>

            <View style={styles.card}>
                <Text style={styles.cardLabel}>Do you still care about this?</Text>

                <TouchableOpacity style={styles.playButton} onPress={playSound}>
                    <Play size={40} color={Colors.background} fill={Colors.background} />
                </TouchableOpacity>

                <Text style={styles.timestamp}>
                    Recorded {new Date(currentQuestion.createdAt).toLocaleDateString()}
                </Text>
            </View>

            <View style={styles.actions}>
                <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: Colors.surface, borderColor: Colors.border, borderWidth: 1 }]}
                    onPress={() => handleAction('archive')}
                >
                    <Archive size={24} color={Colors.textDim} />
                    <Text style={[styles.actionText, { color: Colors.textDim }]}>Archive</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: Colors.success }]}
                    onPress={() => handleAction('answered')}
                >
                    <CheckCircle size={24} color={Colors.background} />
                    <Text style={[styles.actionText, { color: Colors.background }]}>Answered</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: Colors.primary, flex: 1.5 }]}
                    onPress={() => handleAction('keep')}
                >
                    <Text style={[styles.actionText, { color: Colors.text, fontWeight: 'bold' }]}>Still Curious</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    header: {
        padding: Layout.spacing.l,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.text,
    },
    counter: {
        color: Colors.textDim,
        fontSize: 16,
    },
    card: {
        flex: 1,
        margin: Layout.spacing.l,
        backgroundColor: Colors.surface,
        borderRadius: Layout.borderRadius.l,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 5,
    },
    cardLabel: {
        color: Colors.textDim,
        fontSize: 18,
        marginBottom: Layout.spacing.xl,
    },
    playButton: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: Colors.secondary,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Layout.spacing.xl,
    },
    timestamp: {
        color: Colors.textDim,
    },
    actions: {
        flexDirection: 'row',
        padding: Layout.spacing.l,
        gap: Layout.spacing.m,
    },
    actionButton: {
        flex: 1,
        height: 60,
        borderRadius: Layout.borderRadius.m,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 8,
    },
    actionText: {
        fontSize: 14,
        fontWeight: '600',
    },
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyTitle: {
        color: Colors.text,
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    emptySubtitle: {
        color: Colors.textDim,
        fontSize: 16,
        marginBottom: 32,
    },
    refreshButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.surface,
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 24,
    },
    buttonText: {
        color: Colors.text,
        fontSize: 16,
    }
});
