import { useEffect, useRef } from 'react';

function DisclaimerModal({ isOpen, onClose }) {
  const modalRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="disclaimer-overlay">
      <div className="disclaimer-modal" ref={modalRef}>
        {/* Header */}
        <div className="disclaimer-modal-header">
          <div className="disclaimer-header-content">
            <div className="disclaimer-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                <path d="m9 12 2 2 4-4"/>
              </svg>
            </div>
            <h3 className="disclaimer-modal-title">Hurammy Creator Content Disclaimer</h3>
          </div>
          <button className="iconBtn" onClick={onClose} aria-label="Close">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="disclaimer-modal-body">
          <p className="disclaimer-intro">
            By uploading or publishing content on Hurammy, you agree to the following:
          </p>

          <div className="disclaimer-sections">
            <div className="disclaimer-section">
              <div className="disclaimer-section-header">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/>
                  <circle cx="12" cy="12" r="4"/>
                </svg>
                <h4>Ownership & Rights</h4>
              </div>
              <p>You confirm that you own or have obtained all necessary rights, licenses, and permissions for the content you upload, including but not limited to music, video, images, and any third-party materials.</p>
            </div>

            <div className="disclaimer-section">
              <div className="disclaimer-section-header">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
                </svg>
                <h4>No Infringement</h4>
              </div>
              <p>Your content does not infringe upon any copyright, trademark, privacy, publicity, or other legal rights of any third party.</p>
            </div>

            <div className="disclaimer-section">
              <div className="disclaimer-section-header">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                <h4>Content Responsibility</h4>
              </div>
              <p>You are solely responsible for the content you publish. Hurammy is not liable for any claims, damages, or disputes arising from your content.</p>
            </div>

            <div className="disclaimer-section">
              <div className="disclaimer-section-header">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 8v8"/>
                  <path d="M8 12h8"/>
                </svg>
                <h4>Platform Usage Rights</h4>
              </div>
              <p>By uploading content, you grant Hurammy a worldwide, non-exclusive, royalty-free license to host, display, distribute, and promote your content on the platform.</p>
            </div>

            <div className="disclaimer-section">
              <div className="disclaimer-section-header">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18.36 6.64a9 9 0 1 1-12.73 0"/>
                  <line x1="12" y1="2" x2="12" y2="12"/>
                </svg>
                <h4>Prohibited Content</h4>
              </div>
              <p>You agree not to upload content that is illegal, harmful, abusive, defamatory, or otherwise violates applicable laws or platform policies.</p>
            </div>

            <div className="disclaimer-section">
              <div className="disclaimer-section-header">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 6h18"/>
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                </svg>
                <h4>Content Removal</h4>
              </div>
              <p>Hurammy reserves the right to remove or restrict content that violates these terms or applicable laws without prior notice.</p>
            </div>

            <div className="disclaimer-section">
              <div className="disclaimer-section-header">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
                <h4>Indemnification</h4>
              </div>
              <p>You agree to indemnify and hold Hurammy harmless from any claims, losses, or liabilities arising from your content.</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="disclaimer-modal-footer">
          <button className="btn primary" onClick={onClose}>
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
}

export default DisclaimerModal;
