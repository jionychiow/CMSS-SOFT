import React, { Component } from 'react';
import { Route, Routes } from 'react-router-dom';
import MaintenanceDashboard from '../Maintenance/MaintenanceDashboard';
import AppLayout from "../../Layout/AppLayout";
class Dashboards extends Component {
    render() {
        return (
            <AppLayout>
            <Routes>
                  
                    <Route path="/maintenance" Component={MaintenanceDashboard} /> 
                    <Route path="*" Component={MaintenanceDashboard} /> 

                </Routes>
                
            </AppLayout>
        );
    }
}

export default Dashboards;