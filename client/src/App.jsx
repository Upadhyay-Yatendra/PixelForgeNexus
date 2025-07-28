import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ProjectDetails from './pages/ProjectDetails';
import AccountSettings from './pages/AccountSettings';
import UserManagement from './pages/UserManagement';
import CreateProject from './pages/CreateProject';          // stub – see below
import NotFound from './pages/NotFound';

const queryClient = new QueryClient({
  defaultOptions:{ queries:{ retry:1, refetchOnWindowFocus:false } }
});

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-32 w-32 rounded-full border-b-2 border-blue-600"/>
      </div>
    );

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace/> : <Login/>}/>
      <Route path="/" element={<ProtectedRoute><Layout/></ProtectedRoute>}>
        <Route index element={<Navigate to="dashboard" replace/>}/>
        <Route path="dashboard" element={<Dashboard/>}/>
        <Route path="projects/:id" element={<ProjectDetails/>}/>
        <Route path="account" element={<AccountSettings/>}/>

        {/* role-gated */}
        <Route path="users"
               element={<ProtectedRoute requiredRole="admin"><UserManagement/></ProtectedRoute>}/>
        <Route path="projects/create"
               element={<ProtectedRoute requiredRole={['admin','project_lead']}><CreateProject/></ProtectedRoute>}/>
      </Route>
      <Route path="*" element={<NotFound/>}/>
    </Routes>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router><AppRoutes/></Router>
        <Toaster position="top-right"
                 toastOptions={{duration:4000,style:{background:'#363636',color:'#fff'}}}/>
      </AuthProvider>
    </QueryClientProvider>
  );
}
