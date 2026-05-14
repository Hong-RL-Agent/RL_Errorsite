import React from 'react';
import BoxCard from './BoxCard';

const BoxGrid = ({ boxes, onSelect, onDetails }) => {
  return (
    <div className="box-grid" id="grid" data-bug-id="site041-bug02">
      {boxes.map(box => (
        <BoxCard 
          key={box.id} 
          box={box} 
          onSelect={onSelect} 
          onDetails={onDetails} 
        />
      ))}
    </div>
  );
};

export default BoxGrid;
