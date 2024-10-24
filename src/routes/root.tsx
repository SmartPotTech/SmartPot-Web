import { Link, Outlet } from "react-router-dom";
import "../assets/styles/root.css"

export default function Root() {
    return (
      <>
        <div id="sidebar" className="sidebar">

          <nav>
            <ul>
              <li className="item">
                <Link to={`panel`}>Panel de Estado</Link>
              </li>
              <li className="item">
                <Link to={`historial`}>Datos Historicos</Link>
              </li>
            </ul>
          </nav>

        </div>
        <div id="detail" className="main-content">
          <Outlet />
        </div>
      </>
    );
  }