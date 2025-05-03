import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Question, Tag } from '../types/question'; // Fixed import path
import * as FileSystem from 'expo-file-system';

interface QuestionState {
    questions: Question[];
    addQuestion: (audioUri: string, durationMs: number, tags?: Tag[]) => void;
    updateQuestion: (id: string, updates: Partial<Question>) => void;
    archiveQuestion: (id: string) => void;
    deleteQuestion: (id: string) => void;
    /* pending */: () => Question[];
}

export const useQuestionStore = create<QuestionState>()(
    persist(
        (set, get) => ({
            questions: [],

            addQuestion: (audioUri: string, durationMs: number, tags: Tag[] = []) => {
                const newQuestion: Question = {
                    id: Date.now().toString(),
                    audioUri,
                    createdAt: Date.now(),
                    tags,
                    revisitCount: 0,
                    status: 'active',
                    durationMs,
                };
                set((state) => ({ questions: [newQuestion, ...state.questions] }));
            },

            updateQuestion: (id, updates) => {
                set((state) => ({
                    questions: state.questions.map((q) =>
                        q.id === id ? { ...q, ...updates } : q
                    ),
                }));
            },

            archiveQuestion: (id) => {
                set((state) => ({
                    questions: state.questions.map((q) =>
                        q.id === id ? { ...q, status: 'archived' } : q
                    ),
                }));
            },

            deleteQuestion: async (id) => {
                const q = get().questions.find((q) => q.id === id);
                if (q?.audioUri) {
                    try {
                        await FileSystem.deleteAsync(q.audioUri, { idempotent: true });
                    } catch (e) {
                        console.warn('Failed to delete audio file', e);
                    }
                }
                set((state) => ({
                    questions: state.questions.filter((q) => q.id !== id),
                }));
            },

            getWeeklyReviewQuestions: () => {
                const { questions } = get();
                const activeQuestions = questions.filter((q) => q.status === 'active');

                // Simple logic: sort by (createdAt + revisitCount * weight) or random
                // Requirement: "Chosen randomly or by age"
                // Let's mix: 3 oldest, 2 random

                const sortedByAge = [...activeQuestions].sort((a, b) => a.createdAt - b.createdAt);
                const oldest = sortedByAge.slice(0, 3);

                const remaining = activeQuestions.filter(q => !oldest.includes(q));
                const randoms = remaining.sort(() => 0.5 - Math.random()).slice(0, 2);

                return [...oldest, ...randoms];
            },
        }),
        {
            name: 'question-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
