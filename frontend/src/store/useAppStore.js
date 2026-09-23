import { create } from "zustand";

const INITIAL_SECONDS = 120;

const useAppStore = create((set) => ({
  file: null,
  uploadMessage: "",
  topics: [],
  selectedTopic: null,
  secondsLeft: INITIAL_SECONDS,
  isTimerRunning: false,
  chatInput: "",
  messages: [],
  isLoading: false,
  
  setFile: (file) => set({ file }),
  setUploadMessage: (uploadMessage) => set({ uploadMessage }),
  setTopics: (topics) => set({ topics, selectedTopic: topics[0] || null }),
  clearTopics: () => set({ topics: [], selectedTopic: null }),
  selectTopic: (selectedTopic) => set({ selectedTopic, secondsLeft: INITIAL_SECONDS, isTimerRunning: false }),
  startPractice: () => set({ secondsLeft: INITIAL_SECONDS, isTimerRunning: false }),
  resetTimer: () => set({ secondsLeft: INITIAL_SECONDS, isTimerRunning: false }),
  setTimer: (secondsLeft) => set({ secondsLeft, isTimerRunning: false }),
  toggleTimer: () => set((state) => ({ isTimerRunning: !state.isTimerRunning })),
  tickTimer: () => set((state) => {
    const secondsLeft = Math.max(state.secondsLeft - 1, 0);
    return { secondsLeft, isTimerRunning: secondsLeft > 0 };
  }),
  setChatInput: (chatInput) => set({ chatInput }),
  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
  setLoading: (isLoading) => set({ isLoading }),
}));

export default useAppStore;