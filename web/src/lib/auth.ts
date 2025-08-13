const ACCESS_KEY = 'foody_access_token';
const REFRESH_KEY = 'foody_refresh_token';

export function getAccessToken() {
  return localStorage.getItem(ACCESS_KEY);
}
export function setAccessToken(v: string) {
  localStorage.setItem(ACCESS_KEY, v);
}
export function getRefreshToken() {
  return localStorage.getItem(REFRESH_KEY);
}
export function setRefreshToken(v?: string) {
  if (!v) return;
  localStorage.setItem(REFRESH_KEY, v);
}
export function clearTokens() {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
}
