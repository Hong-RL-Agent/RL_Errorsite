import React, { useState } from 'react';
import { createPost } from '../api';
import { assetUrl } from '../api/client';
import { emitPostEvent } from '../hooks/postEvents';
import { refreshMySummary } from '../hooks/useMySummary';
import { useToast } from '../hooks/useToast.jsx';
import Modal from './Modal';

const IMAGE_CHOICES = [1, 2, 3, 4, 5, 6, 7, 8].map((n) => `/img/custom-${n}`);

export default function ComposeModal({ onClose, onCreated }) {
  const { showToast } = useToast();
  const [caption, setCaption] = useState('');
  const [image, setImage] = useState(IMAGE_CHOICES[0]);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!caption.trim()) {
      showToast('내용을 입력해 주세요.', 'error');
      return;
    }
    setSubmitting(true);
    try {
      await createPost({ caption, image_url: image });
      emitPostEvent({ type: 'create' });
      refreshMySummary().catch(() => {});
      showToast('게시물을 작성했습니다.');
      onCreated();
    } catch (err) {
      showToast(err.message, 'error');
      setSubmitting(false);
    }
  };

  return (
    <Modal title="새 게시물 작성" onClose={onClose}>
      <form className="compose" onSubmit={submit}>
        <h2>새 게시물</h2>
        <div className="compose-preview">
          <img src={assetUrl(image)} alt="선택한 사진" />
        </div>
        <div className="image-picker" role="radiogroup" aria-label="사진 선택">
          {IMAGE_CHOICES.map((src) => (
            <button
              type="button"
              key={src}
              className={`thumb${image === src ? ' selected' : ''}`}
              onClick={() => setImage(src)}
              aria-checked={image === src}
              role="radio"
            >
              <img src={assetUrl(src)} alt="" />
            </button>
          ))}
        </div>
        <textarea
          rows={4}
          maxLength={500}
          placeholder="지금 어떤 순간을 공유하고 싶나요?"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          aria-label="게시물 내용"
        />
        <div className="row-end">
          <span className="muted small">{caption.length}/500</span>
          <button type="button" className="btn btn-ghost" onClick={onClose}>취소</button>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? '게시 중…' : '게시하기'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
