import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './App';
import Layout from './layouts/Dashboard';
import ManageReports from "./pages/ManageReports";
import { OverviewAnalyticsView } from './pages/OverviewAnalyticsView';
import { NotFoundView } from './pages/NotFoundView';
import { HelmetProvider } from 'react-helmet-async';
import { ComingSoon } from './pages/ComingSoon';
import ExcelImport from './pages/ExcelImport';
const router = createBrowserRouter([
  {
    Component: App,
    children: [
      {
        path: '',
        Component: Layout,
        children: [
          {
            path: '',
            Component: OverviewAnalyticsView,
          },
        
          {
            path: 'manage-reports',
            Component: ExcelImport,
         
          },
         
       
          {
            path: 'ComingSoon',
            Component: ComingSoon,
          },  
          {
            path: '*',
            Component: NotFoundView
          }
        ]
      },
    
      {
        path: '*',
        Component: NotFoundView
      }
    ],
  },
]);




ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HelmetProvider >
      <RouterProvider router={router} />
    </HelmetProvider>
  </React.StrictMode>
);
