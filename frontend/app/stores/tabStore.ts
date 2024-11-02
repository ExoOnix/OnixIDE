import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface TabState {
    tab: string;
    setTab: (newTab: string) => void;
}

export const useTabStore = create<TabState>()(
    persist(
        (set) => ({
            tab: 'files', // Default initial value
            setTab: (newTab) => set({ tab: newTab }), // Function to update the tab string
        }),
        {
            name: 'tab-storage', // Unique name for the session storage key
            storage: createJSONStorage(() => sessionStorage), // Use sessionStorage instead of localStorage
        }
    )
);
