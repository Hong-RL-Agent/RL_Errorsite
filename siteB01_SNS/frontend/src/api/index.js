import { request } from './client';

export const getHealth = () => request('/api/health');

export const getFeed = (params) => request('/api/feed', { params });
export const getSaved = () => request('/api/saved');
export const getStories = () => request('/api/stories');

export const getPost = (id) => request(`/api/posts/${id}`);
export const createPost = (body) => request('/api/posts', { method: 'POST', body });
export const updatePost = (id, body) => request(`/api/posts/${id}`, { method: 'PATCH', body });
export const deletePost = (id) => request(`/api/posts/${id}`, { method: 'DELETE' });

export const likePost = (id) => request(`/api/posts/${id}/like`, { method: 'POST' });
export const unlikePost = (id) => request(`/api/posts/${id}/like`, { method: 'DELETE' });
export const savePost = (id) => request(`/api/posts/${id}/save`, { method: 'POST' });
export const unsavePost = (id) => request(`/api/posts/${id}/save`, { method: 'DELETE' });

export const getComments = (postId) => request(`/api/posts/${postId}/comments`);
export const addComment = (postId, content) => request(`/api/posts/${postId}/comments`, { method: 'POST', body: { content } });
export const deleteComment = (id) => request(`/api/comments/${id}`, { method: 'DELETE' });

export const getMe = () => request('/api/me');
export const getUsers = (params) => request('/api/users', { params });
export const getUser = (id) => request(`/api/users/${id}`);
export const getFollowing = (id) => request(`/api/users/${id}/following`);
export const followUser = (id) => request(`/api/users/${id}/follow`, { method: 'POST' });
export const unfollowUser = (id) => request(`/api/users/${id}/follow`, { method: 'DELETE' });

export const getNotifications = (params) => request('/api/notifications', { params });
export const markNotificationRead = (id) => request(`/api/notifications/${id}/read`, { method: 'PATCH' });
export const markAllNotificationsRead = () => request('/api/notifications/read-all', { method: 'PATCH' });
export const getActivity = (params) => request('/api/activity', { params });

export const resetData = () => request('/api/test/reset', { method: 'POST' });
