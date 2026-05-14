import React from 'react';
import { Instagram, Twitter, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer>
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div className="logo" style={{ fontSize: '20px', marginBottom: '10px' }}>CREATOR GALLERY</div>
            <p style={{ fontSize: '12px' }}>© 2026 Photography Portfolio. All rights reserved.</p>
          </div>
          
          <div className="flex gap-20" style={{ display: 'flex', gap: '20px' }}>
            <Instagram size={20} style={{ cursor: 'pointer' }} />
            <Twitter size={20} style={{ cursor: 'pointer' }} />
            <Mail size={20} style={{ cursor: 'pointer' }} />
          </div>
          
          <div style={{ textAlign: 'right', fontSize: '12px' }}>
            123 Studio Street, Seoul, Korea <br/>
            contact@creatorgallery.com
          </div>
        </div>
      </div>
    </footer>
  );
}
