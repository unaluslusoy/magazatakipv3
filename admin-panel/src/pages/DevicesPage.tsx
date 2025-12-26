import React, { useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  LinearProgress,
  Typography,
  Badge,
} from '@mui/material';
import {
  Devices as DevicesIcon,
  CheckCircle,
  Error,
  Circle,
} from '@mui/icons-material';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import deviceService, { Device } from '@/services/deviceService';
import socketService from '@/services/socketService';

const STATUS_CONFIG = {
  online: { icon: <CheckCircle />, color: 'success' as const, label: 'Çevrimiçi' },
  offline: { icon: <Circle />, color: 'default' as const, label: 'Çevrimdışı' },
  error: { icon: <Error />, color: 'error' as const, label: 'Hata' },
};

export default function DevicesPage() {
  const queryClient = useQueryClient();
  
  const { data: devices, isLoading } = useQuery({
    queryKey: ['devices'],
    queryFn: () => deviceService.getAll(),
    refetchInterval: 5000, // Her 5 saniyede yenile
  });

  // Socket.IO real-time updates
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token && !socketService.isConnected()) {
      socketService.connect(token);
    }

    const handleDeviceStatusChange = (data: any) => {
      console.log('Device status changed:', data);
      queryClient.invalidateQueries({ queryKey: ['devices'] });
    };

    socketService.on('device:status:changed', handleDeviceStatusChange);

    return () => {
      socketService.off('device:status:changed');
    };
  }, [queryClient]);

  const formatLastSeen = (date?: string) => {
    if (!date) return 'Hiç görülmedi';
    const diff = Date.now() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Az önce';
    if (minutes < 60) return `${minutes} dk önce`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} saat önce`;
    return `${Math.floor(hours / 24)} gün önce`;
  };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Cihaz İzleme
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Tüm cihazların anlık durumunu görüntüleyin
        </Typography>
      </Box>

      {isLoading ? (
        <LinearProgress />
      ) : (
        <Grid container spacing={3}>
          {devices?.data?.devices?.map((device: Device) => {
            const statusConfig = STATUS_CONFIG[device.status];
            
            return (
              <Grid item xs={12} sm={6} md={4} lg={3} key={device.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                      <Badge
                        color={statusConfig.color}
                        variant="dot"
                        sx={{
                          '& .MuiBadge-badge': {
                            animation: device.status === 'online' ? 'pulse 2s infinite' : 'none',
                          },
                        }}
                      >
                        <DevicesIcon fontSize="large" />
                      </Badge>
                      <Chip
                        icon={statusConfig.icon}
                        label={statusConfig.label}
                        size="small"
                        color={statusConfig.color}
                      />
                    </Box>

                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      {device.device_name}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Kod: {device.device_code}
                    </Typography>

                    {device.store && (
                      <Typography variant="caption" display="block" gutterBottom>
                        📍 {device.store.name}
                      </Typography>
                    )}

                    <Typography variant="caption" display="block" color="text.secondary">
                      Son görülme: {formatLastSeen(device.last_seen_at)}
                    </Typography>

                    {device.current_playlist_id && (
                      <Chip
                        label="Playlist aktif"
                        size="small"
                        variant="outlined"
                        sx={{ mt: 1 }}
                      />
                    )}
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      <style>
        {`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}
      </style>
    </Box>
  );
}
