import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
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
  Paper,
  Select,
  TextField,
  Typography,
  Tabs,
  Tab,
  ToggleButton,
  ToggleButtonGroup,
  Stack,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
} from '@mui/material';
import {
  Add,
  Delete,
  Edit,
  Image,
  VideoLibrary,
  TextFields,
  Code,
  Language,
  CloudUpload,
  GridView,
  ViewList,
  ViewCarousel,
  Announcement,
  Subject,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import contentService, { Content, CreateContentDto } from '@/services/contentService';
// import templateService, { Template } from '@/services/templateService';
import RichTextEditor from '@/components/RichTextEditor';
// import TemplateCreator from '@/components/TemplateCreator';

const CONTENT_TYPE_ICONS = {
  video: <VideoLibrary />,
  image: <Image />,
  text: <TextFields />,
  html: <Code />,
  web_page: <Language />,
  slider: <ViewCarousel />,
  ticker: <Subject />,
  announcement: <Announcement />,
};

export default function MediaPage() {
  const [selectedType, setSelectedType] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [openDialog, setOpenDialog] = useState(false);
  const [editContent, setEditContent] = useState<Content | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const queryClient = useQueryClient();

  // Form state
  const [formData, setFormData] = useState<Partial<CreateContentDto>>({
    type: 'video',
    title: '',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Fetch contents
  const { data: contents, isLoading } = useQuery({
    queryKey: ['contents', selectedType, statusFilter],
    queryFn: () => {
      const params: any = {};
      if (selectedType !== 'all') params.type = selectedType;
      if (statusFilter === 'active') params.is_active = true;
      if (statusFilter === 'inactive') params.is_active = false;
      return contentService.getAll(params);
    },
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: CreateContentDto) => {
      // Simüle upload progress (gerçek implementasyon axios onUploadProgress ile yapılabilir)
      if (selectedFile) {
        setUploadProgress(10);
        await new Promise(resolve => setTimeout(resolve, 100));
        setUploadProgress(30);
        await new Promise(resolve => setTimeout(resolve, 100));
        setUploadProgress(60);
      }
      const result = await contentService.create(data);
      setUploadProgress(100);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contents'] });
      setTimeout(() => handleCloseDialog(), 500); // Progress göstermek için kısa gecikme
    },
    onError: () => {
      setUploadProgress(0);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => contentService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contents'] });
    },
  });

  const handleOpenDialog = (content?: Content) => {
    if (content) {
      setEditContent(content);
      setFormData({
        type: content.type,
        title: content.title,
        text_content: content.text_content,
        html_content: content.html_content,
        web_url: content.web_url,
      });
    } else {
      setEditContent(null);
      setFormData({ type: 'video', title: '' });
      setSelectedFile(null);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditContent(null);
    setFormData({ type: 'video', title: '' });
    setSelectedFile(null);
    setUploadProgress(0);
  };

  const handleSubmit = () => {
    if (!formData.title) return;

    const submitData: CreateContentDto = {
      type: formData.type!,
      title: formData.title,
      file: selectedFile || undefined,
      text_content: formData.text_content,
      html_content: formData.html_content,
      web_url: formData.web_url,
    };

    createMutation.mutate(submitData);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'N/A';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" fontWeight="bold">
            Medya Yönetimi
          </Typography>
          <Typography variant="body2" color="text.secondary">
            İçeriklerinizi yönetin
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          Yeni İçerik
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
          {/* Tip Filter Tabs */}
          <Box sx={{ flex: 1 }}>
            <Tabs
              value={selectedType}
              onChange={(e, value) => setSelectedType(value)}
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab label="Tümü" value="all" />
              <Tab icon={<VideoLibrary />} label="Video" value="video" iconPosition="start" />
              <Tab icon={<Image />} label="Görsel" value="image" iconPosition="start" />
              <Tab icon={<ViewCarousel />} label="Slider" value="slider" iconPosition="start" />
              <Tab icon={<Subject />} label="Ticker" value="ticker" iconPosition="start" />
              <Tab icon={<Announcement />} label="Duyuru" value="announcement" iconPosition="start" />
              <Tab icon={<TextFields />} label="Metin" value="text" iconPosition="start" />
              <Tab icon={<Code />} label="HTML" value="html" iconPosition="start" />
              <Tab icon={<Language />} label="Web" value="web_page" iconPosition="start" />
            </Tabs>
          </Box>

          {/* Status Filter */}
          <FormControl sx={{ minWidth: 150 }} size="small">
            <InputLabel>Durum</InputLabel>
            <Select
              value={statusFilter}
              label="Durum"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="all">Tümü</MenuItem>
              <MenuItem value="active">Aktif</MenuItem>
              <MenuItem value="inactive">Pasif</MenuItem>
            </Select>
          </FormControl>

          {/* View Mode Toggle */}
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(e, value) => value && setViewMode(value)}
            size="small"
          >
            <ToggleButton value="grid">
              <GridView />
            </ToggleButton>
            <ToggleButton value="list">
              <ViewList />
            </ToggleButton>
          </ToggleButtonGroup>
        </Stack>
      </Paper>

      {isLoading ? (
        <LinearProgress />
      ) : viewMode === 'grid' ? (
        <Grid container spacing={3}>
          {contents?.data?.contents?.map((content: Content) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={content.id}>
              <Card>
                {content.thumbnail_path && (
                  <CardMedia
                    component="img"
                    height="140"
                    image={`http://localhost:3000${content.thumbnail_path}`}
                    alt={content.title}
                  />
                )}
                {!content.thumbnail_path && (
                  <Box
                    sx={{
                      height: 140,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: 'grey.200',
                    }}
                  >
                    {CONTENT_TYPE_ICONS[content.type]}
                  </Box>
                )}
                <CardContent>
                  <Typography variant="h6" noWrap>
                    {content.title}
                  </Typography>
                  <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Chip label={content.type} size="small" color="primary" />
                    <Chip
                      label={content.is_active ? 'Aktif' : 'Pasif'}
                      size="small"
                      color={content.is_active ? 'success' : 'default'}
                    />
                  </Box>
                  {content.duration && (
                    <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                      Süre: {formatDuration(content.duration)}
                    </Typography>
                  )}
                  {content.file_size && (
                    <Typography variant="caption" display="block">
                      Boyut: {formatFileSize(content.file_size)}
                    </Typography>
                  )}
                </CardContent>
                <CardActions>
                  <IconButton size="small" onClick={() => handleOpenDialog(content)}>
                    <Edit />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => {
                      if (confirm('Bu içeriği silmek istediğinize emin misiniz?')) {
                        deleteMutation.mutate(content.id);
                      }
                    }}
                  >
                    <Delete />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Paper>
          <List>
            {contents?.data?.contents?.map((content: Content) => (
              <ListItem
                key={content.id}
                secondaryAction={
                  <Box>
                    <IconButton onClick={() => handleOpenDialog(content)}>
                      <Edit />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => {
                        if (confirm('Bu içeriği silmek istediğinize emin misiniz?')) {
                          deleteMutation.mutate(content.id);
                        }
                      }}
                    >
                      <Delete />
                    </IconButton>
                  </Box>
                }
              >
                <ListItemAvatar>
                  <Avatar
                    variant="rounded"
                    src={content.thumbnail_path ? `http://localhost:3000${content.thumbnail_path}` : undefined}
                    sx={{ width: 60, height: 60 }}
                  >
                    {!content.thumbnail_path && CONTENT_TYPE_ICONS[content.type]}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={content.title}
                  secondary={
                    <Box sx={{ display: 'flex', gap: 1, mt: 0.5, alignItems: 'center' }}>
                      <Chip label={content.type} size="small" />
                      <Chip
                        label={content.is_active ? 'Aktif' : 'Pasif'}
                        size="small"
                        color={content.is_active ? 'success' : 'default'}
                      />
                      {content.duration && <Typography variant="caption">Süre: {formatDuration(content.duration)}</Typography>}
                      {content.file_size && <Typography variant="caption">Boyut: {formatFileSize(content.file_size)}</Typography>}
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth={formData.type === 'slider' || formData.type === 'ticker' || formData.type === 'announcement' ? 'md' : 'sm'} fullWidth>
        <DialogTitle>
          {editContent ? 'İçeriği Düzenle' : 'Yeni İçerik Oluştur'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <FormControl fullWidth>
              <InputLabel>İçerik Tipi</InputLabel>
              <Select
                value={formData.type}
                label="İçerik Tipi"
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                disabled={!!editContent}
              >
                <MenuItem value="video">Video</MenuItem>
                <MenuItem value="image">Resim</MenuItem>
                <MenuItem value="slider">Slider</MenuItem>
                <MenuItem value="ticker">Ticker</MenuItem>
                <MenuItem value="announcement">Duyuru</MenuItem>
                <MenuItem value="text">Metin</MenuItem>
                <MenuItem value="html">HTML</MenuItem>
                <MenuItem value="web_page">Web Sayfası</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Başlık"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              fullWidth
            />

            {/* Slider Editor */}
            {formData.type === 'slider' && (
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Slider İçeriği (Şimdilik basit JSON)
                </Typography>
                <TextField
                  label="Slides (JSON)"
                  value={JSON.stringify(formData.metadata?.slides || [])}
                  onChange={(e) => {
                    try {
                      const slides = JSON.parse(e.target.value);
                      setFormData({ ...formData, metadata: { ...formData.metadata, slides } });
                    } catch {}
                  }}
                  fullWidth
                  multiline
                  rows={4}
                  placeholder='[{"title": "Slide 1", "subtitle": ""}]'
                />
              </Box>
            )}

            {/* Ticker Editor */}
            {formData.type === 'ticker' && (
              <Box>
                <TextField
                  label="Kayan Metin"
                  value={formData.text_content || ''}
                  onChange={(e) => setFormData({ ...formData, text_content: e.target.value })}
                  fullWidth
                  multiline
                  rows={2}
                />
              </Box>
            )}

            {/* Announcement Editor */}
            {formData.type === 'announcement' && (
              <Box>
                <TextField
                  label="Duyuru Mesajı"
                  value={formData.text_content || ''}
                  onChange={(e) => setFormData({ ...formData, text_content: e.target.value })}
                  fullWidth
                  multiline
                  rows={3}
                />
              </Box>
            )}

            {/* File upload for video/image - only for non-special types */}
            {(formData.type === 'video' || formData.type === 'image') && !editContent && (
              <Button
                variant="outlined"
                component="label"
                startIcon={<CloudUpload />}
                fullWidth
              >
                {selectedFile ? selectedFile.name : 'Dosya Seç'}
                <input type="file" hidden onChange={handleFileChange} />
              </Button>
            )}

            {formData.type === 'text' && (
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Metin İçeriği
                </Typography>
                <RichTextEditor
                  value={formData.text_content || ''}
                  onChange={(value) => setFormData({ ...formData, text_content: value })}
                  height={250}
                />
              </Box>
            )}

            {formData.type === 'html' && (
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  HTML İçeriği
                </Typography>
                <RichTextEditor
                  value={formData.html_content || ''}
                  onChange={(value) => setFormData({ ...formData, html_content: value })}
                  height={300}
                />
              </Box>
            )}

            {formData.type === 'web_page' && (
              <TextField
                label="Web URL"
                value={formData.web_url || ''}
                onChange={(e) => setFormData({ ...formData, web_url: e.target.value })}
                fullWidth
                placeholder="https://example.com"
              />
            )}

            {/* Upload Progress */}
            {uploadProgress > 0 && uploadProgress < 100 && (
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="primary">
                    Yükleniyor...
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {uploadProgress}%
                  </Typography>
                </Box>
                <LinearProgress variant="determinate" value={uploadProgress} sx={{ height: 8, borderRadius: 1 }} />
                {selectedFile && (
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    {selectedFile.name} ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
                  </Typography>
                )}
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>İptal</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={!formData.title || createMutation.isPending}
          >
            {editContent ? 'Güncelle' : 'Oluştur'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
