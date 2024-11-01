import React from "react";
import { Button } from "@/components/ui/button";
import { Folder, Settings } from 'lucide-react';

export const Tabs = () => {
    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
            <button style={{color: "white"}}><Folder /></button>
            <button style={{ color: "white" }}><Settings /></button>
        </div>
    );
};

export default Tabs;
