import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Maximize2 } from 'lucide-react';
import DiagramModal from './DiagramModal';

mermaid.initialize({
  startOnLoad: false,
  theme: 'dark',
  securityLevel: 'loose',
  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  themeVariables: {
    darkMode: true,
    background: '#18181b',
    primaryColor: '#3b82f6',
    primaryTextColor: '#f3f4f6',
    primaryBorderColor: '#60a5fa',
    lineColor: '#93c5fd',
    secondaryColor: '#1e293b',
    tertiaryColor: '#0f172a',
    mainBkg: '#1e1e24',
    nodeBorder: '#3b82f6'
  }
});

// Sequential render queue to avoid concurrent DOM collisions in Mermaid
let renderQueue = Promise.resolve();

const sanitizeMermaidChart = (chartText) => {
  if (!chartText) return '';
  // Replace parentheses inside edge labels |...| with Mermaid entity codes #40; and #41;
  return chartText.replace(/\|([^|\n]+)\|/g, (_, label) => {
    const sanitized = label.replace(/\(/g, '#40;').replace(/\)/g, '#41;');
    return `|${sanitized}|`;
  });
};

export default function Mermaid({ chart }) {
  const containerRef = useRef(null);
  const [svg, setSvg] = useState('');
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;

    if (!chart || !chart.trim()) return;

    setSvg('');
    setError(null);

    renderQueue = renderQueue.then(async () => {
      if (!isMounted) return;

      const uniqueNum = Math.floor(Math.random() * 10000000);
      const id = `mmd_${uniqueNum}`;

      // Create an off-screen container for Mermaid rendering
      const tempDiv = document.createElement('div');
      tempDiv.id = `temp_${id}`;
      tempDiv.style.position = 'fixed';
      tempDiv.style.top = '-9999px';
      tempDiv.style.left = '-9999px';
      tempDiv.style.opacity = '0';
      tempDiv.style.pointerEvents = 'none';
      document.body.appendChild(tempDiv);

      try {
        const cleanedChart = sanitizeMermaidChart(chart.trim());
        const { svg: renderedSvg } = await mermaid.render(id, cleanedChart, tempDiv);
        if (isMounted) {
          setSvg(renderedSvg);
          setError(null);
        }
      } catch (err) {
        console.warn('Mermaid rendering error:', err);
        if (isMounted) {
          setError(err.message || 'Failed to render diagram');
        }
      } finally {
        if (tempDiv.parentNode) {
          tempDiv.parentNode.removeChild(tempDiv);
        }
      }
    });

    return () => {
      isMounted = false;
    };
  }, [chart]);

  if (error) {
    return (
      <div className="mermaid-fallback">
        <SyntaxHighlighter language="mermaid" style={vscDarkPlus} PreTag="div">
          {chart}
        </SyntaxHighlighter>
      </div>
    );
  }

  if (!svg) {
    return (
      <div className="mermaid-loading">
        <div className="spinner" style={{ width: 24, height: 24 }}></div>
      </div>
    );
  }

  return (
    <>
      <div 
        className="mermaid-wrapper" 
        onClick={() => setIsModalOpen(true)}
        title="Click to view diagram in full size"
      >
        <div className="mermaid-header-bar">
          <span className="mermaid-badge">Diagram</span>
          <button 
            type="button" 
            className="mermaid-expand-btn"
            onClick={(e) => {
              e.stopPropagation();
              setIsModalOpen(true);
            }}
            title="Expand to Fullscreen (Pan & Zoom)"
          >
            <Maximize2 size={13} />
            <span>Open in Fullscreen</span>
          </button>
        </div>
        <div 
          className="mermaid-container" 
          ref={containerRef}
          dangerouslySetInnerHTML={{ __html: svg }} 
        />
        <div className="mermaid-footer-hint">
          <span>Click diagram to expand &bull; Pan & Zoom enabled</span>
        </div>
      </div>

      <DiagramModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        svg={svg}
      />
    </>
  );
}
