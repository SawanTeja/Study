import React, { useEffect, useState, useMemo } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { SECTIONS, flattenItems } from '../components/Sidebar';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Copy, Check } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Mermaid = React.lazy(() => import('../components/Mermaid'));
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';

function CodeBlock({ language, value, isDark }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Failed to copy', e);
    }
  };

  return (
    <div className="code-block-wrapper">
      <div className="code-block-header">
        <span className="code-block-lang">{language || 'code'}</span>
        <button
          type="button"
          className="code-copy-btn"
          onClick={handleCopy}
          title={copied ? 'Copied to clipboard!' : 'Copy code'}
          aria-label={copied ? 'Code copied' : 'Copy code to clipboard'}
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
      <div className="code-block-content">
        <SyntaxHighlighter
          language={language || 'text'}
          style={isDark ? vscDarkPlus : oneLight}
          customStyle={{
            margin: 0,
            padding: '1rem 1.25rem',
            background: 'transparent',
            fontSize: '0.875rem'
          }}
          PreTag="div"
        >
          {value}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}

export default function MarkdownViewer() {
  const { isDark } = useTheme();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const { category, topic } = useParams();
  const navigate = useNavigate();

  // Flatten items to compute next and prev (recursively supporting nested subgroups)
  const allItems = useMemo(() => SECTIONS.flatMap(section => 
    flattenItems(section.items, section.category)
  ), []);

  const currentPath = `/topic/${category}/${topic}`;
  const currentIndex = allItems.findIndex(item => item.routePath === currentPath);

  const prevItem = currentIndex > 0 ? allItems[currentIndex - 1] : null;
  const nextItem = currentIndex < allItems.length - 1 && currentIndex !== -1 ? allItems[currentIndex + 1] : null;

  useEffect(() => {
    // Determine file path: prefer location.state, fallback to matched item path, or default convention
    const matchedItem = allItems.find(item => item.routePath === currentPath);
    const filePath = location.state?.filePath || matchedItem?.path || `/content/${category}/${topic}.md`;
    
    setLoading(true);
    fetch(filePath)
      .then((res) => {
        if (!res.ok) {
          throw new Error('Markdown file not found');
        }
        return res.text();
      })
      .then((text) => {
        setContent(text);
        setLoading(false);
      })
      .catch((err) => {
        setContent(`# 404 - Not Found\n\nThe requested content could not be loaded.\n\nError: ${err.message}`);
        setLoading(false);
      });
  }, [location.state, category, topic, currentPath, allItems]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading content...</p>
      </div>
    );
  }

  return (
    <div className="markdown-body">
      <Markdown 
        remarkPlugins={[remarkGfm]}
        components={{
          a({node: _node, href, children, ...props}) {
            let targetHref = href || '';
            if (targetHref.startsWith('file:///home/sawan/Tejashvi/FluxDrop/')) {
              targetHref = targetHref.replace('file:///home/sawan/Tejashvi/FluxDrop/', 'https://github.com/SawanTeja/FluxDrop/blob/main/');
            }
            const isExternal = targetHref.startsWith('http://') || targetHref.startsWith('https://');
            return (
              <a
                href={targetHref}
                target={isExternal ? '_blank' : undefined}
                rel={isExternal ? 'noopener noreferrer' : undefined}
                {...props}
              >
                {children}
              </a>
            );
          },
          code({node: _node, inline, className, children, ...props}) {
            const match = /language-(\w+)/.exec(className || '');
            if (!inline && match && match[1] === 'mermaid') {
              return (
                <React.Suspense fallback={
                  <div className="mermaid-loading">
                    <div className="spinner" style={{ width: 24, height: 24 }}></div>
                  </div>
                }>
                  <Mermaid chart={String(children).replace(/\n$/, '')} />
                </React.Suspense>
              );
            }
            if (!inline && match) {
              return (
                <CodeBlock 
                  language={match[1]} 
                  value={String(children).replace(/\n$/, '')} 
                  isDark={isDark} 
                />
              );
            }
            return (
              <code {...props} className={className}>
                {children}
              </code>
            );
          }
        }}
      >
        {content}
      </Markdown>

      <div className="content-navigation">
        {prevItem ? (
          <button 
            type="button"
            className="nav-btn"
            onClick={() => navigate(prevItem.routePath, { state: { filePath: prevItem.path } })}
          >
            &larr; Previous<br/>
            <span>{prevItem.name}</span>
          </button>
        ) : <div></div>}
        
        {nextItem ? (
          <button 
            type="button"
            className="nav-btn nav-btn-next"
            onClick={() => navigate(nextItem.routePath, { state: { filePath: nextItem.path } })}
          >
            Next &rarr;<br/>
            <span>{nextItem.name}</span>
          </button>
        ) : <div></div>}
      </div>
    </div>
  );
}
