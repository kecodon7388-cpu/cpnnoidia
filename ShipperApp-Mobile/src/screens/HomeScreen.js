import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, RefreshControl, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../api';
import { useAuth } from '../auth';
import { isOnDuty, resumeTracking, startTracking, stopTracking } from '../location';
import { colors, radius, shadow, taskTypeMeta } from '../theme';
import { greeting, initials, money } from '../format';
import { Card, SectionTitle } from '../components/ui';
import TaskCard from '../components/TaskCard';

export default function HomeScreen({ navigation }) {
  const { profile, updateProfile } = useAuth();
  const insets = useSafeAreaInsets();
  const [data, setData] = useState(null);
  const [next, setNext] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [onDuty, setOnDuty] = useState(false);
  const [mode, setMode] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const [me, tasks] = await Promise.all([api.me(), api.tasks('delivery')]);
      setData(me);
      setNext((tasks.items || []).slice(0, 3));
      setError('');
      if (me.profile) updateProfile(me.profile);
    } catch (e) { setError(e.message); }
  }, [updateProfile]);

  useFocusEffect(useCallback(() => { load(); }, [load]));
  useEffect(() => { (async () => { setOnDuty(await isOnDuty()); setMode(await resumeTracking()); })(); }, []);

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const toggleDuty = async (v) => {
    try {
      if (v) { const m = await startTracking(); setMode(m); setOnDuty(true); }
      else { await stopTracking(); setMode(null); setOnDuty(false); }
    } catch (e) { Alert.alert('Không bật được vị trí', e.message); }
  };

  const stats = [
    { key: 'pickup', value: data?.pickups ?? '–' },
    { key: 'delivery', value: data?.deliveries ?? '–' },
    { key: 'return', value: data?.returns ?? '–' },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <StatusBar style="light" />
      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />} contentContainerStyle={{ paddingBottom: 32 }}>
        <View style={[styles.header, { paddingTop: insets.top + 14 }]}>
          <View style={styles.glow} />
          <View style={styles.headRow}>
            <View style={styles.avatar}><Text style={styles.avatarText}>{initials(profile?.fullName)}</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.hello}>{greeting()},</Text>
              <Text style={styles.name} numberOfLines={1}>{profile?.fullName || 'Shipper'}</Text>
            </View>
            <Pressable onPress={() => navigation.navigate('Scan')} style={styles.headBtn} hitSlop={8}>
              <Ionicons name="scan" size={21} color="#fff" />
            </Pressable>
          </View>

          <View style={styles.duty}>
            <View style={[styles.dot, { backgroundColor: onDuty ? '#4ADE80' : '#64748B' }]} />
            <View style={{ flex: 1 }}>
              <Text style={styles.dutyTitle}>{onDuty ? 'Đang làm việc' : 'Đang nghỉ'}</Text>
              <Text style={styles.dutySub}>
                {onDuty ? (mode === 'background' ? 'Đang chia sẻ vị trí (cả khi tắt màn hình)' : 'Đang chia sẻ vị trí khi mở ứng dụng') : 'Bật để điều phối viên thấy vị trí của bạn'}
              </Text>
            </View>
            <Switch value={onDuty} onValueChange={toggleDuty} trackColor={{ true: '#22C55E', false: '#334155' }} thumbColor="#fff" />
          </View>
        </View>

        <View style={{ paddingHorizontal: 16, marginTop: -34 }}>
          {error ? (
            <Card style={{ marginBottom: 12, borderColor: '#FECACA', backgroundColor: '#FEF2F2' }}>
              <Text style={{ color: '#991B1B' }}>{error}</Text>
            </Card>
          ) : null}

          <View style={styles.statRow}>
            {stats.map((s) => {
              const m = taskTypeMeta[s.key];
              return (
                <Pressable key={s.key} style={({ pressed }) => [styles.stat, { opacity: pressed ? 0.9 : 1 }]} onPress={() => navigation.navigate('Tasks', { type: s.key })}>
                  <View style={[styles.statIcon, { backgroundColor: m.bg }]}><Ionicons name={m.icon} size={19} color={m.color} /></View>
                  <Text style={styles.statValue}>{s.value}</Text>
                  <Text style={styles.statLabel}>{m.label}</Text>
                </Pressable>
              );
            })}
          </View>

          <Card style={{ marginTop: 12 }} onPress={() => navigation.navigate('Cod')}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ flex: 1 }}>
                <Text style={styles.codLabel}>Tiền COD đang giữ</Text>
                <Text style={styles.codValue}>{money(data?.codHeld)}</Text>
                <Text style={styles.codSub}>Thu hôm nay {money(data?.codToday)} · nộp về bưu cục cuối ca</Text>
              </View>
              <View style={styles.codIcon}><Ionicons name="wallet" size={24} color={colors.success} /></View>
            </View>
          </Card>

          <View style={styles.todayRow}>
            <Today icon="checkmark-circle" color={colors.success} value={data?.deliveredToday} label="Đã giao" />
            <Today icon="cube" color={colors.info} value={data?.pickedToday} label="Đã lấy" />
            <Today icon="close-circle" color={colors.danger} value={data?.failedToday} label="Thất bại" />
          </View>

          <SectionTitle title="Đơn giao tiếp theo" right={(
            <Pressable onPress={() => navigation.navigate('Tasks', { type: 'delivery' })}><Text style={styles.link}>Xem tất cả</Text></Pressable>
          )} />
          {next.length === 0 ? (
            <Card><Text style={{ color: colors.muted, textAlign: 'center' }}>Chưa có đơn giao được phân công</Text></Card>
          ) : next.map((t) => (
            <TaskCard key={t.assignmentId} item={t} onPress={() => navigation.navigate('Order', { id: t.orderId })} />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const Today = ({ icon, color, value, label }) => (
  <View style={styles.today}>
    <Ionicons name={icon} size={18} color={color} />
    <Text style={styles.todayValue}>{value ?? '–'}</Text>
    <Text style={styles.todayLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  header: { backgroundColor: colors.navy, paddingHorizontal: 18, paddingBottom: 52, overflow: 'hidden' },
  glow: { position: 'absolute', width: 320, height: 320, borderRadius: 160, backgroundColor: colors.brand, opacity: 0.32, top: -140, right: -90 },
  headRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 46, height: 46, borderRadius: 23, backgroundColor: colors.brand, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)' },
  avatarText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  hello: { color: 'rgba(255,255,255,0.6)', fontSize: 13.5 },
  name: { color: '#fff', fontSize: 19, fontWeight: '800', letterSpacing: -0.2 },
  headBtn: { width: 42, height: 42, borderRadius: 13, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center' },
  duty: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 18, padding: 14, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)' },
  dot: { width: 10, height: 10, borderRadius: 5 },
  dutyTitle: { color: '#fff', fontWeight: '700', fontSize: 15 },
  dutySub: { color: 'rgba(255,255,255,0.6)', fontSize: 12.5, marginTop: 2 },
  statRow: { flexDirection: 'row', gap: 10 },
  stat: { flex: 1, backgroundColor: '#fff', borderRadius: radius.lg, padding: 14, borderWidth: 1, borderColor: colors.border, ...shadow },
  statIcon: { width: 36, height: 36, borderRadius: 11, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  statValue: { fontSize: 26, fontWeight: '800', color: colors.text, letterSpacing: -0.5 },
  statLabel: { fontSize: 12.5, color: colors.muted, marginTop: 1 },
  codLabel: { fontSize: 13, color: colors.muted },
  codValue: { fontSize: 24, fontWeight: '800', color: colors.text, marginTop: 3, letterSpacing: -0.4 },
  codSub: { fontSize: 12, color: colors.faint, marginTop: 3 },
  codIcon: { width: 50, height: 50, borderRadius: 16, backgroundColor: colors.successBg, alignItems: 'center', justifyContent: 'center' },
  todayRow: { flexDirection: 'row', marginTop: 12, backgroundColor: '#fff', borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, paddingVertical: 14, ...shadow },
  today: { flex: 1, alignItems: 'center', gap: 3 },
  todayValue: { fontSize: 18, fontWeight: '800', color: colors.text },
  todayLabel: { fontSize: 12, color: colors.muted },
  link: { color: colors.brand, fontWeight: '600', fontSize: 13.5 },
});
