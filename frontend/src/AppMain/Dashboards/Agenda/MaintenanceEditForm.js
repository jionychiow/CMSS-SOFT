import * as React from "react";
import { url as url_base } from "../../../Config";

import {
  Button,
  Box,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Drawer,
  Slide,
  Paper,
  Divider,
  Grid,
  TextField,
  MenuItem,
  Backdrop,
  CircularProgress,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import axios from "axios";
import { toast } from "react-toastify";
import AuthContext from "../../../AuthProvider/AuthContext";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="left" ref={ref} {...props} />;
});

class MaintenancePlanForm extends React.Component {
  constructor(props) {
    super(props);
    const { maintenancePlan } = props;

    this.state = {
      is_loading: false,

      // BASIC INFO
      planned_starting_date: maintenancePlan?.planned_starting_date?.slice(0, 16) || "",
      planned_finished: maintenancePlan?.planned_finished?.slice(0, 16) || "",
      name: maintenancePlan?.name || "",
      ref: maintenancePlan?.ref || "",
      assigned_to: maintenancePlan?.assigned_to?.id || "",
      asset: maintenancePlan?.asset?.uuid || "",

      // OTHER INFO
      started_at: maintenancePlan?.started_at?.slice(0, 16) || "",
      finished_at: maintenancePlan?.finished_at?.slice(0, 16) || "",
      type: maintenancePlan?.type || "Planned",
      priority: maintenancePlan?.priority || "Medium",
      status: maintenancePlan?.status || "Pending",
      estimated_cost: maintenancePlan?.estimated_cost || "",
      instructions: null,
    };
  }

  componentDidUpdate(prevProps) {
    if (prevProps.maintenancePlan !== this.props.maintenancePlan) {
      const m = this.props.maintenancePlan || {};

      this.setState({
        planned_starting_date: m?.planned_starting_date?.slice(0, 16) || "",
        planned_finished: m?.planned_finished?.slice(0, 16) || "",
        name: m?.name || "",
        ref: m?.ref || "",
        assigned_to: m?.assigned_to?.id || "",
        asset: m?.asset?.uuid || "",
        started_at: m?.started_at?.slice(0, 16) || "",
        finished_at: m?.finished_at?.slice(0, 16) || "",
        type: m?.type || "Planned",
        priority: m?.priority || "Medium",
        status: m?.status || "Pending",
        estimated_cost: m?.estimated_cost || "",
        instructions: null,
      });
    }
  }

  handleChange = (e) => this.setState({ [e.target.name]: e.target.value });
  handleDateChange = (e) => this.setState({ [e.target.name]: e.target.value });
  handleFileChange = (e) => this.setState({ instructions: e.target.files[0] });

  isBadForm() {
    const {
      name,
      ref,
      assigned_to,
      asset,
      planned_starting_date,
      planned_finished,
    } = this.state;

    if (!name || !ref || !assigned_to || !asset || !planned_starting_date || !planned_finished) {
      toast.error("请填写所有必填字段");
      return true;
    }
    return false;
  }

