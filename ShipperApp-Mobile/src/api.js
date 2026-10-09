import { getServer, getToken } from './storage';

export class ApiError extends Error {
  constructor(message, status) { super(message); this.status = status; }
}

let onUnauthorized = null;
/** Đăng ký hàm xử lý khi phiên hết hạn (401) → quay về màn hình đăng nhập */
export const setUnauthorizedHandler = (fn) => { onUnauthorized = fn; };

async function request(path, { method = 'GET', body, form, timeout = 20000, auth = true, server } = {}) {
  const base = server || (await getServer());
  const headers = { Accept: 'application/json' };
  if (auth) {
    const token = await getToken();
    if (token) headers.Authorization = 'Bearer ' + token;
  }
  let payload;
  if (form) payload = form; // FormData – để fetch tự đặt Content-Type (multipart boundary)
  else if (body !== undefined) { headers['Content-Type'] = 'application/json'; payload = JSON.stringify(body); }

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeout);
  let res;
  try {
    res = await fetch(base + path, { method, headers, body: payload, signal: ctrl.signal });
  } catch (e) {
    throw new ApiError(e?.name === 'AbortError'
      ? 'Máy chủ phản hồi quá lâu. Kiểm tra kết nối mạng.'
      : 'Không kết nối được máy chủ. Kiểm tra mạng hoặc địa chỉ máy chủ.', 0);
  } finally { clearTimeout(timer); }

  let data = null;
  try { data = await res.json(); } catch { /* không phải JSON */ }
  if (res.status === 401 && auth) {
    onUnauthorized && onUnauthorized();
    throw new ApiError(data?.error || 'Phiên đăng nhập đã hết hạn', 401);
  }
  if (res.status === 429) throw new ApiError('Thao tác quá nhanh, vui lòng thử lại sau ít phút', 429);
  if (!res.ok || (data && data.success === false)) throw new ApiError(data?.error || `Lỗi máy chủ (${res.status})`, res.status);
  return data;
}

export const api = {
  login: (server, username, password, device) =>
    request('/api/shipper/auth/login', { method: 'POST', body: { username, password, device }, auth: false, server }),
  logout: () => request('/api/shipper/auth/logout', { method: 'POST', body: {} }),
  changePassword: (currentPassword, newPassword) => request('/api/shipper/auth/password', { method: 'POST', body: { currentPassword, newPassword } }),
  me: () => request('/api/shipper/me'),
  tasks: (type) => request('/api/shipper/tasks?type=' + type),
  order: (id) => request('/api/shipper/orders/' + id),
  orderByCode: (code) => request('/api/shipper/orders/by-code/' + encodeURIComponent(code)),
  reasons: () => request('/api/shipper/reasons'),
  pickup: (id, note) => request(`/api/shipper/orders/${id}/pickup`, { method: 'POST', body: { note } }),
  pickupFail: (id, reason) => request(`/api/shipper/orders/${id}/pickup-fail`, { method: 'POST', body: { reason } }),
  startDelivery: (id) => request(`/api/shipper/orders/${id}/start-delivery`, { method: 'POST', body: {} }),
  deliver: (id, { otp, recipientName, collected, photoUri, signature }) => {
    const f = new FormData();
    if (otp) f.append('otp', otp);
    if (recipientName) f.append('recipientName', recipientName);
    f.append('collected', String(Math.round(Number(collected || 0))));
    if (photoUri) f.append('photo', { uri: photoUri, name: 'proof.jpg', type: 'image/jpeg' });
    if (signature) f.append('signature', signature);
    return request(`/api/shipper/orders/${id}/deliver`, { method: 'POST', form: f, timeout: 60000 });
  },
  fail: (id, { reasonId, note, rescheduleDate }) =>
    request(`/api/shipper/orders/${id}/fail`, { method: 'POST', body: { reasonId, note, rescheduleDate } }),
  returnDone: (id) => request(`/api/shipper/orders/${id}/return-done`, { method: 'POST', body: {} }),
  history: (date) => request('/api/shipper/history' + (date ? '?date=' + date : '')),
  cod: () => request('/api/shipper/cod'),
  location: (points) => request('/api/shipper/location', { method: 'POST', body: points, timeout: 15000 }),
};
