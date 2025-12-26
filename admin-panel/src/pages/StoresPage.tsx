import React, { useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  LinearProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Switch,
  FormControlLabel,
} from '@mui/material';
import { Add, Delete, Edit, Store as StoreIcon } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import storeService, { Store } from '@/services/storeService';

export default function StoresPage() {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    address: '',
    city: '',
    phone: '',
    manager_name: '',
    is_active: true,
  });

  const { data: stores, isLoading } = useQuery({
    queryKey: ['stores'],
    queryFn: () => storeService.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: storeService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stores'] });
      handleCloseDialog();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: any) => storeService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stores'] });
      handleCloseDialog();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: storeService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stores'] });
    },
  });

  const handleOpenDialog = (store?: Store) => {
    if (store) {
      setSelectedStore(store);
      setFormData({
        code: store.code,
        name: store.name,
        address: store.address || '',
        city: store.city || '',
        phone: store.phone || '',
        manager_name: store.manager_name || '',
        is_active: store.is_active,
      });
    } else {
      setSelectedStore(null);
      setFormData({
        code: '',
        name: '',
        address: '',
        city: '',
        phone: '',
        manager_name: '',
        is_active: true,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedStore(null);
  };

  const handleSubmit = () => {
    if (!formData.code || !formData.name) return;

    if (selectedStore) {
      updateMutation.mutate({ id: selectedStore.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" fontWeight="bold">
          Mağaza Yönetimi
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          Yeni Mağaza
        </Button>
      </Box>

      {isLoading ? (
        <LinearProgress />
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Kod</TableCell>
                <TableCell>Ad</TableCell>
                <TableCell>Şehir</TableCell>
                <TableCell>Telefon</TableCell>
                <TableCell>Yönetici</TableCell>
                <TableCell>Durum</TableCell>
                <TableCell align="right">İşlemler</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {stores?.data?.stores?.map((store: Store) => (
                <TableRow key={store.id}>
                  <TableCell>{store.code}</TableCell>
                  <TableCell>{store.name}</TableCell>
                  <TableCell>{store.city || '-'}</TableCell>
                  <TableCell>{store.phone || '-'}</TableCell>
                  <TableCell>{store.manager_name || '-'}</TableCell>
                  <TableCell>
                    <Chip
                      label={store.is_active ? 'Aktif' : 'Pasif'}
                      size="small"
                      color={store.is_active ? 'success' : 'default'}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => handleOpenDialog(store)}>
                      <Edit />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => {
                        if (confirm('Bu mağazayı silmek istediğinize emin misiniz?')) {
                          deleteMutation.mutate(store.id);
                        }
                      }}
                    >
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedStore ? 'Mağaza Düzenle' : 'Yeni Mağaza'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Mağaza Kodu"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Mağaza Adı"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Adres"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              multiline
              rows={2}
              fullWidth
            />
            <TextField
              label="Şehir"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              fullWidth
            />
            <TextField
              label="Telefon"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              fullWidth
            />
            <TextField
              label="Yönetici Adı"
              value={formData.manager_name}
              onChange={(e) => setFormData({ ...formData, manager_name: e.target.value })}
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
          <Button onClick={handleSubmit} variant="contained">
            {selectedStore ? 'Güncelle' : 'Oluştur'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
