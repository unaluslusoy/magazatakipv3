import { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Grid,
  Paper,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from '@mui/material';
import { HexColorPicker } from 'react-colorful';

interface TickerSettings {
  speed: 'slow' | 'normal' | 'fast';
  font_size: number;
  background_color: string;
  text_color: string;
}

interface TickerEditorProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  initialData?: {
    name?: string;
    text?: string;
    settings?: TickerSettings;
  };
}

const PRESET_THEMES = [
  { name: 'Koyu (Dark)', bg: '#1E293B', text: '#FFFFFF' },
  { name: 'Açık (Light)', bg: '#F8FAFC', text: '#1E293B' },
  { name: 'Kırmızı (Acil)', bg: '#EF4444', text: '#FFFFFF' },
  { name: 'Yeşil (Başarı)', bg: '#10B981', text: '#FFFFFF' },
  { name: 'Mavi (Bilgi)', bg: '#3B82F6', text: '#FFFFFF' },
];

export default function TickerEditor({ open, onClose, onSave, initialData }: TickerEditorProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [text, setText] = useState(initialData?.text || '');
  const [settings, setSettings] = useState<TickerSettings>(
    initialData?.settings || {
      speed: 'normal',
      font_size: 28,
      background_color: '#1E293B',
      text_color: '#FFFFFF',
    }
  );

  const [showBgColorPicker, setShowBgColorPicker] = useState(false);
  const [showTextColorPicker, setShowTextColorPicker] = useState(false);

  const handleApplyTheme = (theme: typeof PRESET_THEMES[0]) => {
    setSettings({
      ...settings,
      background_color: theme.bg,
      text_color: theme.text,
    });
  };

  const handleSave = () => {
    onSave({
      name,
      text,
      settings,
    });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Ticker Düzenle</DialogTitle>
      <DialogContent>
        <Grid container spacing={3} sx={{ mt: 0.5 }}>
          {/* Ticker Adı */}
          <Grid item xs={12}>
            <TextField
              label="Ticker Adı"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
              required
            />
          </Grid>

          {/* Canlı Önizleme */}
          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>
              CANLI ÖNİZLEME
            </Typography>
            <Paper
              sx={{
                height: 80,
                bgcolor: settings.background_color,
                color: settings.text_color,
                display: 'flex',
                alignItems: 'center',
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  whiteSpace: 'nowrap',
                  fontSize: `${settings.font_size}px`,
                  fontWeight: 500,
                  animation: `ticker-scroll ${
                    settings.speed === 'slow' ? '30s' : settings.speed === 'fast' ? '10s' : '20s'
                  } linear infinite`,
                  '@keyframes ticker-scroll': {
                    '0%': {
                      transform: 'translateX(100%)',
                    },
                    '100%': {
                      transform: 'translateX(-100%)',
                    },
                  },
                }}
              >
                {text || 'Örnek ticker metni buraya gelecek...'}
              </Box>
            </Paper>
          </Grid>

          {/* Ticker Metni */}
          <Grid item xs={12}>
            <TextField
              label="Ticker Metni"
              value={text}
              onChange={(e) => setText(e.target.value)}
              fullWidth
              required
              multiline
              rows={3}
              helperText="💡 İpucu: Emoji kullanabilirsiniz. Bölümleri | ile ayırın."
              placeholder="🎄 YILBAŞI ÖZEL: Tüm ürünlerde %30 indirim! | 🚚 500 TL üzeri alışverişlerde ücretsiz kargo | ⭐ VIP üyelere ekstra %10 indirim"
            />
          </Grid>

          {/* Görsel Ayarlar */}
          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>
              GÖRSEL AYARLAR
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Box>
                  <Typography variant="caption" gutterBottom>
                    Hız
                  </Typography>
                  <RadioGroup
                    value={settings.speed}
                    onChange={(e) => setSettings({ ...settings, speed: e.target.value as any })}
                  >
                    <FormControlLabel value="slow" control={<Radio />} label="Yavaş" />
                    <FormControlLabel value="normal" control={<Radio />} label="Normal" />
                    <FormControlLabel value="fast" control={<Radio />} label="Hızlı" />
                  </RadioGroup>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="caption" gutterBottom>
                  Font Boyutu
                </Typography>
                <TextField
                  type="number"
                  value={settings.font_size}
                  onChange={(e) =>
                    setSettings({ ...settings, font_size: Math.max(12, Math.min(72, Number(e.target.value))) })
                  }
                  fullWidth
                  inputProps={{ min: 12, max: 72 }}
                  helperText="12-72 px"
                />
              </Grid>
            </Grid>
          </Grid>

          {/* Renk Ayarları */}
          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>
              RENK AYARLARI
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="caption" gutterBottom>
                  Arkaplan Rengi
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      bgcolor: settings.background_color,
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                      cursor: 'pointer',
                    }}
                    onClick={() => setShowBgColorPicker(!showBgColorPicker)}
                  />
                  <TextField
                    value={settings.background_color}
                    onChange={(e) => setSettings({ ...settings, background_color: e.target.value })}
                    size="small"
                    fullWidth
                  />
                </Box>
                {showBgColorPicker && (
                  <Box sx={{ mt: 2 }}>
                    <HexColorPicker
                      color={settings.background_color}
                      onChange={(color) => setSettings({ ...settings, background_color: color })}
                    />
                  </Box>
                )}
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="caption" gutterBottom>
                  Yazı Rengi
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      bgcolor: settings.text_color,
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                      cursor: 'pointer',
                    }}
                    onClick={() => setShowTextColorPicker(!showTextColorPicker)}
                  />
                  <TextField
                    value={settings.text_color}
                    onChange={(e) => setSettings({ ...settings, text_color: e.target.value })}
                    size="small"
                    fullWidth
                  />
                </Box>
                {showTextColorPicker && (
                  <Box sx={{ mt: 2 }}>
                    <HexColorPicker
                      color={settings.text_color}
                      onChange={(color) => setSettings({ ...settings, text_color: color })}
                    />
                  </Box>
                )}
              </Grid>
            </Grid>
          </Grid>

          {/* Hazır Şablonlar */}
          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>
              HAZIR ŞABLONLAR
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {PRESET_THEMES.map((theme, idx) => (
                <Button
                  key={idx}
                  variant="outlined"
                  onClick={() => handleApplyTheme(theme)}
                  sx={{
                    bgcolor: theme.bg,
                    color: theme.text,
                    '&:hover': {
                      bgcolor: theme.bg,
                      opacity: 0.8,
                    },
                  }}
                >
                  {theme.name}
                </Button>
              ))}
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>İptal</Button>
        <Button onClick={handleSave} variant="contained" disabled={!name || !text}>
          Kaydet
        </Button>
      </DialogActions>
    </Dialog>
  );
}
