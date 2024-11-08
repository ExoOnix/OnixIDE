import React, { useEffect, useState } from "react";
import { useSocket } from "../Editor/Editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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

            // Filter out staged files from modified files
            const modifiedNotStaged = (status.modified || []).filter(file =>
                !status.staged?.includes(file)
            );
            const deleteNotStaged = (status.deleted || []).filter(file =>
                !status.staged?.includes(file)
            );

            // Combine modified (not staged) and not_added files
            const combinedUnstaged = [
                ...modifiedNotStaged,
                ...deleteNotStaged,
                ...(status.not_added || []),
            ];

            setGitRunning(gitRunning);
            setUnstagedFiles(combinedUnstaged); // Only modified files not staged + not added
            setStagedFiles(status.staged || []); // Ensure staged is an array
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
            <Input style={{marginTop: "5px"}} />
            <Button variant="secondary" style={{ marginTop: "5px" }}>Commit</Button>
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
