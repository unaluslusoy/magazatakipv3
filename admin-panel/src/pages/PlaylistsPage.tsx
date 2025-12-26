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
  Grid,
  IconButton,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  Paper,
  TextField,
  Typography,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Add,
  Delete,
  Edit,
  PlaylistPlay,
  DragIndicator,
  ContentCopy,
} from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import playlistService, { Playlist, PlaylistContent } from '@/services/playlistService';
import contentService from '@/services/contentService';

export default function PlaylistsPage() {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [openContentDialog, setOpenContentDialog] = useState(false);
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_active: true,
  });

  // Fetch playlists
  const { data: playlists, isLoading } = useQuery({
    queryKey: ['playlists'],
    queryFn: () => playlistService.getAll(),
  });

  // Fetch playlist contents
  const { data: playlistContents } = useQuery({
    queryKey: ['playlist-contents', selectedPlaylist?.id],
    queryFn: () => playlistService.getContents(selectedPlaylist!.id),
    enabled: !!selectedPlaylist,
  });

  // Fetch available contents
  const { data: availableContents } = useQuery({
    queryKey: ['contents'],
    queryFn: () => contentService.getAll({ is_active: true }),
    enabled: openContentDialog,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: playlistService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playlists'] });
      handleCloseDialog();
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: any) => playlistService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playlists'] });
      handleCloseDialog();
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: playlistService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playlists'] });
    },
  });

  // Add content mutation
  const addContentMutation = useMutation({
    mutationFn: ({ playlistId, contentId }: any) =>
      playlistService.addContent(playlistId, contentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playlist-contents'] });
    },
  });

  // Reorder mutation
  const reorderMutation = useMutation({
    mutationFn: ({ playlistId, contentIds }: any) =>
      playlistService.reorderContents(playlistId, contentIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playlist-contents'] });
    },
  });

  const handleOpenDialog = (playlist?: Playlist) => {
    if (playlist) {
      setSelectedPlaylist(playlist);
      setFormData({
        name: playlist.name,
        description: playlist.description || '',
        is_active: playlist.is_active,
      });
    } else {
      setSelectedPlaylist(null);
      setFormData({ name: '', description: '', is_active: true });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedPlaylist(null);
    setFormData({ name: '', description: '', is_active: true });
  };

  const handleSubmit = () => {
    if (!formData.name) return;

    if (selectedPlaylist) {
      updateMutation.mutate({ id: selectedPlaylist.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination || !selectedPlaylist) return;

    const items = Array.from(playlistContents?.data?.contents || []);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const contentIds = items.map((item: PlaylistContent) => item.content_id);
    reorderMutation.mutate({ playlistId: selectedPlaylist.id, contentIds });
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
        <Typography variant="h4" fontWeight="bold">
          Playlist Yönetimi
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          Yeni Playlist
        </Button>
      </Box>

      {isLoading ? (
        <LinearProgress />
      ) : (
        <Grid container spacing={3}>
          {playlists?.data?.playlists?.map((playlist: Playlist) => (
            <Grid item xs={12} md={6} lg={4} key={playlist.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                    <Typography variant="h6" fontWeight="bold">
                      {playlist.name}
                    </Typography>
                    <Chip
                      label={playlist.is_active ? 'Aktif' : 'Pasif'}
                      size="small"
                      color={playlist.is_active ? 'success' : 'default'}
                    />
                  </Box>

                  {playlist.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {playlist.description}
                    </Typography>
                  )}

                  <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <Chip
                      icon={<PlaylistPlay />}
                      label={`${playlist.content_count || 0} içerik`}
                      size="small"
                    />
                    <Chip
                      label={formatDuration(playlist.total_duration)}
                      size="small"
                      variant="outlined"
                    />
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      size="small"
                      startIcon={<Edit />}
                      onClick={() => handleOpenDialog(playlist)}
                    >
                      Düzenle
                    </Button>
                    <Button
                      size="small"
                      startIcon={<PlaylistPlay />}
                      onClick={() => {
                        setSelectedPlaylist(playlist);
                        setOpenContentDialog(true);
                      }}
                    >
                      İçerikler
                    </Button>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => {
                        if (confirm('Bu playlist\'i silmek istediğinize emin misiniz?')) {
                          deleteMutation.mutate(playlist.id);
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

      {/* Create/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedPlaylist ? 'Playlist Düzenle' : 'Yeni Playlist'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Playlist Adı"
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
            <FormControlLabel
              control={
                <Switch
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                />
              }
              label="Aktif"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>İptal</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={!formData.name}
          >
            {selectedPlaylist ? 'Güncelle' : 'Oluştur'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Playlist Contents Dialog */}
      <Dialog
        open={openContentDialog}
        onClose={() => setOpenContentDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedPlaylist?.name} - İçerikler
        </DialogTitle>
        <DialogContent>
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="playlist-contents">
              {(provided) => (
                <List ref={provided.innerRef} {...provided.droppableProps}>
                  {playlistContents?.data?.contents?.map((item: PlaylistContent, index: number) => (
                    <Draggable
                      key={item.id}
                      draggableId={item.id.toString()}
                      index={index}
                    >
                      {(provided) => (
                        <ListItem
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          secondaryAction={
                            <IconButton
                              edge="end"
                              onClick={() => {
                                if (confirm('İçeriği çıkarmak istediğinize emin misiniz?')) {
                                  playlistService.removeContent(
                                    selectedPlaylist!.id,
                                    item.content_id
                                  ).then(() => {
                                    queryClient.invalidateQueries({ queryKey: ['playlist-contents'] });
                                  });
                                }
                              }}
                            >
                              <Delete />
                            </IconButton>
                          }
                        >
                          <DragIndicator sx={{ mr: 2, color: 'text.secondary' }} />
                          <ListItemText
                            primary={item.content?.title || `Content #${item.content_id}`}
                            secondary={`Sıra: ${item.order_index}`}
                          />
                        </ListItem>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </List>
              )}
            </Droppable>
          </DragDropContext>

          <Paper sx={{ mt: 2, p: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 2 }}>
              Yeni İçerik Ekle
            </Typography>
            <List dense>
              {availableContents?.data?.contents?.map((content: any) => (
                <ListItem
                  key={content.id}
                  secondaryAction={
                    <Button
                      size="small"
                      onClick={() => {
                        addContentMutation.mutate({
                          playlistId: selectedPlaylist!.id,
                          contentId: content.id,
                        });
                      }}
                    >
                      Ekle
                    </Button>
                  }
                >
                  <ListItemText
                    primary={content.title}
                    secondary={content.type}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenContentDialog(false)}>Kapat</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
