import './App.css';
import 'react-toastify/dist/ReactToastify.css';

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import { BrowserRouter } from "react-router-dom";
import AuthProvider from './AuthProvider/AuthProvider';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import DashboardLayout from "./Layout/AppLayout";
import AppRoutes from "./AppMain/Routes"; // your route definitions

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#0288d1",
    },
  }
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true
        }}
      >
        <AuthProvider>

          <DashboardLayout>
            <AppRoutes />
          </DashboardLayout>

        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
