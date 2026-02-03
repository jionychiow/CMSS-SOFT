import React, { Component } from 'react';
import Assets from './Assets/Assets';
import { Route, Routes ,Navigate} from 'react-router-dom';
import Maintenance from './Maintenance/Maintenance';
import Users from './Users/Users';
import Dashboards from './Dashboards/Dashboards'
import DashboardsCMMS from './Dashboards/DashboardsCMMS';
import AuthContext from '../AuthProvider/AuthContext';
import Faults from './Faults/Faults';
import TaskPlan from './TaskPlan/TaskPlan';
import AdvancedManagement from './Admin/AdvancedManagement/AdvancedManagement';
import Profile from './Profile/Profile';

class AppMain extends Component {
    render() {
        return (
            <>
          
           
            <Routes>
                    {/* Default route for all users */}
                    <Route path="/" element={
                        <Navigate to="/cmms/dashboards" replace /> 
                    } /> 
                    {/* Public routes available to all authenticated users */}
                    <Route path="/cmms/assets/*" Component={Assets} /> 
                    <Route path="/cmms/maintenance/*" Component={Maintenance} /> 
                    <Route path="/cmms/dashboards/*" Component={DashboardsCMMS} /> 
                    <Route path="/profile" Component={Profile} />
                    
                    {/* Admin-only routes */}
                    {this.context.state.user_profile?.type ==='Admin' &&
                    <>
                    <Route path="/admin/assets/*" Component={Assets} /> 
                    <Route path="/admin/users/*" Component={Users} /> 
                    <Route path="/admin/advanced" Component={AdvancedManagement} />
                    <Route path="/dashboards/*" Component={Dashboards} /> 
                    <Route path="/admin/faults/*" Component={Faults} />
                    <Route path="/cmms/task-plan" Component={TaskPlan} /> 
                    <Route path="*" Component={DashboardsCMMS} /> 
                    
                    </>
                    
                    }

                    {/* Fallback route */}
                    <Route path="*" element={
                        <Navigate to="/cmms/dashboards" replace /> 
                    } />
                    
                  
                  

                </Routes>
          
            
            </>
            
                
           
        );
    }
}
AppMain.contextType = AuthContext
export default AppMain;