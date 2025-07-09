import {createBrowserRouter, RouterProvider} from 'react-router-dom'
import Root from '../routes/root.tsx'

import '../assets/styles/app.css'
import ErrorPage from '../routes/errorPage.tsx'
import StatusPanel from '../routes/statusPanel.tsx';
import HistoricalData from '../routes/historicalData.tsx';
import {AuthProvider} from '../contexts/AuthContext.tsx';
import Login from '../routes/login.tsx';
import Register from '../routes/register.tsx';
import Profile from "../routes/profile.tsx";


function App() {

    const router = createBrowserRouter([
        {
            path: "/auth/login",
            element: <Login />,
            errorElement: <ErrorPage/>
        },
        {
            path: "/auth/register",
            element: <Register />,
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