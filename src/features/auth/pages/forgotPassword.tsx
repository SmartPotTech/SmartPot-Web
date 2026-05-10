import React, {FormEvent, useEffect, useState} from "react";
import {useAuthContext} from "../contexts/AuthContext.tsx";
import {useNavigate} from "react-router-dom";
import Loading from "../../../shared/components/ui/Loading.tsx"
import axios from "axios";
import {forgotPassword} from "../api/endpoints";

const logo = "/lechuga.png";

export default function ForgotPassword() {
    const {isAuthenticated, loading: authLoading} = useAuthContext();
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (isAuthenticated) {
            navigate("/panel");
        }
    }, [isAuthenticated]);

    const handleChangeEmail = (e: FormEvent<HTMLInputElement>) => {
        setEmail(e.currentTarget.value);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await axios.post(forgotPassword, {email});
            setSuccess(true);
        } catch (err: unknown) {
            const message =
                axios.isAxiosError(err) && err.response?.data?.message
                    ? String(err.response.data.message)
                    : err instanceof Error
                        ? err.message
                        : "An error occurred";
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    if (authLoading) return <Loading/>;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-page-background">
            <div className="relative w-full max-w-md bg-white rounded-2xl p-8 shadow-xl">
                <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                    <h1 className="text-center text-2xl/9 font-bold tracking-tight text-gray-900">
                        <img alt="smartpot" src={logo} className="mx-auto h-10 w-auto"/>{" "}
                        SmartPot
                    </h1>
                    <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900">
                        Reset Password
                    </h2>
                </div>

                <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                    {success ? (
                        <div className="text-center">
                            <p className="text-sm text-gray-600">
                                If an account exists for <span className="font-semibold">{email}</span>,
                                you will receive a password reset link shortly.
                            </p>
                            <a
                                href="/auth/login"
                                className="mt-6 inline-block font-semibold text-green-600 hover:text-green-500"
                            >
                                Back to sign in
                            </a>
                        </div>
                    ) : (
                        <form
                            action="#"
                            method="POST"
                            className="space-y-6"
                            onSubmit={handleSubmit}
                        >
                            <div>
                                <label
                                    htmlFor="email"
                                    className="block text-sm/6 font-medium text-gray-900"
                                >
                                    Email address
                                </label>
                                <div className="mt-2">
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        required
                                        autoComplete="email"
                                        className="bg-white font-semibold p-2 block w-full rounded-md border-0 py-1.5 text-gray-500 shadow-sm ring-1 ring-inset ring-green-300 placeholder:text-gray-800 focus:ring-2 focus:ring-inset focus:ring-green-600 sm:text-sm/6 transition-all duration-200 hover:ring-2 hover:ring-green-500"
                                        value={email}
                                        onChange={handleChangeEmail}
                                    />
                                </div>
                            </div>

                            {error && (
                                <p className="text-center text-sm/6 text-red-500">
                                    {error}
                                </p>
                            )}

                            <div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="bg-green-600 flex w-full justify-center rounded-md px-3 py-1.5 text-sm/6 font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600 transition-all duration-200 disabled:opacity-50"
                                >
                                    {loading ? "Sending..." : "Reset Password"}
                                </button>
                            </div>
                        </form>
                    )}

                    {!success && (
                        <p className="mt-10 text-center text-sm/6 text-gray-500">
                            Remember your password?{" "}
                            <a
                                href="/auth/login"
                                className="font-semibold text-green-600 hover:text-green-500"
                            >
                                Sign in
                            </a>
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
