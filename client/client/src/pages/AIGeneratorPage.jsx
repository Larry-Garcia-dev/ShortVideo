import React, { useState } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import AIVideoGenerator from '../components/AIVideoGenerator';
import './AIGeneratorPage.css';

const AIGeneratorPage = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-container">
      <Header onMenuClick={() => setSidebarOpen(true)} />
      <div className="main-layout">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="ai-page-content">
          {/* Hero Section */}
          <div className="ai-page-hero">
            <div className="ai-page-hero-badge">
              <span className="ai-page-hero-dot"></span>
              Potenciado por IA
            </div>
            <h1 className="ai-page-hero-title">Crea videos con Inteligencia Artificial</h1>
            <p className="ai-page-hero-subtitle">
              Transforma tus imágenes en videos impresionantes con un solo clic. 
              Nuestra IA genera contenido de alta calidad en minutos.
            </p>
          </div>

          {/* Generator Component */}
          <div className="ai-page-generator">
            <AIVideoGenerator />
          </div>

          {/* Features Grid */}
          <div className="ai-page-features">
            <div className="ai-feature-card">
              <div className="ai-feature-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
              </div>
              <h3>Rápido</h3>
              <p>Videos generados en 1-5 minutos</p>
            </div>
            <div className="ai-feature-card">
              <div className="ai-feature-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
              </div>
              <h3>Alta Calidad</h3>
              <p>Resolución 720p profesional</p>
            </div>
            <div className="ai-feature-card">
              <div className="ai-feature-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 18V5l12-2v13"/>
                  <circle cx="6" cy="18" r="3"/>
                  <circle cx="18" cy="16" r="3"/>
                </svg>
              </div>
              <h3>Con Audio</h3>
              <p>Agrega tu propia música</p>
            </div>
            <div className="ai-feature-card">
              <div className="ai-feature-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
              </div>
              <h3>Descargable</h3>
              <p>Guarda tus videos fácilmente</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AIGeneratorPage;
