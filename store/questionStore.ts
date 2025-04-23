import { create } from 'zustand';
export const useQuestionStore = create((set) => ({
  questions: [],
  addQuestion: (uri) => set((s) => ({ questions: [...s.questions, { uri, id: Date.now() }] }))
}));