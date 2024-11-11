import axios from "axios"
import { createContext, ReactNode, useContext, useState } from "react"

export type authContextType = {

    user: UserData,
    login: (email: string, password: string) => void,
    logout: () => void,

}

export type UserData = {
    authToken: string,
    id: string,
    name: string,
    lastname: string,
    role: string,
}

const defaultValues: authContextType = {
    user: {
        authToken: "",
        id: "",
        name: "",
        lastname: "",
        role: "",
    },
    login: function (): void {
        throw new Error("Function not implemented.")
    },
    logout: function (): void {
        throw new Error("Function not implemented.")
    }
}

const AuthContext = createContext<authContextType>(defaultValues);

export function useAuthContext() {
    return useContext(AuthContext);
}

// PROVIDER

type Props = {
    children: ReactNode
}


export function AuthProvider( { children }: Props ) {

    const [user, setUser] = useState<UserData>({
        authToken: "",
        id: "",
        name: "",
        lastname: "",
        role: "",
    });

    const login = async (email: string, password: string) => {

        console.log("Trying to login;")

        let authToken: string = "";
        await axios.post("https://api-smartpot.onrender.com/auth/login",
            {
                email, 
                password 
            }
        )
        .then(response => {
            authToken = response.data;
        })
        .catch( e => {
            console.log("Login error: ")
            throw e;
        })

        console.log("Received token: " + authToken)

        if (authToken != "") {
            let responseUser: UserData = {
                authToken: "",
                id: "",
                name: "",
                lastname: "",
                role: "",
            };

            console.log("Verify token...")

            await axios.get("https://api-smartpot.onrender.com/auth/verify", {
                headers: {
                    Authorization: "Bearer " + authToken,
                }
            })
            .then(response => {
                console.log(response.data);
                responseUser = response.data;
            })
            .catch(e => {
                console.log("No se pudo obtener el usuario, Err: " + e)
            })

            responseUser.authToken = authToken;
            setUser(responseUser)
        }

    }

    const logout = () => {
        setUser({
            authToken: "",
            id: "",
            name: "",
            lastname: "",
            role: "",
        });
        localStorage.removeItem("authToken");
        throw new Error("Function not implemented.")
    }

    const values: authContextType = {
        user,
        login,
        logout,
    }

    return ( 
        <>
            <AuthContext.Provider value={values}>
                {children}
            </AuthContext.Provider>
        </>
    )
}