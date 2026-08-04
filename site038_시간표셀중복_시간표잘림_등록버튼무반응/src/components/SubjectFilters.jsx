import React from 'react';

const SubjectFilters = ({ currentFilter, setFilter }) => {
  const subjects = ['All', 'Math', 'English', 'Science', 'Korean', 'Coding'];

  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginBottom: '40px' }}>
      {subjects.map(subject => (
        <button
          key={subject}
          onClick={() => setFilter(subject)}
          className={`btn ${currentFilter === subject ? 'btn-primary' : 'btn-outline'}`}
          style={{ minWidth: '100px' }}
        >
          {subject === 'All' ? '전체 과목' : 
           subject === 'Math' ? '수학' :
           subject === 'English' ? '영어' :
           subject === 'Science' ? '과학' :
           subject === 'Korean' ? '국어' : '코딩'}
        </button>
      ))}
    </div>
  );
};

export default SubjectFilters;
