// main.tsx (updated with new route)
import * as React from "react";
import * as ReactDOM from "react-dom/client";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import FileManagementPage from "./pages/FileManagementPage";

import { Provider } from "react-redux";
// import { store } from "./store";
import { store, persistor } from "./store"; // UPDATED
import { PersistGate } from "redux-persist/integration/react"; // NEW
import App from "./App";
import Layout from "./layouts/Dashboard";
import ManageReports from "./pages/ManageReports";
import { OverviewAnalyticsView } from "./pages/OverviewAnalyticsView";
import { NotFoundView } from "./pages/NotFoundView";
import { HelmetProvider } from "react-helmet-async";
import { ComingSoon } from "./pages/ComingSoon";
import ExcelImport from "./components/ExcelImport";
import ExcelUploadPage from "./pages/ExcelUploadPage"; // Import the new upload page
import { HelpCenter } from "./pages/HelpCenter";
import { Faq } from "./pages/Faq";
import { ContactUs } from "./pages/ContactUs";
import { ContactTeam } from "./pages/ContactTeam";
import PaymentPage from "./pages/PaymentPage";
import UserPermissions from "./pages/UserPermissions";
import Financials from "./pages/Financials";
import SalesDashboard from "./pages/SalesDashboard";
import ProductMixDashboard from "./pages/ProductMixDashboard";
import DateRangeSelector from "./components/DateRangeSelector";
import SalesSplitDashboard from "./components/SalesSplitDashboard";
<<<<<<< HEAD
=======
import ComprehensiveFinancialDashboard from "./components/ComprehensiveFinancialDashboard";
import HomePage from "./pages/HomePage";
import SignInView from "./pages/SignInView";
import SignUpView from "./pages/SignUpView";
import ForgotPasswordView from "./pages/ForgotPasswordView";
import ResetPasswordView from "./pages/ResetPasswordView";
import CompanyLocationManager from "./pages/CompanyLocationManager";
import AnalyticsDashboard from "./pages/AnalyticsDashboard"; // Import the AnalyticsDashboard component
import MasterFile from "./pages/MasterFile";
import FiltersOrderIQ from "./components/FiltersOrderIQ";
import SummaryFinancialDashboard from "./pages/SummaryFinancialDashboard";
import OrderIQDashboard from "./pages/OrderIQDashboard"; // Import the OrderIQDashboard component
import StoreSummaryProduction from "./pages/StoreSummaryProduction"; // Import the StoreSummaryProduction component
import Reports from "./pages/Reports";
>>>>>>> integrations_v41
const router = createBrowserRouter([
  {
    path: "/sign-in",
    Component: SignInView,
  },
  {
    path: "/sign-up",
    Component: SignUpView,
  },
  {
    path: "/forgot-password",
    Component: ForgotPasswordView,
  },
  {
    path: "/reset-password",
    Component: ResetPasswordView,
  },
  {
    path: "HomePage",
    Component: HomePage,
  },
  {
    Component: App,
    children: [
      {
        path: "",
        Component: Layout,
        children: [
          {
            path: "",
            Component: () => <Navigate to="/manage-reports" replace />,
          },
          {
            path: "manage-reports",
            Component: ExcelImport,
          },
          {
            path: "Financials",
            Component: Financials,
          },
          {
            path: "Saleswide",
            Component: SalesDashboard,
          },
<<<<<<< HEAD
           {
            path: "Productmix",
            Component: ProductMixDashboard,
          },
           {
            path: "SalesSplitDashboard",
            Component: SalesSplitDashboard,
          },
           {
            path: "daterange",
            Component: DateRangeSelector,
          },
          
          {
            path: "upload-excel", // New route for the excel upload page
=======
          {
            path: "Productmix",
            Component: ProductMixDashboard,
          },
          {
            path: "SalesSplitDashboard",
            Component: SalesSplitDashboard,
          },
          {
            path: "AnalyticsDashboard",
            Component: AnalyticsDashboard,
          },
          {
            path: "MasterFile",
            Component: MasterFile,
          },
          {
            path: "StoreSummaryProduction",
            Component: StoreSummaryProduction,
          },
          {
            path: "Reports",
            Component: Reports,
          },

          {
            path: "daterange",
            Component: DateRangeSelector,
          },
          {
            path: "ComprehensiveFinancialDashboard",
            Component: ComprehensiveFinancialDashboard,
          },
          {
            path: "upload-excel",
>>>>>>> integrations_v41
            Component: ExcelUploadPage,
          },
          {
            path: "FileManagement",
            Component: FileManagementPage,
          },
          {
            path: "HelpCenter",
            Component: HelpCenter,
          },
          {
            path: "faq",
            Component: Faq,
          },
          {
            path: "ContactUs",
            Component: ContactUs,
          },
          {
            path: "ContactTeam",
            Component: ContactTeam,
          },
          {
            path: "CompanyLocationManager",
            Component: CompanyLocationManager,
          },
          {
            path: "Payments",
            Component: PaymentPage,
          },
          {
            path: "UserPermissions",
            Component: UserPermissions,
          },
          {
            path: "FiltersOrderIQ",
            Component: FiltersOrderIQ,
          },
          {
            path: "SummaryFinancialDashboard",
            Component: SummaryFinancialDashboard,
          },
          {
            path: "OrderIQDashboard",
            Component: OrderIQDashboard, // Assuming you have this component
          },

          {
            path: "ComingSoon",
            Component: ComingSoon,
          },
          {
            path: "*",
            Component: NotFoundView,
          },
        ],
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        {" "}
        {/* NEW */}
        <HelmetProvider>
          <RouterProvider router={router} />
        </HelmetProvider>
      </PersistGate>
    </Provider>
  </React.StrictMode>
);
