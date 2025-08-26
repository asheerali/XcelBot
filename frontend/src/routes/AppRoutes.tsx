import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';

// Import your page components
import UploadExcel from './pages/UploadExcel';
import ManageReports from './pages/ManageReports';
import ProductMix from './pages/ProductMix';
import Financials from './pages/Financials';
import Saleswide from './pages/Saleswide';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import MasterFile from './pages/MasterFile';
import OrderIQDashboard from './pages/OrderIQDashboard';
import StoreSummaryProduction from './pages/StoreSummaryProduction';
import SummaryFinancialDashboard from './pages/SummaryFinancialDashboard';
import Reports from './pages/Reports';
import Payments from './pages/Payments';
import FileManagement from './pages/FileManagement';
import HelpCenter from './pages/HelpCenter';
import CompanyLocationManager from './pages/CompanyLocationManager';
import ProfileInfo from './pages/ProfileInfo';
import Dashboard from './pages/Dashboard';
import SignIn from './pages/SignIn';

// Your main App component with routing
const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes (no protection needed) */}
      <Route path="/sign-in" element={<SignIn />} />
      
      {/* Protected routes - wrapped with ProtectedRoute */}
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      
      {/* INSIGHTiQ Routes */}
      <Route 
        path="/upload-excel" 
        element={
          <ProtectedRoute>
            <UploadExcel />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/manage-reports" 
        element={
          <ProtectedRoute>
            <ManageReports />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/Productmix" 
        element={
          <ProtectedRoute>
            <ProductMix />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/Financials" 
        element={
          <ProtectedRoute>
            <Financials />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/Saleswide" 
        element={
          <ProtectedRoute>
            <Saleswide />
          </ProtectedRoute>
        } 
      />
      
      {/* ORDERiQ Routes */}
      <Route 
        path="/AnalyticsDashboard" 
        element={
          <ProtectedRoute>
            <AnalyticsDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/MasterFile" 
        element={
          <ProtectedRoute>
            <MasterFile />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/OrderIQDashboard" 
        element={
          <ProtectedRoute>
            <OrderIQDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/StoreSummaryProduction" 
        element={
          <ProtectedRoute>
            <StoreSummaryProduction />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/SummaryFinancialDashboard" 
        element={
          <ProtectedRoute>
            <SummaryFinancialDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/Reports" 
        element={
          <ProtectedRoute>
            <Reports />
          </ProtectedRoute>
        } 
      />
      
      {/* Always Accessible Routes */}
      <Route 
        path="/Payments" 
        element={
          <ProtectedRoute>
            <Payments />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/FileManagement" 
        element={
          <ProtectedRoute>
            <FileManagement />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/HelpCenter" 
        element={
          <ProtectedRoute>
            <HelpCenter />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/CompanyLocationManager" 
        element={
          <ProtectedRoute>
            <CompanyLocationManager />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/profile-info" 
        element={
          <ProtectedRoute>
            <ProfileInfo />
          </ProtectedRoute>
        } 
      />
      
      {/* Catch-all route for unmatched paths */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;