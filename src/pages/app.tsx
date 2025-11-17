import {createBrowserRouter, RouterProvider} from 'react-router-dom'
import Root from '../routes/root.tsx'

import '../shared/styles/app.css'
import ErrorPage from '../routes/errorPage.tsx'

import StatusPanel from '../features/dashboard/pages/statusPanel.tsx';
import HistoricalData from '../features/historical-data/pages/historicalData.tsx';
import {AuthProvider} from '../features/auth/contexts/AuthContext.tsx';
import Login from '../features/auth/pages/login.tsx';
import Register from '../features/auth/pages/register.tsx';
import ForgotPassword from "../features/auth/pages/forgotPassword.tsx";
import Profile from "../features/profile/pages/profile.tsx";
import Sensors from "../routes/sensors.tsx";
import Config from "../routes/Config.tsx";

function App() {

    const router = createBrowserRouter([
        {
            path: "/auth/login",
            element: <Login/>,
            errorElement: <ErrorPage/>
        },
        {
            path: "/auth/register",
            element: <Register/>,
            errorElement: <ErrorPage/>
        },
        {
            path: "/auth/forgotPassword",
            element: <ForgotPassword/>,
            errorElement: <ErrorPage/>
        },

        {
            id: "app",
            path: "/",
            element: <Root/>,
            errorElement: <ErrorPage/>,
            children: [
                {
                    path: "/panel",
                    element: <StatusPanel/>
                },
                {
                    path: "/historial",
                    element: <HistoricalData/>
                },
                {
                    path: "/perfil",
                    element: <Profile/>
                },
                {
                    path: "/sensores",
                    element: <Sensors/>
                },
                {
                    path: "/config",
                    element: <Config/>
                }


            ],
        },
    ]);

    return (
        <>
            <AuthProvider>
                <RouterProvider router={router}/>
            </AuthProvider>
        </>
    )
}

export default App