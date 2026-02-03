import React, { Component } from 'react';
import AuthContext from '../../AuthProvider/AuthContext';
import { url } from '../../Config';
import { 
  FormHelperText, 
  Input, 
  InputLabel,
  Grid,
  Typography,
  Card,
  Button, 
  Backdrop, 
  Snackbar, 
  Alert, 
  CircularProgress,
  Box,
  Paper
} from '@mui/material';
import { LockOutlined, AccountCircle } from '@mui/icons-material';
import { styled } from '@mui/material/styles';

import axios from 'axios';

const StyledCard = styled(Card)(({ theme }) => ({
  width: { xs: '95%', sm: '450px', md: '500px' },
  borderRadius: '20px',
  padding: theme.spacing(4),
  background: 'rgba(255, 255, 255, 0.9)',
  backdropFilter: 'blur(10px)',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  maxWidth: '100%',
  margin: theme.spacing(2)
}));

const GradientBackground = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(2),
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: 'radial-gradient(circle at 10% 20%, rgba(255,255,255,0.1) 0%, transparent 20%), radial-gradient(circle at 90% 80%, rgba(255,255,255,0.1) 0%, transparent 20%)',
  }
}));

const InputContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  marginBottom: theme.spacing(3),
}));

const StyledInput = styled(Input)(({ theme }) => ({
  width: '100%',
  padding: theme.spacing(2),
  backgroundColor: 'rgba(255, 255, 255, 0.9)',
  borderRadius: '12px',
  border: '1px solid rgba(255, 255, 255, 0.3)',
  backdropFilter: 'blur(5px)',
  '&:after': {
    borderBottom: '2px solid #667eea !important',
  },
  '&:hover:not(.Mui-disabled):before': {
    borderBottom: '2px solid rgba(102, 126, 234, 0.5) !important',
  },
}));

class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      password: '',
      error: '',
      is_loading: false,
      show_message: false,
      severity: "success",
      message_text: ""
    };
    this.HandleLogin = this.HandleLogin.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.HandleCloseMessage = this.HandleCloseMessage.bind(this);
  }

  handleChange(e) {
    this.setState({ [e.target.name]: e.target.value });
  }
  
  HandleCloseMessage() {
    this.setState({ ...this.state, show_message: false })
  }

  async HandleLogin() {
    this.setState({ ...this.state, is_loading: true }, async () => {
      const { username, password } = this.state;
      try {
        const response = await axios.post(url + '/api/api-token-auth/', {
          username: username,
          password: password
        });
        const { token } = response.data;

        const response_profile = await axios.get(url + '/api/v1/my-profile/', {
          headers: {
            'Authorization': "Token " + token
          }
        });

        this.context.login(token, response_profile.data);

      } catch (error) {
        this.context.logout()
        this.setState({ ...this.state, is_loading: false, show_message: true, severity: 'error', message_text: '用户名或密码错误！请重试' });
      }
    })
  }

  render() {
    return (
      <>
        <Backdrop
          sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1300 }}
          open={this.state.is_loading}
        >
          <CircularProgress size={60} thickness={4} />
        </Backdrop>

        <GradientBackground>
          <StyledCard>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                mb: 2 
              }}>
                <Paper 
                  elevation={4}
                  sx={{ 
                    width: 80, 
                    height: 80, 
                    borderRadius: '50%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    mb: 1
                  }}
                >
                  <LockOutlined sx={{ fontSize: 40, color: 'white' }} />
                </Paper>
              </Box>
              
              <Typography 
                variant="h4" 
                sx={{ 
                  fontWeight: 'bold', 
                  background: 'linear-gradient(45deg, #667eea, #764ba2)', 
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 1
                }}
              >
                生产维修资料系统
              </Typography>
              
              <Typography variant="body1" color="textSecondary">
                专业设备维护管理系统
              </Typography>
            </Box>

            <Grid container spacing={3}>
              <Grid size={12}>
                <InputContainer>
                  <InputLabel 
                    htmlFor="username-input" 
                    sx={{ 
                      color: '#667eea', 
                      fontWeight: 'bold',
                      mb: 1
                    }}
                  >
                    用户名
                  </InputLabel>
                  <StyledInput
                    id="username-input"
                    name="username"
                    onChange={this.handleChange}
                    type="text"
                    startAdornment={
                      <AccountCircle sx={{ mr: 1, color: '#667eea' }} />
                    }
                    placeholder="请输入用户名"
                  />
                  <FormHelperText sx={{ color: 'rgba(0, 0, 0, 0.6)' }}>请输入您的系统用户名</FormHelperText>
                </InputContainer>
              </Grid>

              <Grid size={12}>
                <InputContainer>
                  <InputLabel 
                    htmlFor="password-input" 
                    sx={{ 
                      color: '#667eea', 
                      fontWeight: 'bold',
                      mb: 1
                    }}
                  >
                    密码
                  </InputLabel>
                  <StyledInput
                    id="password-input"
                    name="password"
                    onChange={this.handleChange}
                    type="password"
                    startAdornment={
                      <LockOutlined sx={{ mr: 1, color: '#667eea' }} />
                    }
                    placeholder="请输入密码"
                  />
                  <FormHelperText sx={{ color: 'rgba(0, 0, 0, 0.6)' }}>请输入您的账户密码</FormHelperText>
                </InputContainer>
              </Grid>

              <Grid size={12}>
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  onClick={this.HandleLogin}
                  sx={{
                    py: 1.5,
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    background: 'linear-gradient(45deg, #667eea, #764ba2)',
                    borderRadius: '12px',
                    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #5a6fd8, #6a4190)',
                      boxShadow: '0 6px 20px rgba(102, 126, 234, 0.6)',
                    },
                  }}
                >
                  登录系统
                </Button>
              </Grid>
            </Grid>
            
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Typography variant="caption" color="textSecondary">
                由专业团队提供技术支持
              </Typography>
            </Box>
          </StyledCard>
        </GradientBackground>

        <Snackbar
          open={this.state.show_message}
          autoHideDuration={4000}
          onClose={this.HandleCloseMessage}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <Alert severity={this.state.severity} variant="filled" sx={{ width: "100%" }}>
            {this.state.message_text}
          </Alert>
        </Snackbar>
      </>
    );
  }
}

Login.contextType = AuthContext;
export default Login;
