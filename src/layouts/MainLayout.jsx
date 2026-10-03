import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import ThemeToggle from '../components/ThemeToggle';
import { Menu, X, PanelLeftOpen, PanelLeftClose } from 'lucide-react';

export default function MainLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    try {
      return localStorage.getItem('prepmaster-sidebar-collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const location = useLocation();

  // Close mobile drawer on route change
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  const toggleSidebarCollapse = () => {
    setIsCollapsed(prev => {
      const next = !prev;
      try {
        localStorage.setItem('prepmaster-sidebar-collapsed', String(next));
      } catch {}
      return next;
    });
  };

  // Keyboard shortcut Ctrl+B / Cmd+B to toggle sidebar
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'b' || e.key === 'B')) {
        e.preventDefault();
        toggleSidebarCollapse();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className={`app-container ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
      {/* Mobile Top Bar */}
      <div className="mobile-top-bar">
        <div className="mobile-top-left">
          <button 
            type="button"
            className="mobile-menu-btn" 
            onClick={() => setIsSidebarOpen(true)}
            aria-label="Open sidebar menu"
          >
            <Menu size={22} />
          </button>
          <span className="mobile-title">PrepMaster</span>
        </div>
        <div className="mobile-top-right">
          <ThemeToggle variant="compact" />
        </div>
      </div>

      {/* Overlay for mobile drawer */}
      {isSidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>
      )}

      {/* Sidebar Wrapper */}
      <div className={`sidebar-wrapper ${isSidebarOpen ? 'open' : ''}`}>
        <button 
          type="button"
          className="mobile-close-btn" 
          onClick={() => setIsSidebarOpen(false)}
          aria-label="Close sidebar"
        >
          <X size={22} />
        </button>
        <Sidebar onToggleCollapse={toggleSidebarCollapse} />
      </div>

      {/* Main Content Area */}
      <main className="main-content">
        {/* Desktop Top Header Bar with Sidebar Toggle */}
        <div className="main-top-toolbar desktop-only">
          <button
            type="button"
            className="sidebar-toolbar-btn"
            onClick={toggleSidebarCollapse}
            title={isCollapsed ? "Show sidebar (Ctrl+B)" : "Hide sidebar (Ctrl+B)"}
            aria-label={isCollapsed ? "Show sidebar" : "Hide sidebar"}
          >
            {isCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
            <span>{isCollapsed ? 'Show Sidebar' : 'Hide Sidebar'}</span>
            <kbd className="sidebar-shortcut-badge">Ctrl+B</kbd>
          </button>
        </div>

        <div className="content-wrapper">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
