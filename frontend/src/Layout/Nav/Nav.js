// src/Layout/Nav/Nav.jsx
import React from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Menu,
  MenuItem
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import AccountCircle from "@mui/icons-material/AccountCircle";
import { Link as RouterLink } from "react-router-dom";
import AuthContext from "../../AuthProvider/AuthContext";
import LanguageSwitcher from '../../Components/LanguageSwitcher';

const FULL_WIDTH = 240;
const MINI_WIDTH = 70;

function Nav({ onToggleSidebar, drawerOpen, isMobile }) {
  const { logout, state: authState, validateToken } = React.useContext(AuthContext);
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleMenuOpen = (event) => {
    // 当打开菜单时，强制验证并更新用户信息
    validateToken();
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => setAnchorEl(null);

  const appBarLeft = isMobile ? 0 : (drawerOpen ? FULL_WIDTH : MINI_WIDTH);

  return (
    <AppBar
      position="fixed"
      color="default"
      elevation={0}
      sx={(theme) => ({
        zIndex: theme.zIndex.drawer - 1,
        ml: `${appBarLeft}px`,
        width: isMobile ? '100%' : `calc(100% - ${appBarLeft}px)`,
        borderBottom: "1px solid",
        borderColor: "divider",
        transition: theme.transitions.create(["width", "margin"], {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.shortest
        })
      })}
    >
      <Toolbar>

        {/* Burger button */}
        <IconButton
          edge="start"
          onClick={onToggleSidebar}
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>

        {/* Left links - Hide on mobile to save space */}
        {!isMobile && (
          <Box sx={{ display: "flex", gap: 2, alignItems: "center", flexGrow: 1 }}>
            <Typography
              component={RouterLink}
              to="/dashboards/live"
              sx={{ textDecoration: "none", color: "primary.main", fontWeight: 600 }}
            >
              仪表盘
            </Typography>

            <Typography
              component={RouterLink}
              to="/cmms/dashboards/assets"
              sx={{ textDecoration: "none", color: "primary.main", fontWeight: 600 }}
            >
              CMMS
            </Typography>

            <Typography
              component={RouterLink}
              to="/admin/assets/table"
              sx={{ textDecoration: "none", color: "primary.main", fontWeight: 600 }}
            >
              管理
            </Typography>
          </Box>
        )}

        {/* Show only title on mobile */}
        {isMobile && (
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ flexGrow: 1, fontSize: { xs: '1rem', sm: '1.25rem' } }}
          >
            生产维修资料系统
          </Typography>
        )}

        {/* Language Switcher - Now renders null since we only support Chinese */}
        <LanguageSwitcher />
        
        {/* Right profile menu */}
        <IconButton onClick={handleMenuOpen}>
          <AccountCircle />
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          keepMounted
        >
          {/* 非管理员用户只能看到个人资料和退出 */}
          <MenuItem component={RouterLink} to="/profile" onClick={handleMenuClose}>
            个人资料
          </MenuItem>
          
          {/* 只有管理员才能看到用户管理和高级管理 */}
          {authState.user_profile && authState.user_profile.type && authState.user_profile.type === 'Admin' ? (
            <>
              <MenuItem component={RouterLink} to="/users" onClick={handleMenuClose}>
                用户管理
              </MenuItem>
              <MenuItem component={RouterLink} to="/admin/advanced" onClick={handleMenuClose}>
                高级管理
              </MenuItem>
            </>
          ) : null}
          
          {/* 调试信息 - 显示用户类型 */}
          {process.env.NODE_ENV === 'development' && (
            <MenuItem disabled sx={{ color: 'blue', fontStyle: 'italic' }}>
              调试: 用户类型 - {authState.user_profile?.type || '未定义'}
            </MenuItem>
          )}
          
          <MenuItem
            onClick={() => {
              handleMenuClose();
              logout();
            }}
          >
            退出登录
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}

export default Nav;
