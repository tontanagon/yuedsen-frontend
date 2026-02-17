import { betterAuth } from "better-auth";
import { Pool } from "pg";

export const auth = betterAuth({
    database: new Pool({
        connectionString: process.env.DATABASE_URL,
    }),
    session: {
        additionalFields: {
            accessToken: {
                type: "string",
                required: false,
                returned: true, // Make sure it's returned to the client
            },
        },
    },
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            scope: ["https://www.googleapis.com/auth/userinfo.profile", "https://www.googleapis.com/auth/userinfo.email"],
        },
    },
    plugins: [
        {
            id: "backend-sync",
            hooks: {
                after: [
                    {
                        matcher: (context: any) => context.path?.startsWith("/callback") || context.path?.includes("/callback/google"),
                        handler: async (ctx: any) => {
                            try {
                                const account = ctx.context?.newAccount;
                                const session = ctx.context?.newSession;

                                if (account && account.accessToken && session) {
                                    console.log("Syncing Google User to Backend...");
                                    const response = await fetch("http://localhost:8080/users/auth/google/callback", {
                                        method: "POST",
                                        headers: {
                                            "Content-Type": "application/json",
                                        },
                                        body: JSON.stringify({
                                            access_token: account.accessToken,
                                        }),
                                    });

                                    if (response.ok) {
                                        const data = await response.json();
                                        console.log("Backend sync success. JWT:", data.token);

                                        // Update the session in the database with the new JWT (accessToken)
                                        // We use internalAdapter provided by better-auth context if available, 
                                        // or we can use the pool directly since we have it.
                                        // But better-auth might have an internal method.

                                        // NOTE: 'auth' object itself might be needed, or we use the pool.
                                        // Since we are inside the definition of 'auth', we can't use 'auth.api'.
                                        // But we can use the pool we defined above.

                                        const pool = new Pool({
                                            connectionString: process.env.DATABASE_URL,
                                        });

                                        await pool.query(
                                            'UPDATE "session" SET "accessToken" = $1 WHERE "token" = $2',
                                            [data.token, session.token]
                                        );

                                        console.log("Session updated with JWT.");

                                    } else {
                                        console.error("Backend sync failed:", await response.text());
                                    }
                                }
                            } catch (error) {
                                console.error("Error in backend-sync hook:", error);
                            }
                            return { response: ctx.response };
                        },
                    },
                ],
            },
        },
    ],
});
