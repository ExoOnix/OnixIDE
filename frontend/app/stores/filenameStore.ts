// store/filenameStore.ts
import { create } from 'zustand';

interface FilenameState {
    filename: string;
    setFilename: (newFilename: string) => void;
}

export const useFilenameStore = create < FilenameState > ((set) => ({
    filename: 'test.txt',
    setFilename: (newFilename) => set({ filename: newFilename }),
}));
