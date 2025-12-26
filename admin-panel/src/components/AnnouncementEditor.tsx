import { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Paper,
  TextField,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import { Info, Warning, Error as ErrorIcon } from '@mui/icons-material';

interface AnnouncementEditorProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  initialData?: {
    name?: string;
    title?: string;
    message?: string;
    type?: 'info' | 'warning' | 'urgent';
    settings?: {
      duration_seconds?: number;
      icon?: string;
    };
  };
}

const ANNOUNCEMENT_TYPES = [
  {
    value: 'info',
    label: 'Bilgi',
    icon: <Info />,
    color: '#3B82F6',
    bgColor: 'rgba(59, 130, 246, 0.1)',
  },
  {
    value: 'warning',
    label: 'Uyarı',
    icon: <Warning />,
    color: '#F59E0B',
    bgColor: 'rgba(245, 158, 11, 0.1)',
  },
  {
    value: 'urgent',
    label: 'Acil',
    icon: <ErrorIcon />,
    color: '#EF4444',
    bgColor: 'rgba(239, 68, 68, 0.1)',
  },
];

export default function AnnouncementEditor({ open, onClose, onSave, initialData }: AnnouncementEditorProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [title, setTitle] = useState(initialData?.title || '');
  const [message, setMessage] = useState(initialData?.message || '');
  const [type, setType] = useState<'info' | 'warning' | 'urgent'>(initialData?.type || 'info');
  const [durationSeconds, setDurationSeconds] = useState(initialData?.settings?.duration_seconds || 10);

  const currentType = ANNOUNCEMENT_TYPES.find((t) => t.value === type)!;

  const handleSave = () => {
    onSave({
      name,
      title,
      message,
      type,
      settings: {
        duration_seconds: durationSeconds,
        icon: type,
      },
    });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Duyuru Düzenle</DialogTitle>
      <DialogContent>
        <Grid container spacing={3} sx={{ mt: 0.5 }}>
          {/* Canlı Önizleme */}
          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>
              CANLI ÖNİZLEME
            </Typography>
            <Paper
              sx={{
                p: 4,
                textAlign: 'center',
                bgcolor: currentType.bgColor,
                border: '2px solid',
                borderColor: currentType.color,
                minHeight: 200,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
              }}
            >
              <Box sx={{ color: currentType.color, fontSize: 48 }}>{currentType.icon}</Box>

              <Typography variant="h5" sx={{ fontWeight: 600, color: currentType.color }}>
                {title || 'Duyuru Başlığı'}
              </Typography>

              <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 500 }}>
                {message || 'Duyuru mesajı buraya gelecek...'}
              </Typography>
            </Paper>
          </Grid>

          {/* İçerik Adı */}
          <Grid item xs={12}>
            <TextField
              label="İçerik Adı"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
              required
              helperText="Admin panelinde görünecek isim"
            />
          </Grid>

          {/* Duyuru Tipi */}
          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>
              Duyuru Tipi
            </Typography>
            <ToggleButtonGroup
              value={type}
              exclusive
              onChange={(_, value) => value && setType(value)}
              fullWidth
              sx={{ mt: 1 }}
            >
              {ANNOUNCEMENT_TYPES.map((t) => (
                <ToggleButton
                  key={t.value}
                  value={t.value}
                  sx={{
                    py: 2,
                    flexDirection: 'column',
                    gap: 1,
                    '&.Mui-selected': {
                      bgcolor: t.bgColor,
                      color: t.color,
                      borderColor: t.color,
                      '&:hover': {
                        bgcolor: t.bgColor,
                      },
                    },
                  }}
                >
                  {t.icon}
                  <Typography variant="caption">{t.label}</Typography>
                  <Typography variant="caption" sx={{ fontSize: 10, opacity: 0.7 }}>
                    ({t.color.substring(0, 7)})
                  </Typography>
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Grid>

          {/* Başlık */}
          <Grid item xs={12}>
            <TextField
              label="Duyuru Başlığı"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              fullWidth
              required
              placeholder="Mağazamıza Hoş Geldiniz!"
            />
          </Grid>

          {/* Mesaj İçeriği */}
          <Grid item xs={12}>
            <TextField
              label="Mesaj İçeriği"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              fullWidth
              required
              multiline
              rows={4}
              placeholder="Bugün size özel fırsatlar sizi bekliyor. Yeni koleksiyonumuzu incelemeyi unutmayın."
            />
          </Grid>

          {/* Gösterim Süresi */}
          <Grid item xs={12} md={6}>
            <TextField
              label="Gösterim Süresi (saniye)"
              type="number"
              value={durationSeconds}
              onChange={(e) => setDurationSeconds(Math.max(5, Math.min(60, Number(e.target.value))))}
              fullWidth
              inputProps={{ min: 5, max: 60 }}
              helperText="5-60 saniye arası"
            />
          </Grid>

          {/* Özet */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2, bgcolor: 'grey.900' }}>
              <Typography variant="subtitle2" gutterBottom>
                ÖZET
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Typography variant="caption" color="text.secondary">
                    Tip
                  </Typography>
                  <Typography variant="body2" sx={{ color: currentType.color }}>
                    {currentType.label}
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="caption" color="text.secondary">
                    Süre
                  </Typography>
                  <Typography variant="body2">{durationSeconds} saniye</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="caption" color="text.secondary">
                    İkon
                  </Typography>
                  <Box sx={{ color: currentType.color }}>{currentType.icon}</Box>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>İptal</Button>
        <Button onClick={handleSave} variant="contained" disabled={!name || !title || !message}>
          Kaydet
        </Button>
      </DialogActions>
    </Dialog>
  );
}
