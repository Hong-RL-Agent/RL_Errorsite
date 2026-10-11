const API_BASE = "http://localhost:9724";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options.headers || {}) }
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || "요청 처리에 실패했습니다.");
  return payload;
}

export const api = {
  courses: (params = {}) => request(`/api/courses?${new URLSearchParams(params)}`),
  course: (id) => request(`/api/courses/${id}`),
  syllabus: (id, learnerId = 1) => request(`/api/courses/${id}/syllabus?learnerId=${learnerId}`),
  instructors: () => request("/api/instructors"),
  instructor: (id) => request(`/api/instructors/${id}`),
  learners: () => request("/api/learners"),
  enrollments: (learnerId = 1) => request(`/api/enrollments?learnerId=${learnerId}`),
  enroll: (body) => request("/api/enrollments", { method: "POST", body: JSON.stringify(body) }),
  cancelEnrollment: (id) => request(`/api/enrollments/${id}`, { method: "DELETE" }),
  lesson: (id) => request(`/api/lessons/${id}`),
  slides: (id) => request(`/api/lessons/${id}/slides`),
  progress: (params = {}) => request(`/api/learning-progress?${new URLSearchParams(params)}`),
  saveProgress: (body) => request("/api/learning-progress", { method: "POST", body: JSON.stringify(body) }),
  updateProgress: (id, body) => request(`/api/learning-progress/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
  notes: (params = {}) => request(`/api/study-notes?${new URLSearchParams(params)}`),
  createNote: (body) => request("/api/study-notes", { method: "POST", body: JSON.stringify(body) }),
  updateNote: (id, body) => request(`/api/study-notes/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
  deleteNote: (id) => request(`/api/study-notes/${id}`, { method: "DELETE" }),
  quizzes: (params = {}) => request(`/api/quizzes?${new URLSearchParams(params)}`),
  quiz: (id) => request(`/api/quizzes/${id}`),
  submitQuiz: (id, body) => request(`/api/quizzes/${id}/submissions`, { method: "POST", body: JSON.stringify(body) }),
  assignments: (params = {}) => request(`/api/assignments?${new URLSearchParams(params)}`),
  assignment: (id) => request(`/api/assignments/${id}`),
  submitAssignment: (id, body) => request(`/api/assignments/${id}/submissions`, { method: "POST", body: JSON.stringify(body) }),
  updateSubmission: (assignmentId, submissionId, body) => request(`/api/assignments/${assignmentId}/submissions/${submissionId}`, { method: "PATCH", body: JSON.stringify(body) }),
  deleteSubmission: (assignmentId, submissionId) => request(`/api/assignments/${assignmentId}/submissions/${submissionId}`, { method: "DELETE" }),
  rules: (courseId) => request(`/api/completion-rules/${courseId}`),
  status: (courseId, learnerId = 1) => request(`/api/completion-status/${courseId}?learnerId=${learnerId}`),
  certificates: (learnerId = 1) => request(`/api/certificates?learnerId=${learnerId}`),
  issueCertificate: (body) => request("/api/certificates", { method: "POST", body: JSON.stringify(body) }),
  activity: (learnerId = 1) => request(`/api/learning-activity?learnerId=${learnerId}`),
  notifications: (learnerId = 1) => request(`/api/notifications?learnerId=${learnerId}`),
  reset: () => request("/api/test/reset", { method: "POST" })
};
