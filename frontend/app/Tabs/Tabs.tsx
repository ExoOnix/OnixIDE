import React from "react";
import { Button } from "@/components/ui/button";

export const Tabs = () => {
    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
            <Button>Button 1</Button>
            <Button>Button 2</Button>
            <Button>Button 3</Button>
        </div>
    );
};

export default Tabs;
