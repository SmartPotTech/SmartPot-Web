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

export type userDTO = {
    name: string,
    lastname: string,
    email: string | null,
    password: string | null,
    role: string | null
}
