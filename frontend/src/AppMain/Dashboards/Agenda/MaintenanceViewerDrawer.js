import React from "react";
import {
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Divider,
  Paper,
  Chip
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

export default function MaintenanceViewerDrawer({ open, onClose, maintenance }) {
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
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { width: "50vw", minWidth: 420, maxWidth: 720 }
      }}
    >
      <AppBar position="sticky" color="default" elevation={0}>
        <Toolbar>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
          <Typography sx={{ flex: 1 }} variant="h6">
            Maintenance Details
          </Typography>
        </Toolbar>
      </AppBar>

      <Box sx={{ p: 3, overflowY: "auto", height: "100%" }}>
        {/* MAINTENANCE DETAILS */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Maintenance Details
          </Typography>
          <Typography variant="body1" gutterBottom>
            <strong>Name:</strong> {maintenance?.name}
          </Typography>
          <Typography variant="body1" gutterBottom>
            <strong>Reference:</strong> {maintenance?.ref}
          </Typography>
          <Typography variant="body1" gutterBottom>
            <strong>Type:</strong> {maintenance?.type}
          </Typography>
          <Typography variant="body1" component="div" gutterBottom>
            <strong>Priority:</strong> 
            <Chip 
              label={maintenance?.priority} 
              size="small" 
              sx={{ ml: 1, textTransform: 'capitalize' }} 
            />
          </Typography>
          <Typography variant="body1" component="div" gutterBottom>
            <strong>Status:</strong> 
            <Chip 
              label={maintenance?.status} 
              size="small" 
              sx={{ ml: 1, textTransform: 'capitalize' }} 
            />
          </Typography>
          <Typography variant="body1" gutterBottom>
            <strong>Created By:</strong> {maintenance?.created_by?.username}
          </Typography>
          <Typography variant="body1" gutterBottom>
            <strong>Assigned To:</strong> {maintenance?.assigned_to?.username}
          </Typography>
          <Typography variant="body1" gutterBottom>
            <strong>Planned Starting Date:</strong> {maintenance?.planned_starting_date ? formatDateTime(maintenance.planned_starting_date) : 'N/A'}
          </Typography>
          <Typography variant="body1" gutterBottom>
            <strong>Started At:</strong> {maintenance?.started_at ? formatDateTime(maintenance.started_at) : 'Not Started'}
          </Typography>
          <Typography variant="body1" gutterBottom>
            <strong>Description:</strong> {maintenance?.description}
          </Typography>
        </Paper>
        
        <Divider sx={{ my: 3 }} />
        
        {/* ASSET DETAILS */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Asset Information
          </Typography>
          <Typography variant="body1" gutterBottom>
            <strong>Name:</strong> {maintenance?.asset?.name}
          </Typography>
          <Typography variant="body1" gutterBottom>
            <strong>Reference:</strong> {maintenance?.asset?.ref}
          </Typography>
          <Typography variant="body1" gutterBottom>
            <strong>Type:</strong> {maintenance?.asset?.asset_type}
          </Typography>
          <Typography variant="body1" component="div" gutterBottom>
            <strong>Status:</strong> 
            <Chip 
              label={maintenance?.asset?.status} 
              size="small" 
              sx={{ ml: 1, textTransform: 'capitalize' }} 
            />
          </Typography>
        </Paper>
      </Box>
    </Drawer>
  );
}
