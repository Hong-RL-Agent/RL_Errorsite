import React from 'react';

export default function ProjectCard({ project }) {
  return (
    <div className="project-card">
      <img src={project.image} alt={project.title} />
      <div>
        <div style={{ color: 'var(--silver)', fontSize: '12px', textTransform: 'uppercase', marginBottom: '10px' }}>
          {project.client} • {project.duration}
        </div>
        <h3 style={{ fontSize: '32px', fontFamily: 'Playfair Display', marginBottom: '20px' }}>{project.title}</h3>
        
        {/* INTENTIONAL GUI BUG: site023-bug01
            Type: forced-decorative-font
            Description: 본문과 프로젝트 설명에 장식 폰트를 강제로 적용해 가독성이 떨어짐. */}
        <p className="project-description" data-bug-id="site023-bug01">
          {project.description}
        </p>

        {/* INTENTIONAL GUI BUG: site023-bug02
            Type: ambiguous-link-text
            Description: 모든 프로젝트 상세 링크가 동일한 모호한 텍스트로 표시되어 목적지를 구분하기 어려움. */}
        <a 
          href={`#project-${project.id}`} 
          className="btn" 
          style={{ marginTop: '30px', display: 'inline-block' }}
          data-bug-id="site023-bug02"
          onClick={(e) => { e.preventDefault(); alert('프로젝트 상세 페이지 준비중입니다.'); }}
        >
          자세히 보기
        </a>
      </div>
    </div>
  );
}
