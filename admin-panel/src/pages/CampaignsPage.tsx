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
} from '@mui/material';
import { Add, Delete, Edit, Campaign as CampaignIcon } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import campaignService, { Campaign } from '@/services/campaignService';
import playlistService from '@/services/playlistService';

const STATUS_CONFIG = {
  pending: { color: 'warning' as const, label: 'Beklemede' },
  active: { color: 'success' as const, label: 'Aktif' },
  completed: { color: 'default' as const, label: 'Tamamlandı' },
  cancelled: { color: 'error' as const, label: 'İptal Edildi' },
};

export default function CampaignsPage() {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    playlist_id: 0,
    start_date: '',
    end_date: '',
  });

  const { data: campaigns, isLoading } = useQuery({
    queryKey: ['campaigns'],
    queryFn: () => campaignService.getAll(),
  });

  const { data: playlists } = useQuery({
    queryKey: ['playlists'],
    queryFn: () => playlistService.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: campaignService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      handleCloseDialog();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: any) => campaignService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      handleCloseDialog();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: campaignService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    },
  });

  const handleOpenDialog = (campaign?: Campaign) => {
    if (campaign) {
      setSelectedCampaign(campaign);
      setFormData({
        name: campaign.name,
        description: campaign.description || '',
        playlist_id: campaign.playlist_id,
        start_date: campaign.start_date.split('T')[0],
        end_date: campaign.end_date.split('T')[0],
      });
    } else {
      setSelectedCampaign(null);
      setFormData({
        name: '',
        description: '',
        playlist_id: 0,
        start_date: '',
        end_date: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedCampaign(null);
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.playlist_id) return;

    if (selectedCampaign) {
      updateMutation.mutate({ id: selectedCampaign.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" fontWeight="bold">
          Kampanya Yönetimi
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          Yeni Kampanya
        </Button>
      </Box>

      {isLoading ? (
        <LinearProgress />
      ) : (
        <Grid container spacing={3}>
          {campaigns?.data?.campaigns?.map((campaign: Campaign) => {
            const statusConfig = STATUS_CONFIG[campaign.status];
            
            return (
              <Grid item xs={12} md={6} lg={4} key={campaign.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                      <Typography variant="h6" fontWeight="bold">
                        {campaign.name}
                      </Typography>
                      <Chip
                        label={statusConfig.label}
                        size="small"
                        color={statusConfig.color}
                      />
                    </Box>

                    {campaign.description && (
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {campaign.description}
                      </Typography>
                    )}

                    <Typography variant="caption" display="block" gutterBottom>
                      🎬 Playlist: {campaign.playlist?.name || `#${campaign.playlist_id}`}
                    </Typography>

                    <Typography variant="caption" display="block" gutterBottom>
                      📅 {new Date(campaign.start_date).toLocaleDateString('tr-TR')} - {new Date(campaign.end_date).toLocaleDateString('tr-TR')}
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                      <IconButton size="small" onClick={() => handleOpenDialog(campaign)}>
                        <Edit />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => {
                          if (confirm('Bu kampanyayı silmek istediğinize emin misiniz?')) {
                            deleteMutation.mutate(campaign.id);
                          }
                        }}
                      >
                        <Delete />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedCampaign ? 'Kampanya Düzenle' : 'Yeni Kampanya'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Kampanya Adı"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Açıklama"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              multiline
              rows={3}
              fullWidth
            />
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
            <TextField
              label="Başlangıç Tarihi"
              type="date"
              value={formData.start_date}
              onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            <TextField
              label="Bitiş Tarihi"
              type="date"
              value={formData.end_date}
              onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>İptal</Button>
          <Button onClick={handleSubmit} variant="contained">
            {selectedCampaign ? 'Güncelle' : 'Oluştur'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
