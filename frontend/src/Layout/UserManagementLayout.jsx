import React from "react";
import Box from "@mui/material/Box";

export default function UserManagementLayout({ children }) {
  return (
    <Box sx={{ 
      display: "flex", 
      flexDirection: "column",
      minHeight: "100vh",
      width: "100%"
    }}>
      {/* 不包含侧边栏，直接渲染子组件 */}
      <Box component="main" sx={{ 
        flexGrow: 1, 
        padding: 3,
        width: '100%',
        marginLeft: 0
      }}>
        {children}
      </Box>
    </Box>
  );
}