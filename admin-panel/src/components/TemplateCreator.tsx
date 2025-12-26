import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  MenuItem,
  Grid,
  Paper,
  Typography,
  IconButton,
  Slider,
  Divider,
  Tabs,
  Tab,
  Card,
  CardContent,
  Chip,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Add,
  Delete,
  ContentCopy,
  FormatBold,
  FormatItalic,
  FormatUnderlined,
  Image,
  VideoLibrary,
  TextFields,
  Rectangle,
  Circle,
  Timer,
  CloudOutlined,
  PlayArrow,
  ZoomIn,
  ZoomOut,
  Undo,
  Redo,
} from '@mui/icons-material';
import type { Template } from '@/services/templateService';

interface TemplateCreatorProps {
  open: boolean;
  onClose: () => void;
  template?: Template | null;
  onSave: (template: Partial<Template>) => void;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ p: 2 }}>{children}</Box>}
    </div>
  );
}

export default function TemplateCreator({ open, onClose, template, onSave }: TemplateCreatorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedLayer, setSelectedLayer] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    template_type: 'slider' as Template['template_type'],
    category: 'promotional' as Template['category'],
    duration: 10,
    is_active: true,
    config: {
      width: 1920,
      height: 1080,
      backgroundColor: '#000000',
    },
    layers: [] as Template['layers'],
    animations: [] as Template['animations'],
  });

  useEffect(() => {
    if (template) {
      setFormData({
        name: template.name,
        template_type: template.template_type,
        category: template.category || 'promotional',
        duration: template.duration,
        is_active: template.is_active,
        config: template.config,
        layers: template.layers,
        animations: template.animations,
      });
    }
  }, [template]);

  // Canvas çizim
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = formData.config.width;
    canvas.height = formData.config.height;

    // Arka plan
    ctx.fillStyle = formData.config.backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Layer'ları çiz
    formData.layers.forEach((layer) => {
      if (layer.type === 'rectangle') {
        ctx.fillStyle = layer.fill || '#FFFFFF';
        ctx.fillRect(layer.x, layer.y, layer.width, layer.height);
      } else if (layer.type === 'text') {
        ctx.font = `${layer.fontWeight || 'normal'} ${layer.fontSize}px ${layer.fontFamily || 'Arial'}`;
        ctx.fillStyle = layer.color || '#FFFFFF';
        ctx.textAlign = layer.textAlign || 'left';
        ctx.fillText(layer.content, layer.x, layer.y);
      } else if (layer.type === 'image' && layer.src) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          ctx.drawImage(img, layer.x, layer.y, layer.width, layer.height);
        };
        img.src = layer.src;
      }

      // Seçili layer border
      if (selectedLayer === layer.id) {
        ctx.strokeStyle = '#00FF00';
        ctx.lineWidth = 2;
        ctx.strokeRect(layer.x - 2, layer.y - 2, layer.width + 4, layer.height + 4);
      }
    });
  }, [formData, selectedLayer]);

  const addLayer = (type: Template['layers'][0]['type']) => {
    const newLayer: any = {
      id: `layer${Date.now()}`,
      type,
      x: 100,
      y: 100,
      zIndex: formData.layers.length,
    };

    if (type === 'text') {
      newLayer.content = 'Yeni Metin';
      newLayer.fontSize = 48;
      newLayer.fontFamily = 'Arial';
      newLayer.color = '#FFFFFF';
      newLayer.fontWeight = 'normal';
    } else if (type === 'rectangle') {
      newLayer.width = 300;
      newLayer.height = 200;
      newLayer.fill = '#667eea';
    } else if (type === 'image') {
      newLayer.src = 'https://via.placeholder.com/400x300';
      newLayer.width = 400;
      newLayer.height = 300;
    } else if (type === 'countdown') {
      newLayer.targetDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      newLayer.fontSize = 72;
      newLayer.color = '#FFD700';
      newLayer.format = 'DD:HH:MM:SS';
    }

    setFormData({
      ...formData,
      layers: [...formData.layers, newLayer],
    });
    setSelectedLayer(newLayer.id);
  };

  const updateLayer = (layerId: string, updates: any) => {
    setFormData({
      ...formData,
      layers: formData.layers.map((l) =>
        l.id === layerId ? { ...l, ...updates } : l
      ),
    });
  };

  const deleteLayer = (layerId: string) => {
    setFormData({
      ...formData,
      layers: formData.layers.filter((l) => l.id !== layerId),
      animations: formData.animations.filter((a) => a.layerId !== layerId),
    });
    setSelectedLayer(null);
  };

  const addAnimation = () => {
    if (!selectedLayer) return;

    const newAnimation = {
      layerId: selectedLayer,
      type: 'fadeIn',
      delay: 0,
      duration: 1000,
      easing: 'ease-in-out',
    };

    setFormData({
      ...formData,
      animations: [...formData.animations, newAnimation],
    });
  };

  const handleSave = () => {
    onSave(formData);
  };

  const selectedLayerData = formData.layers.find((l) => l.id === selectedLayer);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xl" fullWidth>
      <DialogTitle>
        {template ? 'Template Düzenle' : 'Yeni Template Oluştur'}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={3}>
          {/* Sol Panel - Canvas */}
          <Grid item xs={12} md={8}>
            <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <IconButton size="small" title="Geri Al">
                <Undo />
              </IconButton>
              <IconButton size="small" title="İleri Al">
                <Redo />
              </IconButton>
              <Divider orientation="vertical" flexItem />
              <IconButton size="small" title="Yakınlaştır">
                <ZoomIn />
              </IconButton>
              <IconButton size="small" title="Uzaklaştır">
                <ZoomOut />
              </IconButton>
              <Divider orientation="vertical" flexItem />
              <Button
                size="small"
                startIcon={<PlayArrow />}
                variant="outlined"
              >
                Önizle
              </Button>
            </Box>

            <Paper
              sx={{
                p: 2,
                bgcolor: '#1a1a1a',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: 400,
                overflow: 'auto',
              }}
            >
              <canvas
                ref={canvasRef}
                style={{
                  maxWidth: '100%',
                  height: 'auto',
                  border: '1px solid #333',
                }}
              />
            </Paper>

            {/* Layers List */}
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Katmanlar ({formData.layers.length})
              </Typography>
              {formData.layers.map((layer) => (
                <Card
                  key={layer.id}
                  sx={{
                    mb: 1,
                    cursor: 'pointer',
                    bgcolor: selectedLayer === layer.id ? 'action.selected' : 'background.paper',
                  }}
                  onClick={() => setSelectedLayer(layer.id)}
                >
                  <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {layer.type === 'text' && <TextFields fontSize="small" />}
                        {layer.type === 'image' && <Image fontSize="small" />}
                        {layer.type === 'rectangle' && <Rectangle fontSize="small" />}
                        {layer.type === 'countdown' && <Timer fontSize="small" />}
                        <Typography variant="body2">
                          {layer.type === 'text' && layer.content}
                          {layer.type !== 'text' && `${layer.type} Layer`}
                        </Typography>
                      </Box>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteLayer(layer.id);
                        }}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Grid>

          {/* Sağ Panel - Properties */}
          <Grid item xs={12} md={4}>
            <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)}>
              <Tab label="Genel" />
              <Tab label="Katman" disabled={!selectedLayer} />
              <Tab label="Animasyon" disabled={!selectedLayer} />
            </Tabs>

            <TabPanel value={activeTab} index={0}>
              <TextField
                fullWidth
                label="Template Adı"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                select
                label="Tip"
                value={formData.template_type}
                onChange={(e) =>
                  setFormData({ ...formData, template_type: e.target.value as any })
                }
                sx={{ mb: 2 }}
              >
                <MenuItem value="slider">Slider</MenuItem>
                <MenuItem value="banner">Banner</MenuItem>
                <MenuItem value="countdown">Countdown</MenuItem>
                <MenuItem value="weather">Hava Durumu</MenuItem>
                <MenuItem value="news">Haberler</MenuItem>
                <MenuItem value="custom">Özel</MenuItem>
              </TextField>

              <TextField
                fullWidth
                select
                label="Kategori"
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value as any })
                }
                sx={{ mb: 2 }}
              >
                <MenuItem value="promotional">Tanıtım</MenuItem>
                <MenuItem value="informational">Bilgilendirme</MenuItem>
                <MenuItem value="interactive">Etkileşimli</MenuItem>
                <MenuItem value="dynamic">Dinamik</MenuItem>
              </TextField>

              <TextField
                fullWidth
                type="number"
                label="Süre (saniye)"
                value={formData.duration}
                onChange={(e) =>
                  setFormData({ ...formData, duration: parseInt(e.target.value) })
                }
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                label="Arka Plan Rengi"
                type="color"
                value={formData.config.backgroundColor}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    config: { ...formData.config, backgroundColor: e.target.value },
                  })
                }
                sx={{ mb: 2 }}
              />

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle2" gutterBottom>
                Katman Ekle
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip
                  icon={<TextFields />}
                  label="Metin"
                  onClick={() => addLayer('text')}
                  clickable
                />
                <Chip
                  icon={<Image />}
                  label="Resim"
                  onClick={() => addLayer('image')}
                  clickable
                />
                <Chip
                  icon={<Rectangle />}
                  label="Dikdörtgen"
                  onClick={() => addLayer('rectangle')}
                  clickable
                />
                <Chip
                  icon={<Timer />}
                  label="Countdown"
                  onClick={() => addLayer('countdown')}
                  clickable
                />
              </Box>
            </TabPanel>

            <TabPanel value={activeTab} index={1}>
              {selectedLayerData && (
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Katman Özellikleri
                  </Typography>

                  <TextField
                    fullWidth
                    type="number"
                    label="X Pozisyonu"
                    value={selectedLayerData.x}
                    onChange={(e) =>
                      updateLayer(selectedLayer!, { x: parseInt(e.target.value) })
                    }
                    sx={{ mb: 2 }}
                  />

                  <TextField
                    fullWidth
                    type="number"
                    label="Y Pozisyonu"
                    value={selectedLayerData.y}
                    onChange={(e) =>
                      updateLayer(selectedLayer!, { y: parseInt(e.target.value) })
                    }
                    sx={{ mb: 2 }}
                  />

                  {selectedLayerData.type === 'text' && (
                    <>
                      <TextField
                        fullWidth
                        label="Metin"
                        value={selectedLayerData.content}
                        onChange={(e) =>
                          updateLayer(selectedLayer!, { content: e.target.value })
                        }
                        sx={{ mb: 2 }}
                      />

                      <TextField
                        fullWidth
                        type="number"
                        label="Font Boyutu"
                        value={selectedLayerData.fontSize}
                        onChange={(e) =>
                          updateLayer(selectedLayer!, { fontSize: parseInt(e.target.value) })
                        }
                        sx={{ mb: 2 }}
                      />

                      <TextField
                        fullWidth
                        label="Renk"
                        type="color"
                        value={selectedLayerData.color}
                        onChange={(e) =>
                          updateLayer(selectedLayer!, { color: e.target.value })
                        }
                        sx={{ mb: 2 }}
                      />

                      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                        <IconButton
                          size="small"
                          onClick={() =>
                            updateLayer(selectedLayer!, {
                              fontWeight: selectedLayerData.fontWeight === 'bold' ? 'normal' : 'bold',
                            })
                          }
                        >
                          <FormatBold />
                        </IconButton>
                        <IconButton size="small">
                          <FormatItalic />
                        </IconButton>
                        <IconButton size="small">
                          <FormatUnderlined />
                        </IconButton>
                      </Box>
                    </>
                  )}

                  {selectedLayerData.type === 'image' && (
                    <>
                      <TextField
                        fullWidth
                        label="Resim URL"
                        value={selectedLayerData.src}
                        onChange={(e) =>
                          updateLayer(selectedLayer!, { src: e.target.value })
                        }
                        sx={{ mb: 2 }}
                      />

                      <TextField
                        fullWidth
                        type="number"
                        label="Genişlik"
                        value={selectedLayerData.width}
                        onChange={(e) =>
                          updateLayer(selectedLayer!, { width: parseInt(e.target.value) })
                        }
                        sx={{ mb: 2 }}
                      />

                      <TextField
                        fullWidth
                        type="number"
                        label="Yükseklik"
                        value={selectedLayerData.height}
                        onChange={(e) =>
                          updateLayer(selectedLayer!, { height: parseInt(e.target.value) })
                        }
                        sx={{ mb: 2 }}
                      />
                    </>
                  )}

                  {selectedLayerData.type === 'rectangle' && (
                    <>
                      <TextField
                        fullWidth
                        type="number"
                        label="Genişlik"
                        value={selectedLayerData.width}
                        onChange={(e) =>
                          updateLayer(selectedLayer!, { width: parseInt(e.target.value) })
                        }
                        sx={{ mb: 2 }}
                      />

                      <TextField
                        fullWidth
                        type="number"
                        label="Yükseklik"
                        value={selectedLayerData.height}
                        onChange={(e) =>
                          updateLayer(selectedLayer!, { height: parseInt(e.target.value) })
                        }
                        sx={{ mb: 2 }}
                      />

                      <TextField
                        fullWidth
                        label="Dolgu Rengi"
                        type="color"
                        value={selectedLayerData.fill}
                        onChange={(e) =>
                          updateLayer(selectedLayer!, { fill: e.target.value })
                        }
                        sx={{ mb: 2 }}
                      />
                    </>
                  )}
                </Box>
              )}
            </TabPanel>

            <TabPanel value={activeTab} index={2}>
              {selectedLayer && (
                <Box>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<Add />}
                    onClick={addAnimation}
                    sx={{ mb: 2 }}
                  >
                    Animasyon Ekle
                  </Button>

                  {formData.animations
                    .filter((a) => a.layerId === selectedLayer)
                    .map((anim, idx) => (
                      <Card key={idx} sx={{ mb: 2 }}>
                        <CardContent>
                          <FormControl fullWidth sx={{ mb: 2 }}>
                            <InputLabel>Animasyon Tipi</InputLabel>
                            <Select
                              value={anim.type}
                              label="Animasyon Tipi"
                              onChange={(e) => {
                                const newAnims = [...formData.animations];
                                newAnims[idx].type = e.target.value;
                                setFormData({ ...formData, animations: newAnims });
                              }}
                            >
                              <MenuItem value="fadeIn">Fade In</MenuItem>
                              <MenuItem value="fadeOut">Fade Out</MenuItem>
                              <MenuItem value="slideInLeft">Slide In Left</MenuItem>
                              <MenuItem value="slideInRight">Slide In Right</MenuItem>
                              <MenuItem value="slideInUp">Slide In Up</MenuItem>
                              <MenuItem value="slideInDown">Slide In Down</MenuItem>
                              <MenuItem value="zoomIn">Zoom In</MenuItem>
                              <MenuItem value="zoomOut">Zoom Out</MenuItem>
                              <MenuItem value="bounce">Bounce</MenuItem>
                              <MenuItem value="pulse">Pulse</MenuItem>
                            </Select>
                          </FormControl>

                          <TextField
                            fullWidth
                            type="number"
                            label="Gecikme (ms)"
                            value={anim.delay}
                            onChange={(e) => {
                              const newAnims = [...formData.animations];
                              newAnims[idx].delay = parseInt(e.target.value);
                              setFormData({ ...formData, animations: newAnims });
                            }}
                            sx={{ mb: 2 }}
                          />

                          <TextField
                            fullWidth
                            type="number"
                            label="Süre (ms)"
                            value={anim.duration}
                            onChange={(e) => {
                              const newAnims = [...formData.animations];
                              newAnims[idx].duration = parseInt(e.target.value);
                              setFormData({ ...formData, animations: newAnims });
                            }}
                            sx={{ mb: 2 }}
                          />
                        </CardContent>
                      </Card>
                    ))}
                </Box>
              )}
            </TabPanel>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>İptal</Button>
        <Button onClick={handleSave} variant="contained">
          Kaydet
        </Button>
      </DialogActions>
    </Dialog>
  );
}
