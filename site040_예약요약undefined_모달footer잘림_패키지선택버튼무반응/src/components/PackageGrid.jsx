import React from 'react';
import PackageCard from './PackageCard';

const PackageGrid = ({ packages, onSelect, onOpenDetails }) => {
  return (
    <div className="package-grid">
      {packages.map(pkg => (
        <PackageCard 
          key={pkg.id} 
          pkg={pkg} 
          onSelect={onSelect} 
          onOpenDetails={onOpenDetails} 
        />
      ))}
    </div>
  );
};

export default PackageGrid;
