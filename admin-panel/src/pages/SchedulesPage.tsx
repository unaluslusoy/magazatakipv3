import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  LinearProgress,
  MenuItem,
  Select,
  TextField,
  Typography,
  Switch,
  FormControlLabel,
  FormGroup,
  Checkbox,
} from '@mui/material';
import {
  Add,
  Delete,
  Edit,
  Schedule as ScheduleIcon,
  AccessTime,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import scheduleService, { Schedule } from '@/services/scheduleService';
import playlistService from '@/services/playlistService';
import deviceService from '@/services/deviceService';
import storeService from '@/services/storeService';

const SCHEDULE_TYPES = {
  daily: 'Günlük',
  weekly: 'Haftalık',
  date_range: 'Tarih Aralığı',
  specific_dates: 'Belirli Tarihler',
  hourly: 'Saatlik',
};

const DAYS = [
  { value: 1, label: 'Pzt' },
  { value: 2, label: 'Sal' },
  { value: 3, label: 'Çar' },
  { value: 4, label: 'Per' },
  { value: 5, label: 'Cum' },
  { value: 6, label: 'Cmt' },
  { value: 0, label: 'Paz' },
];

export default function SchedulesPage() {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name: '',
    device_id: 0,
    store_id: 0,
    playlist_id: 0,
    schedule_type: 'daily' as Schedule['schedule_type'],
    start_time: '',
    end_time: '',
    start_date: '',
    end_date: '',
    days_of_week: [] as number[],
    priority: 1,
    is_active: true,
  });

  const { data: schedules, isLoading } = useQuery({
    queryKey: ['schedules'],
    queryFn: () => scheduleService.getAll(),
  });

  const { data: playlists } = useQuery({
    queryKey: ['playlists'],
    queryFn: () => playlistService.getAll(),
  });

  const { data: devices } = useQuery({
    queryKey: ['devices'],
    queryFn: () => deviceService.getAll(),
  });

  const { data: stores } = useQuery({
    queryKey: ['stores'],
    queryFn: () => storeService.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: scheduleService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      handleCloseDialog();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: any) => scheduleService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      handleCloseDialog();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: scheduleService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
    },
  });

  const handleOpenDialog = (schedule?: Schedule) => {
    if (schedule) {
      setSelectedSchedule(schedule);
      setFormData({
        name: schedule.name,
        device_id: schedule.device_id || 0,
        store_id: schedule.store_id || 0,
        playlist_id: schedule.playlist_id,
        schedule_type: schedule.schedule_type,
        start_time: schedule.start_time || '',
        end_time: schedule.end_time || '',
        start_date: schedule.start_date?.split('T')[0] || '',
        end_date: schedule.end_date?.split('T')[0] || '',
        days_of_week: schedule.days_of_week || [],
        priority: schedule.priority,
        is_active: schedule.is_active,
      });
    } else {
      setSelectedSchedule(null);
      setFormData({
        name: '',
        device_id: 0,
        store_id: 0,
        playlist_id: 0,
        schedule_type: 'daily',
        start_time: '',
        end_time: '',
        start_date: '',
        end_date: '',
        days_of_week: [],
        priority: 1,
        is_active: true,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedSchedule(null);
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.playlist_id) return;

    const submitData: any = {
      ...formData,
      device_id: formData.device_id || null,
      store_id: formData.store_id || null,
    };

    if (selectedSchedule) {
      updateMutation.mutate({ id: selectedSchedule.id, data: submitData });
    } else {
      createMutation.mutate(submitData);
    }
  };

  const toggleDay = (day: number) => {
    const newDays = formData.days_of_week.includes(day)
      ? formData.days_of_week.filter((d) => d !== day)
      : [...formData.days_of_week, day];
    setFormData({ ...formData, days_of_week: newDays });
  };

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" fontWeight="bold">
          Zamanlama Yönetimi
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          Yeni Zamanlama
        </Button>
      </Box>

      {isLoading ? (
        <LinearProgress />
      ) : (
        <Grid container spacing={3}>
          {schedules?.data?.schedules?.map((schedule: Schedule) => (
            <Grid item xs={12} md={6} lg={4} key={schedule.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AccessTime color="primary" />
                      <Typography variant="h6" fontWeight="bold">
                        {schedule.name}
                      </Typography>
                    </Box>
                    <Chip
                      label={schedule.is_active ? 'Aktif' : 'Pasif'}
                      size="small"
                      color={schedule.is_active ? 'success' : 'default'}
                    />
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Chip
                      label={SCHEDULE_TYPES[schedule.schedule_type]}
                      size="small"
                      color="primary"
                      variant="outlined"
                      sx={{ mr: 1 }}
                    />
                    <Chip
                      label={`Öncelik: ${schedule.priority}`}
                      size="small"
                      variant="outlined"
                    />
                  </Box>

                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    🎬 {schedule.playlist?.name || `Playlist #${schedule.playlist_id}`}
                  </Typography>

                  {schedule.device && (
                    <Typography variant="caption" display="block">
                      📱 {schedule.device.device_name}
                    </Typography>
                  )}

                  {schedule.store && (
                    <Typography variant="caption" display="block">
                      🏪 {schedule.store.name}
                    </Typography>
                  )}

                  {schedule.start_time && schedule.end_time && (
                    <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                      ⏰ {schedule.start_time} - {schedule.end_time}
                    </Typography>
                  )}

                  <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                    <IconButton size="small" onClick={() => handleOpenDialog(schedule)}>
                      <Edit />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => {
                        if (confirm('Bu zamanlamayı silmek istediğinize emin misiniz?')) {
                          deleteMutation.mutate(schedule.id);
                        }
                      }}
                    >
                      <Delete />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedSchedule ? 'Zamanlama Düzenle' : 'Yeni Zamanlama'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                label="Zamanlama Adı"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                fullWidth
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Playlist</InputLabel>
                <Select
                  value={formData.playlist_id}
                  label="Playlist"
                  onChange={(e) => setFormData({ ...formData, playlist_id: e.target.value as number })}
                >
                  {playlists?.data?.playlists?.map((pl: any) => (
                    <MenuItem key={pl.id} value={pl.id}>
                      {pl.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Zamanlama Tipi</InputLabel>
                <Select
                  value={formData.schedule_type}
                  label="Zamanlama Tipi"
                  onChange={(e) => setFormData({ ...formData, schedule_type: e.target.value as any })}
                >
                  <MenuItem value="daily">Günlük</MenuItem>
                  <MenuItem value="weekly">Haftalık</MenuItem>
                  <MenuItem value="date_range">Tarih Aralığı</MenuItem>
                  <MenuItem value="hourly">Saatlik</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Cihaz (Opsiyonel)</InputLabel>
                <Select
                  value={formData.device_id}
                  label="Cihaz (Opsiyonel)"
                  onChange={(e) => setFormData({ ...formData, device_id: e.target.value as number })}
                >
                  <MenuItem value={0}>Tüm Cihazlar</MenuItem>
                  {devices?.data?.devices?.map((dev: any) => (
                    <MenuItem key={dev.id} value={dev.id}>
                      {dev.device_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Mağaza (Opsiyonel)</InputLabel>
                <Select
                  value={formData.store_id}
                  label="Mağaza (Opsiyonel)"
                  onChange={(e) => setFormData({ ...formData, store_id: e.target.value as number })}
                >
                  <MenuItem value={0}>Tüm Mağazalar</MenuItem>
                  {stores?.data?.stores?.map((store: any) => (
                    <MenuItem key={store.id} value={store.id}>
                      {store.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={6}>
              <TextField
                label="Başlangıç Saati"
                type="time"
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
            </Grid>

            <Grid item xs={6}>
              <TextField
                label="Bitiş Saati"
                type="time"
                value={formData.end_time}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
            </Grid>

            {formData.schedule_type === 'weekly' && (
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Günler
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {DAYS.map((day) => (
                    <Chip
                      key={day.value}
                      label={day.label}
                      onClick={() => toggleDay(day.value)}
                      color={formData.days_of_week.includes(day.value) ? 'primary' : 'default'}
                      variant={formData.days_of_week.includes(day.value) ? 'filled' : 'outlined'}
                    />
                  ))}
                </Box>
              </Grid>
            )}

            {formData.schedule_type === 'date_range' && (
              <>
                <Grid item xs={6}>
                  <TextField
                    label="Başlangıç Tarihi"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Bitiş Tarihi"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                  />
                </Grid>
              </>
            )}

            <Grid item xs={6}>
              <TextField
                label="Öncelik (1-10)"
                type="number"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 1 })}
                InputProps={{ inputProps: { min: 1, max: 10 } }}
                fullWidth
              />
            </Grid>

            <Grid item xs={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  />
                }
                label="Aktif"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>İptal</Button>
          <Button onClick={handleSubmit} variant="contained">
            {selectedSchedule ? 'Güncelle' : 'Oluştur'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
