// src/Layout/AppLayout.jsx
import React from "react";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

import Nav from "./Nav/Nav";
import SidebarMiniDrawer from "./Sidebar/MiniSidebar";

const FULL_WIDTH = 240;
const MINI_WIDTH = 70;

export default function AppLayout({ children }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [open, setOpen] = React.useState(!isMobile); // Close sidebar by default on mobile

  const drawerWidth = isMobile ? (open ? FULL_WIDTH : 0) : (open ? FULL_WIDTH : MINI_WIDTH);

  React.useEffect(() => {
    // Update sidebar state based on screen size
    if (isMobile) {
      setOpen(false); // Close sidebar on mobile by default
    } else {
      setOpen(true); // Open sidebar on desktop by default
    }
  }, [isMobile]);

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  const handleMobileClose = () => {
    if (isMobile) {
      setOpen(false);
    }
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar */}
      {!isMobile && <SidebarMiniDrawer open={open} onClose={handleMobileClose} />}
      {isMobile && (
        <SidebarMiniDrawer 
          open={open} 
          onClose={handleMobileClose} 
        />
      )}

      {/* Top Nav, aware of drawer width */}
      <Nav
        drawerOpen={open}
        onToggleSidebar={handleDrawerToggle}
        isMobile={isMobile}
      />

      {/* Main content */}
      <Box
        component="main"
        sx={(theme) => ({
          flexGrow: 1,
          ml: isMobile ? 0 : `${drawerWidth}px`,
          pt: 0,
          px: { xs: 1, sm: 2 },
          pb: 2,
          transition: theme.transitions.create(["margin"], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.shortest
          }),
          width: isMobile ? '100%' : `calc(100% - ${drawerWidth}px)`,
          minWidth: 0, // Prevent overflow on small screens
        })}
      >
        {/* Spacer to push content below AppBar height */}
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}
