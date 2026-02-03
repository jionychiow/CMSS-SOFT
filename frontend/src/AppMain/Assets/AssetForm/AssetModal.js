import React from 'react';
import {
  Drawer,
  Typography,
  Grid,
  Paper,
  CardMedia,
  AppBar,
  Toolbar,
  IconButton,
  Box,
  Divider
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const AssetModal = ({ open, handleClose, asset }) => {
  if (!asset) return null;

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
      width: "50vw",       // main width
      minWidth: 420,        // consistent min width
      maxWidth: 720,        // consistent max width
      display: "flex",
      flexDirection: "column",
      bgcolor: "background.default",
    }
  }}
      ModalProps={{ keepMounted: true }}
    >

      {/* 🧭 Sticky AppBar */}
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

          <Typography sx={{ flex: 1 }} variant="h6">
            查看资产
          </Typography>
        </Toolbar>
      </AppBar>

      {/* 🔽 Scrollable body */}
      <Box sx={{ flex: 1, overflowY: "auto", p: 3 }}>

        {/* ⭐ Section 1: Basic Info + Image */}
        <Paper elevation={0} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" fontWeight={600}>基本信息</Typography>
          <Divider sx={{ my: 2 }} />

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <CardMedia
                component="img"
                image={asset.photo}
                alt={asset.name}
                sx={{
                  width: "100%",
                  height: 220,
                  objectFit: "cover",
                  borderRadius: 1
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 8 }}>
              <Typography variant="body1" gutterBottom>
                <strong>名称:</strong> {asset.name}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>参考号:</strong> {asset.ref}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>类型:</strong> {asset.asset_type}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>序列号:</strong> {asset.serial_number}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>状态:</strong> {asset.status}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>期别:</strong> {asset.phase_name || '未指定'}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>产线:</strong> {asset.production_line_name || '未指定'}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>工序:</strong> {asset.process_name || '未指定'}
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        {/* ⭐ Section 2: Additional Info */}
        <Paper elevation={0} sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight={600}>附加信息</Typography>
          <Divider sx={{ my: 2 }} />

          <Typography variant="body1" gutterBottom>
            <strong>位置:</strong> {asset.location}
          </Typography>
          <Typography variant="body1" gutterBottom>
            <strong>购买日期:</strong> {formatDateTime(asset.purchase_date)}
          </Typography>
          <Typography variant="body1" gutterBottom>
            <strong>保修到期:</strong> {formatDateTime(asset.warranty_expiration_date)}
          </Typography>
          <Typography variant="body1" gutterBottom>
            <strong>创建时间:</strong> {formatDateTime(asset.created_at)}
          </Typography>
          <Typography variant="body1" gutterBottom>
            <strong>最后更新:</strong> {formatDateTime(asset.last_updated_at)}
          </Typography>

          <Typography variant="body1" gutterBottom>
            <strong>成本:</strong> {asset.cost}
          </Typography>
          <Typography variant="body1" gutterBottom>
            <strong>当前价值:</strong> {asset.current_value}
          </Typography>
        </Paper>

      </Box>
    </Drawer>
  );
};

export default AssetModal;
