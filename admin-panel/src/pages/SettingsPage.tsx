import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  Grid,
  Paper,
} from '@mui/material';
import { Save, Notifications, Security, Palette } from '@mui/icons-material';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    // Genel
    siteName: 'MağazaPano',
    siteDescription: 'Dijital Ekran Yönetim Sistemi',
    
    // Bildirimler
    emailNotifications: true,
    pushNotifications: false,
    deviceAlerts: true,
    playlistAlerts: true,
    
    // Güvenlik
    sessionTimeout: 24,
    twoFactorAuth: false,
    ipWhitelist: '',
    
    // Medya
    maxFileSize: 500,
    allowedVideoFormats: 'mp4,webm,mov',
    allowedImageFormats: 'jpg,jpeg,png,gif,webp',
    
    // Otomatik işlemler
    autoSyncInterval: 5,
    autoBackup: true,
    backupTime: '03:00',
  });

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    // TODO: API call to save settings
    console.log('Settings saved:', settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Sistem Ayarları
      </Typography>

      {saved && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Ayarlar başarıyla kaydedildi!
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Genel Ayarlar */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Palette sx={{ mr: 1 }} color="primary" />
                <Typography variant="h6">Genel Ayarlar</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              
              <TextField
                label="Site Adı"
                value={settings.siteName}
                onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                fullWidth
                margin="normal"
              />
              
              <TextField
                label="Site Açıklaması"
                value={settings.siteDescription}
                onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
                fullWidth
                margin="normal"
                multiline
                rows={2}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Bildirim Ayarları */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Notifications sx={{ mr: 1 }} color="primary" />
                <Typography variant="h6">Bildirimler</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.emailNotifications}
                    onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                  />
                }
                label="E-posta Bildirimleri"
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.pushNotifications}
                    onChange={(e) => setSettings({ ...settings, pushNotifications: e.target.checked })}
                  />
                }
                label="Push Bildirimleri"
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.deviceAlerts}
                    onChange={(e) => setSettings({ ...settings, deviceAlerts: e.target.checked })}
                  />
                }
                label="Cihaz Uyarıları"
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.playlistAlerts}
                    onChange={(e) => setSettings({ ...settings, playlistAlerts: e.target.checked })}
                  />
                }
                label="Playlist Uyarıları"
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Güvenlik Ayarları */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Security sx={{ mr: 1 }} color="primary" />
                <Typography variant="h6">Güvenlik</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              
              <TextField
                label="Oturum Zaman Aşımı (saat)"
                type="number"
                value={settings.sessionTimeout}
                onChange={(e) => setSettings({ ...settings, sessionTimeout: parseInt(e.target.value) })}
                fullWidth
                margin="normal"
                InputProps={{ inputProps: { min: 1, max: 168 } }}
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.twoFactorAuth}
                    onChange={(e) => setSettings({ ...settings, twoFactorAuth: e.target.checked })}
                  />
                }
                label="İki Faktörlü Doğrulama"
              />
              
              <TextField
                label="IP Beyaz Liste (virgülle ayırın)"
                value={settings.ipWhitelist}
                onChange={(e) => setSettings({ ...settings, ipWhitelist: e.target.value })}
                fullWidth
                margin="normal"
                multiline
                rows={2}
                placeholder="192.168.1.1, 10.0.0.1"
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Medya Ayarları */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Medya Ayarları
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <TextField
                label="Maksimum Dosya Boyutu (MB)"
                type="number"
                value={settings.maxFileSize}
                onChange={(e) => setSettings({ ...settings, maxFileSize: parseInt(e.target.value) })}
                fullWidth
                margin="normal"
                InputProps={{ inputProps: { min: 1, max: 5000 } }}
              />
              
              <TextField
                label="İzin Verilen Video Formatları"
                value={settings.allowedVideoFormats}
                onChange={(e) => setSettings({ ...settings, allowedVideoFormats: e.target.value })}
                fullWidth
                margin="normal"
              />
              
              <TextField
                label="İzin Verilen Resim Formatları"
                value={settings.allowedImageFormats}
                onChange={(e) => setSettings({ ...settings, allowedImageFormats: e.target.value })}
                fullWidth
                margin="normal"
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Otomatik İşlemler */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Otomatik İşlemler
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <TextField
                    label="Senkronizasyon Aralığı (dakika)"
                    type="number"
                    value={settings.autoSyncInterval}
                    onChange={(e) => setSettings({ ...settings, autoSyncInterval: parseInt(e.target.value) })}
                    fullWidth
                    InputProps={{ inputProps: { min: 1, max: 60 } }}
                  />
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.autoBackup}
                        onChange={(e) => setSettings({ ...settings, autoBackup: e.target.checked })}
                      />
                    }
                    label="Otomatik Yedekleme"
                  />
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <TextField
                    label="Yedekleme Saati"
                    type="time"
                    value={settings.backupTime}
                    onChange={(e) => setSettings({ ...settings, backupTime: e.target.value })}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Kaydet Butonu */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<Save />}
              onClick={handleSave}
            >
              Ayarları Kaydet
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
