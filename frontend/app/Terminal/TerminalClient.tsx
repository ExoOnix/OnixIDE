import { useEffect, useRef, useState } from 'react';
import { useSocket } from '../Editor/Editor';

let handleResize: () => void; 

const initHandleResize = (fitAddon, socket, terminal) => {
    if (fitAddon) {
        fitAddon.fit();
        const { cols, rows } = terminal;
        console.log(cols, rows);
        socket.emit('terminal.resize', cols, rows);
    }
};

export default function TerminalClient() {
    const terminalRef = useRef<HTMLDivElement>(null);
    const fitAddon = useRef(null);
    const [isInitialized, setIsInitialized] = useState(false);
    const socket = useSocket();
    const terminal = useRef(null);

    useEffect(() => {
        const loadTerminal = async () => {
            if (typeof window === 'undefined') return;

            const { Terminal: XTerm } = await import('xterm');
            const { FitAddon } = await import('xterm-addon-fit');
            import('xterm/css/xterm.css');

            if (terminalRef.current) {
                terminal.current = new XTerm();
                fitAddon.current = new FitAddon();
                terminal.current.loadAddon(fitAddon.current);
                terminal.current.open(terminalRef.current);

                terminal.current.writeln('Welcome to the OnixIDE terminal!');

                fitAddon.current.fit();
                setIsInitialized(true);

                const handleResize = () => initHandleResize(fitAddon.current, socket, terminal.current);
                window.addEventListener('resize', handleResize);

                socket.on("terminal.incomingData", (data) => {
                    terminal.current?.write(data);
                });

                terminal.current.onData((data) => {
                    socket.emit("terminal.keystroke", data);
                });

                return () => {
                    window.removeEventListener('resize', handleResize);
                    terminal.current?.dispose();
                    socket.off("terminal.incomingData");
                };
            }
        };

        const timeoutId = setTimeout(loadTerminal, 100);

        return () => clearTimeout(timeoutId);
    }, [socket]);

    return (
        <div
            ref={terminalRef}
            style={{ width: '100%', height: '100%', backgroundColor: 'black' }}
        ></div>
    );
}
