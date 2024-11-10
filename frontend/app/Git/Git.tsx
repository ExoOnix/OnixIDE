import React, { useEffect, useState } from "react";
import { useSocket } from "../Editor/Editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowUpFromLine, ArrowDownToLine } from 'lucide-react'

interface GitStatus {
    modified: string[];
    created: string[];
    deleted: string[];
    renamed: { from: string; to: string }[];
    staged: string[];
    not_added: string[];
}

export const Git = () => {
    const socket: any = useSocket();
    const [unstagedFiles, setUnstagedFiles] = useState<string[]>([]);
    const [stagedFiles, setStagedFiles] = useState<string[]>([]);
    const [gitRunning, setGitRunning] = useState<boolean>(false);
    const [commitMessage, setCommitMessage] = useState<string>("");

    useEffect(() => {
        socket.emit('recieveGit')
    }, [socket])
    useEffect(() => {
        socket.on("gitUpdate", (status: GitStatus, gitRunning: boolean) => {
            // console.log("Status received:", status);

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
        socket.on("gitRunning", (gitRunning: boolean) => {
            setGitRunning(false);
        })

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
    function gitCommit() {
        if (commitMessage.length >= 3) {
            socket.emit("gitCommit", commitMessage);
            setCommitMessage(""); // Clear input after commit
        }
    }
    function gitPush() {
        if (gitRunning) {
            socket.emit("gitPush")
        }
    }
    function gitPull() {
        if (gitRunning) {
            socket.emit("gitPull")
        }
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
            <Input disabled={!gitRunning} value={commitMessage} onChange={(e) => setCommitMessage(e.target.value)} style={{marginTop: "5px"}} />
            <div style={{ display: "flex", width: "100%", gap: "3px" }}>
                <Button
                    disabled={commitMessage.length < 3}
                    onClick={gitCommit}
                    variant="secondary"
                    style={{ marginTop: "5px", flexGrow: 1 }}
                >
                    Commit
                </Button>
                <Button disabled={!gitRunning} onClick={() => gitPush()} variant="ghost" size="icon" style={{ marginTop: "5px" }}>
                    <ArrowUpFromLine />
                </Button>
                <Button disabled={!gitRunning} onClick={() => gitPull()} variant="ghost" size="icon" style={{ marginTop: "5px" }}>
                    <ArrowDownToLine />
                </Button>
            </div>

            <div style={{ padding: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <h4>Changes</h4>
                    <div style={{ background: 'none', border: 'none', color: 'limegreen', cursor: 'pointer', marginLeft: 'auto' }}>
                        <button disabled={!gitRunning}  onClick={() => resetFile("*")} style={{ background: 'none', border: 'none', color: 'tomato', cursor: 'pointer', marginRight: "5px" }}>
                            -
                        </button>
                        <button
                            onClick={() => addFile("*")}
                            disabled={!gitRunning}
                            style={{ background: 'none', border: 'none', color: 'limegreen', cursor: 'pointer' }}
                        >
                            +
                        </button>
                    </div>
                </div>

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
                {/* <h4>Branches</h4> */}
            </div>
                )}
            </div>
        </div>
    );
};

export default Git;
