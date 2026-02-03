import React, { Component } from "react";

import { ToastContainer, toast } from "react-toastify";
import { url } from "../../Config";

import { Navigate } from "react-router-dom";
import axios from "axios";

import {
  FormControl,
  Input,
  InputLabel,
  Grid,
  CardHeader,
  CardContent,
  CardActions,
  Card,
  CardMedia,
  Button,
  Backdrop,
  CircularProgress
} from "@mui/material";

class Register extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: "",
      password: "",
      password2: "",
      email: "",
      organization: "",
      is_created: false,
      is_loading: false
    };

    this.handleChange = this.handleChange.bind(this);
    this.HandleRegister = this.HandleRegister.bind(this);
    this.checkForm = this.checkForm.bind(this);
  }

  handleChange(e) {
    this.setState({ [e.target.name]: e.target.value });
  }

  checkForm() {
    const { username, password, password2, email, organization } = this.state;

    if (!username || !password || password !== password2 || !email || !organization) {
      toast.error("请检查所有信息并重试");
      return true;
    }
    return false;
  }

  async HandleRegister() {
    if (this.checkForm()) return;

    this.setState({ is_loading: true }, async () => {
      const { username, password, password2, email, organization } = this.state;

      try {
        const response = await axios.post(url + "/api/auth/profile/", {
          username,
          password,
          password2,
          email,
          organization
        });

        if (response.status === 201) {
          toast.success("账户已创建。您现在可以登录。");
          this.setState({ is_created: true });
        }
      } catch (error) {
        toast.error("错误：" + (error.response?.data?.detail || "请重试"));
        this.setState({ is_loading: false });
      }
    });
  }

  render() {
    const { is_created } = this.state;

    return (
      <>
        {is_created && <Navigate to="/login" replace />}

        <ToastContainer />

        {/* Full screen background */}
        <Grid
          container
          sx={(theme) => ({
            minHeight: "100vh",
            background: theme.palette.loginBg.main,
            display: "flex",
            p: 2
          })}
        >
          <Grid size={{ xs: 12, sm: 10, md: 6, lg: 4 }} sx={{ margin: "auto" }}>
            <Card sx={{ width: "100%", borderRadius: 2 }}>
              <CardMedia
                sx={{ height: 60, objectFit: "contain", pt: 2 }}
                image="/g888.png"
                component="img"
              />

              <Backdrop
                sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
                open={this.state.is_loading}
              >
                <CircularProgress />
              </Backdrop>

              <CardHeader title="创建您的账户" />

              <CardContent>
                <FormControl variant="standard" fullWidth sx={{ mb: 2 }}>
                  <InputLabel>用户名</InputLabel>
                  <Input name="username" onChange={this.handleChange} />
                </FormControl>

                <FormControl variant="standard" fullWidth sx={{ mb: 2 }}>
                  <InputLabel>组织</InputLabel>
                  <Input name="organization" onChange={this.handleChange} />
                </FormControl>

                <FormControl variant="standard" fullWidth sx={{ mb: 2 }}>
                  <InputLabel>邮箱</InputLabel>
                  <Input name="email" type="email" onChange={this.handleChange} />
                </FormControl>

                <FormControl variant="standard" fullWidth sx={{ mb: 2 }}>
                  <InputLabel>密码</InputLabel>
                  <Input name="password" type="password" onChange={this.handleChange} />
                </FormControl>

                <FormControl variant="standard" fullWidth sx={{ mb: 2 }}>
                  <InputLabel>重复密码</InputLabel>
                  <Input name="password2" type="password" onChange={this.handleChange} />
                </FormControl>
              </CardContent>

              <CardActions sx={{ p: 2 }}>
                <Button variant="contained" fullWidth onClick={this.HandleRegister}>
                  注册
                </Button>
              </CardActions>

              <CardActions sx={{ justifyContent: "space-between", px: 2 }}>
                <Button href="/terms" target="_blank">
                  条款
                </Button>
                <Button href="/login">登录</Button>
              </CardActions>
            </Card>
          </Grid>
        </Grid>
      </>
    );
  }
}

export default Register;
