'use client';

import React, { useState, useRef } from 'react';
import Editor from './Editor/Editor';
import FileTree from './Filetree/Tree';
import { useFilenameStore } from './stores/filenameStore';
import Terminal from './Terminal/Terminal'
import { handleResize } from './Terminal/TerminalClient'

export default function Home() {
  const { filename, setFilename } = useFilenameStore();
  const [treeWidth, setTreeWidth] = useState(250);
  const resizerRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const terminalRef = useRef<HTMLDivElement | null>(null); // Add this ref

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
          style={{ width: `${treeWidth}px`, minWidth: '100px', overflow: 'auto' }}
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
            <Editor key={filename} filename={filename} />
          </div>

          <div className="terminal-container" style={{ height: '30%', backgroundColor: '#333' }}> { }
            <Terminal />
          </div>
        </div>
      </div>
    </main>
  );
}