import { useEffect, useRef, useState, useCallback } from 'react';
import { useSocket } from '../Editor/Editor';
import { terminalEvents } from './Terminal';

const initHandleResize = (fitAddon: any, socket: any, terminal: any) => {
    if (fitAddon) {
        fitAddon.fit();
        const { cols, rows } = terminal!;
        socket.emit('terminal.resize', cols, rows);
    }
};

export default function TerminalClient({ terminalId }: { terminalId: any }) {
    const terminalRef = useRef<HTMLDivElement>(null);
    const fitAddon = useRef<any>(null);
    const [isInitialized, setIsInitialized] = useState(false);
    const socket: any = useSocket();
    const terminal = useRef<any>(null);

    // Memoized handleResize function
    const handleResize = useCallback(() => {
        if (fitAddon.current && terminal.current) {
            initHandleResize(fitAddon.current, socket, terminal.current);
        }
    }, [socket]);

    terminalEvents.on('resize', (id) => {
        if (id === terminalId && terminalRef) {
            handleResize();
        }
    });

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

                window.addEventListener('resize', handleResize);
                socket.on("terminal.incomingData", (data: string) => {
                    terminal.current?.write(data);
                });

                terminal.current.onData((data: any) => {
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
    }, [socket, handleResize]);

    return (
        <div
            ref={terminalRef}
            style={{ width: '100%', height: '100%', backgroundColor: 'black' }}
        ></div>
    );
}
