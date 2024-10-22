import React, { useState, useRef } from "react";
import JSZip from "jszip";

const FileDropZone = () => {
    const [fileCount, setFileCount] = useState(0);
    const [zipFileUrl, setZipFileUrl] = useState(null);
    const dropzoneRef = useRef(null);

    const getAllFileEntries = async (dataTransferItemList) => {
        let fileEntries = [];
        let queue = [];
        for (let i = 0; i < dataTransferItemList.length; i++) {
            queue.push(dataTransferItemList[i].webkitGetAsEntry());
        }
        while (queue.length > 0) {
            let entry = queue.shift();
            if (entry.isFile) {
                fileEntries.push(entry);
            } else if (entry.isDirectory) {
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
        try {
            return await new Promise((resolve, reject) => {
                directoryReader.readEntries(resolve, reject);
            });
        } catch (err) {
            console.log(err);
        }
    };

    const handleDragOver = (event) => {
        event.preventDefault();
        setFileCount(0);
    };

    const handleDrop = async (event) => {
        event.preventDefault();
        const items = await getAllFileEntries(event.dataTransfer.items);
        setFileCount(items.length);

        if (items.length > 0) {
            zipFiles(items);
        }
    };

    const zipFiles = async (fileEntries) => {
        const zip = new JSZip();

        for (const entry of fileEntries) {
            const relativePath = entry.fullPath ? entry.fullPath.slice(1) : entry.name;
            if (entry.isFile) {
                const file = await new Promise((resolve) => {
                    entry.file(resolve);
                });
                zip.file(relativePath, file);
            } else if (entry.isDirectory) {

                zip.folder(relativePath);
            }
        }

        const zipBlob = await zip.generateAsync({ type: "blob" });
        const url = URL.createObjectURL(zipBlob);
        setZipFileUrl(url);
    };

    return (
        <div>
            <div
                id="dropzone"
                ref={dropzoneRef}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                style={{
                    backgroundColor: "#cfc",
                    border: "solid 3px #9c9",
                    color: "#9c9",
                    minHeight: "50px",
                    padding: "20px",
                    textShadow: "1px 1px 0 #fff",
                }}
            >
                Drop files here!
            </div>
            <ul id="items">
                {fileCount === 0 ? (
                    <li style={{ color: "#ccc" }}>(File counts will be shown here.)</li>
                ) : (
                    <li>{fileCount} file(s) dropped</li>
                )}
            </ul>
            {zipFileUrl && (
                <a href={zipFileUrl} download="files.zip" style={{ display: "block", marginTop: "20px" }}>
                    Download Zipped Files
                </a>
            )}
        </div>
    );
};

export default FileDropZone;