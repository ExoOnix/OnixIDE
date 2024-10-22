
import dynamic from 'next/dynamic';

const TerminalComponent = dynamic(() => import('./TerminalClient'), {
    ssr: false,
});

export default function Terminal() {
    return (
        <div style={{ width: '100%', height: '100%' }}>
            <TerminalComponent />
        </div>
    );
}
