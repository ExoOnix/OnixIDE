import React from "react";
import { useSettingsStore } from "../stores/settingsStore";
import { Switch } from "@/components/ui/switch";

export const Settings = () => {
    const AICompletions = useSettingsStore((state) => state.AICompletions);
    const setAICompletions = useSettingsStore((state) => state.setAICompletions);

    return (
        <div style={{ color: 'white' }}>
            <div style={{
                height: '20px',
                width: '100%',
                backgroundColor: '#424242',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '10px',
                color: "white"
            }}>
                <span>OnixIDE</span>
            </div>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center', // Center horizontally
                marginTop: '20px' // Optional: add some space above
            }}>
                <Switch
                    checked={AICompletions}
                    onCheckedChange={(checked) => setAICompletions(checked)}
                    id="ai-completions-switch"
                />
                <h6 style={{ marginLeft: '8px', display: 'inline' }}>AutoCompletions</h6>
            </div>
        </div>
    );
};

export default Settings;
