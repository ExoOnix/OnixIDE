'use client';

import React, { useState, useRef, useEffect } from 'react';
import Editor from './Editor/Editor';
import FileTree from './Filetree/Tree';
import { useFilenameStore } from './stores/filenameStore';
import Terminal from './Terminal/Terminal'
import { handleResize } from './Terminal/TerminalClient'
import { useSocket } from './Editor/Editor';

export default function Home() {
  const { filename, setFilename } = useFilenameStore();
  const [treeWidth, setTreeWidth] = useState(250);
  const resizerRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const terminalRef = useRef<HTMLDivElement | null>(null); // Add this ref
  const socket: any = useSocket();
  const [editorKey, setEditorKey] = useState(filename);

  useEffect(() => {
    setEditorKey(filename)
  }, [filename])

  useEffect(() => {
    if (!socket) return;

    socket.on('resetFile', (relativeFilePath: string) => {
      // Improve later
      console.log(relativeFilePath, useFilenameStore.getState().filename)
      if (relativeFilePath == useFilenameStore.getState().filename) {
        console.log(relativeFilePath);
        setFilename(relativeFilePath);
        setEditorKey("Temp"); 


        setTimeout(() => {
          setEditorKey(filename);
        }, 100);
      }
    });


    socket.on('connect_error', (err: any) => {
      console.error('Failed to connect to server:', err);
    });

    return () => {
      socket.off('getFilesResponse');
      socket.off('connect_error');
    };
  }, [socket]);

  const handleFileChange = (newFilename: string) => {
    setFilename(newFilename);
  };

  const startResizing = (event: React.MouseEvent) => {
    event.preventDefault();
    document.addEventListener('mousemove', resizePanel);
    document.addEventListener('mouseup', stopResizing);
  };

  const resizePanel = (event: MouseEvent) => {
    if (containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const newWidth = event.clientX - containerRect.left;
      setTreeWidth(Math.max(100, newWidth));

      handleResize()
    }
  };

  const stopResizing = () => {
    document.removeEventListener('mousemove', resizePanel);
    document.removeEventListener('mouseup', stopResizing);
  };

  return (
    <main>
      <div className='maincontainer' ref={containerRef} style={{ display: 'flex', height: '100vh' }}>
        <div
          className="file-tree-container"
          style={{ width: `${treeWidth}px`, minWidth: '100px', overflow: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <FileTree />
        </div>

        <div
          ref={resizerRef}
          className="resizer"
          onMouseDown={startResizing}
          style={{
            width: '5px',
            cursor: 'col-resize',
            backgroundColor: '#ddd',
          }}
        ></div>

        <div className="editor-container" style={{ flexGrow: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div
            style={{ flexGrow: 1, height: '70%', overflow: 'auto', backgroundColor: '#303841' }}
          >
            <Editor key={editorKey} filename={filename} />
          </div>

          <div className="terminal-container" style={{ height: '30%', backgroundColor: '#333' }}> { }
            <Terminal />
          </div>
        </div>
      </div>
    </main>
  );
}