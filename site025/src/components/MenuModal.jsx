import React from 'react';
import { X } from 'lucide-react';
import MenuCard from './MenuCard';

export default function MenuModal({ restaurant, isOpen, onClose, onAdd }) {
  const [menus, setMenus] = React.useState([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (isOpen && restaurant) {
      fetchMenus();
    }
  }, [isOpen, restaurant]);

  const fetchMenus = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/menus?restaurantId=${restaurant.id}`);
      const data = await res.json();
      setMenus(data);
    } catch (err) {
      console.error("Failed to fetch menus");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !restaurant) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ background: 'white', width: '100%', maxWidth: '700px', maxHeight: '85vh', borderRadius: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '25px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: 'white', zIndex: 10 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '24px' }}>{restaurant.name}</h2>
            <div style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>{restaurant.category} • 최소주문 {restaurant.minOrder}</div>
          </div>
          <button onClick={onClose} style={{ background: '#f5f5f5', border: 'none', padding: '8px', borderRadius: '50%', cursor: 'pointer' }}><X /></button>
        </div>
        
        <div style={{ padding: '25px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px', color: '#999' }}>메뉴를 불러오고 있습니다...</div>
          ) : (
            <div>
              <h3 style={{ fontSize: '18px', marginBottom: '20px', borderLeft: '4px solid var(--primary)', paddingLeft: '10px' }}>대표 메뉴</h3>
              <div style={{ display: 'grid', gap: '15px' }}>
                {menus.map(menu => (
                  <MenuCard key={menu.id} menu={menu} onAdd={onAdd} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
