import React, { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Folder, FolderOpen, File, ChevronRight, ChevronDown, Copy, Check } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const FileTreeNode = ({ node, onFileSelect, selectedPath, level = 0 }) => {
  const [isOpen, setIsOpen] = useState(false);

  const isDir = node.type === 'directory';
  const isSelected = selectedPath === node.path;

  const handleClick = () => {
    if (isDir) {
      setIsOpen(!isOpen);
    } else {
      onFileSelect(node);
    }
  };

  return (
    <div className="codebase-tree-node">
      <div 
        className={`codebase-tree-row ${isSelected ? 'active' : ''}`}
        style={{ paddingLeft: `${level * 14 + 10}px` }}
        onClick={handleClick}
        title={node.name}
      >
        {isDir ? (
          <>
            <span className="codebase-chevron">
              {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </span>
            {isOpen ? (
              <FolderOpen size={15} className="codebase-icon folder-open" />
            ) : (
              <Folder size={15} className="codebase-icon folder" />
            )}
          </>
        ) : (
          <>
            <span className="codebase-chevron-spacer"></span>
            <File size={15} className="codebase-icon file" />
          </>
        )}
        <span className="codebase-node-name">{node.name}</span>
      </div>
      
      {isDir && isOpen && node.children && (
        <div className="codebase-tree-children">
          {node.children.map((child, idx) => (
            <FileTreeNode 
              key={idx} 
              node={child} 
              onFileSelect={onFileSelect} 
              selectedPath={selectedPath} 
              level={level + 1} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Helper to convert GitHub's flat tree to our nested structure
function buildTreeFromGitHub(flatTree) {
  const root = { name: 'root', type: 'directory', children: [] };
  
  flatTree.forEach(item => {
    if (item.path.includes('.git/') || item.path.includes('node_modules/') || item.path.includes('.DS_Store')) return;
    
    const parts = item.path.split('/');
    let currentDir = root;
    
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isFile = i === parts.length - 1 && item.type === 'blob';
      
      let child = currentDir.children.find(c => c.name === part);
      if (!child) {
        child = {
          name: part,
          type: isFile ? 'file' : 'directory',
          path: item.path,
          children: []
        };
        currentDir.children.push(child);
      }
      currentDir = child;
    }
  });

  const sortTree = (node) => {
    if (node.children) {
      node.children.sort((a, b) => {
        if (a.type === b.type) return a.name.localeCompare(b.name);
        return a.type === 'directory' ? -1 : 1;
      });
      node.children.forEach(sortTree);
    }
  };
  
  sortTree(root);
  return root;
}

export default function CodebaseViewer() {
  const { isDark } = useTheme();
  const location = useLocation();
  const { repo } = useParams();
  
  const repoOwner = location.state?.repoOwner || 'SawanTeja';
  const repoName = location.state?.repoName || repo;
  const repoBranch = location.state?.repoBranch || 'main';

  const [tree, setTree] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContent, setFileContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setLoading(true);
    const treeApiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/git/trees/${repoBranch}?recursive=1`;
    
    fetch(treeApiUrl)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch tree from GitHub');
        return res.json();
      })
      .then(data => {
        const nestedTree = buildTreeFromGitHub(data.tree);
        setTree(nestedTree);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load GitHub repo tree:', err);
        setLoading(false);
      });
  }, [repoOwner, repoName, repoBranch]);

  const handleFileSelect = (node) => {
    setSelectedFile(node);
    
    const rawUrl = `https://raw.githubusercontent.com/${repoOwner}/${repoName}/${repoBranch}/${node.path}`;
    
    fetch(rawUrl)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch file from GitHub');
        return res.text();
      })
      .then(text => setFileContent(text))
      .catch(err => {
        setFileContent(`Error loading file: ${err.message}`);
      });
  };

  const handleCopy = async () => {
    if (!fileContent) return;
    try {
      await navigator.clipboard.writeText(fileContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Failed to copy', e);
    }
  };

  const getLanguage = (filename) => {
    const ext = filename.split('.').pop().toLowerCase();
    switch (ext) {
      case 'js': case 'jsx': return 'javascript';
      case 'ts': case 'tsx': return 'typescript';
      case 'css': return 'css';
      case 'html': return 'html';
      case 'json': return 'json';
      case 'md': return 'markdown';
      case 'cpp': case 'hpp': case 'cc': case 'cxx': case 'c': case 'h': return 'cpp';
      case 'cmake': return 'cmake';
      case 'txt': return filename.toLowerCase() === 'cmakelists.txt' ? 'cmake' : 'text';
      case 'dart': return 'dart';
      case 'sh': case 'bash': return 'bash';
      case 'yaml': case 'yml': return 'yaml';
      default: return 'text';
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading codebase from GitHub...</p>
      </div>
    );
  }

  if (!tree) {
    return (
      <div className="loading-container">
        <p>Failed to load codebase repository.</p>
      </div>
    );
  }

  return (
    <div className="codebase-container">
      {/* File Explorer Sidebar */}
      <div className="codebase-explorer">
        <div className="codebase-explorer-header">
          <span className="codebase-explorer-title">Explorer</span>
          <span className="codebase-repo-badge">{repoName}</span>
        </div>
        <div className="codebase-tree-scroll">
          {tree.children && tree.children.map((child, idx) => (
            <FileTreeNode 
              key={idx} 
              node={child} 
              onFileSelect={handleFileSelect} 
              selectedPath={selectedFile?.path}
            />
          ))}
        </div>
      </div>

      {/* Code Viewer */}
      <div className="codebase-viewer">
        {selectedFile ? (
          <>
            <div className="codebase-viewer-header">
              <div className="codebase-viewer-file-info">
                <File size={15} />
                <span className="codebase-viewer-file-name">{selectedFile.name}</span>
                <span className="codebase-viewer-file-path">{selectedFile.path}</span>
              </div>
              <button 
                type="button" 
                className="code-copy-btn" 
                onClick={handleCopy}
                title={copied ? 'Copied to clipboard!' : 'Copy full file content'}
              >
                {copied ? (
                  <>
                    <Check size={13} />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy size={13} />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            <div className="codebase-viewer-body">
              <SyntaxHighlighter
                language={getLanguage(selectedFile.name)}
                style={isDark ? vscDarkPlus : oneLight}
                customStyle={{ 
                  margin: 0, 
                  padding: '1.25rem', 
                  background: 'transparent',
                  fontSize: '0.875rem' 
                }}
                showLineNumbers={true}
              >
                {fileContent}
              </SyntaxHighlighter>
            </div>
          </>
        ) : (
          <div className="codebase-viewer-empty">
            <File size={36} className="codebase-empty-icon" />
            <p>Select a file from the explorer to view its contents</p>
          </div>
        )}
      </div>
    </div>
  );
}
