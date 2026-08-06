const BASE_URL = 'http://localhost:9577/api';

export const fetchVotes = async () => {
  const res = await fetch(`${BASE_URL}/votes`);
  return res.json();
};

export const searchVotesApi = async (category, status) => {
  const res = await fetch(`${BASE_URL}/votes/search?category=${category}&status=${status}`);
  return res.json();
};

export const fetchVoteDetailApi = async (id) => {
  const res = await fetch(`${BASE_URL}/votes/${id}`);
  return res.json();
};

export const createVoteApi = async (voteData) => {
  const res = await fetch(`${BASE_URL}/votes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(voteData)
  });
  return res.json();
};

export const closeVoteApi = async (id) => {
  const res = await fetch(`${BASE_URL}/votes/${id}/close`, { method: 'POST' });
  return res.json();
};

export const patchOptionsApi = async (id, options) => {
  const res = await fetch(`${BASE_URL}/votes/${id}/options`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ options })
  });
  return res.json();
};

export const castVoteApi = async (id, voterName, optionId, userId) => {
  const res = await fetch(`${BASE_URL}/votes/${id}/cast`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ voterName, optionId, userId })
  });
  return { status: res.status, data: await res.json() };
};

export const deleteParticipantApi = async (id) => {
  const res = await fetch(`${BASE_URL}/participants/${id}`, { method: 'DELETE' });
  return res.json();
};

export const patchCommentApi = async (id, content) => {
  const res = await fetch(`${BASE_URL}/comments/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content })
  });
  return res.json();
};

export const resetSandboxApi = async () => {
  const res = await fetch(`${BASE_URL}/reset`, { method: 'POST' });
  return res.json();
};
