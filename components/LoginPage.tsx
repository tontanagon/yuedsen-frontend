"use client";

import { authClient } from "@/lib/auth-client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGoogleLogin = async () => {
        setIsLoading(true);
        setError(null);
        await authClient.signIn.social({
            provider: "google",
            callbackURL: "/dashboard", // Or wherever you want to go
        }, {
            onSuccess: async (ctx) => {
                // Send access token/user info to backend
                try {
                    // Fetch user info from session or context if available?
                    // Better Auth client usually handles session automatically.
                    // We can get the session to get user details.
                    const session = await authClient.getSession();
                    const user = session.data?.user;

                    if (user) {
                        // Call Go Backend
                        const response = await fetch("http://localhost:8080/users", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                                name: user.name,
                                email: user.email,
                                password: "google-login-placeholder", // Backend requires password? (based on struct)
                            }),
                        });
                        
                        if (!response.ok) {
                            console.error("Failed to sync user with backend");
                        }
                    }
                    router.push("/");
                } catch (err) {
                    console.error("Error syncing with backend:", err);
                }
            },
            onError: (ctx) => {
                 setError(ctx.error.message);
                 setIsLoading(false);
            }
        });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Sign in to your account</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Or <a href="/" className="font-medium text-indigo-600 hover:text-indigo-500">return to home</a>
                    </p>
                </div>
                
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                        <strong className="font-bold">Error:</strong>
                        <span className="block sm:inline"> {error}</span>
                    </div>
                )}

                <div className="mt-8 space-y-6">
                    <button
                        onClick={handleGoogleLogin}
                        disabled={isLoading}
                        className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
                    >
                        {isLoading ? (
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : (
                            <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                                {/* Google Icon */}
                                <svg className="h-5 w-5 text-indigo-500 group-hover:text-indigo-400" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M21.35,11.1H12.18V13.83H18.69C18.36,17.64 15.19,19.27 12.19,19.27C8.36,19.27 5,16.25 5,12.61C5,8.85 8.38,5.78 12.23,5.78C13.81,5.78 15.45,6.23 16.71,7.28L20.25,3.74C18.06,1.45 15.22,0.29 12.22,0.29C5.46,0.29 0,5.74 0,12.48C0,19.23 5.33,24.69 12.07,24.69C18.81,24.69 24.14,19.23 24.14,12.48C24.14,11.83 24.06,11.23 24,10.63H21.35V11.1Z" />
                                </svg>
                            </span>
                        )}
                        Sign in with Google
                    </button>
                </div>
            </div>
        </div>
    );
}
