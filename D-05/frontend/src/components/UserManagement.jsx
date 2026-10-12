import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  UserCheck, 
  UserX, 
  Edit3, 
  ChevronLeft, 
  ChevronRight,
  Shield
} from 'lucide-react';
import { fetchUsers, fetchDepartments, updateUserStatus } from '../lib/api';

export default function UserManagement({ onOpenUserDetail, onShowToast }) {
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [sortField, setSortField] = useState('id');
  const [sortOrder, setSortOrder] = useState('asc');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1, limit: 10 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDepartments().then(res => {
      if (res.success) setDepartments(res.data);
    }).catch(console.error);
  }, []);

  useEffect(() => {
    loadUsers();
  }, [search, statusFilter, deptFilter, sortField, sortOrder, page]);

  async function loadUsers() {
    try {
      setLoading(true);
      const res = await fetchUsers({
        search,
        status: statusFilter,
        department: deptFilter,
        sort: sortField,
        order: sortOrder,
        page,
        limit: 10
      });
      if (res.success) {
        setUsers(res.data);
        setPagination(res.pagination);
      }
    } catch (err) {
      console.error(err);
      onShowToast('사용자 목록을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }

  // 상태 토글 핸들러 (비활성화/활성화)
  async function handleToggleStatus(user) {
    const nextStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    const filterContext = {
      search,
      status: statusFilter,
      department: deptFilter,
      sort: sortField,
      order: sortOrder,
      page
    };

    try {
      const res = await updateUserStatus(user.emp_no, nextStatus, filterContext);
      if (res.success) {
        onShowToast(`사용자 [${user.name}] 상태 변경 요청이 완료되었습니다.`);
        // 목록 갱신
        loadUsers();
      }
    } catch (err) {
      console.error(err);
      onShowToast('상태 변경에 실패했습니다.');
    }
  }

  function handleSortChange(e) {
    const val = e.target.value;
    if (val === 'created_at_asc') {
      setSortField('created_at');
      setSortOrder('asc');
    } else if (val === 'created_at_desc') {
      setSortField('created_at');
      setSortOrder('desc');
    } else if (val === 'name_asc') {
      setSortField('name');
      setSortOrder('asc');
    } else {
      setSortField('id');
      setSortOrder('asc');
    }
    setPage(1);
  }

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">임직원 계정 및 권한 관리</h2>
        <span style={{ fontSize: '13px', color: '#64748b' }}>
          총 {pagination.total}명 조회됨
        </span>
      </div>

      <div className="card-body">
        {/* 필터 및 검색 바 */}
        <div className="filter-bar">
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            {/* 검색창 */}
            <div className="search-box">
              <Search size={16} color="#64748b" />
              <input
                type="text"
                placeholder="이름, 사번(EMP-), 이메일 검색..."
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
              />
            </div>

            {/* 상태 필터 */}
            <select
              className="select-filter"
              value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
            >
              <option value="">전체 상태</option>
              <option value="ACTIVE">활성 (ACTIVE)</option>
              <option value="INACTIVE">비활성 (INACTIVE)</option>
            </select>

            {/* 부서 필터 */}
            <select
              className="select-filter"
              value={deptFilter}
              onChange={e => { setDeptFilter(e.target.value); setPage(1); }}
            >
              <option value="">전체 부서</option>
              {departments.map(d => (
                <option key={d.id} value={d.name}>{d.name}</option>
              ))}
            </select>
          </div>

          {/* 정렬 드롭다운 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ArrowUpDown size={14} color="#64748b" />
            <select
              className="select-filter"
              onChange={handleSortChange}
              value={sortField === 'created_at' ? (sortOrder === 'asc' ? 'created_at_asc' : 'created_at_desc') : sortField === 'name' ? 'name_asc' : 'id'}
            >
              <option value="id">기본 순서 (사번순)</option>
              <option value="name_asc">이름 가나다순</option>
              <option value="created_at_asc">등록일 오래된순 (오름차순)</option>
              <option value="created_at_desc">등록일 최신순 (내림차순)</option>
            </select>
          </div>
        </div>

        {/* 사용자 데이터 테이블 */}
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>사번</th>
                <th>이름</th>
                <th>이메일</th>
                <th>소속 부서</th>
                <th>직급</th>
                <th>권한</th>
                <th>계정 상태</th>
                <th>등록일</th>
                <th style={{ textAlign: 'center' }}>관리 작업</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                    사용자 데이터를 불러오는 중입니다...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                    조건에 해당하는 사용자가 없습니다.
                  </td>
                </tr>
              ) : (
                users.map(u => (
                  <tr key={u.emp_no} data-user-id={u.emp_no}>
                    <td style={{ fontWeight: '600', color: '#0f172a' }}>{u.emp_no}</td>
                    <td style={{ fontWeight: '600' }}>{u.name}</td>
                    <td style={{ color: '#475569' }}>{u.email}</td>
                    <td>{u.department}</td>
                    <td>{u.position}</td>
                    <td>
                      <span className={`badge role-${u.role.toLowerCase()}`}>
                        <Shield size={10} style={{ marginRight: '2px' }} />
                        {u.role}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${u.status.toLowerCase()}`}>
                        {u.status === 'ACTIVE' ? '활성' : '비활성'}
                      </span>
                    </td>
                    <td style={{ color: '#64748b', fontSize: '12px' }}>{u.created_at}</td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => onOpenUserDetail(u, {
                            search,
                            status: statusFilter,
                            department: deptFilter,
                            sort: sortField,
                            order: sortOrder,
                            page
                          })}
                          title="상세 정보 및 권한 수정"
                        >
                          <Edit3 size={13} />
                          <span>상세</span>
                        </button>
                        <button
                          className={`btn btn-sm ${u.status === 'ACTIVE' ? 'btn-danger' : 'btn-primary'}`}
                          onClick={() => handleToggleStatus(u)}
                          title={u.status === 'ACTIVE' ? '계정 비활성화' : '계정 활성화'}
                        >
                          {u.status === 'ACTIVE' ? (
                            <>
                              <UserX size={13} />
                              <span>비활성화</span>
                            </>
                          ) : (
                            <>
                              <UserCheck size={13} />
                              <span>활성화</span>
                            </>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 페이지네이션 */}
        {pagination.totalPages > 1 && (
          <div className="pagination">
            <span style={{ fontSize: '13px', color: '#64748b' }}>
              페이지 {pagination.page} / {pagination.totalPages} (총 {pagination.total}명)
            </span>
            <div className="page-numbers">
              <button
                className="page-btn"
                disabled={page <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
              >
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(pNum => (
                <button
                  key={pNum}
                  className={`page-btn ${page === pNum ? 'active' : ''}`}
                  onClick={() => setPage(pNum)}
                >
                  {pNum}
                </button>
              ))}
              <button
                className="page-btn"
                disabled={page >= pagination.totalPages}
                onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
