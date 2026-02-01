import React, { useCallback, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, Text, Alert } from 'react-native';
import { RecordButton } from '../../components/RecordButton';
import { RecentList } from '../../components/RecentList';
import { Colors, Layout } from '../../constants/Colors';
import { useAudioRecorder } from '../../hooks/useAudioRecorder';
import { useQuestionStore } from '../../store/questionStore';
import { Audio } from 'expo-av';

export default function HomeScreen() {
    const [playingId, setPlayingId] = React.useState<string | null>(null);

    const {
        startRecording,
        stopRecording,
        isRecording,
        recordingDuration,
        hasPermission
    } = useAudioRecorder();

    const { addQuestion, questions } = useQuestionStore();

    const handleRecordPress = async () => {
        if (isRecording) {
            const result = await stopRecording();
            if (result) {
                addQuestion(result.uri, result.duration);
            }
        } else {
            if (!hasPermission) {
                Alert.alert("Permission required", "Please enable microphone access in settings.");
                return;
            }
            await startRecording();
        }
    };

    const handlePlayQuestion = async (question: any) => {
        if (playingId === question.id) {
            // Stop logic could be here if we kept the sound instance ref
            // For MVP, simplistic toggle or just ignore re-press
            return;
        }

        try {
            setPlayingId(question.id);
            const { sound } = await Audio.Sound.createAsync(
                { uri: question.audioUri },
                { shouldPlay: true }
            );

            sound.setOnPlaybackStatusUpdate((status) => {
                if (status.isLoaded && status.didJustFinish) {
                    setPlayingId(null);
                }
            });

            await sound.playAsync();
        } catch (e) {
            Alert.alert("Error", "Could not play audio file.");
            setPlayingId(null);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.headerContainer}>
                <Text style={styles.title}>Expla</Text>
                <Text style={styles.subtitle}>Capture now. Understand later.</Text>
            </View>

            <View style={styles.recordContainer}>
                <RecordButton
                    isRecording={isRecording}
                    onPress={handleRecordPress}
                    durationMs={recordingDuration}
                />
            </View>

            <View style={styles.listContainer}>
                <RecentList
                    questions={questions}
                    onPlay={handlePlayQuestion}
                    playingId={playingId}
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    headerContainer: {
        paddingHorizontal: Layout.spacing.l,
        paddingTop: Layout.spacing.l,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: Colors.text,
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 16,
        color: Colors.textDim,
    },
    recordContainer: {
        flex: 1,
        justifyContent: 'center',
        minHeight: 250,
    },
    listContainer: {
        flex: 1.5,
        backgroundColor: Colors.background, // Ensure clean transition
    }
});
