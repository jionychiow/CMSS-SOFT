import React, { Component } from 'react';
import PublicPages from '../PublicPages/PublicPages';
import AuthContext from './AuthContext'
import AppMain from '../AppMain/Routes';
import { url } from '../Config';
import axios from 'axios';

class AuthProvider extends Component {
    constructor(props) {
        super(props);
        this.login = this.login.bind(this)
        this.logout = this.logout.bind(this)
        this.validateToken = this.validateToken.bind(this)
        
        // 从 localStorage 获取持久化的登录状态
        const storedToken = localStorage.getItem('token');
        const storedUserProfile = localStorage.getItem('user_profile');
        const isLoggedIn = !!storedToken;
        
        this.state = {
          closedSmallerSidebar: false,
          is_logged_in: isLoggedIn,
          user_profile: storedToken ? JSON.parse(storedUserProfile) : {},
          token: storedToken || "",
        };
      }
    
    componentDidMount() {
      // 组件挂载时验证令牌有效性
      if (this.state.token) {
        this.validateToken();
      }
    }
    
    async validateToken() {
      // 检查是否存在token，如果不存在则不执行请求
      if (!this.state.token) {
        console.warn('No token available, skipping token validation');
        return;
      }
      
      try {
        // 首先尝试使用原有API获取用户信息
        const response = await axios.get(url + '/api/v1/my-profile/', {
          headers: {
            'Authorization': "Token " + this.state.token
          }
        });
        // 如果原API有效，更新用户信息
        this.setState({
          ...this.state,
          is_logged_in: true,
          user_profile: response.data
        });
      } catch (error) {
        try {
          // 如果原API失败，尝试使用新的用户权限API
          const response = await axios.get(`${url}/api/user-management/user-permissions/`, {
            headers: {
              'Authorization': `Token ${this.state.token}`
            }
          });
          // 如果新API成功，更新用户信息
          this.setState({
            ...this.state,
            is_logged_in: true,
            user_profile: response.data
          });
        } catch (secondError) {
          // 如果两个API都失败，清除登录状态
          localStorage.removeItem('token');
          localStorage.removeItem('user_profile');
          this.setState({
            ...this.state,
            is_logged_in: false,
            token: "",
            user_profile: {}
          });
        }
      }
    }
    
    login(token,user_profile) {
      // 将登录信息存储到 localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user_profile', JSON.stringify(user_profile));
      this.setState({
        ...this.state,
        is_logged_in:true,
        token:token,
        user_profile:user_profile
      });
      
      // 额外获取最新用户权限信息以确保准确性
      this.fetchUpdatedUserInfo();
    }
    
    async fetchUpdatedUserInfo() {
      // 检查是否存在token，如果不存在则不执行请求
      if (!this.state.token) {
        console.warn('No token available, skipping user info fetch');
        return;
      }
      
      try {
        const response = await axios.get(`${url}/api/user-management/user-permissions/`, {
          headers: {
            'Authorization': `Token ${this.state.token}`
          }
        });
        // 更新用户信息
        this.setState({
          ...this.state,
          user_profile: response.data
        });
        // 同时更新localStorage
        localStorage.setItem('user_profile', JSON.stringify(response.data));
      } catch (error) {
        console.error('获取更新的用户信息失败:', error);
      }
    }
    
    logout() {
      // 清除 localStorage 中的登录信息
      localStorage.removeItem('token');
      localStorage.removeItem('user_profile');
      this.setState({
        ...this.state,
        is_logged_in:false, 
        token:"",
        user_profile:{}
      });
    }
    render() {
        return (
            <>
           
                <AuthContext.Provider value={this}>
                {!this.state.is_logged_in && 

                    <PublicPages ></PublicPages>
                    }
               

             {this.state.is_logged_in &&

              <>
             
              <AppMain />
              
              </>
           
            }
            </AuthContext.Provider>
             

            </>
        );
    }
}

export default AuthProvider;