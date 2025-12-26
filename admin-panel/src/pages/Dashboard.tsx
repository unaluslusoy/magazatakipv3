import { useEffect } from 'react';
import { Box, Container, Grid, Paper, Typography, LinearProgress, Chip, Card, CardContent } from '@mui/material';
import {
  VideoLibrary,
  PlaylistPlay,
  Devices,
  Store,
  Campaign,
  Schedule,
  TrendingUp,
  Storage,
  Visibility,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import contentService from '@/services/contentService';
import playlistService from '@/services/playlistService';
import deviceService from '@/services/deviceService';
import storeService from '@/services/storeService';
import campaignService from '@/services/campaignService';
import scheduleService from '@/services/scheduleService';
import socketService from '@/services/socketService';
import { useAuthStore } from '@/store/authStore';

export default function Dashboard() {
  const { user } = useAuthStore();

  // Fetch stats
  const { data: contents, isLoading: loadingContents } = useQuery({
    queryKey: ['contents'],
    queryFn: () => contentService.getAll(),
  });

  const { data: playlists, isLoading: loadingPlaylists } = useQuery({
    queryKey: ['playlists'],
    queryFn: () => playlistService.getAll(),
  });

  const { data: devices, isLoading: loadingDevices, refetch: refetchDevices } = useQuery({
    queryKey: ['devices'],
    queryFn: () => deviceService.getAll(),
    refetchInterval: 5000,
  });

  const { data: stores, isLoading: loadingStores } = useQuery({
    queryKey: ['stores'],
    queryFn: () => storeService.getAll(),
  });

  const { data: campaigns, isLoading: loadingCampaigns } = useQuery({
    queryKey: ['campaigns'],
    queryFn: () => campaignService.getAll(),
  });

  const { data: schedules, isLoading: loadingSchedules } = useQuery({
    queryKey: ['schedules'],
    queryFn: () => scheduleService.getAll(),
  });

  // Dashboard stats API
  const { data: dashboardStats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const res = await axios.get('/api/reports/dashboard');
      return res.data.data || res.data;
    },
    refetchInterval: 30000, // 30 saniyede bir
  });

  // Socket.IO
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      socketService.connect(token);

      socketService.on('device:status:changed', () => {
        refetchDevices();
      });

      return () => {
        socketService.disconnect();
      };
    }
  }, [refetchDevices]);

  const stats = {
    contents: contents?.data?.contents?.length || 0,
    playlists: playlists?.data?.playlists?.length || 0,
    devices: devices?.data?.devices?.length || 0,
    stores: stores?.data?.stores?.length || 0,
    campaigns: campaigns?.data?.campaigns?.length || 0,
    schedules: schedules?.data?.schedules?.length || 0,
  };

  const onlineDevices = devices?.data?.devices?.filter((d: any) => d.status === 'online').length || 0;
  const activeContents = contents?.data?.contents?.filter((c: any) => c.is_active).length || 0;

  const statsData = [
    {
      title: 'Toplam İçerik',
      value: stats.contents,
      icon: <VideoLibrary sx={{ fontSize: 40 }} />,
      color: '#667eea',
      loading: loadingContents,
    },
    {
      title: 'Aktif Playlist',
      value: stats.playlists,
      icon: <PlaylistPlay sx={{ fontSize: 40 }} />,
      color: '#764ba2',
      loading: loadingPlaylists,
    },
    {
      title: 'Çevrimiçi Cihaz',
      value: onlineDevices,
      icon: <Devices sx={{ fontSize: 40 }} />,
      color: '#10b981',
      loading: loadingDevices,
    },
    {
      title: 'Mağazalar',
      value: stats.stores,
      icon: <Store sx={{ fontSize: 40 }} />,
      color: '#f59e0b',
      loading: loadingStores,
    },
    {
      title: 'Aktif Kampanya',
      value: stats.campaigns,
      icon: <Campaign sx={{ fontSize: 40 }} />,
      color: '#ef4444',
      loading: loadingCampaigns,
    },
    {
      title: 'Zamanlamalar',
      value: stats.schedules,
      icon: <Schedule sx={{ fontSize: 40 }} />,
      color: '#8b5cf6',
      loading: loadingSchedules,
    },
  ];
  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Hoş Geldiniz, {user?.name || 'Admin'}!
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 3 }}>
        Sisteminizin genel görünümü ve istatistikleri
      </Typography>

      <Grid container spacing={3}>
        {statsData.map((stat, index) => (
          <Grid item xs={12} sm={6} md={4} lg={2} key={index}>
            <Paper
              elevation={2}
              sx={{
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                borderLeft: 4,
                borderColor: stat.color,
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 6,
                },
              }}
            >
              <Box sx={{ color: stat.color }}>{stat.icon}</Box>
              <Box>
                {stat.loading ? (
                  <LinearProgress sx={{ width: 60 }} />
                ) : (
                  <Typography variant="h4" fontWeight="bold">
                    {stat.value}
                  </Typography>
                )}
                <Typography variant="body2" color="text.secondary">
                  {stat.title}
                </Typography>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Cihaz Durumu
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mt: 2, flexWrap: 'wrap' }}>
              <Chip
                label={`${onlineDevices} Çevrimiçi`}
                color="success"
                icon={<Devices />}
              />
              <Chip
                label={`${stats.devices - onlineDevices} Çevrimdışı`}
                color="default"
                icon={<Devices />}
              />
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              İçerik Durumu
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mt: 2, flexWrap: 'wrap' }}>
              <Chip
                label={`${activeContents} Aktif`}
                color="success"
                icon={<VideoLibrary />}
              />
              <Chip
                label={`${stats.contents - activeContents} Pasif`}
                color="default"
                icon={<VideoLibrary />}
              />
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Sistem Durumu
            </Typography>
            <Box sx={{ mt: 2, display: 'flex', gap: 3, flexWrap: 'wrap' }}>
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Backend API
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      bgcolor: '#10b981',
                      animation: 'pulse 2s infinite',
                      '@keyframes pulse': {
                        '0%, 100%': { opacity: 1 },
                        '50%': { opacity: 0.5 },
                      },
                    }}
                  />
                  <Typography variant="body2" fontWeight="bold" color="success.main">
                    Çalışıyor
                  </Typography>
                </Box>
              </Box>

              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Socket.IO
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      bgcolor: socketService.isConnected() ? '#10b981' : '#ef4444',
                      animation: socketService.isConnected() ? 'pulse 2s infinite' : 'none',
                      '@keyframes pulse': {
                        '0%, 100%': { opacity: 1 },
                        '50%': { opacity: 0.5 },
                      },
                    }}
                  />
                  <Typography
                    variant="body2"
                    fontWeight="bold"
                    color={socketService.isConnected() ? 'success.main' : 'error.main'}
                  >
                    {socketService.isConnected() ? 'Bağlı' : 'Bağlı Değil'}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Raporlama Widget'ları */}
        {dashboardStats && (
          <>
            <Grid item xs={12} md={6}>
              <Paper elevation={2} sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Storage /> Depolama Kullanımı
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      {dashboardStats.storage?.used_gb || 0} GB / {dashboardStats.storage?.total_gb || 100} GB
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {dashboardStats.storage?.percentage || 0}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min(dashboardStats.storage?.percentage || 0, 100)}
                    sx={{
                      height: 8,
                      borderRadius: 1,
                      bgcolor: 'grey.200',
                      '& .MuiLinearProgress-bar': {
                        bgcolor: dashboardStats.storage?.percentage > 80 ? 'error.main' : 'primary.main',
                      },
                    }}
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    {dashboardStats.storage?.available_gb || 0} GB kullanılabilir
                  </Typography>
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper elevation={2} sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Visibility /> Bugünkü Oynatmalar
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="h3" fontWeight="bold" color="primary.main">
                    {dashboardStats.today_plays || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Toplam içerik oynatma sayısı
                  </Typography>
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Paper elevation={2} sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <VideoLibrary /> İçerik Dağılımı
                </Typography>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  {dashboardStats.content_stats && Object.entries(dashboardStats.content_stats).map(([type, count]) => (
                    <Grid item xs={6} sm={3} key={type}>
                      <Card variant="outlined">
                        <CardContent sx={{ textAlign: 'center', py: 2 }}>
                          <Typography variant="h5" fontWeight="bold" color="primary.main">
                            {count as number}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" textTransform="capitalize">
                            {type === 'video' ? 'Video' : type === 'image' ? 'Görsel' : type === 'slider' ? 'Slider' : type === 'ticker' ? 'Ticker' : type === 'announcement' ? 'Duyuru' : type}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            </Grid>

            {dashboardStats.active_campaigns && dashboardStats.active_campaigns.length > 0 && (
              <Grid item xs={12}>
                <Paper elevation={2} sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Campaign /> Aktif Kampanyalar
                  </Typography>
                  <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {dashboardStats.active_campaigns.slice(0, 5).map((campaign: any) => (
                      <Box key={campaign.id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                        <Box>
                          <Typography variant="body1" fontWeight="bold">
                            {campaign.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(campaign.start_date).toLocaleDateString()} - {new Date(campaign.end_date).toLocaleDateString()}
                          </Typography>
                        </Box>
                        <Chip label={campaign.is_active ? 'Aktif' : 'Pasif'} color={campaign.is_active ? 'success' : 'default'} size="small" />
                      </Box>
                    ))}
                  </Box>
                </Paper>
              </Grid>
            )}
          </>
        )}
      </Grid>
    </Container>
  );
}
