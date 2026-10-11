import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../api';
import { useApp } from '../context/AppContext';
import EventEditor, { blankForm } from '../components/EventEditor';

export default function NewEventPage() {
  const { today, bumpData, toast } = useApp();
  const navigate = useNavigate();
  const [sp] = useSearchParams();
  const date = sp.get('date') || today;

  const save = async (form) => {
    const res = await api.createEvent(form);
    bumpData();
    toast('일정을 저장했어요.');
    navigate(`/events/${res.data.id}`, { replace: true });
  };

  return (
    <div className="single-col">
      <div className="toolbar"><h1>새 일정 작성</h1></div>
      <section className="card">
        {/* INTENTIONAL_ERROR: B07-ERR02
            CSV Error: 뒤로가기의 오작동
            Strategy: STATE_REVISIT
            Description: 신규 일정 작성 화면은 입력 폼 상태를 보관하지 않아 미리보기에서 뒤로가기 하면 입력값이 초기화됨. */}
        <EventEditor
          variant="page"
          mode="create"
          bugId="B07-ERR02"
          initial={blankForm(date)}
          draftKey={null}
          onPreview={(draft) => navigate('/preview', { state: { draft, mode: 'create' } })}
          onSubmit={save}
          onCancel={() => navigate(-1)}
        />
      </section>
    </div>
  );
}
