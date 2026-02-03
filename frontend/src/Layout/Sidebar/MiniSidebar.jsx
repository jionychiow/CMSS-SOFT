import React from "react";
import {
  Drawer,
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Divider,
  ListSubheader,
  useTheme,
  useMediaQuery,
  IconButton
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import AuthContext from "../../AuthProvider/AuthContext";

/* Icons */
import SensorsIcon from "@mui/icons-material/Sensors";
import AutoModeIcon from "@mui/icons-material/AutoMode";
import GppBadIcon from "@mui/icons-material/GppBad";
import ElectricBoltIcon from "@mui/icons-material/ElectricBolt";
import PrecisionManufacturingIcon from "@mui/icons-material/PrecisionManufacturing";
import DashboardCustomizeIcon from "@mui/icons-material/DashboardCustomize";
import CategoryIcon from "@mui/icons-material/Category";
import PersonIcon from "@mui/icons-material/Person";
import AutoGraphIcon from "@mui/icons-material/AutoGraph";
import BarChartIcon from "@mui/icons-material/BarChart";
import DateRangeIcon from "@mui/icons-material/DateRange";
import ConstructionIcon from "@mui/icons-material/Construction";
import TuneIcon from "@mui/icons-material/Tune";
import EventNoteIcon from "@mui/icons-material/EventNote";
import CloseIcon from "@mui/icons-material/Close";
import AssignmentIcon from "@mui/icons-material/Assignment";

/* Drawer widths */
const FULL_WIDTH = 240;
const MINI_WIDTH = 70;

export default function SidebarMiniDrawer({ open, onClose }) {
  const { state } = React.useContext(AuthContext);
  const userType = state.user_profile?.type;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  /* Wrapper for tooltip on collapsed state */
  const Item = ({ icon, text, to }) => (
    <Tooltip title={!open ? text : ""} placement="right">
      <ListItemButton component={RouterLink} to={to} onClick={isMobile ? onClose : undefined}>
        <ListItemIcon sx={{ minWidth: 40 }}>{icon}</ListItemIcon>
        {open && <ListItemText primary={text} />}
      </ListItemButton>
    </Tooltip>
  );

  return (
    <Drawer
      variant={isMobile ? "temporary" : "permanent"}
      open={open}
      onClose={onClose}
      ModalProps={{
        keepMounted: true, // Better open performance on mobile
      }}
      PaperProps={{
        sx: {
          width: isMobile ? FULL_WIDTH : (open ? FULL_WIDTH : MINI_WIDTH),
          transition: "width 0.2s ease",
          whiteSpace: "nowrap",
          overflowX: "hidden",
          borderRight: "1px solid #ddd",
          height: "100vh",
          position: "fixed", // Ensure it stays fixed on mobile
          zIndex: theme.zIndex.drawer,
        },
      }}
    >
      <Box sx={{ mt: 8, pb: 8 }}>
        {/* Close button for mobile */}
        {isMobile && open && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
            <Tooltip title="关闭菜单">
              <IconButton onClick={onClose} size="small">
                <CloseIcon />
              </IconButton>
            </Tooltip>
          </Box>
        )}

        {/* ADMIN MENU */}
        {userType === "Admin" && (
          <>
            {open && (
              <ListSubheader sx={{ pl: 2, fontWeight: "bold" }}>
                OEE仪表板
              </ListSubheader>
            )}
            <List>
              <Item icon={<SensorsIcon />} text="实时" to="/dashboards/live" />
              <Item icon={<AutoModeIcon />} text="OEE" to="/dashboards/oee" />
              <Item icon={<GppBadIcon />} text="停机时间" to="/dashboards/downtimes" />
              <Item icon={<ElectricBoltIcon />} text="能源与成本" to="/dashboards/energy" />
            </List>

            <Divider sx={{ my: 2 }} />

            {open && (
              <ListSubheader sx={{ pl: 2, fontWeight: "bold" }}>
                管理
              </ListSubheader>
            )}
            <List>
              <Item icon={<PrecisionManufacturingIcon />} text="生产线" to="/admin/assets/table" />
              <Item icon={<DashboardCustomizeIcon />} text="工位" to="/admin/cells/table" />
              <Item icon={<AssignmentIcon />} text="任务计划" to="/cmms/task-plan" />
              <Item icon={<CategoryIcon />} text="产品" to="/admin/products/table" />
              <Item icon={<PersonIcon />} text="用户" to="/admin/users/add" />
            </List>

            <Divider sx={{ my: 2 }} />

            {open && (
              <ListSubheader sx={{ pl: 2, fontWeight: "bold" }}>
                设备维护
              </ListSubheader>
            )}
            <List>
              <Item icon={<AutoGraphIcon />} text="资产" to="/cmms/dashboards/assets" />
              <Item icon={<BarChartIcon />} text="维护记录" to="/cmms/dashboards/maintenances" />
              <Item icon={<DateRangeIcon />} text="日程安排" to="/cmms/dashboards/agenda" />
              <Item icon={<ConstructionIcon />} text="计划" to="/cmms/maintenance/add" />
              <Item icon={<ConstructionIcon />} text="分期班次记录" to="/cmms/maintenance/phase-shift-records" />
            </List>
          </>
        )}

        {/* OPERATOR MENU */}
        <Divider sx={{ my: 2 }} />
        {open && (
          <ListSubheader sx={{ pl: 2, fontWeight: "bold" }}>
            操作员
          </ListSubheader>
        )}

        <List>
          <Item icon={<EventNoteIcon />} text="我的日程" to="/operator/agenda" />
          <Item icon={<TuneIcon />} text="控制" to="/operator/control" />
        </List>
      </Box>
    </Drawer>
  );
}
