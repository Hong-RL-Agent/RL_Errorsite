import React, { useState, useEffect } from 'react';
import Header from './components/Header.jsx';
import SidebarFilter from './components/SidebarFilter.jsx';
import PropertyList from './components/PropertyList.jsx';
import MapPanel from './components/MapPanel.jsx';

function App() {
  const [properties, setProperties] = useState([]);
  const [filters, setFilters] = useState({ type: '전체', location: '' });

  const fetchProperties = (currentFilters) => {
    const { type, location } = currentFilters;
    let url = `/api/properties?type=${type}&location=${location}`;
    fetch(url)
      .then(res => res.json())
      .then(data => setProperties(data.data));
  };

  // Initial load
  useEffect(() => {
    fetchProperties(filters);
  }, []);

  const handleApplyFilter = (newFilters) => {
    setFilters(newFilters);
    fetchProperties(newFilters);
  };

  return (
    <div className="app-container">
      <Header />
      <div className="main-content">
        <SidebarFilter onApply={handleApplyFilter} />
        <PropertyList properties={properties} />
        <MapPanel />
      </div>
    </div>
  );
}

export default App;
