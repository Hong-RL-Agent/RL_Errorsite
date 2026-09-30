import React from 'react';
import { Clock, Heart, Eye, User } from 'lucide-react';

export default function RecipeCard({ recipe, onClick }) {
  return (
    <div className="recipe-card" onClick={onClick}>
      <div className="recipe-card-thumb-wrap">
        <img 
          src={recipe.image} 
          alt={recipe.title} 
          className="recipe-card-thumb" 
          loading="lazy" 
        />
        <span className={`card-category-badge ${recipe.category}`}>
          {recipe.category}
        </span>
        <span className="card-time-badge">
          <Clock size={13} color="var(--primary)" />
          <span>{recipe.cookingTime}분</span>
        </span>
      </div>

      <div className="recipe-card-body">
        <h3 className="recipe-card-title">{recipe.title}</h3>
        <p className="recipe-card-desc">{recipe.description}</p>

        <div className="recipe-card-footer">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <User size={14} color="var(--primary)" />
            <span style={{ fontWeight: '600', color: 'var(--text-muted)' }}>{recipe.authorName}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              <Heart size={13} color="#ea580c" />
              <span>{recipe.likes}</span>
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              <Eye size={13} />
              <span>{recipe.views}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
