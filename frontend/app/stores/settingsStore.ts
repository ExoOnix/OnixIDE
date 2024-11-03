import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface SettingsState {
    AICompletions: boolean;
    setAICompletions: (newAICompletions: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            AICompletions: true, // Default AICompletions
            setAICompletions: (newAICompletions) => set({ AICompletions: newAICompletions }),
        }),
        {
            name: 'settings-storage', // Unique name for the session storage key
            storage: createJSONStorage(() => sessionStorage), // Use sessionStorage instead of localStorage
        }
    )
);
