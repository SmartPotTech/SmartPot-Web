import { useAuthContext } from "../contexts/AuthContext"
import "../assets/styles/Profile.css"
export default function Profile() {

    const {user, updateUser } = useAuthContext();

    const handleUpdate = () => {
        if (user != null) {
            updateUser({
                name: "Pedro",
                lastname: "$",
                email: null,
                password: null,
                role: null
            })
        }
    }

    return (
        <>
                <main className="mainContent">
                    <div className="cd__main">
                        <div className="profile-page">
                            <div className="content">
                                <div className="content__cover">
                                    <div className="content__avatar"></div>
                                    <div className="content__bull">
                                        <span></span><span></span><span></span><span></span><span></span>
                                    </div>
                                </div>

                                <div className="content__title">
                                    <h1>{user?.name} {user?.lastname}</h1><span>Colombia</span>
                                </div>
                                <div className="content__description">
                                    <p>{user?.email}</p>
                                </div>
                                <ul className="content__list">
                                    <li><span>1</span>Cultivos</li>
                                </ul>
                                <div className="content__button">
                                    <a className="button" href="#">
                                        <div className="button__border"></div>
                                        <div className="button__bg"></div>
                                        <p className="button__text">Editar perfil</p>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                </main>
        </>
    )

}