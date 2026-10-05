import React, { useState, useEffect, useMemo } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar, { SECTIONS, flattenItems } from '../components/Sidebar';
import ThemeToggle from '../components/ThemeToggle';
import { Menu, X, PanelLeftOpen, PanelLeftClose, ChevronRight } from 'lucide-react';

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

  // Compute breadcrumb navigation for persistent header
  const currentBreadcrumb = useMemo(() => {
    if (location.pathname === '/') {
      return { section: 'PrepMaster', title: 'Overview' };
    }
    const all = SECTIONS.flatMap(section => {
      const items = flattenItems(section.items, section.category);
      return items.map(it => ({ ...it, sectionTitle: section.title }));
    });
    const matched = all.find(it => it.routePath === location.pathname);
    if (matched) {
      return { section: matched.sectionTitle, title: matched.name };
    }
    return null;
  }, [location.pathname]);

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

      {/* Main Area with Always-Visible Sticky Top Header */}
      <div className="main-area">
        {/* Desktop Sticky Header Bar — Stays visible regardless of scroll depth */}
        <header className="main-sticky-header desktop-only">
          <div className="main-header-left">
            <button
              type="button"
              className={`sidebar-toolbar-btn ${isCollapsed ? 'is-collapsed' : ''}`}
              onClick={toggleSidebarCollapse}
              title={isCollapsed ? "Show sidebar (Ctrl+B)" : "Hide sidebar (Ctrl+B)"}
              aria-label={isCollapsed ? "Show sidebar" : "Hide sidebar"}
            >
              {isCollapsed ? <PanelLeftOpen size={17} /> : <PanelLeftClose size={17} />}
              <span>{isCollapsed ? 'Show Sidebar' : 'Hide Sidebar'}</span>
              <kbd className="sidebar-shortcut-badge">Ctrl+B</kbd>
            </button>

            {currentBreadcrumb && (
              <div className="header-breadcrumb">
                <span className="breadcrumb-category">{currentBreadcrumb.section}</span>
                <ChevronRight size={13} className="breadcrumb-chevron" />
                <span className="breadcrumb-title">{currentBreadcrumb.title}</span>
              </div>
            )}
          </div>

          <div className="main-header-right">
            <ThemeToggle variant="compact" />
          </div>
        </header>

        {/* Scrollable Content Container */}
        <main className="main-content">
          <div className="content-wrapper">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

