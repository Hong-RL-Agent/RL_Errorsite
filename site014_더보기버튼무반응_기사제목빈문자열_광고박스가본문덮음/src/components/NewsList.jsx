import React from 'react';

function NewsList({ news, onSelect }) {
  return (
    <div className="news-grid">
      {news.map(article => {
        {/* INTENTIONAL GUI BUG: site014-bug02
            Type: component-rendering
            Description: 특정 기사(id=2)의 경우 제목을 빈 문자열로 강제 렌더링함.
        */}
        const displayTitle = article.id === 2 ? "" : article.title;
        
        return (
          <div 
            key={article.id} 
            className="news-card" 
            onClick={() => onSelect(article)}
            data-bug-id={article.id === 2 ? "site014-bug02" : undefined}
          >
            <div className="category">{article.category}</div>
            <div className="title">{displayTitle}</div>
            <div className="summary">{article.summary}</div>
            <div className="date">{article.date}</div>
          </div>
        );
      })}
      
      {/* INTENTIONAL GUI BUG: site014-bug01
          Type: button-no-response
          Description: 더보기 버튼 클릭 시 기사 목록을 늘리는 로직을 연결하지 않음.
      */}
      <button 
        className="btn-more"
        data-bug-id="site014-bug01"
        // onClick={() => console.log('Load more clicked')} // Intentionally no state change
      >
        Load More
      </button>
    </div>
  );
}

export default NewsList;
