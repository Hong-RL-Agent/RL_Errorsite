import React from 'react';
import { 
  LayoutDashboard, 
  FolderKanban, 
  Search, 
  Building2, 
  Users, 
  Package, 
  FileText, 
  CalendarDays, 
  ShoppingCart, 
  CreditCard, 
  HelpCircle, 
  Activity, 
  Settings,
  Layers
} from 'lucide-react';

export default function Sidebar({ currentPage, setCurrentPage, cartCount = 0, currentUser }) {
  const mainNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'projects', label: 'Projects', icon: FolderKanban },
    { id: 'search', label: 'Search', icon: Search },
    { id: 'workspace', label: 'Workspace', icon: Building2 },
    { id: 'members', label: 'Members', icon: Users },
  ];

  const manageNavItems = [
    { id: 'products', label: 'Products', icon: Package },
    { id: 'files', label: 'Files', icon: FileText },
    { id: 'reservations', label: 'Reservations', icon: CalendarDays },
    { id: 'cart', label: 'Cart', icon: ShoppingCart, badge: cartCount > 0 ? cartCount : null },
    { id: 'payments', label: 'Payments', icon: CreditCard },
  ];

  const systemNavItems = [
    { id: 'support', label: 'Support', icon: HelpCircle },
    { id: 'activity', label: 'Activity', icon: Activity },
    { id: 'profile', label: 'Profile', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="app-sidebar">
      <div className="sidebar-brand">
        <div className="brand-logo-icon">
          <Layers size={20} />
        </div>
        <span className="brand-text">WorkNest</span>
        <span className="brand-badge">PRO</span>
      </div>

      <div className="sidebar-nav">
        <div className="nav-section-title">Main Workspace</div>
        {mainNavItems.map(item => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              className={`nav-item ${currentPage === item.id ? 'active' : ''}`}
              onClick={() => setCurrentPage(item.id)}
            >
              <span className="nav-item-icon"><Icon size={18} /></span>
              <span>{item.label}</span>
            </button>
          );
        })}

        <div className="nav-section-title">Resources & Billing</div>
        {manageNavItems.map(item => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              className={`nav-item ${currentPage === item.id ? 'active' : ''}`}
              onClick={() => setCurrentPage(item.id)}
            >
              <span className="nav-item-icon"><Icon size={18} /></span>
              <span>{item.label}</span>
              {item.badge && <span className="nav-item-badge">{item.badge}</span>}
            </button>
          );
        })}

        <div className="nav-section-title">Support & System</div>
        {systemNavItems.map(item => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              className={`nav-item ${currentPage === item.id ? 'active' : ''}`}
              onClick={() => setCurrentPage(item.id)}
            >
              <span className="nav-item-icon"><Icon size={18} /></span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      <div className="sidebar-footer">
        <img 
          src={currentUser?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"} 
          alt="Avatar" 
          className="user-avatar-mini" 
        />
        <div className="user-info-mini">
          <div className="user-name-mini">{currentUser?.name || '김민준'}</div>
          <div className="user-role-mini">{currentUser?.role || 'Product Lead'}</div>
        </div>
      </div>
    </aside>
  );
}
