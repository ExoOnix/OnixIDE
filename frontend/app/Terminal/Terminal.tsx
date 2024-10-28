import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import EventEmitter from 'events';

const TerminalComponent = dynamic(() => import('./TerminalClient'), {
    ssr: false,
});

// Create a variable to hold the active terminal function
let resizeActiveTerminal: () => void;
export const terminalEvents = new EventEmitter();

export default function Terminal() {
    const [terminals, setTerminals] = useState<{ id: number }[]>([]);
    const [activeTerminal, setActiveTerminal] = useState<number | null>(null);

    useEffect(() => {
        const initialTerminal = { id: Date.now() };
        setTerminals([initialTerminal]);
        setActiveTerminal(initialTerminal.id);
    }, []);

    const addTerminal = () => {
        const newTerminal = { id: Date.now() };
        setTerminals((prev) => [...prev, newTerminal]);
        setActiveTerminal(newTerminal.id); // Set the new terminal as active
        
    };

    const removeTerminal = (id: number) => {
        setTerminals((prev) => prev.filter(terminal => terminal.id !== id));
        if (id === activeTerminal && terminals.length > 1) {
            const remainingTerminals = terminals.filter(terminal => terminal.id !== id);
            setActiveTerminal(remainingTerminals[0]?.id ?? null);
        }
    };

    // Function to resize the active terminal
    resizeActiveTerminal = () => {
        if (activeTerminal !== null) {
            console.log(`Resizing terminal with ID: ${activeTerminal}`);
            terminalEvents.emit('resize', activeTerminal);

        }
    };

    return (
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
            <button
                onClick={addTerminal}
                style={{
                    position: 'absolute',
                    top: '6px',
                    right: '10px',
                    zIndex: 1000,
                    padding: '8px 12px',
                    backgroundColor: '#444',
                    color: '#e0e0e0',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px',
                }}
            >
                New Terminal
            </button>
            <div style={{ display: 'flex', overflowX: 'auto', padding: '10px' }}>
                {terminals.map((terminal) => (
                    <div key={terminal.id} style={{ display: 'flex', alignItems: 'center' }}>
                        <button
                            onClick={() => setActiveTerminal(terminal.id)}
                            style={{
                                backgroundColor: terminal.id === activeTerminal ? '#555' : '#777',
                                color: '#e0e0e0',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '4px 8px',
                                fontSize: '11px',
                                transition: 'background-color 0.2s',
                            }}
                        >
                            Terminal {terminal.id}
                        </button>
                        <button
                            onClick={() => removeTerminal(terminal.id)}
                            style={{
                                backgroundColor: '#999',
                                color: '#e0e0e0',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '4px',
                                fontSize: '11px',
                                transition: 'background-color 0.2s',
                                marginLeft: '4px',
                            }}
                        >
                            ✕
                        </button>
                    </div>
                ))}
            </div>
            <div style={{ height: 'calc(100% - 46px)' }}>
                {terminals.map((terminal) => (
                    <div
                        key={terminal.id}
                        style={{
                            display: terminal.id === activeTerminal ? 'block' : 'none',
                            height: '100%',
                        }}
                    >
                        <TerminalComponent terminalId={terminal.id}/>
                    </div>
                ))}
            </div>
        </div>
    );
}

// Export the function to resize the active terminal
export { resizeActiveTerminal };
