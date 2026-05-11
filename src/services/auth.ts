export interface DevUser {
  full_name: string;
  organization_name: string;
  user_type: string;
}

export const getUser = (): DevUser | null => {
  const raw = localStorage.getItem('dev_user');
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
};

export const isLoggedIn = (): boolean => !!localStorage.getItem('dev_access_token');

export const logout = () => {
  localStorage.removeItem('dev_access_token');
  localStorage.removeItem('dev_refresh_token');
  localStorage.removeItem('dev_user');
};

export const saveSession = (data: { access: string; refresh: string; full_name: string; organization_name: string; user_type: string }) => {
  localStorage.setItem('dev_access_token', data.access);
  localStorage.setItem('dev_refresh_token', data.refresh);
  localStorage.setItem('dev_user', JSON.stringify({
    full_name: data.full_name,
    organization_name: data.organization_name,
    user_type: data.user_type,
  }));
};
