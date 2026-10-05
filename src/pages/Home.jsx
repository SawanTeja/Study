import React from 'react';
import { Code, Database, Layers, LayoutTemplate, Monitor } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FEATURES = [
  { title: 'Operating Systems', desc: 'OS Fundamentals, System Calls, Process Management', icon: <Monitor size={24} />, path: '/topic/OS/intro-to-os', filePath: '/content/OS/intro-to-os.md' },
  { title: 'DSA', desc: 'Master Data Structures & Algorithms', icon: <Layers size={24} />, path: '/topic/DSA/arrays', filePath: '/content/DSA/arrays.md' },
  { title: 'OOP', desc: 'Object Oriented Principles & Design Patterns', icon: <Code size={24} />, path: '/topic/OOP/oop-fundamentals', filePath: '/content/OOP/oop-fundamentals.md' },
  { title: 'DBMS', desc: 'Database Management Systems & SQL', icon: <Database size={24} />, path: '/topic/DBMS/dbms-fundamentals', filePath: '/content/DBMS/dbms-fundamentals.md' },
  { title: 'Projects', desc: 'In-depth project guides & architecture', icon: <LayoutTemplate size={24} />, path: '/topic/Projects/e-commerce-platform', filePath: '/content/Projects/ecommerce.md' },
];

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="markdown-body">
      <h1>Welcome to PrepMaster</h1>
      <p>
        Your all-in-one preparation guide for software engineering interviews. 
        Select a topic from the sidebar or jump right into one of the core categories below.
      </p>

      <div className="home-grid">
        {FEATURES.map((feature, idx) => (
          <div 
            key={idx} 
            className="feature-card" 
            onClick={() => navigate(feature.path, { state: { filePath: feature.filePath } })}
          >
            <div className="feature-icon">
              {feature.icon}
            </div>
            <h3 style={{ marginTop: 0 }}>{feature.title}</h3>
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              {feature.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
