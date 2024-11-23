import { useAuthContext } from "../contexts/AuthContext"

export default function Profile() {

    const {user} = useAuthContext();

    return (
        <>
            This is the profile page! 
            Welcome {user?.name}
        </>
    )

}