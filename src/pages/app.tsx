import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Root from '../routes/root.tsx'

import '../assets/styles/app.css'
import ErrorPage from '../routes/error-page.tsx'
import PanelEstado from '../routes/PanelEstado.tsx';
import DatosHistoricos from '../routes/DatosHistoricos.tsx';
import { AuthProvider } from '../context/AuthContext.tsx';

function App() {

  const router = createBrowserRouter([
    {
      path: "/",
      element: <Root />,
      errorElement: <ErrorPage />,
      children: [
        {
          path: "/panel",
          element: <PanelEstado />
        },
        {
          path: "/historial",
          element: <DatosHistoricos />
        }
      ],
    },


  ]);

  return (
    <>

    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>

    </>
  )
}

export default App