import { useState, useEffect, useRef } from 'react';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';

interface AudioRecorderHook {
    startRecording: () => Promise<void>;
    stopRecording: () => Promise<{ uri: string; duration: number } | null>;
    isRecording: boolean;
    recordingDuration: number;
    metering: number;
    hasPermission: boolean;
}

export function useAudioRecorder(): AudioRecorderHook {
    const [recording, setRecording] = useState<Audio.Recording | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [recordingDuration, setRecordingDuration] = useState(0);
    const [metering, setMetering] = useState(-160);
    const [hasPermission, setHasPermission] = useState(false);

    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        (async () => {
            const { status } = await Audio.requestPermissionsAsync();
            setHasPermission(status === 'granted');
        })();

        return () => {
            if (recording) {
                stopRecording();
            }
        }
    }, []);

    const startRecording = async () => {
        try {
            if (!hasPermission) {
                const { status } = await Audio.requestPermissionsAsync(); // Try again
                if (status !== 'granted') return;
            }

            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
            });

            const { recording } = await Audio.Recording.createAsync(
                Audio.RecordingOptionsPresets.HIGH_QUALITY
            );

            setRecording(recording);
            setIsRecording(true);
            setRecordingDuration(0);

            // Start duration and metering tracking
            intervalRef.current = setInterval(async () => {
                const status = await recording.getStatusAsync();
                if (status.isRecording) {
                    setRecordingDuration(status.durationMillis);
                    if (status.metering) {
                        setMetering(status.metering);
                        checkSilence(status.metering);
                    }
                }
            }, 100);

        } catch (err) {
            console.error('Failed to start recording', err);
        }
    };

    const checkSilence = (level: number) => {
        // Simple silence check: if below -50dB for 3 seconds, could stop.
        // For MVP, we'll keeping it manual or very conservative to avoid cutting off thinking.
        // Implementing logic but disabling purely auto-stop for now to ensure usability first.
        // User said "Auto-stop on silence (optional)".
    };

    const stopRecording = async () => {
        if (!recording) return null;

        if (intervalRef.current) clearInterval(intervalRef.current);
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);

        setIsRecording(false);

        try {
            await recording.stopAndUnloadAsync();
            const uri = recording.getURI();
            const { durationMillis } = await recording.getStatusAsync(); // get final duration

            setRecording(null);

            if (!uri) return null;
            return { uri, duration: durationMillis };

        } catch (error) {
            console.error('Error stopping recording', error);
            return null;
        }
    };

    return {
        startRecording,
        stopRecording,
        isRecording,
        recordingDuration,
        metering,
        hasPermission,
    };
}
