import axios from "axios";
import {createContext, ReactNode, useContext, useEffect, useState} from "react";
import {auth, authRegister, userUpdate, verifyToken} from "../api/Endpoints";
import {userDTO} from "../types/ApiResponses";

export type authContextType = {
    user: UserData | null;
    isAuthenticated: boolean;
    register: (email: string, password: string, name: string, lastname: string) => Promise<void>;
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
    email: string;
    role: string;
};

const defaultValues: authContextType = {
    user: null,
    isAuthenticated: false,
    register: async () => {
        throw new Error("Function not implemented.")
    },
    login: async () => {
        throw new Error("Function not implemented.")
    },
    logout: () => {
    },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
                    Authorization: `SmartPot-OAuth ${token}`,
                },
            });

            if (responseUser.data) {
                setUser({
                    authToken: token,
                    id: responseUser.data.id,
                    name: responseUser.data.name,
                    lastname: responseUser.data.lastname,
                    email: responseUser.data.email,
                    role: responseUser.data.role,
                });
                setIsAuthenticated(true);
            }
        } catch (err) {
            console.error("Error verifying token in API: " + verifyToken, err);
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
            const authToken = response.data.token;

            if (!authToken) {
                console.error("Error logging in: " + response);
                throw new Error("No token received from the server in API: " + auth);
            }

            const responseUser = await axios.get(verifyToken, {
                headers: {Authorization: `SmartPot-OAuth ${authToken}`},
            });

            const userData: UserData = {
                authToken,
                id: responseUser.data.id,
                name: responseUser.data.name,
                lastname: responseUser.data.lastname,
                email: responseUser.data.email,
                role: responseUser.data.role,
            };

            // Set user and token in state and localStorage
            setUser(userData);
            setIsAuthenticated(true);
            localStorage.setItem("authToken", authToken);
        } catch (err: any) {
            console.error("Login error:", err);
            try {
                setError(err.response.data.message || "An error occurred during login in API: " + auth);
            } catch {
                setError(err.message || "An error ocurred during login in API: " + auth);
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


    const register = async (email: string, password: string, name: string, lastname: string) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.post(authRegister, {
                email,
                password,
                name,
                lastname,
                role: 'USER'
            });

            const authToken = response.data.token;

            if (!authToken) {
                throw new Error("No token received from the server.");
            }

            const responseUser = await axios.get(verifyToken, {
                headers: {Authorization: `SmartPot-OAuth ${authToken}`},
            });

            const userData: UserData = {
                authToken,
                id: responseUser.data.id,
                name: responseUser.data.name,
                lastname: responseUser.data.lastname,
                email: responseUser.data.email,
                role: responseUser.data.role,
            };


            setUser(userData);
            setIsAuthenticated(true);
            localStorage.setItem("authToken", authToken);

        } catch (err: any) {
            console.error("Register error:", err);
            try {
                setError(err.response.data.message || "Error al registrar el usuario.");
            } catch {
                setError(err.message || "Error durante el registro.")
            }
        } finally {
            setLoading(false);
        }
    };

    const updateUser = async (userDTO: userDTO) => {
        setError(null);
        try {
            if (user != null) {
                setLoading(true)
                const response = await axios.put(`${userUpdate}${user.id}`, userDTO, {
                    headers: {
                        Authorization: `SmartPot-OAuth ${user.authToken}`,
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
    }

    const values: authContextType = {
        user,
        isAuthenticated,
        register,
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
