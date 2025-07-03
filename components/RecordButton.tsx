import React, { useEffect, useRef } from 'react';
import { View, TouchableOpacity, StyleSheet, Animated, Text } from 'react-native';
import { Mic, Square } from 'lucide-react-native';
import { Colors, Layout } from '../constants/Colors';
import * as Haptics from 'expo-haptics';

interface RecordButtonProps {
    isRecording: boolean;
    onPress: () => void;
    durationMs: number;
}

export const RecordButton: React.FC<RecordButtonProps> = ({ isRecording, onPress, durationMs }) => {
    const scale = useRef(new Animated.Value(1)).current;
    const opacity = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        let animation: Animated.CompositeAnimation;

        if (isRecording) {
            animation = Animated.loop(
                Animated.sequence([
                    Animated.parallel([
                        Animated.timing(scale, { toValue: 1.2, duration: 1000, useNativeDriver: true }),
                        Animated.timing(opacity, { toValue: 0.6, duration: 1000, useNativeDriver: true }),
                    ]),
                    Animated.parallel([
                        Animated.timing(scale, { toValue: 1, duration: 1000, useNativeDriver: true }),
                        Animated.timing(opacity, { toValue: 1, duration: 1000, useNativeDriver: true }),
                    ]),
                ])
            );
            animation.start();
        } else {
            scale.setValue(1);
            opacity.setValue(1);
        }

        return () => animation?.stop();
    }, [isRecording]);

    const handlePress = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        onPress();
    };

    const formatDuration = (ms: number) => {
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    return (
        <View style={styles.container}>
            {isRecording && (
                <Animated.View
                    style={[
                        styles.pulseRing,
                        {
                            transform: [{ scale }],
                            opacity,
                        },
                    ]}
                />
            )}

            <TouchableOpacity
                style={[styles.button, isRecording && styles.buttonIsRecording]}
                onPress={handlePress}
                activeOpacity={0.8}
            >
                {isRecording ? (
                    <Square color="#FFF" size={32} fill="#FFF" />
                ) : (
                    <Mic color="#FFF" size={48} />
                )}
            </TouchableOpacity>

            <Text style={styles.instruction}>
                {isRecording ? formatDuration(durationMs) : "Tap to Capture"}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: Layout.spacing.xxl,
    },
    pulseRing: {
        position: 'absolute',
        width: 140,
        height: 140,
        borderRadius: Layout.borderRadius.circle,
        backgroundColor: Colors.primary,
        opacity: 0.5,
    },
    button: {
        width: 100,
        height: 100,
        borderRadius: Layout.borderRadius.circle,
        backgroundColor: Colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    buttonIsRecording: {
        backgroundColor: Colors.error,
        shadowColor: Colors.error,
    },
    instruction: {
        marginTop: Layout.spacing.m,
        color: Colors.textDim,
        fontSize: 16,
        fontWeight: '500',
        letterSpacing: 0.5,
    }
});
