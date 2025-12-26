import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Chip,
  IconButton,
  Stack,
  Button,
} from '@mui/material';
import { ChevronLeft, ChevronRight, Today } from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

interface TimelineData {
  date: string;
  timeline: Array<{
    hour: number;
    active_playlist: {
      id: number;
      name: string;
      priority: number;
    } | null;
  }>;
  playlists: Array<{
    id: number;
    name: string;
    priority: number;
    schedule_type: string;
    color: string;
  }>;
}

export default function TimelineView() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const { data: timelineData, isLoading } = useQuery<TimelineData>({
    queryKey: ['timeline', selectedDate],
    queryFn: async () => {
      const res = await axios.get(`/api/schedules/timeline`, {
        params: { date: selectedDate },
      });
      return res.data.data || res.data;
    },
  });

  const handlePrevDay = () => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() - 1);
    setSelectedDate(date.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + 1);
    setSelectedDate(date.toISOString().split('T')[0]);
  };

  const handleToday = () => {
    setSelectedDate(new Date().toISOString().split('T')[0]);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('tr-TR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Yükleniyor...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">Günlük Timeline</Typography>

        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <IconButton onClick={handlePrevDay}>
            <ChevronLeft />
          </IconButton>

          <Typography variant="h6" sx={{ minWidth: 300, textAlign: 'center' }}>
            {formatDate(selectedDate)}
          </Typography>

          <IconButton onClick={handleNextDay}>
            <ChevronRight />
          </IconButton>

          <Button startIcon={<Today />} onClick={handleToday} variant="outlined">
            Bugün
          </Button>
        </Box>
      </Box>

      {/* Saat Çizelgesi */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          SAAT ÇİZELGESİ
        </Typography>

        <Box sx={{ position: 'relative', height: 400, mt: 2 }}>
          {/* Saat başlıkları */}
          <Box sx={{ display: 'flex', mb: 2, borderBottom: '1px solid', borderColor: 'divider', pb: 1 }}>
            {[0, 3, 6, 9, 12, 15, 18, 21, 24].map((hour) => (
              <Box
                key={hour}
                sx={{
                  flex: hour === 24 ? 0 : 1,
                  textAlign: 'center',
                  fontSize: 12,
                  color: 'text.secondary',
                }}
              >
                {hour < 24 ? `${hour.toString().padStart(2, '0')}:00` : ''}
              </Box>
            ))}
          </Box>

          {/* Playlist çubukları */}
          {timelineData?.playlists.map((playlist, idx) => (
            <Box key={playlist.id} sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography
                  variant="caption"
                  sx={{ minWidth: 150, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis' }}
                >
                  P{idx + 1}
                </Typography>

                <Box sx={{ flex: 1, height: 40, position: 'relative', bgcolor: 'grey.900', borderRadius: 1 }}>
                  {timelineData?.timeline.map((slot) => {
                    if (slot.active_playlist?.id === playlist.id) {
                      return (
                        <Box
                          key={slot.hour}
                          sx={{
                            position: 'absolute',
                            left: `${(slot.hour / 24) * 100}%`,
                            width: `${(1 / 24) * 100}%`,
                            height: '100%',
                            bgcolor: playlist.color,
                            borderRight: '1px solid',
                            borderColor: 'background.paper',
                          }}
                        />
                      );
                    }
                    return null;
                  })}
                </Box>
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ ml: '166px', display: 'block', mt: 0.5 }}>
                {playlist.name} ({playlist.schedule_type})
              </Typography>
            </Box>
          ))}
        </Box>
      </Paper>

      {/* Öncelik Sırası */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          ÖNCELİK SIRASI
        </Typography>
        <Stack spacing={1} sx={{ mt: 2 }}>
          {timelineData?.playlists
            .sort((a, b) => b.priority - a.priority)
            .map((playlist, idx) => (
              <Box key={playlist.id} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="body2" sx={{ minWidth: 30, fontWeight: 600 }}>
                  {idx + 1}.
                </Typography>
                <Box
                  sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: playlist.color, flexShrink: 0 }}
                />
                <Typography variant="body2" sx={{ flex: 1 }}>
                  {playlist.name}
                </Typography>
                <Chip label={`Öncelik: ${playlist.priority}`} size="small" variant="outlined" />
                <Chip label={playlist.schedule_type} size="small" />
              </Box>
            ))}
        </Stack>
      </Paper>

      {/* Renk Kodları */}
      <Paper sx={{ p: 2 }}>
        <Typography variant="caption" color="text.secondary">
          RENK KODLARI
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, mt: 1, flexWrap: 'wrap' }}>
          {timelineData?.playlists.map((playlist) => (
            <Box key={playlist.id} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 16, height: 16, bgcolor: playlist.color, borderRadius: 0.5 }} />
              <Typography variant="caption">{playlist.name}</Typography>
            </Box>
          ))}
        </Box>
      </Paper>
    </Box>
  );
}
