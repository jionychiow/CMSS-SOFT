import React, { Component } from 'react';
import { Route, Routes } from 'react-router-dom';
import MaintenanceDashboard from './MaintenanceDashboard';
import MaintenanceRecords from './MaintenanceTableNew/MaintenanceTable';
import PhaseShiftMaintenanceRecords from './PhaseShiftMaintenanceRecords';
import MaintenanceSelection from './MaintenanceSelection';
import MaintenanceManuals from './MaintenanceManuals';
import MaintenanceCases from './MaintenanceCases';

class Maintenance extends Component {
    render() {
        return (
            <Routes>
                <Route path="/" element={<MaintenanceDashboard />} />
                <Route path="/dashboard" element={<MaintenanceDashboard />} />
                <Route path="/records" element={<MaintenanceSelection />} />
                <Route path="/records/*" element={<MaintenanceSelection />} />
                <Route path="/phase-shift-records" element={<PhaseShiftMaintenanceRecords />} />
                <Route path="/phase-shift-records/*" element={<PhaseShiftMaintenanceRecords />} />
                <Route path="/manuals/*" element={<MaintenanceManuals />} />
                <Route path="/cases/*" element={<MaintenanceCases />} />
                <Route path="*" element={<MaintenanceDashboard />} />
            </Routes>
        );
    }
}

export default Maintenance;