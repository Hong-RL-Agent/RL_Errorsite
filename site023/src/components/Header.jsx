import React from 'react';
import { Sun, Moon } from 'lucide-react';

export default function Header() {
  return (
    /* INTENTIONAL GUI BUG: site023-bug03
       Type: missing-skip-link
       Description: 반복되는 네비게이션을 건너뛰는 skip link를 제공하지 않음.
    */
    <header data-bug-id="site023-bug03">
      <div className="container flex justify-between items-center" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="logo">CREATOR GALLERY</div>
        
        <nav>
          <ul>
            <li><button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', textTransform: 'uppercase' }}>Home</button></li>
            <li><button onClick={() => document.getElementById('gallery').scrollIntoView({ behavior: 'smooth' })} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', textTransform: 'uppercase' }}>Gallery</button></li>
            <li><button onClick={() => document.getElementById('projects').scrollIntoView({ behavior: 'smooth' })} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', textTransform: 'uppercase' }}>Projects</button></li>
            <li><button onClick={() => document.getElementById('contact').scrollIntoView({ behavior: 'smooth' })} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', textTransform: 'uppercase' }}>Contact</button></li>
          </ul>
        </nav>

        <div className="flex items-center gap-20" style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <button className="theme-toggle" onClick={() => alert('테마 전환 기능 준비중입니다.')} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
            <Sun size={20} />
          </button>
          <button className="btn" onClick={() => document.getElementById('contact').scrollIntoView({ behavior: 'smooth' })}>Inquiry</button>
        </div>
      </div>
    </header>
  );
}
