import React from 'react';

export default function ProsCons({ pros, cons }) {
  return (
    <div className="pros-cons">
      <div className="pros"><h4>장점</h4><ul>{pros.map((t) => (<li key={t}>{t}</li>))}</ul></div>
      <div className="cons"><h4>단점</h4><ul>{cons.map((t) => (<li key={t}>{t}</li>))}</ul></div>
    </div>
  );
}
