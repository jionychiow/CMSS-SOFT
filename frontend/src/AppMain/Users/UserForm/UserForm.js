import * as React from 'react';
import { url as url_base } from '../../../Config';
import {
  Drawer,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Button,
  Box,
  Grid,
  Paper,
  Divider,
  TextField,
  Select,
  MenuItem,
  Backdrop,
  CircularProgress,
  FormHelperText
} from '@mui/material';

import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';
import { toast } from 'react-toastify';
import AuthContext from '../../../AuthProvider/AuthContext';

class UserForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      is_loading: false,
      username: '',
      email: '',
      first_name: '',
      last_name: '',
      type: 'Admin'
    };

    this.handleRegister = this.handleRegister.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(e) {
    const { name, value } = e.target;
    this.setState({ [name]: value });
  }

  isBadForm() {
    const { username, email, first_name, last_name } = this.state;

    if (!username || !email || !first_name || !last_name) {
      toast.error("请填写所有必填字段");
      return true;
    }
    return false;
  }

  async handleRegister() {
    if (this.isBadForm()) return;

    this.setState({ is_loading: true });

    try {
      const url = url_base + '/api/v1/profile-users/';

      const formData = new FormData();
      Object.keys(this.state).forEach(key => {
        if (this.state[key]) formData.append(key, this.state[key]);
      });

      await axios({
        method: 'post',
        url,
        data: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: 'Token ' + this.context.state.token
        }
      });

      toast.success(
        "用户已创建。已发送邮件邀请他们加入您的组织",
        { autoClose: false }
      );

      if (this.props.OnUpdate) this.props.OnUpdate();
    } catch (error) {
      toast.error("出现问题！" + error?.response?.data?.detail);
    } finally {
      this.setState({ is_loading: false });
    }
  }

  render() {
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
            bgcolor: "background.default"
          }
        }}
        ModalProps={{ keepMounted: true }}
      >
        {/* Loading overlay */}
        <Backdrop
          sx={{ zIndex: theme => theme.zIndex.drawer + 3 }}
          open={this.state.is_loading}
        >
          <CircularProgress />
        </Backdrop>

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
            <IconButton edge="start" onClick={this.props.handleClose}>
              <CloseIcon />
            </IconButton>

            <Typography sx={{ flex: 1 }} variant="h6">
              添加用户
            </Typography>

            <Button variant="contained" onClick={this.handleRegister}>
              创建
            </Button>
          </Toolbar>
        </AppBar>

        {/* Scrollable Body */}
        <Box sx={{ flex: 1, overflowY: "auto", p: 3 }}>
          <Paper sx={{ p: 3 }} elevation={0}>
            <Typography variant="h6" fontWeight={600}>
              基本信息
            </Typography>

            <Divider sx={{ my: 2 }} />

            <Grid container spacing={2}>
              {/* First Name */}
              <Grid size={12}>
                <TextField
                  fullWidth
                  label="名字"
                  name="first_name"
                  value={this.state.first_name}
                  onChange={this.handleChange}
                />
                <FormHelperText>Required *</FormHelperText>
              </Grid>

              {/* Last Name */}
              <Grid size={12}>
                <TextField
                  fullWidth
                  label="姓氏"
                  name="last_name"
                  value={this.state.last_name}
                  onChange={this.handleChange}
                />
                <FormHelperText>Required *</FormHelperText>
              </Grid>

              {/* Username */}
              <Grid size={12}>
                <TextField
                  fullWidth
                  label="用户名"
                  name="username"
                  value={this.state.username}
                  onChange={this.handleChange}
                />
                <FormHelperText>Required *</FormHelperText>
              </Grid>

              {/* Email */}
              <Grid size={12}>
                <TextField
                  fullWidth
                  label="电子邮箱"
                  name="email"
                  type="email"
                  value={this.state.email}
                  onChange={this.handleChange}
                />
                <FormHelperText>Required *</FormHelperText>
              </Grid>

              {/* Type */}
              <Grid size={12}>
                <Select
                  fullWidth
                  name="type"
                  value={this.state.type}
                  onChange={this.handleChange}
                >
                  <MenuItem value="Admin">管理员</MenuItem>
                  <MenuItem value="Reporter">Reporter</MenuItem>
                </Select>
                <FormHelperText>
                  Choose the type of the user (default: Admin)
                </FormHelperText>
              </Grid>
            </Grid>
          </Paper>
        </Box>
      </Drawer>
    );
  }
}

UserForm.contextType = AuthContext;
export default UserForm;
