import React from 'react';
import { CheckCircle2, Clock, AlertTriangle, BatteryCharging } from 'lucide-react';

export default function VehicleStatusBadge({ status, text }) {
  switch (status) {
    case 'available':
      return (
        <span className="status-pill status-available">
          <CheckCircle2 size={13} />
          <span>{text || '이용 가능'}</span>
        </span>
      );
    case 'in_use':
      return (
        <span className="status-pill status-in-use">
          <Clock size={13} />
          <span>{text || '이용 중'}</span>
        </span>
      );
    case 'charging':
      return (
        <span className="status-pill status-charging">
          <BatteryCharging size={13} />
          <span>{text || '충전 필요'}</span>
        </span>
      );
    default:
      return (
        <span className="status-pill" style={{ background: '#f1f5f9', color: '#64748b' }}>
          <span>{text || status}</span>
        </span>
      );
  }
}
