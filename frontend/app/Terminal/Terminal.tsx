import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';

const TerminalComponent = dynamic(() => import('./TerminalClient'), {
    ssr: false,
});

export default function Terminal() {
    const [terminals, setTerminals] = useState<{ id: number }[]>([]);
    const [activeTerminal, setActiveTerminal] = useState<number | null>(null);

    useEffect(() => {
        // Initialize with the first terminal after mounting on the client
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
                                // borderRadius: '3px',
                                cursor: 'pointer',
                                padding: '4px 8px',
                                fontSize: '11px',
                                transition: 'background-color 0.2s',
                            }}
                        >
                            Terminal
                        </button>
                        <button
                            onClick={() => removeTerminal(terminal.id)}
                            style={{
                                backgroundColor: '#999',
                                color: '#e0e0e0',
                                border: 'none',
                                // borderRadius: '3px',
                                cursor: 'pointer',
                                padding: '4px',
                                fontSize: '11px',
                                transition: 'background-color 0.2s',
                                marginRight: "4px"
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
                        <TerminalComponent />
                    </div>
                ))}
            </div>
        </div>
    );
}
