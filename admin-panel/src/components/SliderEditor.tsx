import React, { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Switch,
  TextField,
  Typography,
  Slider as MuiSlider,
  Stack,
  Divider,
} from '@mui/material';
import {
  Add,
  Delete,
  Edit,
  DragIndicator,
  Image as ImageIcon,
  CloudUpload,
} from '@mui/icons-material';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Slide {
  id: string;
  image_id: number | null;
  image_url?: string;
  title: string;
  subtitle: string;
  duration_seconds: number;
  position: number;
}

interface SliderSettings {
  transition_type: 'fade' | 'slide' | 'zoom' | 'flip';
  show_indicators: boolean;
  auto_play: boolean;
  loop: boolean;
}

interface SliderEditorProps {
  slides?: Slide[];
  settings?: SliderSettings;
  onChange: (slides: Slide[], settings: SliderSettings) => void;
}

function SortableSlide({ slide, onEdit, onDelete }: { slide: Slide; onEdit: () => void; onDelete: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: slide.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Paper
      ref={setNodeRef}
      style={style}
      sx={{
        p: 2,
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        mb: 1,
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Box {...attributes} {...listeners} sx={{ cursor: 'grab', display: 'flex' }}>
        <DragIndicator />
      </Box>
      
      <Box
        sx={{
          width: 80,
          height: 60,
          bgcolor: 'grey.800',
          borderRadius: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {slide.image_url ? (
          <img src={slide.image_url} alt={slide.title} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 4 }} />
        ) : (
          <ImageIcon sx={{ color: 'grey.600' }} />
        )}
      </Box>

      <Box sx={{ flex: 1 }}>
        <Typography variant="subtitle2">{slide.title || 'Başlıksız'}</Typography>
        <Typography variant="caption" color="text.secondary">
          {slide.duration_seconds} saniye
        </Typography>
      </Box>

      <IconButton size="small" onClick={onEdit}>
        <Edit fontSize="small" />
      </IconButton>
      <IconButton size="small" onClick={onDelete} color="error">
        <Delete fontSize="small" />
      </IconButton>
    </Paper>
  );
}

export default function SliderEditor({ open, onClose, onSave, initialData }: SliderEditorProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [slides, setSlides] = useState<Slide[]>(initialData?.slides || []);
  const [settings, setSettings] = useState<SliderSettings>(
    initialData?.settings || {
      transition_type: 'fade',
      show_indicators: true,
      auto_play: true,
      loop: true,
    }
  );

  const [slideDialogOpen, setSlideDialogOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<Slide | null>(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setSlides((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        const newItems = arrayMove(items, oldIndex, newIndex);
        
        // Update positions
        return newItems.map((item, index) => ({
          ...item,
          position: index + 1,
        }));
      });
    }
  };

  const handleAddSlide = () => {
    setEditingSlide({
      id: `slide-${Date.now()}`,
      image_id: null,
      title: '',
      subtitle: '',
      duration_seconds: 5,
      position: slides.length + 1,
    });
    setSlideDialogOpen(true);
  };

  const handleEditSlide = (slide: Slide) => {
    setEditingSlide(slide);
    setSlideDialogOpen(true);
  };

  const handleSaveSlide = (slide: Slide) => {
    if (slides.find((s) => s.id === slide.id)) {
      setSlides(slides.map((s) => (s.id === slide.id ? slide : s)));
    } else {
      setSlides([...slides, slide]);
    }
    setSlideDialogOpen(false);
    setEditingSlide(null);
  };

  const handleDeleteSlide = (slideId: string) => {
    setSlides(slides.filter((s) => s.id !== slideId));
  };

  const handleSave = () => {
    onSave({
      name,
      description,
      slides,
      settings,
    });
    onClose();
  };

  const handlePrevSlide = () => {
    setCurrentSlideIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const handleNextSlide = () => {
    setCurrentSlideIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
        <DialogTitle>Slider Düzenle</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 0.5 }}>
            {/* Sol: Önizleme */}
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" gutterBottom>
                ÖNİZLEME ALANI
              </Typography>
              <Paper
                sx={{
                  height: 400,
                  bgcolor: 'grey.900',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {slides.length > 0 ? (
                  <>
                    <Box
                      sx={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: 'grey.800',
                      }}
                    >
                      {slides[currentSlideIndex]?.image_url ? (
                        <img
                          src={slides[currentSlideIndex].image_url}
                          alt={slides[currentSlideIndex].title}
                          style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                        />
                      ) : (
                        <ImageIcon sx={{ fontSize: 80, color: 'grey.600' }} />
                      )}
                    </Box>
                    
                    {/* Navigation */}
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: 16,
                        left: 0,
                        right: 0,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: 2,
                      }}
                    >
                      <Button size="small" onClick={handlePrevSlide} sx={{ color: 'white' }}>
                        ◀
                      </Button>
                      <Typography variant="body2" sx={{ color: 'white' }}>
                        {currentSlideIndex + 1} / {slides.length}
                      </Typography>
                      <Button size="small" onClick={handleNextSlide} sx={{ color: 'white' }}>
                        ▶
                      </Button>
                    </Box>

                    {/* Indicators */}
                    {settings.show_indicators && (
                      <Box
                        sx={{
                          position: 'absolute',
                          bottom: 50,
                          left: 0,
                          right: 0,
                          display: 'flex',
                          justifyContent: 'center',
                          gap: 1,
                        }}
                      >
                        {slides.map((_, idx) => (
                          <Box
                            key={idx}
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius: '50%',
                              bgcolor: idx === currentSlideIndex ? 'white' : 'grey.600',
                              cursor: 'pointer',
                            }}
                            onClick={() => setCurrentSlideIndex(idx)}
                          />
                        ))}
                      </Box>
                    )}
                  </>
                ) : (
                  <Typography color="text.secondary">Slide ekleyin</Typography>
                )}
              </Paper>
            </Grid>

            {/* Sağ: Ayarlar */}
            <Grid item xs={12} md={6}>
              <Stack spacing={2}>
                <TextField
                  label="Slider Adı"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  fullWidth
                  required
                />

                <TextField
                  label="Açıklama"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  fullWidth
                  multiline
                  rows={2}
                />

                <Divider />

                <FormControl fullWidth>
                  <InputLabel>Geçiş Efekti</InputLabel>
                  <Select
                    value={settings.transition_type}
                    onChange={(e) => setSettings({ ...settings, transition_type: e.target.value as any })}
                    label="Geçiş Efekti"
                  >
                    <MenuItem value="fade">Fade</MenuItem>
                    <MenuItem value="slide">Slide</MenuItem>
                    <MenuItem value="zoom">Zoom</MenuItem>
                    <MenuItem value="flip">Flip</MenuItem>
                  </Select>
                </FormControl>

                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.show_indicators}
                      onChange={(e) => setSettings({ ...settings, show_indicators: e.target.checked })}
                    />
                  }
                  label="Göstergeleri göster"
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.auto_play}
                      onChange={(e) => setSettings({ ...settings, auto_play: e.target.checked })}
                    />
                  }
                  label="Otomatik oynat"
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.loop}
                      onChange={(e) => setSettings({ ...settings, loop: e.target.checked })}
                    />
                  }
                  label="Döngü"
                />
              </Stack>
            </Grid>

            {/* Slide Yönetimi */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1">SLİDE YÖNETİMİ</Typography>
                <Button startIcon={<Add />} onClick={handleAddSlide} variant="contained">
                  Slide Ekle
                </Button>
              </Box>

              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={slides.map((s) => s.id)} strategy={verticalListSortingStrategy}>
                  {slides.map((slide) => (
                    <SortableSlide
                      key={slide.id}
                      slide={slide}
                      onEdit={() => handleEditSlide(slide)}
                      onDelete={() => handleDeleteSlide(slide.id)}
                    />
                  ))}
                </SortableContext>
              </DndContext>

              {slides.length === 0 && (
                <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'grey.900' }}>
                  <Typography color="text.secondary">
                    Henüz slide eklenmemiş. Başlamak için yukarıdaki butona tıklayın.
                  </Typography>
                </Paper>
              )}
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
                      Toplam Slide
                    </Typography>
                    <Typography variant="h6">{slides.length}</Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="caption" color="text.secondary">
                      Toplam Süre
                    </Typography>
                    <Typography variant="h6">
                      {slides.reduce((sum, s) => sum + s.duration_seconds, 0)} sn
                    </Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="caption" color="text.secondary">
                      Döngü
                    </Typography>
                    <Typography variant="h6">{settings.loop ? 'Sürekli' : 'Bir kez'}</Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>İptal</Button>
          <Button onClick={handleSave} variant="contained" disabled={!name || slides.length === 0}>
            Kaydet
          </Button>
        </DialogActions>
      </Dialog>

      {/* Slide Edit Dialog */}
      <SlideEditDialog
        open={slideDialogOpen}
        onClose={() => {
          setSlideDialogOpen(false);
          setEditingSlide(null);
        }}
        onSave={handleSaveSlide}
        slide={editingSlide}
      />
    </>
  );
}

// Slide Edit Dialog Component
interface SlideEditDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (slide: Slide) => void;
  slide: Slide | null;
}

function SlideEditDialog({ open, onClose, onSave, slide }: SlideEditDialogProps) {
  const [formData, setFormData] = useState<Slide>(
    slide || {
      id: '',
      image_id: null,
      title: '',
      subtitle: '',
      duration_seconds: 5,
      position: 1,
    }
  );

  React.useEffect(() => {
    if (slide) {
      setFormData(slide);
    }
  }, [slide]);

  const handleSave = () => {
    onSave(formData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Slide Düzenle</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid item xs={12}>
            <Button variant="outlined" fullWidth startIcon={<CloudUpload />}>
              Görsel Yükle
            </Button>
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Slide Başlığı"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              fullWidth
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Alt Metin"
              value={formData.subtitle}
              onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
              fullWidth
            />
          </Grid>

          <Grid item xs={12}>
            <Typography gutterBottom>Gösterim Süresi (saniye)</Typography>
            <MuiSlider
              value={formData.duration_seconds}
              onChange={(_, value) => setFormData({ ...formData, duration_seconds: value as number })}
              min={1}
              max={30}
              marks
              valueLabelDisplay="on"
            />
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
