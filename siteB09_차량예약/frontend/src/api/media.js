import { API_BASE } from './index';

export const assetUrl = (u) => (!u ? '' : u.startsWith('http') ? u : `${API_BASE}${u}`);
export { won } from './index';
