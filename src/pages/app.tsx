import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Root from './routes/root.tsx'

import './App.css'
import ErrorPage from './error-page.tsx'
import PanelEstado from './routes/PanelEstado.tsx';
import DatosHistoricos from './routes/DatosHistoricos.tsx';

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
      <RouterProvider router={router} />
      {/* <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p> */}
    </>
  )
}

export default App