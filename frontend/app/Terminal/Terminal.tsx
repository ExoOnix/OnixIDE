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
        // If the removed terminal is active, switch to another terminal
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
                    top: '10px',
                    right: '10px',
                    zIndex: 1000,
                    padding: '10px 15px',
                    backgroundColor: '#007bff',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer'
                }}
            >
                New Terminal
            </button>
            <div style={{ display: 'flex', overflowX: 'auto', padding: '10px' }}>
                {terminals.map((terminal) => (
                    <div key={terminal.id} style={{ display: 'flex', alignItems: 'center', marginRight: '10px' }}>
                        <button
                            onClick={() => setActiveTerminal(terminal.id)}
                            style={{
                                backgroundColor: terminal.id === activeTerminal ? '#007bff' : '#6c757d',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '3px',
                                cursor: 'pointer',
                                padding: '5px 10px'
                            }}
                        >
                            Terminal {terminal.id}
                        </button>
                        <button
                            onClick={() => removeTerminal(terminal.id)}
                            style={{
                                backgroundColor: '#dc3545',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '3px',
                                cursor: 'pointer',
                                padding: '5px',
                                marginLeft: '5px'
                            }}
                        >
                            Close
                        </button>
                    </div>
                ))}
            </div>
            <div style={{ height: 'calc(100% - 70px)', overflowY: 'auto' }}>
                {terminals.map((terminal) =>
                    terminal.id === activeTerminal ? (
                        <div key={terminal.id} style={{ height: '100%' }}>
                            <TerminalComponent />
                        </div>
                    ) : null
                )}
            </div>
        </div>
    );
}
