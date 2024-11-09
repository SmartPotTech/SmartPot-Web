import { Link, Outlet } from "react-router-dom";
import "../assets/styles/root.css"
import SessionBar from "../components/SessionBar";

export default function Root() {
  return (
    <>
      <div className="content">
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

        <SessionBar />
        <div id="detail" className="mainContent">


          <Outlet />
        </div>
      </div>
    </>
  );
}