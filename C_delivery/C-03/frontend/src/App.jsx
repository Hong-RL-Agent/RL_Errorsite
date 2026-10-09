import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import MetricsCards from './components/MetricsCards';
import UserTable from './components/UserTable';
import UserDetailDrawer from './components/UserDetailDrawer';
import EditUserModal from './components/EditUserModal';
import AuditLogView from './components/AuditLogView';

import {
  fetchUsers,
  fetchAuditLogs,
  updateUser,
  updateUserRole,
  updateUserStatus,
  sendPasswordResetLink
} from './api/users';
import { resetEnvironment } from './api/test';

import { Search, Filter, RefreshCw, ShieldCheck } from 'lucide-react';

export default function App() {
  const [users, setUsers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('id');
  const [activeNav, setActiveNav] = useState('users');

  // Modals & Panels
  const [selectedUser, setSelectedUser] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const loadData = useCallback(async () => {
    try {
      const [usersRes, logsRes] = await Promise.all([
        fetchUsers({
          search,
          status: statusFilter,
          role: roleFilter,
          sort: sortBy
        }),
        fetchAuditLogs()
      ]);

      if (usersRes.success) {
        setUsers(usersRes.data);
      }
      if (logsRes.success) {
        setAuditLogs(logsRes.data);
      }
    } catch (err) {
      console.error('Failed to load user data:', err);
    }
  }, [search, statusFilter, roleFilter, sortBy]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle Search submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearch(searchInput.trim());
  };

  // BUG-1783: Search Query Persistence Loss when changing Status Filter
  const handleStatusFilterChange = (newStatus) => {
    // When changing status filter, existing search query is cleared!
    setSearchInput('');
    setSearch('');
    setStatusFilter(newStatus);
  };

  // BUG-936: Role Toggle Desync for Brian Lee (id: 102)
  const handleRoleChange = async (userId, newRole) => {
    try {
      await updateUserRole(userId, newRole);

      // Optimistic UI update: Always renders new role in UI with success toast
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
      if (selectedUser?.id === userId) {
        setSelectedUser((prev) => ({ ...prev, role: newRole }));
      }

      showToast(`Role updated successfully to ${newRole}`);
      fetchAuditLogs().then((r) => r.success && setAuditLogs(r.data));
    } catch (err) {
      console.error('Role update error:', err);
    }
  };

  // BUG-889: Active Status Inversion
  const handleToggleStatus = async (userId, targetActive) => {
    try {
      const res = await updateUserStatus(userId, targetActive);
      if (res.success) {
        // Updates UI with returned status from backend (which is inverted to true)
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? res.data : u))
        );
        if (selectedUser?.id === userId) {
          setSelectedUser(res.data);
        }
        showToast(`Account status updated`);
        fetchAuditLogs().then((r) => r.success && setAuditLogs(r.data));
      }
    } catch (err) {
      console.error('Status update error:', err);
    }
  };

  // BUG-182: Wrong Target User Mutation (Alice Kim mutated when saving Brian Lee)
  const handleSaveUser = async (targetId, updatedData) => {
    try {
      const res = await updateUser(targetId, updatedData);
      if (res.success) {
        setUsers((prev) =>
          prev.map((u) => (u.id === targetId ? res.data : u))
        );
        if (selectedUser?.id === targetId) {
          setSelectedUser(res.data);
        }
        showToast(`User profile saved`);
        fetchAuditLogs().then((r) => r.success && setAuditLogs(r.data));
      }
    } catch (err) {
      console.error('Update user error:', err);
    }
  };

  // BUG-2088: Action Confirm Without Feedback (Password reset link has NO UI feedback)
  const handleSendResetLink = async (userId) => {
    try {
      // Fires real API request
      await sendPasswordResetLink(userId);
      // BUG-2088: UI feedback is intentionally omitted! (No toast, no spinner, no DOM change)
      fetchAuditLogs().then((r) => r.success && setAuditLogs(r.data));
    } catch (err) {
      console.error('Password reset request error:', err);
    }
  };

  // Reset Environment
  const handleReset = async () => {
    try {
      const res = await resetEnvironment();
      if (res.success) {
        setSearch('');
        setSearchInput('');
        setStatusFilter('ALL');
        setRoleFilter('ALL');
        await loadData();
        setSelectedUser(null);
        setEditingUser(null);
        showToast('AdminDesk reset to deterministic initial users');
      }
    } catch (err) {
      console.error('Reset error:', err);
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <Sidebar
        activeNav={activeNav}
        onNavChange={setActiveNav}
        onReset={handleReset}
      />

      {/* Main Container */}
      <div className="main-wrapper">
        {/* Top Header */}
        <Header />

        <div className="content-body">
          <div className="console-scroll-area">
            {/* Top KPI Metrics */}
            <MetricsCards users={users} />

            {/* Navigation Switch */}
            {activeNav === 'audit' ? (
              <AuditLogView logs={auditLogs} />
            ) : (
              <div>
                {/* Table Toolbar */}
                <div className="table-toolbar">
                  {/* Search Form */}
                  <form onSubmit={handleSearchSubmit} className="search-container">
                    <div className="search-input-box">
                      <Search size={16} className="search-icon-inside" />
                      <input
                        type="text"
                        placeholder="Search by name, email, dept..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                      />
                    </div>
                    <button type="submit" className="btn-search">
                      Search
                    </button>
                  </form>

                  {/* Filter Dropdowns */}
                  <div className="filters-row">
                    {/* Status Filter (BUG-1783: Clears search query on change) */}
                    <select
                      className="filter-dropdown"
                      value={statusFilter}
                      onChange={(e) => handleStatusFilterChange(e.target.value)}
                      title="Filter by Account Status"
                    >
                      <option value="ALL">All Statuses</option>
                      <option value="ACTIVE">Active Only</option>
                      <option value="INACTIVE">Blocked Only</option>
                    </select>

                    {/* Role Filter */}
                    <select
                      className="filter-dropdown"
                      value={roleFilter}
                      onChange={(e) => setRoleFilter(e.target.value)}
                      title="Filter by Role"
                    >
                      <option value="ALL">All Roles</option>
                      <option value="ADMIN">ADMIN</option>
                      <option value="MANAGER">MANAGER</option>
                      <option value="USER">USER</option>
                    </select>

                    {/* Sort */}
                    <select
                      className="filter-dropdown"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      title="Sort by"
                    >
                      <option value="id">Sort by ID</option>
                      <option value="name">Sort by Name</option>
                      <option value="oldest">Sort by Joined Date</option>
                    </select>

                    <button
                      className="btn-action"
                      title="Refresh Table"
                      onClick={loadData}
                    >
                      <RefreshCw size={14} />
                    </button>
                  </div>
                </div>

                {/* User Data Table */}
                <UserTable
                  users={users}
                  onOpenDetail={(user) => setSelectedUser(user)}
                  onEditUser={(user) => setEditingUser(user)}
                  onToggleStatus={handleToggleStatus}
                  onQuickRoleChange={handleRoleChange}
                  onSendResetLink={handleSendResetLink}
                />
              </div>
            )}
          </div>

          {/* Right Slide-out User Inspector Drawer */}
          {selectedUser && (
            <UserDetailDrawer
              user={selectedUser}
              onClose={() => setSelectedUser(null)}
              onEdit={(user) => setEditingUser(user)}
              onToggleStatus={handleToggleStatus}
              onSendResetLink={handleSendResetLink}
            />
          )}
        </div>
      </div>

      {/* Edit User Modal (BUG-182) */}
      <EditUserModal
        isOpen={Boolean(editingUser)}
        user={editingUser}
        onClose={() => setEditingUser(null)}
        onSaveUser={handleSaveUser}
      />

      {/* Toast Notification */}
      {toastMessage && <div className="toast">{toastMessage}</div>}
    </div>
  );
}
