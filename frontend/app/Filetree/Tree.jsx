import React, { useEffect, useCallback, useState, useRef } from "react";
import { NativeTypes } from "react-dnd-html5-backend";
import {
    Tree,
    MultiBackend,
    getBackendOptions,
    DndProvider
} from "@minoru/react-dnd-treeview";
import { CustomNode } from "./CustomNode";
import { CustomDragPreview } from "./CustomDragPreview";
import "./FileTree.css";
import useTreeStore from './useTreeStore';
import { useSocket } from '../Editor/Editor';
import JSZip from "jszip";
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuTrigger,
} from "@/components/ui/context-menu"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { DialogClose } from "@radix-ui/react-dialog";
import { useFilenameStore } from "../stores/filenameStore";
import { Newspaper } from "lucide-react";

export const FileTree = () => {
    const { treeData, setTreeData } = useTreeStore(); 
    const [localTreeData, setLocalTreeData] = useState(treeData); 
    const socket = useSocket();
    const { filename, setFilename } = useFilenameStore();

    useEffect(() => {
        // Any additional actions based on filename changes
        console.log('Current filename:', filename);
    }, [filename]);
    const getNodePath = (nodeId, tree) => {
        const path = [];
        let currentNode = tree.find(n => n.id === nodeId);

        while (currentNode) {
            path.unshift(currentNode.text);
            currentNode = tree.find(n => n.id === currentNode.parent);
        }

        return path.join('/'); 
    };

    useEffect(() => {
        setLocalTreeData(treeData);
    }, [treeData]);

    const checkSocketAvailability = (delay = 500) => {
        return new Promise((resolve) => {
            const attempt = () => {
                if (socket && socket.connected) {
                    resolve(true);
                } else {
                    setTimeout(attempt, delay);
                }
            };
            attempt();
        });
    };

    const emitGetFiles = useCallback(async () => {
        try {
            await checkSocketAvailability();
            socket.emit('getFiles');
        } catch (err) {
            console.error(err);
        }
    }, [socket]);

    useEffect(() => {
        if (!socket) return;

        emitGetFiles();

        socket.on('getFilesResponse', (response) => {
            try {
                const parsedResponse = JSON.parse(response);
                setTreeData(parsedResponse);
            } catch (error) {
                console.error('Failed to load data:', error);
            }
        });
        socket.on('updateEditorPath', (oldPath, newPath) => {
            updateEditorPath(oldPath, newPath)
        })
        socket.on('connect_error', (err) => {
            console.error('Failed to connect to server:', err);
        });

        return () => {
            socket.off('getFilesResponse');
            socket.off('connect_error');
        };
    }, [socket, emitGetFiles, setTreeData]);
    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    const handleDrop = (newTree, options) => {
        const { dropTargetId, monitor } = options;
        const itemType = monitor.getItemType();

        if (itemType === NativeTypes.FILE) {
            ;
        } else {

            const updatedTree = [...newTree];
            const changes = [];

            const getNodePath = (node, tree) => {
                const path = [];
                let currentNode = node;
                while (currentNode) {
                    path.unshift(currentNode.text);
                    currentNode = tree.find(n => n.id === currentNode.parent);
                }
                return path.join('/');
            };

            const oldTreeMap = new Map(localTreeData.map(node => [node.id, node]));
            const newTreeMap = new Map(newTree.map(node => [node.id, node]));

            newTree.forEach(node => {
                const oldNode = oldTreeMap.get(node.id);
                if (oldNode) {
                    if (oldNode.parent !== node.parent) {
                        const oldPath = getNodePath(oldNode, localTreeData);
                        const newPath = getNodePath(node, newTree);
                        changes.push([oldPath, newPath]);
                    }
                } else {
                    const newPath = getNodePath(node, newTree);
                    changes.push([null, newPath]);
                }
            });

            localTreeData.forEach(node => {
                if (!newTreeMap.has(node.id)) {
                    const oldPath = getNodePath(node, localTreeData);
                    changes.push([oldPath, null]);
                }
            });

            if (changes.length > 0) {
                socket.emit('updateTree', JSON.stringify(changes));
            }

            setLocalTreeData(updatedTree);
            setTreeData(updatedTree);
            console.log('Detected changes:', changes);
            console.log(filename)
            for (const subChange of changes) {
                if (subChange[0] === filename) {
                    console.log("found", subChange[1])
                    setFilename(subChange[1])
                    break;
                }
            }
            // setFilename("test.txt")
            const currentFilePath = filename;
            for (const [oldPath, newPath] of changes) {
                if (currentFilePath.startsWith(oldPath)) {
                    const updatedFilePath = currentFilePath.replace(oldPath, newPath);
                    setFilename(updatedFilePath);
                    break;
                }
            }
        }
    };
    const handleDragOver = (event) => {
        event.preventDefault();
    };

    const readAllDirectoryEntries = async (directoryReader) => {
        let entries = [];
        let readEntries = await readEntriesPromise(directoryReader);
        while (readEntries.length > 0) {
            entries.push(...readEntries);
            readEntries = await readEntriesPromise(directoryReader);
        }
        return entries;
    };

    const readEntriesPromise = async (directoryReader) => {
        return new Promise((resolve, reject) => {
            directoryReader.readEntries(resolve, reject);
        });
    };

    const getAllFileEntries = async (dataTransferItemList) => {
        let fileEntries = [];
        let queue = [];
        for (let i = 0; i < dataTransferItemList.length; i++) {
            const entry = dataTransferItemList[i].webkitGetAsEntry();
            if (entry) {
                queue.push(entry);
            }
        }
        while (queue.length > 0) {
            let entry = queue.shift();
            if (entry && entry.isFile) { 
                fileEntries.push(entry);
            } else if (entry && entry.isDirectory) { 
                let reader = entry.createReader();
                queue.push(...(await readAllDirectoryEntries(reader)));
            }
        }
        return fileEntries;
    };
    const handleDragDrop = async (event) => {
        event.preventDefault(); 



        const items = await getAllFileEntries(event.dataTransfer.items);
        if (items.length > 0) {
            zipFiles(items); 
        }
    };

    const zipFiles = async (fileEntries) => {
        const zip = new JSZip();

        // Add files to the zip
        for (const entry of fileEntries) {
            const relativePath = entry.fullPath ? entry.fullPath.slice(1) : entry.name; 
            if (entry.isFile) {
                const file = await new Promise((resolve) => {
                    entry.file(resolve);
                });
                zip.file(relativePath, file); 
            }

        }

        const zipBlob = await zip.generateAsync({ type: "blob" });

        // Create FormData to send to the backend
        const formData = new FormData();
        formData.append('file', zipBlob, 'files.zip'); 

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URI}/api/upload/`, {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();

            if (response.ok) {
                console.log('File uploaded successfully!');
            } else {
                console.error('Upload failed:', result.message);
            }
        } catch (error) {
            console.error('Error uploading file:', error);
        }
    };
    const [isCreateFolderDialogOpen, setisCreateFolderDialogOpen] = useState(false)
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [newName, setNewName] = useState("");
    function handleCreateFile() {
        socket.emit("createFile", `${newName}`);
        setIsCreateDialogOpen(false);
    }
    function handleCreateFolder() {
        socket.emit("createFolder", `${newName}`);
        setIsCreateDialogOpen(false);
    }
    function updateEditorPath(oldPath, newPath) {
        const currentFilename = useFilenameStore.getState().filename;
        const currentFiletree = treeData;
        if (currentFilename == oldPath) {
            setFilename(newPath)
        }

        if (currentFilename.startsWith(oldPath)) {
            const updatedFilePath = currentFilename.replace(oldPath, newPath);
            setFilename(updatedFilePath);
        }
    
        console.log('updateEditorPath', currentFilename, oldPath, newPath, treeData)
    }

    return (
        <div className="rootGrid" onDragOver={handleDragOver} onDrop={handleDragDrop}>
            <ContextMenu>
                <ContextMenuTrigger>
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
                    </div></ContextMenuTrigger>
                <ContextMenuContent>
                    <ContextMenuItem onClick={() => setIsCreateDialogOpen(true)}>Create File</ContextMenuItem>
                    <ContextMenuItem onClick={() => setisCreateFolderDialogOpen(true)}>Create Folder</ContextMenuItem>
                </ContextMenuContent>
            </ContextMenu>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Enter file name to create.</DialogTitle>
                    </DialogHeader>
                    <Label htmlFor="create" className="sr-only">
                        New Name
                    </Label>
                    <Input
                        id="create"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                    />
                    <DialogClose>
                        <Button type="submit" size="sm" className="px-3" onClick={handleCreateFile}>
                            Create
                        </Button>
                    </DialogClose>
                </DialogContent>
            </Dialog>
            <Dialog open={isCreateFolderDialogOpen} onOpenChange={setisCreateFolderDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Enter file name to create.</DialogTitle>
                    </DialogHeader>
                    <Label htmlFor="create" className="sr-only">
                        New Name
                    </Label>
                    <Input
                        id="create"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                    />
                    <DialogClose>
                        <Button type="submit" size="sm" className="px-3" onClick={handleCreateFolder}>
                            Create
                        </Button>
                    </DialogClose>
                </DialogContent>
            </Dialog>
            <DndProvider backend={MultiBackend} options={getBackendOptions()}>
                <Tree
                    rootId={0}
                    tree={localTreeData}
                    extraAcceptTypes={[NativeTypes.FILE]}
                    classes={{
                        root: "treeRoot",
                        draggingSource: "draggingSource",
                        dropTarget: "dropTarget"
                    }}
                    render={(node, options) => <CustomNode node={node} {...options} />}
                    dragPreviewRender={(monitorProps) => (
                        <CustomDragPreview monitorProps={monitorProps} />
                    )}
                    onDrop={handleDrop}
                />
            </DndProvider>
            <p style={{color: "white"}}>{ filename }</p>
        </div>
    );
};

export default FileTree;
