// main.tsx (updated with new route)
import * as React from "react";
import * as ReactDOM from "react-dom/client";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./store";
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

const router = createBrowserRouter([
  {
    Component: App,
    children: [
      {
        path: "",
        Component: Layout,
        children: [
          {
            path: "",
            // Component: OverviewAnalyticsView,
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
            path: "upload-excel", // New route for the excel upload page
            Component: ExcelUploadPage,
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
            path: "Payments",
            Component: PaymentPage,
          },
          {
            path: "UserPermissions",
            Component: UserPermissions,
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
      {
        path: "*",
        Component: NotFoundView,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider store={store}>
      <HelmetProvider>
        <RouterProvider router={router} />
      </HelmetProvider>
    </Provider>
  </React.StrictMode>
);
