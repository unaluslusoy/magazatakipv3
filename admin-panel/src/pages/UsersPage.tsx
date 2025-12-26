import React, { useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  LinearProgress,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Switch,
} from '@mui/material';
import {
  Add,
  Delete,
  Edit,
  People as PeopleIcon,
  PersonAdd,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import userService, { User, CreateUserDto } from '@/services/userService';
import { useAuthStore } from '@/store/authStore';

const ROLE_LABELS = {
  admin: 'Yönetici',
  manager: 'Müdür',
  viewer: 'Görüntüleyici',
};

const ROLE_COLORS = {
  admin: 'error' as const,
  manager: 'warning' as const,
  viewer: 'info' as const,
};

export default function UsersPage() {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuthStore();

  const [formData, setFormData] = useState<Partial<CreateUserDto>>({
    email: '',
    password: '',
    name: '',
    role: 'viewer',
  });

  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => userService.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: userService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      handleCloseDialog();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      userService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      handleCloseDialog();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: userService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: userService.toggleStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const handleOpenDialog = (user?: User) => {
    if (user) {
      setSelectedUser(user);
      setFormData({
        email: user.email,
        name: user.name,
        role: user.role,
        password: '', // Şifre güncellemede opsiyonel
      });
    } else {
      setSelectedUser(null);
      setFormData({
        email: '',
        password: '',
        name: '',
        role: 'viewer',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedUser(null);
    setFormData({
      email: '',
      password: '',
      name: '',
      role: 'viewer',
    });
  };

  const handleSubmit = () => {
    if (selectedUser) {
      // Güncelleme
      const updateData: any = {
        email: formData.email,
        name: formData.name,
        role: formData.role,
      };
      // Şifre girildiyse ekle
      if (formData.password && formData.password.trim() !== '') {
        updateData.password = formData.password;
      }
      updateMutation.mutate({ id: selectedUser.id, data: updateData });
    } else {
      // Yeni oluşturma
      if (!formData.email || !formData.password || !formData.name) {
        return;
      }
      createMutation.mutate(formData as CreateUserDto);
    }
  };

  const handleDelete = (id: number) => {
    if (confirm('Bu kullanıcıyı silmek istediğinize emin misiniz?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleToggleStatus = (id: number) => {
    toggleStatusMutation.mutate(id);
  };

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" fontWeight="bold">
            Kullanıcı Yönetimi
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Sistem kullanıcılarını yönetin
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<PersonAdd />}
          onClick={() => handleOpenDialog()}
        >
          Yeni Kullanıcı
        </Button>
      </Box>

      {isLoading ? (
        <LinearProgress />
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>İsim</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Rol</TableCell>
                <TableCell>Durum</TableCell>
                <TableCell>Son Giriş</TableCell>
                <TableCell>Oluşturulma</TableCell>
                <TableCell align="right">İşlemler</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users?.data?.users?.map((user: User) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PeopleIcon color="action" />
                      <Typography fontWeight="medium">{user.name}</Typography>
                      {user.id === currentUser?.id && (
                        <Chip label="Siz" size="small" color="primary" />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Chip
                      label={ROLE_LABELS[user.role]}
                      size="small"
                      color={ROLE_COLORS[user.role]}
                    />
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={user.is_active}
                      onChange={() => handleToggleStatus(user.id)}
                      disabled={user.id === currentUser?.id}
                      color="success"
                    />
                  </TableCell>
                  <TableCell>
                    {user.last_login
                      ? new Date(user.last_login).toLocaleDateString('tr-TR')
                      : 'Henüz giriş yapmadı'}
                  </TableCell>
                  <TableCell>
                    {new Date(user.created_at).toLocaleDateString('tr-TR')}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(user)}
                      color="primary"
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(user.id)}
                      color="error"
                      disabled={user.id === currentUser?.id}
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

      {/* Create/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedUser ? 'Kullanıcı Düzenle' : 'Yeni Kullanıcı Oluştur'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="İsim"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              fullWidth
              required
            />

            <TextField
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              fullWidth
              required
            />

            <TextField
              label={selectedUser ? 'Şifre (Boş bırakırsanız değişmez)' : 'Şifre'}
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              fullWidth
              required={!selectedUser}
              helperText={
                selectedUser
                  ? 'Şifreyi değiştirmek istemiyorsanız boş bırakın'
                  : 'En az 6 karakter olmalıdır'
              }
            />

            <FormControl fullWidth>
              <InputLabel>Rol</InputLabel>
              <Select
                value={formData.role}
                label="Rol"
                onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
              >
                <MenuItem value="viewer">Görüntüleyici</MenuItem>
                <MenuItem value="manager">Müdür</MenuItem>
                <MenuItem value="admin">Yönetici</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>İptal</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={
              !formData.email ||
              !formData.name ||
              (!selectedUser && !formData.password) ||
              createMutation.isPending ||
              updateMutation.isPending
            }
          >
            {selectedUser ? 'Güncelle' : 'Oluştur'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
