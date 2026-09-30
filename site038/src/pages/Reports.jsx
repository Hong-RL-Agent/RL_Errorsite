import React, { useState, useEffect } from 'react';
import { BarChart3, Filter, TrendingUp, Eye, ThumbsUp, DollarSign, RefreshCw, Layers } from 'lucide-react';

export default function Reports({ onShowToast }) {
  const [reports, setReports] = useState([]);
  const [period, setPeriod] = useState('last-30-days');
  const [platform, setPlatform] = useState('youtube');
  const [metric, setMetric] = useState('views');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const res = await fetch('/api/reports');
      const data = await res.json();
      setReports(data);
    } catch (err) {
      console.error(err);
    }
  };

  // SEC-358: Report Filter Save
  const handleApplyFilter = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Deterministic idempotency key based on selected filter values
      const idempotency_key = `REPORT-FILTER-${period.toUpperCase()}-${platform.toUpperCase()}-${metric.toUpperCase()}`;

      const res = await fetch('/api/reports/filter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          period,
          platform,
          metric,
          idempotency_key
        })
      });

      const data = await res.json();
      if (data.success) {
        onShowToast({
          title: '성과 리포트 필터 적용',
          message: `필터 조건 [기간: ${period}, 플랫폼: ${platform}, 지표: ${metric}]이(가) 저장되었습니다.`,
          type: 'success',
          bugId: data.bugId,
          secId: data.secId,
          txId: data.transaction_id,
          idempotency_key
        });
        if (data.results) {
          setReports(data.results);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">콘텐츠 성과 분석 & 리포트</h1>
          <p className="page-subtitle">채널 조회수, 구독자 증감, 수익화 지표를 종합 분석합니다.</p>
        </div>
      </div>

      {/* Filter Control Card */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <form onSubmit={handleApplyFilter} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr)) 160px', gap: '16px', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">분석 기간</label>
            <select
              className="form-input"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
            >
              <option value="last-7-days">최근 7일</option>
              <option value="last-30-days">최근 30일</option>
              <option value="last-90-days">최근 90일</option>
              <option value="year-to-date">올해 누적 (YTD)</option>
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">플랫폼</label>
            <select
              className="form-input"
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
            >
              <option value="all">전체 플랫폼</option>
              <option value="youtube">유튜브 (YouTube)</option>
              <option value="instagram">인스타그램 (Reels)</option>
              <option value="tiktok">틱톡 (TikTok)</option>
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">핵심 지표</label>
            <select
              className="form-input"
              value={metric}
              onChange={(e) => setMetric(e.target.value)}
            >
              <option value="views">총 조회수</option>
              <option value="engagement">참여도 (좋아요/댓글)</option>
              <option value="revenue">예상 수익 ($)</option>
            </select>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ height: '42px', justifyContent: 'center' }}
            disabled={loading}
          >
            <Filter size={15} /> {loading ? '적용 중...' : '필터 적용'}
          </button>
        </form>
      </div>

      {/* Performance Summary Cards */}
      <div className="grid-layout grid-3" style={{ marginBottom: '24px' }}>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>총 조회수</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-color)' }}>
              <Eye size={18} />
            </div>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>1,120,400</div>
          <span style={{ fontSize: '12px', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
            <TrendingUp size={13} /> 전월 대비 +18.4%
          </span>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>평균 시청 지속 시간</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(236, 72, 153, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ec4899' }}>
              <BarChart3 size={18} />
            </div>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>5분 42초</div>
          <span style={{ fontSize: '12px', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
            <TrendingUp size={13} /> 전월 대비 +4.2%
          </span>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>예상 크리에이터 수익</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
              <DollarSign size={18} />
            </div>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>$3,840.50</div>
          <span style={{ fontSize: '12px', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
            <TrendingUp size={13} /> 전월 대비 +12.8%
          </span>
        </div>
      </div>

      {/* Reports Table */}
      <div className="card">
        <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>
          월별 성과 리포트 아카이브
        </h3>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>리포트 ID</th>
                <th>리포트 명칭</th>
                <th>기간</th>
                <th>총 조회수</th>
                <th>수익 ($)</th>
                <th>참여율</th>
              </tr>
            </thead>
            <tbody>
              {reports.map(r => (
                <tr key={r.id}>
                  <td style={{ fontFamily: 'monospace', fontSize: '12px', color: 'var(--primary-color)' }}>{r.id}</td>
                  <td style={{ fontWeight: 600 }}>{r.title}</td>
                  <td>{r.period}</td>
                  <td>{r.views.toLocaleString()}회</td>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>${r.revenue.toLocaleString()}</td>
                  <td><span className="badge badge-indigo">{r.engagement}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
