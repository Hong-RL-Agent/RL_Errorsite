import React from 'react';
import ArticleCard from './ArticleCard';

export default function ArticleGrid({ articles, onArticleClick }) {
  return (
    /* INTENTIONAL GUI BUG: site022-bug01
       Type: rtl-layout-not-supported
       Description: RTL 모드에서도 기사 카드 배치와 방향 아이콘이 LTR 기준으로 고정됨.
    */
    <section className="article-grid" data-bug-id="site022-bug01">
      {articles.map(article => (
        <ArticleCard key={article.id} article={article} onClick={onArticleClick} />
      ))}
    </section>
  );
}
