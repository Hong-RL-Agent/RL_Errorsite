import { request } from './client';

export async function resetEnvironment() {
  return request('/test/reset', {
    method: 'POST'
  });
}

export async function getEnvironmentStatus() {
  return request('/test/status', {
    method: 'GET'
  });
}
