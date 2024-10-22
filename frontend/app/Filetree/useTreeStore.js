// useTreeStore.js
import { create } from 'zustand';
import InitialData from './sample-data.json';

const useTreeStore = create((set) => ({
    treeData: InitialData, // Initial tree data
    setTreeData: (data) => set({ treeData: data }), // Function to update tree data
}));

export default useTreeStore;
