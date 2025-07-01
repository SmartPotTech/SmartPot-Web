import {FormEvent, SyntheticEvent, useEffect, useState} from "react";
import {useAuthContext} from "../contexts/AuthContext";
import {useNavigate} from "react-router-dom";
import logo from "../assets/images/lechuga.png";
import Loading from "../components/Loading";
import "../assets/styles/login.css"


export default function Login() {

    const {login, isAuthenticated, error, loading} = useAuthContext();
    let navigate = useNavigate();

    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");

    useEffect(() => {
        console.log(isAuthenticated)
        if (isAuthenticated) {
            navigate("/panel")
        }
    }, [isAuthenticated]);

    const handleChangeEmail = (e: FormEvent<HTMLInputElement>) => {
        setEmail(e.currentTarget.value);
    };

    const handleChangePassword = (e: FormEvent<HTMLInputElement>) => {
        setPassword(e.currentTarget.value);
    }

    const handleSubmit = async (e: SyntheticEvent) => {
        e.preventDefault();

        await login(email, password)
            .then(r => console.log(r))
            .catch(error => console.log(error));
    }

    if (loading) return (<Loading/>);

    return (
        <>
            {/*
          This example requires updating your template:
  
          ```
          <html class="h-full bg-white">
          <body class="h-full">
          ```
        */}
            <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                    <img
                        alt="smartpot"
                        src={logo}
                        className="mx-auto h-10 w-auto"
                    />
                    <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900">
                        Sign in to your account
                    </h2>
                </div>

                <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                    <form
                        action="#"
                        method="POST"
                        className="space-y-6"
                        onSubmit={handleSubmit}
                    >
                        <div>
                            <label htmlFor="email" className="block text-sm/6 font-medium text-gray-900">
                                Email address
                            </label>
                            <div className="mt-2">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    autoComplete="email"
                                    className="bg-white font-semibold p-2 block w-full rounded-md border-0 py-1.5 text-gray-800 shadow-sm ring-1 ring-inset ring-green-300 placeholder:text-green-400 focus:ring-2 focus:ring-inset focus:ring-green-300 sm:text-sm/6"
                                    value={email}
                                    onChange={handleChangeEmail}
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between">
                                <label htmlFor="password" className="block text-sm/6 font-medium text-gray-900">
                                    Password
                                </label>
                                <div className="text-sm">
                                    <a href="#" className="font-semibold text-green-600 hover:text-green-400">
                                        Forgot password?
                                    </a>
                                </div>
                            </div>
                            <div className="mt-2">
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    autoComplete="current-password"
                                    className="bg-white font-semibold p-2 block w-full rounded-md border-0 py-1.5 text-gray-800 shadow-sm ring-1 ring-inset ring-green-300 placeholder:text-green-400 focus:ring-2 focus:ring-inset focus:ring-green-300 sm:text-sm/6"
                                    value={password}
                                    onChange={handleChangePassword}
                                />
                            </div>
                        </div>
                        <div>
                            <p className="mt-10 text-center text-sm/6 text-red-500">
                                {error}
                            </p>
                        </div>
                        <div>
                            <button
                                type="submit"
                                className="bg-main-colour flex w-full justify-center rounded-md px-3 py-1.5 text-sm/6 font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                            >
                                {loading ? ("Loading") : ("Sign in")}
                            </button>
                        </div>
                    </form>

                    <p className="mt-10 text-center text-sm/6 text-gray-500">
                        Not a exclusive member of smartpot 🤢?{' '}
                        <a href="#" className="font-semibold text-green-600 hover:text-green-500">
                            Free 15-day trial for the poor!
                        </a>
                    </p>
                </div>
            </div>
        </>
    )
}
