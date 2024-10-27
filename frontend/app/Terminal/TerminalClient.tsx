import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { useSocket } from '../Editor/Editor';

const initHandleResize = (fitAddon: any, socket: any, terminal: any) => {
    if (fitAddon) {
        fitAddon.fit();
        const { cols, rows } = terminal!;
        console.log(cols, rows);
        socket.emit('terminal.resize', cols, rows);
    }
};

const TerminalClient = forwardRef((_, ref) => {
    const terminalRef = useRef<HTMLDivElement>(null);
    const fitAddon = useRef<any>(null);
    const [isInitialized, setIsInitialized] = useState(false);
    const socket: any = useSocket();
    const terminal = useRef<any>(null);

    useImperativeHandle(ref, () => ({
        resize: () => {
            initHandleResize(fitAddon.current, socket, terminal.current);
        },
    }));

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

                // Call resize function on window resize
                const handleResize = () => initHandleResize(fitAddon.current, socket, terminal.current);
                window.addEventListener('resize', handleResize);
                handleResize(); // Call once to initialize

                socket.on("terminal.incomingData", (data: string) => {
                    terminal.current?.write(data);
                });

                terminal.current.onData((data: any) => {
                    socket.emit("terminal.keystroke", data);
                });

                return () => {
                    window.removeEventListener('resize', handleResize); // Clean up listener
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
});

export default TerminalClient;
