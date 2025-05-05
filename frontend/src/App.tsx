import * as React from "react";

import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";

import NewspaperIcon from "@mui/icons-material/Newspaper";

import { Outlet, useNavigate } from "react-router-dom";
// import { AppProvider } from "@toolpad/core/react-router-dom";
import { AppProvider } from '@toolpad/core';

import { createTheme } from "@mui/material/styles";
import logoMidPng from "./assets/it-logo-mid.png";
import { Session, type Navigation } from "@toolpad/core/AppProvider";
import { SessionContext } from "./SessionContext";
import * as agentService from "./services/agentService";
import * as productService from "./services/productService";
import * as customerService from "./services/customerService";
import * as orderService from "./services/orderService";

const NAVIGATION: Navigation = [
  {
    title: "Manage Reports",
    segment: "manage-reports",
    icon: <ShoppingCartIcon />,
  },
  {
    title: "Setup",
    segment: "manage-reports",
    icon: <NewspaperIcon />,
  },

  {
    title: "Setup",
    segment: "manage-reports",
    icon: <NewspaperIcon />,
  },

  // {
  //   title: "Advance",
  //   icon: <ShoppingCartIcon />,
  //   children: [
  //     {
  //       segment: "blogs",
  //       title: "Permissions",
  //       icon: <NewspaperIcon />,
  //     },

  //     {
  //       segment: "agents",
  //       title: "Roles and Hierarchies",
  //       icon: <PeopleAltIcon />,
  //     },
  //     {
  //       segment: "Action Plan Settings",
  //       title: "Contacts",
  //       icon: <ContactsIcon />,
  //     },
  //   ],
  // },
];
const logo = <img className="logo" alt="" />;
const BRANDING = {
  title: "Audit IQ",
  logo,
};

const theme = createTheme({
  cssVariables: {
    colorSchemeSelector: "data-toolpad-color-scheme",
  },
  colorSchemes: { light: true, dark: true },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 600,
      lg: 1408,
      xl: 1530,
    },
  },
});

agentService.init();
customerService.init();
productService.init();
orderService.init();

export default function App() {
  const [session, setSession] = React.useState<Session | null>(null);
  const navigate = useNavigate();

  const signIn = React.useCallback(() => {
    navigate("/sign-in");
  }, [navigate]);

  const signOut = React.useCallback(() => {
    // setSession(null);
    navigate("/sign-in");
  }, [navigate]);

  const sessionContextValue = React.useMemo(
    () => ({ session, setSession }),
    [session, setSession]
  );

  return (
    <SessionContext.Provider value={sessionContextValue}>
      <AppProvider
        theme={theme}
        navigation={NAVIGATION}
        branding={BRANDING}
        session={session}
        authentication={{ signIn, signOut }}
      >
        <Outlet />
      </AppProvider>
    </SessionContext.Provider>
  );
}
