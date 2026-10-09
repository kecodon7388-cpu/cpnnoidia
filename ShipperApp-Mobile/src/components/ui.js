import React from 'react';
import { ActivityIndicator, Linking, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, font, radius, shadow, statusColor } from '../theme';

export const Card = ({ style, children, onPress, padded = true }) => {
  const content = <View style={[styles.card, padded && { padding: 16 }, style]}>{children}</View>;
  if (!onPress) return content;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [{ transform: [{ scale: pressed ? 0.985 : 1 }], opacity: pressed ? 0.96 : 1 }]}>
      {content}
    </Pressable>
  );
};

export function Button({ title, onPress, icon, variant = 'primary', loading, disabled, style, size = 'lg' }) {
  const v = {
    primary: { bg: colors.brand, fg: '#fff', border: colors.brand },
    success: { bg: colors.success, fg: '#fff', border: colors.success },
    danger: { bg: '#fff', fg: colors.danger, border: '#FECACA' },
    outline: { bg: '#fff', fg: colors.text, border: colors.borderStrong },
    soft: { bg: colors.brand50, fg: colors.brand600, border: colors.brand100 },
    dark: { bg: colors.navy, fg: '#fff', border: colors.navy },
  }[variant];
  const h = size === 'lg' ? 52 : size === 'md' ? 44 : 36;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.btn,
        { height: h, backgroundColor: v.bg, borderColor: v.border, opacity: disabled ? 0.5 : pressed ? 0.85 : 1 },
        variant === 'primary' || variant === 'success' ? styles.btnShadow : null,
        style,
      ]}
    >
      {loading ? <ActivityIndicator color={v.fg} /> : (
        <>
          {icon ? <Ionicons name={icon} size={size === 'sm' ? 16 : 19} color={v.fg} /> : null}
          <Text style={{ color: v.fg, fontWeight: '700', fontSize: size === 'sm' ? 13 : 15.5 }}>{title}</Text>
        </>
      )}
    </Pressable>
  );
}

export const Badge = ({ text, fg = colors.brand600, bg = colors.brand100, style }) => (
  <View style={[styles.badge, { backgroundColor: bg }, style]}><Text style={[styles.badgeText, { color: fg }]}>{text}</Text></View>
);

export const StatusBadge = ({ status, text }) => {
  const c = statusColor(status);
  return <Badge text={text} fg={c.fg} bg={c.bg} />;
};

export const IconCircle = ({ name, color = colors.brand, bg = colors.brand50, size = 40 }) => (
  <View style={{ width: size, height: size, borderRadius: size / 3.2, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }}>
    <Ionicons name={name} size={size * 0.5} color={color} />
  </View>
);

export function Field({ label, icon, right, style, inputStyle, ...props }) {
  return (
    <View style={[{ marginBottom: 14 }, style]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={styles.inputWrap}>
        {icon ? <Ionicons name={icon} size={18} color={colors.faint} style={{ marginLeft: 14 }} /> : null}
        <TextInput placeholderTextColor={colors.faint} style={[styles.input, inputStyle]} {...props} />
        {right}
      </View>
    </View>
  );
}

export const SectionTitle = ({ title, right, style }) => (
  <View style={[styles.sectionRow, style]}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {right}
  </View>
);

export const Row = ({ icon, label, value, onPress, valueStyle, last }) => (
  <Pressable onPress={onPress} disabled={!onPress} style={[styles.row, !last && styles.rowBorder]}>
    {icon ? <Ionicons name={icon} size={18} color={colors.muted} style={{ width: 26 }} /> : null}
    <Text style={styles.rowLabel}>{label}</Text>
    <Text style={[styles.rowValue, valueStyle]} numberOfLines={2}>{value}</Text>
    {onPress ? <Ionicons name="chevron-forward" size={16} color={colors.faint} /> : null}
  </Pressable>
);

export const Empty = ({ icon = 'file-tray-outline', title, text }) => (
  <View style={{ alignItems: 'center', paddingVertical: 48, paddingHorizontal: 24 }}>
    <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: '#EEF2F7', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
      <Ionicons name={icon} size={34} color={colors.faint} />
    </View>
    <Text style={[font.h3, { textAlign: 'center' }]}>{title}</Text>
    {text ? <Text style={[font.small, { textAlign: 'center', marginTop: 6 }]}>{text}</Text> : null}
  </View>
);

export const Loading = () => (
  <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 }}><ActivityIndicator size="large" color={colors.brand} /></View>
);

