import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { BookOpen, Code, Database, LayoutTemplate, Layers, Monitor, ChevronDown, ChevronRight } from 'lucide-react';

export const SECTIONS = [
  {
    title: 'Operating Systems',
    icon: <Monitor size={18} />,
    category: 'OS',
    items: [
      { name: 'Intro to OS', path: '/content/OS/intro-to-os.md' },
      { name: 'System Calls', path: '/content/OS/system-calls.md' },
      { name: 'Process Fundamentals', path: '/content/OS/process-fundamentals.md' },
      { name: 'Process Scheduling', path: '/content/OS/process-scheduling.md' },
      { name: 'CPU Scheduling Algorithms', path: '/content/OS/cpu-scheduling.md' },
      { name: 'Threads', path: '/content/OS/threads.md' },
      { name: 'Concurrency Basics', path: '/content/OS/concurrency-basics.md' },
      { name: 'Process Synchronization', path: '/content/OS/process-synchronization.md' },
      { name: 'Deadlocks', path: '/content/OS/deadlocks.md' },
      { name: 'Memory Management', path: '/content/OS/memory-management.md' },
      { name: 'Paging and Virtual Memory', path: '/content/OS/paging-and-virtual-memory.md' },
      { name: 'Segmentation', path: '/content/OS/segmentation.md' },
      { name: 'Process Memory', path: '/content/OS/process-memory.md' },
      { name: 'Inter-Process Communication', path: '/content/OS/ipc.md' },
      { name: 'File Systems', path: '/content/OS/file-systems.md' },
      { name: 'I/O Systems', path: '/content/OS/io-systems.md' },
      { name: 'Disk Scheduling', path: '/content/OS/disk-scheduling.md' },
      { name: 'Linux Knowledge', path: '/content/OS/linux-knowledge.md' }
    ]
  },
  {
    title: 'Data Structures & Algorithms',
    icon: <Layers size={18} />,
    category: 'DSA',
    items: [
      { name: 'Arrays', path: '/content/DSA/arrays.md' }
    ]
  },
  {
    title: 'Object Oriented Programming',
    icon: <Code size={18} />,
    category: 'OOP',
    items: [
      { name: 'Polymorphism', path: '/content/OOP/polymorphism.md' }
    ]
  },
  {
    title: 'Database Management',
    icon: <Database size={18} />,
    category: 'DBMS',
    items: [
      { name: 'Normalization', path: '/content/DBMS/normalization.md' }
    ]
  },
  {
    title: 'Projects',
    icon: <LayoutTemplate size={18} />,
    category: 'Projects',
    items: [
      { name: 'E-Commerce Platform', path: '/content/Projects/ecommerce.md' },
      { name: 'EMPLO Backend', path: '/content/Projects/EMPLO/backend.md' },
      { name: 'EMPLO Frontend', path: '/content/Projects/EMPLO/frontend.md' },
      { name: 'Forever Backend', path: '/content/Projects/Forever/backend.md' },
      { name: 'Forever Frontend', path: '/content/Projects/Forever/frontend.md' }
    ]
  },
  {
    title: 'Codebases',
    icon: <Code size={18} />,
    category: 'Codebase',
    items: [
      { name: 'Forever Repository', path: '/repos/Forever/tree.json', repo: 'Forever' }
    ]
  }
];

const SidebarSectionComponent = ({ section }) => {
  const location = useLocation();
  
  // Check if any item in this section is currently active to open it by default
  const isActiveSection = section.items.some(item => {
    const itemPath = item.repo ? `/codebase/${item.repo}` : `/topic/${section.category}/${item.name.toLowerCase().replace(/\s+/g, '-')}`;
    return location.pathname === itemPath;
  });

  const [isOpen, setIsOpen] = useState(isActiveSection); 

  return (
    <div className="sidebar-section">
      <h3 
        className="sidebar-section-title flex items-center justify-between cursor-pointer hover:text-gray-400 transition-colors select-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{section.title}</span>
        {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
      </h3>
      
      {isOpen && (
        <div className="sidebar-nav mt-2">
          {section.items.map((item, itemIdx) => (
            <NavLink 
              key={itemIdx}
              to={item.repo ? `/codebase/${item.repo}` : `/topic/${section.category}/${item.name.toLowerCase().replace(/\s+/g, '-')}`}
              state={item.repo ? { treeUrl: item.path } : { filePath: item.path }}
              className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
            >
              {section.icon}
              <span>{item.name}</span>
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
};

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <BookOpen size={24} color="#60a5fa" />
        <span>PrepMaster</span>
      </div>

      <nav className="sidebar-nav">
        <NavLink 
          to="/" 
          className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
          end
        >
          <BookOpen size={18} />
          <span>Overview</span>
        </NavLink>
        
        <div style={{ height: '2rem' }}></div>

        {SECTIONS.map((section, idx) => (
          <SidebarSectionComponent key={idx} section={section} />
        ))}
      </nav>
    </aside>
  );
}
