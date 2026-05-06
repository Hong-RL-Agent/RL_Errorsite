import React from 'react';

export default function BreakingTicker() {
  const news = [
    "BREAKING: New breakthrough in quantum computing announced by research team.",
    "JUST IN: Global markets respond positively to new trade agreement.",
    "WEATHER: Severe storm warning issued for the northeastern coast.",
    "SPORTS: Local team secures spot in the upcoming championship finals."
  ];

  return (
    /* INTENTIONAL GUI BUG: site022-bug02
       Type: prefers-reduced-motion-ignored
       Description: 속보 ticker 영역에 data-bug-id를 부여함.
    */
    <div className="ticker-wrap" data-bug-id="site022-bug02">
      <div className="ticker-content">
        {news.map((item, index) => (
          <div key={index} className="ticker-item">
            <span>•</span> {item}
          </div>
        ))}
        {/* Duplicate for seamless loop */}
        {news.map((item, index) => (
          <div key={`dup-${index}`} className="ticker-item">
            <span>•</span> {item}
          </div>
        ))}
      </div>
    </div>
  );
}
