import React, { useState } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import AIVideoGenerator from '../components/AIVideoGenerator';

const AIGeneratorPage = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-container">
      <Header onMenuClick={() => setSidebarOpen(true)} />
      <div className="main-layout">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="feed-container" style={{ padding: '20px', overflowY: 'auto' }}>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <AIVideoGenerator />
            </div>
        </main>
      </div>
    </div>
  );
};

export default AIGeneratorPage;