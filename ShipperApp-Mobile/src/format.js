export const money = (v) => {
  const n = Math.round(Number(v || 0));
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' đ';
};

export const num = (v) => Math.round(Number(v || 0)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');

const pad = (n) => (n < 10 ? '0' + n : '' + n);

export const dt = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d)) return '';
  return `${pad(d.getHours())}:${pad(d.getMinutes())} ${pad(d.getDate())}/${pad(d.getMonth() + 1)}`;
};

export const date = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d)) return '';
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
};

/** yyyy-MM-dd theo giờ máy */
export const isoDay = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export const addDays = (n) => { const d = new Date(); d.setDate(d.getDate() + n); return d; };

export const weekday = (d) => ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][d.getDay()];

export const greeting = () => {
  const h = new Date().getHours();
  if (h < 11) return 'Chào buổi sáng';
  if (h < 14) return 'Chào buổi trưa';
  if (h < 18) return 'Chào buổi chiều';
  return 'Chào buổi tối';
};

export const initials = (name) => (name || '?').trim().split(/\s+/).slice(-2).map((w) => w[0]?.toUpperCase()).join('');
