import React, { useState } from 'react';

export default function PatientEditModal({ patient, onClose, onConfirm }) {
  const [height, setHeight] = useState(patient?.height || 170);
  const [weight, setWeight] = useState(patient?.weight || 70);
  const [medication, setMedication] = useState(patient?.medication || '');

  if (!patient) return null;

  const handleSave = () => {
    onConfirm(patient.id, height, weight, medication);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h3>👤 환자 기본 신체정보 수정</h3>
        <p>환자 ID: <strong style={{ color: 'var(--color-primary)' }}>{patient.id}</strong> ({patient.name})</p>

        <div className="form-group">
          <label>키 (cm):</label>
          <input type="number" value={height} onChange={(e) => setHeight(parseInt(e.target.value || '0'))} />
        </div>

        <div className="form-group">
          <label>몸무게 (kg):</label>
          <input type="number" value={weight} onChange={(e) => setWeight(parseInt(e.target.value || '0'))} />
        </div>

        <div className="form-group">
          <label>복용 중인 약물:</label>
          <input type="text" value={medication} onChange={(e) => setMedication(e.target.value)} />
        </div>

        <div className="modal-foot">
          <button className="save-btn" style={{ backgroundColor: 'var(--color-border)', color: '#ffffff' }} onClick={onClose}>
            취소
          </button>
          <button className="save-btn" onClick={handleSave}>
            저장 확정
          </button>
        </div>
      </div>
    </div>
  );
}
