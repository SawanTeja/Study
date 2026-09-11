import React, { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Folder, File, ChevronRight, ChevronDown } from 'lucide-react';

const FileTreeNode = ({ node, onFileSelect, level = 0 }) => {
  const [isOpen, setIsOpen] = useState(false);

  const isDir = node.type === 'directory';

  const handleClick = () => {
    if (isDir) {
      setIsOpen(!isOpen);
    } else {
      onFileSelect(node);
    }
  };

  return (
    <div className="select-none">
      <div 
        className="flex items-center gap-1.5 py-1 px-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded cursor-pointer text-sm"
        style={{ paddingLeft: `${level * 12 + 8}px` }}
        onClick={handleClick}
      >
        {isDir ? (
          <>
            {isOpen ? <ChevronDown size={14} className="opacity-50" /> : <ChevronRight size={14} className="opacity-50" />}
            <Folder size={14} className="text-blue-500" />
          </>
        ) : (
          <>
            <span className="w-[14px]"></span>
            <File size={14} className="text-gray-500" />
          </>
        )}
        <span className="truncate">{node.name}</span>
      </div>
      
      {isDir && isOpen && node.children && (
        <div className="flex flex-col">
          {node.children.map((child, idx) => (
            <FileTreeNode key={idx} node={child} onFileSelect={onFileSelect} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

export default function CodebaseViewer() {
  const location = useLocation();
  const { repo } = useParams();
  const [tree, setTree] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContent, setFileContent] = useState('');
  const [loading, setLoading] = useState(true);

  // Fallback if accessed directly without state
  const treeUrl = location.state?.treeUrl || `/repos/${repo}/tree.json`;

  useEffect(() => {
    setLoading(true);
    fetch(treeUrl)
      .then(res => res.json())
      .then(data => {
        setTree(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load repo tree:', err);
        setLoading(false);
      });
  }, [treeUrl]);

  const handleFileSelect = (node) => {
    setSelectedFile(node);
    // Construct path from the root
    let fullPath = node.path;
    // node.path from our script is relative to the targetDir. So we join with /repos/Forever/
    const filePath = `/repos/${repo}/${fullPath ? fullPath + '/' : ''}${node.name}`;
    
    fetch(filePath)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch file');
        return res.text();
      })
      .then(text => setFileContent(text))
      .catch(err => {
        setFileContent(`Error loading file: ${err.message}`);
      });
  };

  const getLanguage = (filename) => {
    const ext = filename.split('.').pop().toLowerCase();
    switch (ext) {
      case 'js':
      case 'jsx':
        return 'javascript';
      case 'ts':
      case 'tsx':
        return 'typescript';
      case 'css':
        return 'css';
      case 'html':
        return 'html';
      case 'json':
        return 'json';
      case 'md':
        return 'markdown';
      default:
        return 'text';
    }
  };

  if (loading) {
    return <div className="loading-container">Loading Codebase...</div>;
  }

  if (!tree) {
    return <div className="loading-container">Failed to load codebase.</div>;
  }

  return (
    <div className="flex flex-col md:flex-row h-[80vh] gap-4 mb-8">
      {/* File Explorer Sidebar */}
      <div className="w-full md:w-64 flex-shrink-0 border border-gray-200 dark:border-gray-800 rounded-lg overflow-y-auto bg-white dark:bg-[#111111] p-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3 px-2 pt-2">Explorer</h3>
        {tree.children && tree.children.map((child, idx) => (
           <FileTreeNode key={idx} node={child} onFileSelect={handleFileSelect} />
        ))}
      </div>

      {/* Code Viewer */}
      <div className="flex-1 border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden bg-[#1e1e1e] flex flex-col">
        {selectedFile ? (
          <>
            <div className="bg-[#2d2d2d] text-gray-300 text-sm px-4 py-2 border-b border-gray-800 flex items-center gap-2">
              <File size={14} />
              {selectedFile.name}
            </div>
            <div className="overflow-y-auto flex-1">
              <SyntaxHighlighter
                language={getLanguage(selectedFile.name)}
                style={vscDarkPlus}
                customStyle={{ margin: 0, padding: '1rem', background: 'transparent' }}
                showLineNumbers={true}
              >
                {fileContent}
              </SyntaxHighlighter>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Select a file from the explorer to view its contents
          </div>
        )}
      </div>
    </div>
  );
}
