import React, { useEffect, useState } from "react";
import { useSocket } from "../Editor/Editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowUpFromLine, ArrowDownToLine, GitBranch, Undo2, Redo, Clipboard } from 'lucide-react'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { PopoverClose } from "@radix-ui/react-popover";
import { Label } from "@/components/ui/label";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"


interface GitStatus {
    modified: string[];
    created: string[];
    deleted: string[];
    renamed: { from: string; to: string }[];
    staged: string[];
    not_added: string[];
}
interface Commit {
    hash: string;
    message: string;
    active: boolean;
}

export const Git = () => {
    const socket: any = useSocket();
    const [unstagedFiles, setUnstagedFiles] = useState<string[]>([]);
    const [stagedFiles, setStagedFiles] = useState<string[]>([]);
    const [gitRunning, setGitRunning] = useState<boolean>(false);
    const [commitMessage, setCommitMessage] = useState<string>("");
    const [createBranchName, setCreateBranchName] = useState<string>("")
    const [branches, setBranches] = useState<string[]>([]);
    const [currentBranch, setCurrentBranch] = useState<string>("");
    const [commits, setCommits] = useState<Commit[]>([]);

    useEffect(() => {
        socket.emit('recieveGit')
    }, [socket])
    useEffect(() => {
        socket.on("gitUpdate", (status: GitStatus, gitRunning: boolean, gitbranches: string[], gitcurrentBranch: string, gitCommits: Commit[]) => {
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
            setBranches(gitbranches)
            setCurrentBranch(gitcurrentBranch)
            setGitRunning(gitRunning);
            setUnstagedFiles(combinedUnstaged); // Only modified files not staged + not added
            setStagedFiles(status.staged || []); // Ensure staged is an array
            setCommits(gitCommits);
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
    function gitSwitchBranch(branchName: string) {
        if (gitRunning) {
            socket.emit("switchBranch", branchName)
        }
    }
    function deleteBranch(branchName: string) {
        if (gitRunning) {
            socket.emit("deleteBranch", branchName)
        }
    }
    function createBranch(branchName: string) {
        if (gitRunning && branchName.length > 0) {
            socket.emit("createBranch", branchName)
        }
    }
    function gitCheckout(commitHash: string) {
        if (gitRunning) {
            socket.emit("gitCheckout", commitHash)
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
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <h4>Branches</h4>
                                    <div style={{ background: 'none', border: 'none', color: 'limegreen', cursor: 'pointer', marginLeft: 'auto' }}>
                                    <Popover>
                                    <PopoverTrigger>
                                        <button
                                            disabled={!gitRunning}
                                            style={{ background: 'none', border: 'none', color: 'limegreen', cursor: 'pointer' }}
                                        >
                                            +
                                        </button>
                                    </PopoverTrigger>
                                        <PopoverContent>
                                            <div className="grid grid-cols-3 items-center gap-4">
                                                <Label>Name</Label>
                                                <Input
                                                    onChange={(e) => setCreateBranchName(e.target.value)}
                                                    value={createBranchName}
                                                    id="width"
                                                    className="col-span-2 h-8"
                                                />
                                            </div>
                                            <PopoverClose asChild>
                                            <Button
                                                onClick={() => {
                                                    createBranch(createBranchName); // Emit createBranch event with the branch name
                                                    setCreateBranchName(""); // Clear input after creation
                                                }}
                                                disabled={!gitRunning}
                                                variant="secondary"
                                                style={{ marginTop: "5px" }}
                                            >
                                                Create Branch
                                            </Button>
                                            </PopoverClose>
                                        </PopoverContent>

                                    </Popover>
                                    </div>
                                </div>
                                
                            {branches.map((branch) => (
                                <div style={{ display: 'flex', alignItems: 'center' }} key={branch}>
                                    <button
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            color: 'tomato',
                                            cursor: 'pointer',
                                            padding: 0, // Removes any extra padding
                                            height: '1em', // Matches the height to the text
                                            display: 'flex',
                                            alignItems: 'center', // Centers the icon vertically with the text
                                        }}
                                        onClick={() => gitSwitchBranch(branch)}
                                    >
                                        <GitBranch
                                            style={{
                                                width: '15px',
                                                height: 'auto',
                                                color: branch === currentBranch ? 'green' : 'tomato', // Conditionally set color
                                            }}
                                        />
                                    </button>
                                    <span style={{ marginLeft: '10px', color: '#cfcfcf' }}>{branch}</span>
                                    <div style={{ background: 'none', border: 'none', color: 'limegreen', cursor: 'pointer', marginLeft: 'auto' }}>

                                        {currentBranch != branch && (
                                            <button
                                                disabled={!gitRunning}
                                                onClick={() => deleteBranch(branch)}
                                                style={{ background: 'none', border: 'none', color: 'tomato', cursor: 'pointer', marginRight: "5px" }}
                                            >
                                                -
                                            </button>
                                        )}

                                    </div>
                                    
                                </div>
                            ))}
                            <h4>Commits</h4>

                            {commits.map((commit) => (
                                <div style={{ display: 'flex', alignItems: 'center' }} key={commit.hash}>
                                    <span style={{ marginLeft: '10px', color: commit.active ? "limegreen" : '#cfcfcf'}}>{commit.message}</span>
                                    <div style={{ background: 'none', border: 'none', cursor: 'pointer', marginLeft: 'auto' }}>
                                        {!commit.active && (
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger>                                            <button
                                                        disabled={!gitRunning}
                                                        onClick={() => gitCheckout(commit.hash)}
                                                        style={{ background: 'none', border: 'none', cursor: 'pointer', marginRight: "5px" }}
                                                    >
                                                        <Redo style={{ width: "15px" }} />
                                                    </button></TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>Checkout Commit</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        )}
                                    </div>
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger>                                            <button
                                                disabled={!gitRunning}
                                                onClick={() => navigator.clipboard.writeText(commit.hash)}
                                                style={{ background: 'none', border: 'none', cursor: 'pointer', marginRight: "5px" }}

                                            >
                                                <Clipboard style={{ width: "15px" }} />
                                            </button></TooltipTrigger>
                                            <TooltipContent>
                                                <p>Copy Commit Hash</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>
                            ))}


            </div>
                )}
            </div>
        </div>
    );
};

export default Git;
