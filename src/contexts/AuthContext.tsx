import axios from "axios";
import {createContext, ReactNode, useContext, useEffect, useState} from "react";
import {auth, userUpdate, verifyToken} from "../api/Endpoints";
import { userDTO } from "../types/ApiResponses";

export type authContextType = {
    user: UserData | null;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    updateUser: (user: userDTO) => void;
    loading: boolean;
    error: string | null;
};

export type UserData = {
    authToken: string;
    id: string;
    name: string;
    lastname: string;
    role: string;
    email: string;
};

const defaultValues: authContextType = {
    user: null,
    isAuthenticated: false,
    login: async () => {
        throw new Error("Function not implemented.")
    },
    logout: () => {
    },
    updateUser: (_userDTO: userDTO) => {
    },
    loading: false,
    error: null,
};

const AuthContext = createContext<authContextType>(defaultValues);

export function useAuthContext() {
    return useContext(AuthContext);
}

type Props = {
    children: ReactNode;
}

export function AuthProvider({children}: Props) {
    const [user, setUser] = useState<UserData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

    // Load user from localStorage if available
    useEffect(() => {
        setLoading(true);
        const storedToken = localStorage.getItem("authToken");
        if (storedToken) {
            verifyStoredToken(storedToken);
        } else {
            setLoading(false)
        }
    }, []);

    // Verify token from localStorage
    const verifyStoredToken = async (token: string) => {
        try {
            setLoading(true);
            const responseUser = await axios.get(verifyToken, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (responseUser.data) {
                setUser({
                    authToken: token,
                    id: responseUser.data.id,
                    name: responseUser.data.name,
                    lastname: responseUser.data.lastname,
                    role: responseUser.data.role,
                    email: responseUser.data.email,
                });
                setIsAuthenticated(true);
            }
        } catch (err) {
            console.error("Error verifying token:", err);
            logout(); // Logout if token verification fails
        } finally {
            setLoading(false);
        }
    };

    const login = async (email: string, password: string) => {
        setLoading(true);
        setError(null); // Reset errors on each attempt
        try {
            const response = await axios.post(auth, {email, password});
            const authToken = response.data;

            if (!authToken) {
                throw new Error("No token received from the server.");
            }

            const responseUser = await axios.get(verifyToken, {
                headers: {Authorization: `Bearer ${authToken}`},
            });

            const userData: UserData = {
                authToken,
                id: responseUser.data.id,
                name: responseUser.data.name,
                lastname: responseUser.data.lastname,
                role: responseUser.data.role,
                email: responseUser.data.email,
            };

            // Set user and token in state and localStorage
            setUser(userData);
            setIsAuthenticated(true);
            localStorage.setItem("authToken", authToken);
        } catch (err: any) {
            console.error("Login error:", err);
            try {
                setError(err.response.data.message || "An error occurred during login.");
            } catch {
                setError(err.message || "An error ocurred during login.")
            }
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem("authToken");
    };

   /* const updateUser = async (userDTO: userDTO) => {
        setError(null);
        try {
            if (user != null) {
                setLoading(true)
                let response = await axios.put(`${userUpdate}${user.id}`, userDTO, {
                    headers: {
                        Authorization: `Bearer ${user.authToken}`,
                    },
                })
                
                setUser(
                    response.data as UserData
                )
            }
        } catch (err) {
            console.log("Error updating user: " + err)
        } finally {
            setLoading(false)
        }
    }*/
    const updateUser = async (userDTO: userDTO) => {
        setError(null);
        if (!user?.authToken) {
            console.error("No hay token de autenticación disponible.");
            setError("No estás autenticado.");
            return;
        }

        
        const hasEmailChanged = user.email !== userDTO.email;

        const updatedUserDTO = { ...userDTO };
        if (!hasEmailChanged) {
            delete updatedUserDTO.email;
        }

        try {
            setLoading(true);
            const response = await axios.put(`${userUpdate}${user.id}`, updatedUserDTO, {
                headers: {
                    Authorization: `Bearer ${user.authToken}`,
                },
            });

            setUser(response.data as UserData);
        } catch (err: any) {
            if (err.response?.status === 401) {
                console.error("Error 401: No autorizado.");
                setError("Tu sesión ha expirado. Por favor, inicia sesión nuevamente.");
                logout();
            } else {
                console.error("Error actualizando usuario:", err);
                setError(err.response?.data?.message || "Ocurrió un error al actualizar.");
            }
        } finally {
            setLoading(false);
        }
    };


    const values: authContextType = {
        user,
        isAuthenticated,
        login,
        logout,
        loading,
        updateUser,
        error,
    };

    return (
        <AuthContext.Provider value={values}>
            {children}
        </AuthContext.Provider>
    );
}
