'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import CodeMirror from '@uiw/react-codemirror';

import { sublime } from '@uiw/codemirror-theme-sublime';
import { indentUnit } from '@codemirror/language';
import { basicSetup } from '@uiw/codemirror-extensions-basic-setup';
import { ViewPlugin } from '@codemirror/view';
import { Text, ChangeSet } from '@codemirror/state';
import { receiveUpdates, sendableUpdates, collab, getSyncedVersion } from '@codemirror/collab';
import { io } from 'socket.io-client';
import { emitGetFiles } from '../Filetree/Tree';
import { loadLanguage, langNames, langs } from '@uiw/codemirror-extensions-langs';
import { loadLanguageExtensions } from './extensions';


// Helper functions
const pushUpdates = (socket, filename, version, fullUpdates) => {
    const updates = fullUpdates.map(u => ({
        clientID: u.clientID,
        changes: u.changes.toJSON(),
        effects: u.effects
    }));
    return new Promise((resolve) => {
        socket.emit('pushUpdates', filename, version, JSON.stringify(updates));
        socket.once('pushUpdateResponse', (status) => {
            resolve(status);
        });
    });
};

const pullUpdates = (socket, filename, version) => {
    return new Promise((resolve) => {
        socket.emit('pullUpdates', filename, version);
        socket.once('pullUpdateResponse', (updates) => {
            const parsedUpdates = JSON.parse(updates);
            resolve(parsedUpdates.map(u => ({
                changes: ChangeSet.fromJSON(u.changes),
                clientID: u.clientID,
                effects: u.effects
            })));
        });
    });
};

const getDocument = (socket, filename) => {
    return new Promise((resolve) => {
        socket.emit('getDocument', filename);
        socket.once('getDocumentResponse', (version, doc) => {
            resolve({
                version,
                doc: Text.of(doc.split("\n"))
            });
        });
    });
};

// Peer extension logic
const peerExtension = (socket, filename, startVersion) => {
    const plugin = ViewPlugin.fromClass(class {
        constructor(view) {
            this.view = view;
            this.pushing = false;
            this.done = false;
            this.pull();
        }

        update(update) {
            if (update.docChanged || update.transactions.length) {
                this.push();
            }
        }

        async push() {
            const updates = sendableUpdates(this.view.state);
            if (this.pushing || !updates.length) return;
            this.pushing = true;
            const version = getSyncedVersion(this.view.state);
            await pushUpdates(socket, filename, version, updates);
            this.pushing = false;
            if (sendableUpdates(this.view.state).length) {
                setTimeout(() => this.push(), 100);
            }
        }

        async pull() {
            while (!this.done) {
                const version = getSyncedVersion(this.view.state);
                const updates = await pullUpdates(socket, filename, version);
                try {
                    this.view.dispatch(receiveUpdates(this.view.state, updates));
                } catch(err) {
                    console.error(err)
                }
            }
        }

        destroy() {
            this.done = true;
        }
    });

    return [collab({ startVersion }), plugin];
};

// Memoize socket creation
const useSocket = () => {
    const socketRef = useRef(null);

    if (!socketRef.current) {
        socketRef.current = io(`${process.env.NEXT_PUBLIC_BACKEND_URI}`, { path: '/ws' });
    }

    return socketRef.current;
};

const Home = ({ filename }) => {
    const [code, setCode] = useState(null);
    const [version, setVersion] = useState(null);
    const socket = useSocket();

    useEffect(() => {
        const handleConnect = () => {
            getDocument(socket, filename).then(({ version, doc }) => {
                setCode(doc.toString());
                setVersion(version);
            });
        };

        socket.on('connect', handleConnect);


        if (socket.connected) {
            handleConnect();
        }

        return () => {
            socket.off('connect', handleConnect);
        };
    }, [filename, socket]);

    if (code === null || version === null) {
        return <div>Loading...</div>;
    }

    return (
        <main>
            <EditorComponent filename={filename} code={code} version={version} socket={socket} />
        </main>
    );
};

const EditorComponent = ({ filename, code, version, socket }) => {
    const extensions = useMemo(() => [
        indentUnit.of("\t"),
        basicSetup(),
        ...loadLanguageExtensions(filename),  // Load extensions from helper
        ...peerExtension(socket, filename, version)
    ], [socket, filename, version]);


    return (
        <div>
        <CodeMirror
            value={code}
            height="100%"
            theme={sublime}
            extensions={extensions}
        />
        {/* <p>{filename.substring(filename.lastIndexOf('.') + 1)}</p> */}
        </div>
    );
};

export default Home;
export { useSocket };
