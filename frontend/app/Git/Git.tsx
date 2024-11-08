import React, { useEffect, useState } from "react";
import { useSocket } from "../Editor/Editor";

interface GitStatus {
    modified: string[];
    created: string[];
    deleted: string[];
    renamed: { from: string; to: string }[];
    staged: string[]; // Assuming staged files come in as a separate array for simplicity
}

export const Git = () => {
    const socket: any = useSocket();
    const [unstagedFiles, setUnstagedFiles] = useState<string[]>([]);
    const [stagedFiles, setStagedFiles] = useState<string[]>([]);
    const [gitRunning, setGitRunning] = useState<boolean>(false);

    useEffect(() => {
        socket.emit('recieveGit')
    }, [socket])
    useEffect(() => {
        socket.on("gitUpdate", (status: GitStatus, gitRunning: boolean) => {
            console.log("Status received:", status);

            setGitRunning(gitRunning);
            setUnstagedFiles(status.not_added || []);
            setStagedFiles(status.staged || []); // Assuming 'staged' is available as an array in the status object
        });

        return () => {
            socket.off("gitUpdate");
        };
    }, [socket]);

    function addFile(filePath: string) {
        socket.emit("addFile", filePath)
    }
    function resetFile(filePath: string) {
        socket.emit("resetFile", filePath)
    }

    return (
        <div style={{ display: 'flex', color: 'white', height: '100vh', flexDirection: 'column' }}>
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

            <div style={{ padding: '10px' }}>
                <h4>Changes</h4>
                {!gitRunning ? (
                    <div style={{ color: 'tomato' }}>Git is disabled</div>
                ) : (
                    <div style={{ marginBottom: '20px' }}>
                {unstagedFiles.map((file, index) => (
                    <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
                        <button onClick={() => addFile(file)} style={{ background: 'none', border: 'none', color: 'limegreen', cursor: 'pointer' }}>
                            +
                        </button>
                        <span style={{ marginLeft: '10px', color: '#cfcfcf' }}>{file}</span>
                    </div>
                ))}
                {stagedFiles.map((file, index) => (
                    <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
                        <button onClick={() => resetFile(file)} style={{ background: 'none', border: 'none', color: 'tomato', cursor: 'pointer' }}>
                            -
                        </button>
                        <span style={{ marginLeft: '10px', color: '#cfcfcf' }}>{file}</span>
                    </div>
                ))}
            </div>
                )}
            </div>
        </div>
    );
};

export default Git;
