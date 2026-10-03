import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import ThemeToggle from '../components/ThemeToggle';
import { Menu, X } from 'lucide-react';

export default function MainLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  // Close sidebar on route change for mobile
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="app-container">
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

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>
      )}

      {/* Sidebar Wrapper */}
      <div className={`sidebar-wrapper ${isSidebarOpen ? 'open' : ''}`}>
        <button className="mobile-close-btn" onClick={() => setIsSidebarOpen(false)}>
          <X size={24} />
        </button>
        <Sidebar />
      </div>

      <main className="main-content">
        <div className="content-wrapper">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
