import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  BookOpen, 
  Code, 
  Database, 
  LayoutTemplate, 
  Layers, 
  Monitor, 
  ChevronDown, 
  ChevronRight,
  Folder,
  Globe,
  Terminal,
  FileText,
  PanelLeftClose
} from 'lucide-react';
import ThemeToggle from './ThemeToggle';

export const flattenItems = (items, category) => {
  let result = [];
  for (const item of items) {
    if (item.subsections) {
      for (const sub of item.subsections) {
        if (sub.items) {
          result = result.concat(flattenItems(sub.items, category));
        } else if (sub.path || sub.repoName) {
          const slug = sub.slug || sub.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
          result.push({
            ...sub,
            category,
            routePath: sub.repoName ? `/codebase/${sub.repoName}` : `/topic/${category}/${slug}`
          });
        }
      }
    } else if (item.items) {
      result = result.concat(flattenItems(item.items, category));
    } else if (item.path || item.repoName) {
      const slug = item.slug || item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      result.push({
        ...item,
        category,
        routePath: item.repoName ? `/codebase/${item.repoName}` : `/topic/${category}/${slug}`
      });
    }
  }
  return result;
};

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
      { name: 'OOP Fundamentals', path: '/content/OOP/oop-fundamentals.md' },
      { name: 'Polymorphism', path: '/content/OOP/polymorphism.md' },
      { name: 'Relationships & Advanced OOP', slug: 'advanced-oop', path: '/content/OOP/advanced-oop.md' },
      { name: 'Design Patterns & Generics', slug: 'design-patterns', path: '/content/OOP/design-patterns.md' }
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
      {
        name: 'EMPLO',
        isGroup: true,
        icon: <Folder size={16} />,
        subsections: [
          {
            name: 'Frontend',
            icon: <Globe size={15} />,
            items: [
              { 
                name: 'Module 1: Overview & Architecture', 
                slug: 'emplo-frontend-module-1', 
                path: '/content/Projects/EMPLO/frontend/module1_overview.md' 
              },
              { 
                name: 'Module 2: Routing & Authentication', 
                slug: 'emplo-frontend-module-2', 
                path: '/content/Projects/EMPLO/frontend/module2_routing_auth.md' 
              },
              { 
                name: 'Module 3: Networking & API', 
                slug: 'emplo-frontend-module-3', 
                path: '/content/Projects/EMPLO/frontend/module3_networking.md' 
              },
              { 
                name: 'Module 4: AI Interview Architecture', 
                slug: 'emplo-frontend-module-4', 
                path: '/content/Projects/EMPLO/frontend/module4_ai_interview.md' 
              },
              { 
                name: 'Module 5: Styling & UI Components', 
                slug: 'emplo-frontend-module-5', 
                path: '/content/Projects/EMPLO/frontend/module5_ui_styling.md' 
              }
            ]
          },
          { 
            name: 'Backend', 
            icon: <Terminal size={15} />,
            items: [
              {
                name: 'Module 1: Architecture & Request Pipeline',
                slug: 'emplo-backend-module-1',
                path: '/content/Projects/EMPLO/backend/module1_overview.md'
              },
              {
                name: 'Module 2: Security & Authentication',
                slug: 'emplo-backend-module-2',
                path: '/content/Projects/EMPLO/backend/module2_security_auth.md'
              },
              {
                name: 'Module 3: Data Modeling & Validation',
                slug: 'emplo-backend-module-3',
                path: '/content/Projects/EMPLO/backend/module3_database_models.md'
              },
              {
                name: 'Module 4: Live AI Engine & State Machine',
                slug: 'emplo-backend-module-4',
                path: '/content/Projects/EMPLO/backend/module4_ai_interview_engine.md'
              },
              {
                name: 'Module 5: Evaluation Pipeline & Tooling',
                slug: 'emplo-backend-module-5',
                path: '/content/Projects/EMPLO/backend/module5_evaluation_pipeline.md'
              }
            ]
          }
        ]
      },
      {
        name: 'Plannify',
        isGroup: true,
        icon: <Folder size={16} />,
        subsections: [
          {
            name: 'Frontend',
            icon: <Globe size={15} />,
            items: [
              { 
                name: 'Module 1: Core Architecture & Navigation', 
                slug: 'plannify-frontend-module-1', 
                path: '/content/Projects/Plannify/frontend/01_CORE_ARCHITECTURE_AND_NAVIGATION.md' 
              },
              { 
                name: 'Module 2: Global State, Storage & Alerts', 
                slug: 'plannify-frontend-module-2', 
                path: '/content/Projects/Plannify/frontend/02_GLOBAL_STATE_STORAGE_AND_ALERTS.md' 
              },
              { 
                name: 'Module 3: Auth Services & Backend API', 
                slug: 'plannify-frontend-module-3', 
                path: '/content/Projects/Plannify/frontend/03_AUTH_SERVICES_AND_BACKEND_API.md' 
              },
              { 
                name: 'Module 4: Drive Backup & Sync Engine', 
                slug: 'plannify-frontend-module-4', 
                path: '/content/Projects/Plannify/frontend/04_DRIVE_BACKUP_AND_SYNC_ENGINE.md' 
              },
              { 
                name: 'Module 5: Notification & Scheduler', 
                slug: 'plannify-frontend-module-5', 
                path: '/content/Projects/Plannify/frontend/05_NOTIFICATION_AND_SCHEDULER.md' 
              },
              { 
                name: 'Module 6: Onboarding & User Setup', 
                slug: 'plannify-frontend-module-6', 
                path: '/content/Projects/Plannify/frontend/06_ONBOARDING_AND_USER_SETUP.md' 
              },
              { 
                name: 'Module 7: Home Summary Dashboard', 
                slug: 'plannify-frontend-module-7', 
                path: '/content/Projects/Plannify/frontend/07_HOME_SUMMARY_DASHBOARD.md' 
              },
              { 
                name: 'Module 8: Habit Tracking & Gamification', 
                slug: 'plannify-frontend-module-8', 
                path: '/content/Projects/Plannify/frontend/08_HABIT_TRACKING_AND_GAMIFICATION.md' 
              },
              { 
                name: 'Module 9: Task Management, Pomodoro & Matrix', 
                slug: 'plannify-frontend-module-9', 
                path: '/content/Projects/Plannify/frontend/09_TASK_MANAGEMENT_POMODORO_AND_MATRIX.md' 
              },
              { 
                name: 'Module 10: Attendance Tracking & Calculator', 
                slug: 'plannify-frontend-module-10', 
                path: '/content/Projects/Plannify/frontend/10_ATTENDANCE_TRACKING_AND_CALCULATOR.md' 
              },
              { 
                name: 'Module 11: Budget Planner & Expense Analytics', 
                slug: 'plannify-frontend-module-11', 
                path: '/content/Projects/Plannify/frontend/11_BUDGET_PLANNER_AND_EXPENSE_ANALYTICS.md' 
              },
              { 
                name: 'Module 12: SplitFund, Social & Journal', 
                slug: 'plannify-frontend-module-12', 
                path: '/content/Projects/Plannify/frontend/12_SPLITFUND_SOCIAL_AND_JOURNAL.md' 
              }
            ]
          },
          { 
            name: 'Backend', 
            icon: <Terminal size={15} />,
            items: [
              {
                name: 'Module 1: Server Architecture & Database',
                slug: 'plannify-backend-module-1',
                path: '/content/Projects/Plannify/backend/01_SERVER_ARCHITECTURE_AND_DATABASE.md'
              },
              {
                name: 'Module 2: Auth Identity & User Management',
                slug: 'plannify-backend-module-2',
                path: '/content/Projects/Plannify/backend/02_AUTH_IDENTITY_AND_USER_MANAGEMENT.md'
              },
              {
                name: 'Module 3: Delta Sync & Data Models',
                slug: 'plannify-backend-module-3',
                path: '/content/Projects/Plannify/backend/03_DELTA_SYNC_AND_DATA_MODELS.md'
              },
              {
                name: 'Module 4: Media Pipeline & Journal API',
                slug: 'plannify-backend-module-4',
                path: '/content/Projects/Plannify/backend/04_MEDIA_PIPELINE_AND_JOURNAL_API.md'
              },
              {
                name: 'Module 5: SplitFund Expense & Settlement API',
                slug: 'plannify-backend-module-5',
                path: '/content/Projects/Plannify/backend/05_SPLITFUND_EXPENSE_AND_SETTLEMENT_API.md'
              },
              {
                name: 'Module 6: Social Communities & Feeds API',
                slug: 'plannify-backend-module-6',
                path: '/content/Projects/Plannify/backend/06_SOCIAL_COMMUNITIES_AND_FEEDS_API.md'
              }
            ]
          }
        ]
      },
      { name: 'Forever Backend', path: '/content/Projects/Forever/backend.md' },
      { name: 'Forever Frontend', path: '/content/Projects/Forever/frontend.md' },
      {
        name: 'FluxDrop',
        isGroup: true,
        icon: <Folder size={16} />,
        subsections: [
          {
            name: 'Engine Architecture & Core',
            icon: <Terminal size={15} />,
            items: [
              {
                name: 'Module 01: System Architecture & Overview',
                slug: 'fluxdrop-module-01-architecture-overview',
                path: '/content/Projects/FluxDrop/01_architecture_and_overview.md'
              },
              {
                name: 'Module 02: C API & Application Integration',
                slug: 'fluxdrop-module-02-c-api-integration',
                path: '/content/Projects/FluxDrop/02_c_api_and_integration.md'
              },
              {
                name: 'Module 03: Binary Protocol & Wire Serialization',
                slug: 'fluxdrop-module-03-protocol-serialization',
                path: '/content/Projects/FluxDrop/03_protocol_and_packet_serialization.md'
              },
              {
                name: 'Module 04: Security & Cryptography (libsodium)',
                slug: 'fluxdrop-module-04-security-cryptography',
                path: '/content/Projects/FluxDrop/04_security_and_cryptography.md'
              },
              {
                name: 'Module 05: Boost.Asio & Network Abstraction',
                slug: 'fluxdrop-module-05-boost-asio-networking',
                path: '/content/Projects/FluxDrop/05_boost_asio_and_networking_deep_dive.md'
              },
              {
                name: 'Module 06: Device Discovery Subsystem',
                slug: 'fluxdrop-module-06-device-discovery',
                path: '/content/Projects/FluxDrop/06_device_discovery_subsystem.md'
              },
              {
                name: 'Module 07: Transfer Engine & Resumption Pipeline',
                slug: 'fluxdrop-module-07-transfer-engine-resumption',
                path: '/content/Projects/FluxDrop/07_transfer_engine_and_resumption.md'
              },
              {
                name: 'Module 08: Bidirectional Session Architecture',
                slug: 'fluxdrop-module-08-bidirectional-session',
                path: '/content/Projects/FluxDrop/08_bidirectional_session_manager.md'
              },
              {
                name: 'Module 09: Concurrency Model & Synchronization',
                slug: 'fluxdrop-module-09-concurrency-threading',
                path: '/content/Projects/FluxDrop/09_concurrency_threading_and_synchronization.md'
              },
              {
                name: 'Module 10: Third-Party Libraries & Testing Guide',
                slug: 'fluxdrop-module-10-testing-tooling',
                path: '/content/Projects/FluxDrop/10_testing_tooling_and_third_party_libraries.md'
              }
            ]
          }
        ]
      }
    ]
  },
  {
    title: 'Codebases',
    icon: <Code size={18} />,
    category: 'Codebase',
    items: [
      { name: 'Forever Repository', repoOwner: 'SawanTeja', repoName: 'Forever', repoBranch: 'main' },
      { name: 'FluxDrop Repository', repoOwner: 'SawanTeja', repoName: 'FluxDrop', repoBranch: 'main' }
    ]
  }
];

