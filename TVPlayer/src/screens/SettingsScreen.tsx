import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import StorageService from '@services/StorageService';
import DownloadManager from '@services/DownloadManager';
import SyncManager from '@services/SyncManager';
import ApiService from '@services/ApiService';
import { APP_CONFIG } from '@config/constants';
import type { Device, SyncStatus } from '@types/index';

const SettingsScreen = () => {
  const navigation = useNavigation();
  const [device, setDevice] = useState<Device | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [cacheSize, setCacheSize] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const deviceInfo = await StorageService.getDeviceInfo();
    const status = await SyncManager.getSyncStatus();
    const size = await DownloadManager.getCacheSize();

    setDevice(deviceInfo);
    setSyncStatus(status);
    setCacheSize(size);
  };

  const handleLogout = () => {
    Alert.alert('Çıkış', 'Çıkış yapmak istediğinize emin misiniz?', [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Çıkış Yap',
        style: 'destructive',
        onPress: async () => {
          await ApiService.logout();
          navigation.navigate('Login' as never);
        },
      },
    ]);
  };

  const handleClearCache = () => {
    Alert.alert('Önbellek Temizle', 'Tüm indirilen içerikler silinecek. Devam edilsin mi?', [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Temizle',
        style: 'destructive',
        onPress: async () => {
          await DownloadManager.clearCache();
          await loadData();
          Alert.alert('Başarılı', 'Önbellek temizlendi');
        },
      },
    ]);
  };

  const handleSync = async () => {
    await SyncManager.sync();
    await loadData();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Geri</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Ayarlar</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Device Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cihaz Bilgileri</Text>
          <View style={styles.card}>
            <InfoRow label="Cihaz Adı" value={device?.device_name || '-'} />
            <InfoRow label="Cihaz Kodu" value={device?.device_code || '-'} />
            <InfoRow label="Durum" value={device?.status || '-'} />
            <InfoRow
              label="Son Görülme"
              value={device?.last_seen ? new Date(device.last_seen).toLocaleString('tr-TR') : '-'}
            />
          </View>
        </View>

        {/* Sync Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Senkronizasyon</Text>
          <View style={styles.card}>
            <InfoRow
              label="Son Senkronizasyon"
              value={
                syncStatus?.last_sync_at
                  ? new Date(syncStatus.last_sync_at).toLocaleString('tr-TR')
                  : 'Henüz yapılmadı'
              }
            />
            <InfoRow label="Playlist Sayısı" value={syncStatus?.playlists_count.toString() || '0'} />
            <InfoRow label="İçerik Sayısı" value={syncStatus?.contents_count.toString() || '0'} />
            <InfoRow label="Zamanlama Sayısı" value={syncStatus?.schedules_count.toString() || '0'} />
            <InfoRow
              label="Bekleyen İndirme"
              value={syncStatus?.pending_downloads.toString() || '0'}
            />
          </View>

          <TouchableOpacity style={styles.button} onPress={handleSync}>
            <Text style={styles.buttonText}>🔄 Şimdi Senkronize Et</Text>
          </TouchableOpacity>
        </View>

        {/* Storage */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Depolama</Text>
          <View style={styles.card}>
            <InfoRow label="Önbellek Boyutu" value={`${cacheSize.toFixed(2)} MB`} />
          </View>

          <TouchableOpacity style={[styles.button, styles.dangerButton]} onPress={handleClearCache}>
            <Text style={styles.buttonText}>🗑️ Önbelleği Temizle</Text>
          </TouchableOpacity>
        </View>

        {/* Actions */}
        <View style={styles.section}>
          <TouchableOpacity style={[styles.button, styles.logoutButton]} onPress={handleLogout}>
            <Text style={styles.buttonText}>Çıkış Yap</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.version}>Versiyon {APP_CONFIG.VERSION}</Text>
      </ScrollView>
    </View>
  );
};

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  backButton: {
    fontSize: 24,
    color: '#007AFF',
    marginRight: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  card: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  infoLabel: {
    fontSize: 18,
    color: '#999',
  },
  infoValue: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '500',
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
  },
  dangerButton: {
    backgroundColor: '#FF3B30',
  },
  logoutButton: {
    backgroundColor: '#666',
  },
  buttonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  version: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
    marginTop: 20,
    marginBottom: 40,
  },
});

export default SettingsScreen;
