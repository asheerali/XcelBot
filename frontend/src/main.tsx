import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Provider } from 'react-redux'; // Add Redux Provider import
import { store } from './store'; // Import your Redux store
import App from './App';
import Layout from './layouts/Dashboard';
import ManageReports from "./pages/ManageReports";
import { OverviewAnalyticsView } from './pages/OverviewAnalyticsView';
import { NotFoundView } from './pages/NotFoundView';
import { HelmetProvider } from 'react-helmet-async';
import { ComingSoon } from './pages/ComingSoon';
import ExcelImport from './components/ExcelImport';
import { HelpCenter } from './pages/HelpCenter';
import { Faq } from './pages/Faq';
import { ContactUs } from './pages/ContactUs';
import { ContactTeam } from './pages/ContactTeam';
import PaymentPage from './pages/PaymentPage';
import UserPermissions from './pages/UserPermissions';

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
            path: 'HelpCenter',
            Component: HelpCenter,
          },
          {
            path: 'faq',
            Component: Faq,
          },
          {
            path: 'ContactUs',
            Component: ContactUs,
          },
          {
            path: 'ContactTeam',
            Component: ContactTeam,
          },
          {
            path: 'Payments',
            Component: PaymentPage,
          },
          {
            path: 'UserPermissions',
            Component: UserPermissions,
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
    {/* Add Redux Provider wrapping everything */}
    <Provider store={store}>
      <HelmetProvider>
        <RouterProvider router={router} />
      </HelmetProvider>
    </Provider>
  </React.StrictMode>
);