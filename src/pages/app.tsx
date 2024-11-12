import {createBrowserRouter, RouterProvider} from 'react-router-dom'
import Root from '../routes/root.tsx'

import '../assets/styles/app.css'
import ErrorPage from '../routes/error-page.tsx'
import StatusPanel from '../routes/statusPanel.tsx';
import HistoricalData from '../routes/historicalData.tsx';
import { AuthProvider } from '../context/AuthContext.tsx';
import Login from '../routes/login.tsx';

function App() {

    const router = createBrowserRouter([
        {
            path: "/login",
            element: <Login />,
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