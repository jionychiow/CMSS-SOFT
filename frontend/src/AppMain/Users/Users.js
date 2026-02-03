import React, { Component } from 'react';
import { Route, Routes } from 'react-router-dom';
import UserManagement from './UserManagement/UserManagement';
import UserManagementLayout from '../../Layout/UserManagementLayout';

class Users extends Component {
    render() {
        return (
            <UserManagementLayout>
            <Routes>
                    <Route path="*" Component={UserManagement} /> 

                </Routes>
            </UserManagementLayout>
        );
    }
}

export default Users;