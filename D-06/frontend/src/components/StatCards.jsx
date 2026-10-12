'use client';
import React from 'react';
import { ShoppingBag, CheckCircle, Package, Truck, AlertTriangle, CreditCard } from 'lucide-react';

export default function StatCards({ stats }) {
  if (!stats) return null;

  return (
    <div className="kpi-grid">
      <div className="kpi-card">
        <div className="kpi-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <ShoppingBag size={14} color="#f97316" />
          <span>전체 누적 주문</span>
        </div>
        <div className="kpi-value">{stats.totalOrders}건</div>
        <div className="kpi-sub">총 관리 주문 건수</div>
      </div>

      <div className="kpi-card">
        <div className="kpi-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <CheckCircle size={14} color="#10b981" />
          <span>결제 완료 (출고대기)</span>
        </div>
        <div className="kpi-value" style={{ color: '#059669' }}>{stats.paidOrders}건</div>
        <div className="kpi-sub">정상 결제 승인 건</div>
      </div>

      <div className="kpi-card">
        <div className="kpi-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Package size={14} color="#2563eb" />
          <span>배송 준비 중</span>
        </div>
        <div className="kpi-value" style={{ color: '#2563eb' }}>{stats.preparingOrders}건</div>
        <div className="kpi-sub">패킹 및 운송장 준비</div>
      </div>

      <div className="kpi-card">
        <div className="kpi-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Truck size={14} color="#f97316" />
          <span>배송 중 (운송장 등록)</span>
        </div>
        <div className="kpi-value" style={{ color: '#ea580c' }}>{stats.shippingOrders}건</div>
        <div className="kpi-sub">택배사 집하 및 이동</div>
      </div>

      <div className="kpi-card">
        <div className="kpi-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <AlertTriangle size={14} color="#ef4444" />
          <span>환불 요청 접수</span>
        </div>
        <div className="kpi-value" style={{ color: '#dc2626' }}>{stats.refundRequestedOrders}건</div>
        <div className="kpi-sub">관리자 승인 대기</div>
      </div>

      <div className="kpi-card">
        <div className="kpi-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <CreditCard size={14} color="#8b5cf6" />
          <span>총 결제 거래액</span>
        </div>
        <div className="kpi-value" style={{ fontSize: '20px' }}>
          {stats.totalSales ? Number(stats.totalSales).toLocaleString() : 0}원
        </div>
        <div className="kpi-sub">매출 정산 집계</div>
      </div>
    </div>
  );
}