const SidebarSubgroupComponent = ({ subgroup, category }) => {
  const location = useLocation();
  const subgroupFlat = flattenItems(subgroup.items, category);
  const hasActiveChild = subgroupFlat.some(item => location.pathname === item.routePath);
  const [isOpen, setIsOpen] = useState(hasActiveChild);

  useEffect(() => {
    if (hasActiveChild) {
      setIsOpen(true);
    }
  }, [hasActiveChild]);

  return (
    <div className="nav-subgroup-container">
      <div 
        className={`nav-subgroup-header ${hasActiveChild ? 'has-active-child' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="nav-subgroup-header-label">
          {subgroup.icon || <Layers size={14} />}
          <span>{subgroup.name}</span>
        </div>
        {isOpen ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
      </div>

      {isOpen && (
        <div className="nav-subgroup-items">
          {subgroup.items.map((item, itemIdx) => {
            const slug = item.slug || item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
            const toPath = `/topic/${category}/${slug}`;
            return (
              <NavLink
                key={itemIdx}
                to={toPath}
                state={{ filePath: item.path }}
                className={({ isActive }) => isActive ? 'nav-subitem active' : 'nav-subitem'}
                title={item.name}
              >
                <FileText size={13} style={{ flexShrink: 0 }} />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </div>
      )}
    </div>
  );
};

const SidebarGroupComponent = ({ group, category }) => {
  const location = useLocation();
  const groupFlat = flattenItems([group], category);
  const hasActiveChild = groupFlat.some(item => location.pathname === item.routePath);
  const [isOpen, setIsOpen] = useState(hasActiveChild);

  useEffect(() => {
    if (hasActiveChild) {
      setIsOpen(true);
    }
  }, [hasActiveChild]);

  return (
    <div className="nav-group">
      <div 
        className={`nav-group-header ${hasActiveChild ? 'has-active-child' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="nav-group-header-label">
          {group.icon || <Folder size={16} />}
          <span>{group.name}</span>
        </div>
        {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
      </div>

      {isOpen && (
        <div className="nav-subgroup">
          {group.subsections.map((sub, subIdx) => {
            if (sub.items) {
              return <SidebarSubgroupComponent key={subIdx} subgroup={sub} category={category} />;
            }
            const slug = sub.slug || sub.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
            const toPath = `/topic/${category}/${slug}`;
            return (
              <NavLink
                key={subIdx}
                to={toPath}
                state={{ filePath: sub.path }}
                className={({ isActive }) => isActive ? 'nav-subitem active' : 'nav-subitem'}
              >
                {sub.icon || <Terminal size={14} style={{ flexShrink: 0 }} />}
                <span>{sub.name}</span>
              </NavLink>
            );
          })}
        </div>
      )}
    </div>
  );
};

const SidebarSectionComponent = ({ section }) => {
  const location = useLocation();
  const sectionFlatItems = flattenItems(section.items, section.category);
  const isActiveSection = sectionFlatItems.some(item => location.pathname === item.routePath);

  const [isOpen, setIsOpen] = useState(isActiveSection); 

  useEffect(() => {
    if (isActiveSection) {
      setIsOpen(true);
    }
  }, [isActiveSection]);

  return (
    <div className="sidebar-section">
      <h3 
        className="sidebar-section-title cursor-pointer select-none"
        onClick={() => setIsOpen(!isOpen)}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
      >
        <span>{section.title}</span>
        {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
      </h3>
      
      {isOpen && (
        <div className="sidebar-nav" style={{ marginTop: '0.5rem' }}>
          {section.items.map((item, itemIdx) => {
            if (item.subsections) {
              return <SidebarGroupComponent key={itemIdx} group={item} category={section.category} />;
            }
            const slug = item.slug || item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
            const toPath = item.repoName ? `/codebase/${item.repoName}` : `/topic/${section.category}/${slug}`;
            return (
              <NavLink 
                key={itemIdx}
                to={toPath}
                state={item.repoName ? { repoOwner: item.repoOwner, repoName: item.repoName, repoBranch: item.repoBranch } : { filePath: item.path }}
                className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
              >
                {section.icon}
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default function Sidebar({ onToggleCollapse }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-brand">
          <BookOpen size={24} className="sidebar-logo-icon" />
          <span>PrepMaster</span>
        </div>
        {onToggleCollapse && (
          <button 
            type="button" 
            className="sidebar-collapse-btn desktop-only"
            onClick={onToggleCollapse}
            title="Hide sidebar (Ctrl+B)"
            aria-label="Hide sidebar"
          >
            <PanelLeftClose size={18} />
          </button>
        )}
      </div>

      <div className="sidebar-content">
        <nav className="sidebar-nav">
          <NavLink 
            to="/" 
            className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
            end
          >
            <BookOpen size={18} />
            <span>Overview</span>
          </NavLink>
          
          <div style={{ height: '1.25rem' }}></div>

          {SECTIONS.map((section, idx) => (
            <SidebarSectionComponent key={idx} section={section} />
          ))}
        </nav>
      </div>

      <div className="sidebar-footer">
        <div className="sidebar-footer-title">Theme</div>
        <ThemeToggle variant="segmented" />
      </div>
    </aside>
  );
}
