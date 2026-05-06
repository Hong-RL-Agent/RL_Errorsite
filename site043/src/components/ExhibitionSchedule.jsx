import { CalendarClock } from 'lucide-react';

const schedule = {
  current: [
    { date: '05.04', title: 'Light Archive 온라인 프리뷰', location: 'Online Viewing Room' },
    { date: '05.18', title: '큐레이터 라이브 투어', location: 'Atelier Veyron Seoul' }
  ],
  upcoming: [
    { date: '06.03', title: '프라이빗 컬렉터 데이', location: 'Cheongdam Salon' },
    { date: '06.21', title: '작가와의 대화', location: 'Main Gallery' }
  ],
  past: [
    { date: '04.12', title: 'Young Collector Preview', location: 'Viewing Room B' },
    { date: '03.28', title: 'Material Notes', location: 'Archive Hall' }
  ]
};

const tabs = [
  { id: 'current', label: '현재 일정' },
  { id: 'upcoming', label: '예정' },
  { id: 'past', label: '지난 일정' }
];

export default function ExhibitionSchedule({ activeTab, onTabChange }) {
  return (
    <section className="schedule-section section-card">
      <div className="section-heading">
        <div>
          <span className="section-kicker">Exhibition Calendar</span>
          <h2>전시 일정</h2>
        </div>
        <div className="schedule-tabs" role="tablist" aria-label="전시 일정 탭">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={activeTab === tab.id ? 'active' : ''}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              onClick={() => onTabChange(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="schedule-list">
        {schedule[activeTab].map((item) => (
          <article key={`${item.date}-${item.title}`}>
            <span><CalendarClock size={16} aria-hidden="true" /> {item.date}</span>
            <strong>{item.title}</strong>
            <small>{item.location}</small>
          </article>
        ))}
      </div>
    </section>
  );
}
