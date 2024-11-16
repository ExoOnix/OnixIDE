import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface UserState {
    username: string | null;
    setUsername: (newUsername: string) => void;
    clearUsername: () => void;
}

export const useUserStore = create<UserState>()(
    persist(
        (set) => ({
            username: null, // Default value
            setUsername: (newUsername) => set({ username: newUsername }),
            clearUsername: () => set({ username: null }), // Function to reset the username
        }),
        {
            name: "user-storage", // Unique name for the local storage key
            storage: createJSONStorage(() => localStorage), // Use localStorage for persistence
        }
    )
);
