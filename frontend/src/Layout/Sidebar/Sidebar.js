import React from "react";
import {
  Drawer,
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  ListSubheader
} from "@mui/material";

import { Link as RouterLink, useLocation } from "react-router-dom"; // ✅ import useLocation

// Icons...
import SensorsIcon from "@mui/icons-material/Sensors";
import AutoModeIcon from "@mui/icons-material/AutoMode";
import GppBadIcon from "@mui/icons-material/GppBad";
import ElectricBoltIcon from "@mui/icons-material/ElectricBolt";
import PrecisionManufacturingIcon from "@mui/icons-material/PrecisionManufacturing";
import DashboardCustomizeIcon from "@mui/icons-material/DashboardCustomize";
import FmdBadIcon from "@mui/icons-material/FmdBad";
import CategoryIcon from "@mui/icons-material/Category";
import PersonIcon from "@mui/icons-material/Person";
import AutoGraphIcon from "@mui/icons-material/AutoGraph";
import BarChartIcon from "@mui/icons-material/BarChart";
import DateRangeIcon from "@mui/icons-material/DateRange";
import ConstructionIcon from "@mui/icons-material/Construction";
import TuneIcon from "@mui/icons-material/Tune";
import EventNoteIcon from "@mui/icons-material/EventNote";

import AuthContext from "../../AuthProvider/AuthContext";

function SidebarDrawer({ open, onClose }) {
  const { state } = React.useContext(AuthContext);
  const userType = state.user_profile?.type;

  const location = useLocation(); // ✅ current path

  const isActive = (path) => window.location.pathname.startsWith(path); // helper

  return (
    <Drawer open={open} onClose={onClose} PaperProps={{ sx: { width: 260 } }}>
      <Box role="presentation" sx={{ p: 2 }}>

        {userType === "Admin" && (
          <>
            <ListSubheader><b>OEE仪表板</b></ListSubheader>

            <List>
              <ListItemButton
                component={RouterLink}
                to="/dashboards/live"
                selected={location.pathname === "/dashboards/live"}
             
              >
                <ListItemIcon><SensorsIcon /></ListItemIcon>
                <ListItemText primary="实时" />
              </ListItemButton>

              <ListItemButton
                component={RouterLink}
                to="/dashboards/oee"
                selected={isActive("/dashboards/oee")}
              >
                <ListItemIcon><AutoModeIcon /></ListItemIcon>
                <ListItemText primary="OEE" />
              </ListItemButton>

              <ListItemButton
                component={RouterLink}
                to="/dashboards/downtimes"
                selected={isActive("/dashboards/downtimes")}
              >
                <ListItemIcon><GppBadIcon /></ListItemIcon>
                <ListItemText primary="停机时间" />
              </ListItemButton>

              <ListItemButton
                component={RouterLink}
                to="/dashboards/energy"
                selected={isActive("/dashboards/energy")}
              >
                <ListItemIcon><ElectricBoltIcon /></ListItemIcon>
                <ListItemText primary="能源与成本" />
              </ListItemButton>
            </List>

            <Divider sx={{ my: 2 }} />

            <ListSubheader><b>管理</b></ListSubheader>
            <List>
              <ListItemButton
                component={RouterLink}
                to="/admin/assets/table"
                selected={isActive("/admin/assets")}
              >
                <ListItemIcon><PrecisionManufacturingIcon /></ListItemIcon>
                <ListItemText primary="产线" />
              </ListItemButton>

              <ListItemButton
                component={RouterLink}
                to="/admin/cells/table"
                selected={isActive("/admin/cells")}
              >
                <ListItemIcon><DashboardCustomizeIcon /></ListItemIcon>
                <ListItemText primary="单元格" />
              </ListItemButton>

              <ListItemButton
                component={RouterLink}
                to="/cmms/task-plan"
                selected={isActive("/cmms/task-plan")}
              >
                <ListItemIcon><FmdBadIcon /></ListItemIcon>
                <ListItemText primary="故障" />
              </ListItemButton>

              <ListItemButton
                component={RouterLink}
                to="/admin/products/table"
                selected={isActive("/admin/products")}
              >
                <ListItemIcon><CategoryIcon /></ListItemIcon>
                <ListItemText primary="产品" />
              </ListItemButton>

              <ListItemButton
                component={RouterLink}
                to="/admin/users/add"
                selected={isActive("/admin/users")}
              >
                <ListItemIcon><PersonIcon /></ListItemIcon>
                <ListItemText primary="用户" />
              </ListItemButton>
            </List>

            <Divider sx={{ my: 2 }} />

            <ListSubheader><b>设备维护</b></ListSubheader>
            <List>
              <ListItemButton
                component={RouterLink}
                to="/cmms/dashboards/assets"
                selected={isActive("/cmms/dashboards/assets")}
              >
                <ListItemIcon><AutoGraphIcon /></ListItemIcon>
                <ListItemText primary="资产" />
              </ListItemButton>

              <ListItemButton
                component={RouterLink}
                to="/cmms/dashboards/maintenances"
                selected={isActive("/cmms/dashboards/maintenances")}
              >
                <ListItemIcon><BarChartIcon /></ListItemIcon>
                <ListItemText primary="维护" />
              </ListItemButton>

              <ListItemButton
                component={RouterLink}
                to="/cmms/dashboards/agenda"
                selected={isActive("/cmms/dashboards/agenda")}
              >
                <ListItemIcon><DateRangeIcon /></ListItemIcon>
                <ListItemText primary="日程" />
              </ListItemButton>

              <ListItemButton
                component={RouterLink}
                to="/cmms/maintenance/add"
                selected={isActive("/cmms/maintenance")}
              >
                <ListItemIcon><ConstructionIcon /></ListItemIcon>
                <ListItemText primary="计划维护" />
              </ListItemButton>
            </List>

            <Divider sx={{ my: 2 }} />
          </>
        )}

        {/* OPERATOR */}
        <ListSubheader><b>操作员</b></ListSubheader>
        <List>
          <ListItemButton
            component={RouterLink}
            to="/operator/agenda"
            selected={isActive("/operator/agenda")}
          >
            <ListItemIcon><EventNoteIcon /></ListItemIcon>
            <ListItemText primary="我的日程" />
          </ListItemButton>

          <ListItemButton
            component={RouterLink}
            to="/operator/control"
            selected={isActive("/operator/control")}
          >
            <ListItemIcon><TuneIcon /></ListItemIcon>
            <ListItemText primary="控制" />
          </ListItemButton>
        </List>
      </Box>
    </Drawer>
  );
}

export default SidebarDrawer;
