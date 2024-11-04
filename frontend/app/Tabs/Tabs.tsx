import React from "react";
import { Button } from "@/components/ui/button";
import { Folder, Settings } from 'lucide-react';
import { useTabStore } from "../stores/tabStore";

export const Tabs = () => {
    const { setTab } = useTabStore();


    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
            <button style={{color: "white"}} onClick={() => setTab("files")}><Folder /></button>
            <button style={{ color: "white" }} onClick={() => setTab("settings")}><Settings /></button>
        </div>
    );
};

export default Tabs;