export function Segmented({ items, value, onChange }) {
  return (
    <View style={styles.seg}>
      {items.map((it) => {
        const active = it.key === value;
        return (
          <Pressable key={it.key} onPress={() => onChange(it.key)} style={[styles.segItem, active && styles.segActive]}>
            <Text style={[styles.segText, active && { color: colors.text, fontWeight: '700' }]}>{it.label}</Text>
            {it.count != null ? (
              <View style={[styles.segCount, active && { backgroundColor: colors.brand }]}>
                <Text style={{ fontSize: 11, fontWeight: '700', color: active ? '#fff' : colors.muted }}>{it.count}</Text>
              </View>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}

/** Nút tròn nhỏ: gọi điện / chỉ đường */
export const ActionChip = ({ icon, label, onPress, color = colors.brand }) => (
  <Pressable onPress={onPress} style={({ pressed }) => [styles.chip, { opacity: pressed ? 0.7 : 1 }]} hitSlop={6}>
    <Ionicons name={icon} size={16} color={color} />
    <Text style={[styles.chipText, { color }]}>{label}</Text>
  </Pressable>
);

export const call = (phone) => phone && Linking.openURL('tel:' + phone.replace(/[^\d+]/g, ''));
export const sms = (phone) => phone && Linking.openURL('sms:' + phone.replace(/[^\d+]/g, ''));
export const navigateTo = (address) => {
  if (!address) return;
  const q = encodeURIComponent(address);
  const url = Platform.OS === 'ios' ? `http://maps.apple.com/?daddr=${q}` : `google.navigation:q=${q}`;
  Linking.openURL(url).catch(() => Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${q}`));
};

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, ...shadow },
  btn: { borderRadius: 14, borderWidth: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: 16 },
  btnShadow: Platform.select({ ios: { shadowColor: colors.brand, shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: { width: 0, height: 6 } }, android: { elevation: 2 } }),
  badge: { paddingHorizontal: 9, paddingVertical: 4, borderRadius: 7, alignSelf: 'flex-start' },
  badgeText: { fontSize: 11.5, fontWeight: '700' },
  label: { fontSize: 13, fontWeight: '600', color: colors.text2, marginBottom: 7 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderWidth: 1, borderColor: colors.borderStrong, borderRadius: 13, minHeight: 50 },
  input: { flex: 1, fontSize: 15.5, color: colors.text, paddingHorizontal: 12, paddingVertical: 12 },
  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 22, marginBottom: 10 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 13, gap: 6 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: '#EEF1F6' },
  rowLabel: { flex: 1, fontSize: 14.5, color: colors.text2 },
  rowValue: { fontSize: 14.5, color: colors.text, fontWeight: '600', maxWidth: '58%', textAlign: 'right' },
  seg: { flexDirection: 'row', backgroundColor: '#E9EDF4', borderRadius: 13, padding: 4 },
  segItem: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 9, borderRadius: 10 },
  segActive: { backgroundColor: '#fff', ...Platform.select({ ios: { shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4, shadowOffset: { width: 0, height: 1 } }, android: { elevation: 1 } }) },
  segText: { fontSize: 13.5, fontWeight: '600', color: colors.muted },
  segCount: { minWidth: 20, height: 20, borderRadius: 10, paddingHorizontal: 5, backgroundColor: '#D8DEE8', alignItems: 'center', justifyContent: 'center' },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 11, paddingVertical: 7, borderRadius: 999, backgroundColor: colors.brand50 },
  chipText: { fontSize: 13, fontWeight: '600' },
});
