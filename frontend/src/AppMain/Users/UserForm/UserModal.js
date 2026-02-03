import React from 'react';
import {
  Drawer,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Grid,
  Paper,
  Divider
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const UserModal = ({ open, handleClose, user }) => {
  // 24小时制时间格式化函数
  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return dateString;
    }
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={handleClose}
      PaperProps={{
        sx: {
          width: "50vw",
          minWidth: 420,
          maxWidth: 720,
          bgcolor: "background.default",
          display: "flex",
          flexDirection: "column"
        }
      }}
      ModalProps={{ keepMounted: true }}
    >
      {/* Sticky Header */}
      <AppBar
        elevation={0}
        color="default"
        sx={{
          borderBottom: "1px solid",
          borderColor: "divider",
          position: "sticky",
          top: 0,
          zIndex: 10
        }}
      >
        <Toolbar>
          <IconButton edge="start" onClick={handleClose}>
            <CloseIcon />
          </IconButton>

          <Typography sx={{ ml: 2, flex: 1 }} variant="h6">
            View User
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Drawer Content */}
      <Box sx={{ flex: 1, overflowY: "auto", p: 3 }}>
        <Paper elevation={0} sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight={600}>
            Basic Information
          </Typography>

          <Divider sx={{ my: 2 }} />

          <Grid container spacing={2}>
            <Grid size={12}>
              <Typography>
                <strong>First Name:</strong> {user?.first_name}
              </Typography>
            </Grid>

            <Grid size={12}>
              <Typography>
                <strong>Last Name:</strong> {user?.last_name}
              </Typography>
            </Grid>

            <Grid size={12}>
              <Typography>
                <strong>Username:</strong> {user?.username}
              </Typography>
            </Grid>

            <Grid size={12}>
              <Typography>
                <strong>Email:</strong> {user?.email}
              </Typography>
            </Grid>

            <Grid size={12}>
              <Typography>
                <strong>Last login:</strong>{" "}
                {user?.last_login
                  ? formatDateTime(user.last_login)
                  : "Never"}
              </Typography>
            </Grid>

            <Grid size={12}>
              <Typography>
                <strong>Date joined:</strong>{" "}
                {user?.date_joined
                  ? formatDateTime(user.date_joined)
                  : ""}
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      </Box>
    </Drawer>
  );
};

export default UserModal;
