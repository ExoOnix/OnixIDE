import React, { useState } from "react";
import { ChevronRight } from "lucide-react";
import { TypeIcon } from "./TypeIcon";
import "./CustomNode.css";
import useTreeStore from './useTreeStore';
import JSZip from "jszip";
import { useSocket } from '../Editor/Editor';
import { useFilenameStore } from '../stores/filenameStore';
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuTrigger,
} from "@/components/ui/context-menu";
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

export const CustomNode = (props) => {
    const { filename, setFilename } = useFilenameStore();
    const { treeData } = useTreeStore(); 
    const { droppable } = props.node;
    const indent = props.depth * 24;
    const socket = useSocket();

    const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false); 
    const [isCreateFolderDialogOpen, setisCreateFolderDialogOpen] = useState(false)
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false); 
    const [newName, setNewName] = useState(""); 
    const getNodePath = (nodeId, tree) => {
        const path = [];
        let currentNode = tree.find(n => n.id === nodeId);

        while (currentNode) {
            path.unshift(currentNode.text); 
            currentNode = tree.find(n => n.id === currentNode.parent); 
        }

        return path.join('/');
    };

    const fullPath = getNodePath(props.node.id, treeData);
    const fileName = fullPath.substring(fullPath.lastIndexOf('/') + 1);
    const filePath = fullPath.substring(0, fullPath.lastIndexOf('/') + 1);

    const handleToggle = (e) => {
        e.stopPropagation();
        props.onToggle(props.node.id);
    };

    const handleClick = (e) => {
        e.stopPropagation();
        if (droppable) {
            handleToggle(e);
        } else {
            setFilename(getNodePath(props.node.id, treeData));
        }
    };

    const handleDragOver = (event) => {
        event.preventDefault(); 
    };

    const handleDrop = async (event) => {
        event.preventDefault();
        if (!props.node.droppable) {
            return;
        }

        const items = await getAllFileEntries(event.dataTransfer.items);
        if (items.length > 0) {
            zipFiles(items);
        }
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


        const formData = new FormData();
        formData.append('file', zipBlob, 'files.zip');
        const src = getNodePath(props.node.id, treeData);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URI}/api/upload/${src}`, {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();
            console.log(result);

            if (response.ok) {

                console.log('File uploaded successfully!');
            } else {

                console.error('Upload failed:', result.message);
            }
        } catch (error) {
            console.error('Error uploading file:', error);
        }
    };

    function handleDelete() {

        socket.emit("delete", getNodePath(props.node.id, treeData));
    }

    function handleRename() {
        console.log(JSON.stringify([fullPath, `${filePath}${newName}`]));
        socket.emit("updateTree", JSON.stringify([[fullPath, `${filePath}${newName}`]]));
        setIsRenameDialogOpen(false);
    }

    function handleCreateFile() {
        socket.emit("createFile", `${getNodePath(props.node.id, treeData)}/${newName}`);
        setIsCreateDialogOpen(false); 
    }
    function handleCreateFolder() {
        socket.emit("createFolder", `${getNodePath(props.node.id, treeData)}/${newName}`);
        setIsCreateDialogOpen(false);
    }

    return (
        <div>
            <ContextMenu>
                <ContextMenuTrigger>
                    <div
                        className={`tree-node root`}
                        style={{ paddingInlineStart: indent, color: "white" }}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                    >
                        <div
                            className={`expandIconWrapper ${props.isOpen ? "isOpen" : ""}`}
                            onClick={handleClick}
                        >
                            {droppable && <ChevronRight />}
                        </div>
                        <div className="typeIconWrapper" onClick={handleClick}>
                            <TypeIcon droppable={droppable} />
                        </div>
                        <div className="labelGridItem" onClick={handleClick}>
                            <span>{props.node.text}</span>
                        </div>
                    </div>
                </ContextMenuTrigger>
                <ContextMenuContent>
                    <ContextMenuItem onClick={handleDelete}>Delete</ContextMenuItem>
                    <ContextMenuItem onClick={() => setIsRenameDialogOpen(true)}>Rename</ContextMenuItem>
                    {droppable && <ContextMenuItem onClick={() => setIsCreateDialogOpen(true)}>Create File</ContextMenuItem>}
                    {droppable && <ContextMenuItem onClick={() => setisCreateFolderDialogOpen(true)}>Create Folder</ContextMenuItem>}
                </ContextMenuContent>
            </ContextMenu>

            {/* Rename Dialog */}
            <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Enter new name.</DialogTitle>
                    </DialogHeader>
                    <Label htmlFor="rename" className="sr-only">
                        New Name
                    </Label>
                    <Input
                        id="rename"
                        defaultValue={fileName}
                        onChange={(e) => setNewName(e.target.value)}
                    />
                    <DialogClose>
                        <Button type="submit" size="sm" className="px-3" onClick={handleRename}>
                            Rename
                        </Button>
                    </DialogClose>
                </DialogContent>
            </Dialog>

            {/* Create Dialog */}
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
        </div>
    );
};
