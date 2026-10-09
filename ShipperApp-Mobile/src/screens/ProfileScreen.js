import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import Constants from 'expo-constants';
import { useAuth } from '../auth';
import { getServer } from '../storage';
import { colors } from '../theme';
import { initials } from '../format';
import { Button, Card, Row, SectionTitle } from '../components/ui';

export default function ProfileScreen({ navigation }) {
  const { profile, signOut } = useAuth();
  const insets = useSafeAreaInsets();
  const [server, setServer] = useState('');
  useEffect(() => { getServer().then(setServer); }, []);

  const logout = () => Alert.alert('Đăng xuất', 'Bạn muốn đăng xuất khỏi ứng dụng?', [
    { text: 'Hủy', style: 'cancel' }, { text: 'Đăng xuất', style: 'destructive', onPress: signOut },
  ]);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ paddingBottom: 40 }}>
      <StatusBar style="light" />
      <View style={[styles.hero, { paddingTop: insets.top + 24 }]}>
        <View style={styles.glow} />
        <View style={styles.avatar}><Text style={styles.avatarText}>{initials(profile?.fullName)}</Text></View>
        <Text style={styles.name}>{profile?.fullName}</Text>
        <Text style={styles.sub}>Mã shipper {profile?.code} · {profile?.username}</Text>
      </View>
      <View style={{ paddingHorizontal: 16 }}>
        <SectionTitle title="Thông tin" />
        <Card padded={false} style={{ paddingHorizontal: 16 }}>
          <Row icon="call-outline" label="Số điện thoại" value={profile?.phone || '—'} />
          <Row icon="bicycle-outline" label="Biển số xe" value={profile?.vehiclePlate || '—'} />
          <Row icon="mail-outline" label="Email" value={profile?.email || '—'} last />
        </Card>
        <SectionTitle title="Tiện ích" />
        <Card padded={false} style={{ paddingHorizontal: 16 }}>
          <Row icon="time-outline" label="Lịch sử công việc" value="" onPress={() => navigation.navigate('History')} />
          <Row icon="wallet-outline" label="Tiền COD & nộp tiền" value="" onPress={() => navigation.navigate('Cod')} />
          <Row icon="key-outline" label="Đổi mật khẩu" value="" onPress={() => navigation.navigate('ChangePassword')} last />
        </Card>
        <SectionTitle title="Ứng dụng" />
        <Card padded={false} style={{ paddingHorizontal: 16 }}>
          <Row icon="server-outline" label="Máy chủ" value={server} />
          <Row icon="information-circle-outline" label="Phiên bản" value={Constants.expoConfig?.version || '1.0.0'} last />
        </Card>
        <Button title="Đăng xuất" icon="log-out-outline" variant="danger" onPress={logout} style={{ marginTop: 24 }} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  hero: { backgroundColor: colors.navy, alignItems: 'center', paddingBottom: 28, overflow: 'hidden' },
  glow: { position: 'absolute', width: 320, height: 320, borderRadius: 160, backgroundColor: colors.brand, opacity: 0.3, top: -150, left: -80 },
  avatar: { width: 76, height: 76, borderRadius: 38, backgroundColor: colors.brand, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: 'rgba(255,255,255,0.25)' },
  avatarText: { color: '#fff', fontSize: 26, fontWeight: '800' },
  name: { color: '#fff', fontSize: 21, fontWeight: '800', marginTop: 12 },
  sub: { color: 'rgba(255,255,255,0.6)', fontSize: 13.5, marginTop: 4 },
});
