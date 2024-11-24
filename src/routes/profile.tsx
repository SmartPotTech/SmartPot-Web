import { useAuthContext } from "../contexts/AuthContext"

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
            This is the profile page! 
            Welcome {JSON.stringify(user)}

            Want to update? click this button!
            <button 
                className="btn btn-primary"
                onClick={handleUpdate}
            >update!</button>
        </>
    )

}