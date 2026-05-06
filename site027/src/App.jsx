import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import RecipeHero from './components/RecipeHero';
import SearchFilters from './components/SearchFilters';
import RecipeCard from './components/RecipeCard';
import RecipeModal from './components/RecipeModal';
import SavedRecipesPanel from './components/SavedRecipesPanel';
import ChefSection from './components/ChefSection';
import Footer from './components/Footer';

import './styles/global.css';
import './styles/recipes.css';
import './styles/responsive.css';

export default function App() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [difficulty, setDifficulty] = useState('All');
  const [time, setTime] = useState('All');
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  useEffect(() => {
    fetchRecipes();
  }, [difficulty]); // BUG01: Dependency is difficulty, but fetch function might be using stale state if not careful

  const fetchRecipes = async () => {
    setLoading(true);
    try {
      // INTENTIONAL GUI BUG: site027-bug01
      // Type: filter-result-mismatch
      // Description: 선택된 난이도 state와 레시피 필터링에 사용되는 state가 달라 결과 목록이 불일치함.
      
      // We want to simulate the bug where difficulty filter is "쉬움" but list shows "중간"
      // Let's use a local variable that mocks the bug if difficulty is '쉬움'
      let queryDifficulty = difficulty;
      if (difficulty === '쉬움') {
        // Force the query to be something else, or don't filter correctly
        queryDifficulty = '중간'; 
      }

      const res = await fetch(`/api/recipes?difficulty=${queryDifficulty}`);
      const data = await res.json();
      setRecipes(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <Header />
      <main className="container">
        <RecipeHero />
        
        <div className="main-grid">
          <section className="main-content">
            <SearchFilters 
              difficulty={difficulty} 
              onDifficultyChange={setDifficulty}
              time={time}
              onTimeChange={setTime}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
              <h2 style={{ margin: 0, fontSize: '22px' }}>레시피 탐색 <span style={{ color: 'var(--primary)', marginLeft: '8px' }}>{recipes.length}</span></h2>
              <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>인기순 | 최신순</div>
            </div>

            {loading ? (
              <div style={{ padding: '80px', textAlign: 'center', color: '#999' }}>레시피를 불러오고 있습니다...</div>
            ) : (
              <div className="recipe-grid" data-bug-id="site027-bug01">
                {recipes.map(recipe => (
                  <RecipeCard key={recipe.id} recipe={recipe} onClick={setSelectedRecipe} />
                ))}
              </div>
            )}

            <ChefSection />
          </section>

          <SavedRecipesPanel />
        </div>
      </main>

      <Footer />

      <RecipeModal 
        recipe={selectedRecipe} 
        isOpen={!!selectedRecipe} 
        onClose={() => setSelectedRecipe(null)} 
      />
    </div>
  );
}
