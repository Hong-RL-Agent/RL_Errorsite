import React from 'react';
import { Clock, BarChart, Heart } from 'lucide-react';

export default function RecipeCard({ recipe, onClick }) {
  return (
    <div className="card recipe-card" onClick={() => onClick(recipe)} data-bug-id="site027-bug03">
      <img src={recipe.image} alt={recipe.title} className="recipe-card-img" />
      <div className="recipe-card-body">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, lineHeight: 1.3 }}>{recipe.title}</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--primary)' }}>
            <Heart size={14} fill="var(--primary)" /> {recipe.saved.toLocaleString()}
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '15px', color: 'var(--text-muted)', fontSize: '13px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <BarChart size={14} /> {recipe.difficulty}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Clock size={14} /> {recipe.time}
          </div>
        </div>
      </div>
    </div>
  );
}
