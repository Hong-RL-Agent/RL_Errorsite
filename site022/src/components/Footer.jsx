import React from 'react';

export default function Footer() {
  return (
    <footer>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '40px', marginBottom: '40px' }}>
          <div>
            <div className="logo" style={{ color: 'white', textAlign: 'left', fontSize: '24px', marginBottom: '20px' }}>GlobalNews</div>
            <p style={{ fontSize: '14px', color: '#94a3b8', lineHeight: 1.6 }}>Trusted journalism for a global audience. Delivering news, analysis, and opinion since 2026.</p>
          </div>
          <div>
            <h4 style={{ color: 'white', marginBottom: '20px' }}>Sections</h4>
            <ul style={{ listStyle: 'none', padding: 0, fontSize: '14px', color: '#94a3b8' }}>
              <li style={{ marginBottom: '10px' }}>Technology</li>
              <li style={{ marginBottom: '10px' }}>Business</li>
              <li style={{ marginBottom: '10px' }}>Science</li>
              <li>Lifestyle</li>
            </ul>
          </div>
          <div>
            <h4 style={{ color: 'white', marginBottom: '20px' }}>About Us</h4>
            <ul style={{ listStyle: 'none', padding: 0, fontSize: '14px', color: '#94a3b8' }}>
              <li style={{ marginBottom: '10px' }}>Our Mission</li>
              <li style={{ marginBottom: '10px' }}>Editorial Staff</li>
              <li style={{ marginBottom: '10px' }}>Advertising</li>
              <li>Contact</li>
            </ul>
          </div>
          <div>
            <h4 style={{ color: 'white', marginBottom: '20px' }}>Legal</h4>
            <ul style={{ listStyle: 'none', padding: 0, fontSize: '14px', color: '#94a3b8' }}>
              <li style={{ marginBottom: '10px' }}>Terms of Service</li>
              <li style={{ marginBottom: '10px' }}>Privacy Policy</li>
              <li>Cookie Policy</li>
            </ul>
          </div>
        </div>
        <div style={{ borderTop: '1px solid #334155', paddingTop: '20px', textAlign: 'center', fontSize: '12px', color: '#64748b' }}>
          &copy; 2026 GlobalNews Digital. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
