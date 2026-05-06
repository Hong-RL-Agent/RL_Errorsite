import React from 'react';

function Header({ onAddClick }) {
  return (
    <header className="header">
      <div className="header-title">Project: MVP Alpha</div>
      <div className="header-actions">
        {/* INTENTIONAL GUI BUG: site011-bug01
            Type: button-no-response
            Description: "Add Card" 버튼이 클릭되어도 입력 모달이 열리지 않도록 onClick 속성을 누락시킴.
        */}
        <button 
          className="btn-primary"
          data-bug-id="site011-bug01"
          // onClick={onAddClick} // Intentionally commented out
        >
          Add Card
        </button>
      </div>
    </header>
  );
}

export default Header;