  handleRegister = async () => {
    if (this.isBadForm()) return;

    this.setState({ is_loading: true });

    const formData = new FormData();
    Object.keys(this.state).forEach((key) => {
      if (this.state[key] !== null && this.state[key] !== "")
        formData.append(key, this.state[key]);
    });

    try {
      const { maintenancePlan } = this.props;
      const method = maintenancePlan ? "patch" : "post";
      const url =
        url_base +
        "/api/v1/maintenances-plans/" +
        (maintenancePlan ? `${maintenancePlan.uuid}/` : "");

      await axios({
        method,
        url,
        data: formData,
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: "Token " + this.context.state.token,
        },
      });

      toast.success(`维护计划${maintenancePlan ? "已更新" : "已创建"}`);

      if (this.props.OnUpdate) this.props.OnUpdate();
    } catch (error) {
      toast.error("错误：" + (error?.response?.data?.detail || "请重试。"));
    } finally {
      this.setState({ is_loading: false });
    }
  };

  render() {
    const { maintenancePlan, users, assets } = this.props;

    return (
      <Drawer
        anchor="right"
        open={this.props.show}
        onClose={this.props.handleClose}
        PaperProps={{
          sx: {
            width: "50vw",
            minWidth: 420,
            maxWidth: 720,
            display: "flex",
            flexDirection: "column",
            bgcolor: "background.default",
          },
        }}
        ModalProps={{ keepMounted: true }}
      >
        {/* LOADER */}
        <Backdrop
          sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 10 }}
          open={this.state.is_loading}
        >
          <CircularProgress />
        </Backdrop>

        {/* HEADER */}
        <AppBar
          elevation={0}
          color="default"
          sx={{
            borderBottom: "1px solid",
            borderColor: "divider",
            position: "sticky",
            top: 0,
            zIndex: 10,
          }}
        >
          <Toolbar>
            <IconButton edge="start" onClick={this.props.handleClose}>
              <CloseIcon />
            </IconButton>

            <Typography sx={{ flex: 1 }} variant="h6">
              {maintenancePlan ? "编辑维护计划" : "新建维护计划"}
            </Typography>

            <Button variant="contained" onClick={this.handleRegister}>
              {maintenancePlan ? "保存" : "创建"}
            </Button>
          </Toolbar>
        </AppBar>

        {/* CONTENT */}
        <Box sx={{ flex: 1, overflowY: "auto", p: 3 }}>
          {/* BASIC INFO */}
          <Paper sx={{ p: 3, mb: 3 }} elevation={0}>
            <Typography variant="h6" fontWeight={600}>
              基本信息
            </Typography>
            <Divider sx={{ my: 2 }} />

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="计划开始"
                  type="datetime-local"
                  name="planned_starting_date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={this.state.planned_starting_date}
                  onChange={this.handleDateChange}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="计划完成时间"
                  type="datetime-local"
                  name="planned_finished"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={this.state.planned_finished}
                  onChange={this.handleDateChange}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  label="名称"
                  name="name"
                  fullWidth
                  value={this.state.name}
                  onChange={this.handleChange}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  label="参考编号"
                  name="ref"
                  fullWidth
                  value={this.state.ref}
                  onChange={this.handleChange}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  label="分配给"
                  name="assigned_to"
                  select
                  fullWidth
                  value={this.state.assigned_to}
                  onChange={this.handleChange}
                >
                  {users.map((u) => (
                    <MenuItem key={u?.user?.id} value={u?.user?.id}>
                      {u?.user?.username}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  label="资产"
                  name="asset"
                  select
                  fullWidth
                  value={this.state.asset}
                  onChange={this.handleChange}
                >
                  {assets.map((asset) => (
                    <MenuItem key={asset.uuid} value={asset.uuid}>
                      {asset.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>
          </Paper>

          {/* ADDITIONAL INFO */}
          <Paper sx={{ p: 3, mb: 3 }} elevation={0}>
            <Typography variant="h6" fontWeight={600}>
              额外信息
            </Typography>
            <Divider sx={{ my: 2 }} />

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="实际开始"
                  type="datetime-local"
                  name="started_at"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={this.state.started_at}
                  onChange={this.handleDateChange}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="实际完成时间"
                  type="datetime-local"
                  name="finished_at"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={this.state.finished_at}
                  onChange={this.handleDateChange}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="类型"
                  name="type"
                  select
                  fullWidth
                  value={this.state.type}
                  onChange={this.handleChange}
                >
                  <MenuItem value="计划内">计划内</MenuItem>
                  <MenuItem value="计划外">计划外</MenuItem>
                  <MenuItem value="其他">其他</MenuItem>
                </TextField>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="优先级"
                  name="priority"
                  select
                  fullWidth
                  value={this.state.priority}
                  onChange={this.handleChange}
                >
                  <MenuItem value="低">低</MenuItem>
                  <MenuItem value="中">中</MenuItem>
                  <MenuItem value="高">高</MenuItem>
                </TextField>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="状态"
                  name="status"
                  select
                  fullWidth
                  value={this.state.status}
                  onChange={this.handleChange}
                >
                  <MenuItem value="Pending">待处理</MenuItem>
                  <MenuItem value="In Progress">进行中</MenuItem>
                  <MenuItem value="Completed">已完成</MenuItem>
                  <MenuItem value="Cancelled">已取消</MenuItem>
                </TextField>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="预估成本"
                  name="estimated_cost"
                  type="number"
                  fullWidth
                  value={this.state.estimated_cost}
                  onChange={this.handleChange}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Button variant="outlined" component="label">
                  上传说明文档
                  <input type="file" hidden onChange={this.handleFileChange} />
                </Button>

                {this.state.instructions && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    已选择: {this.state.instructions.name}
                  </Typography>
                )}
              </Grid>
            </Grid>
          </Paper>
        </Box>
      </Drawer>
    );
  }
}

MaintenancePlanForm.contextType = AuthContext;
export default MaintenancePlanForm;
