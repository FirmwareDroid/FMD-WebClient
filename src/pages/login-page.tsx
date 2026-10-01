// typescript
import {useAuth} from "@/lib/auth.tsx";
import {useLocation, useNavigate} from "react-router";
import React, {FormEvent, useEffect, useState} from "react";
import { useLazyQuery } from "@/lib/apollo-hooks";
import {GET_AUTH_TOKEN} from "@/components/graphql/auth.graphql.ts";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {Label} from "@/components/ui/label.tsx";
import {Input} from "@/components/ui/input.tsx";
import {cn} from "@/lib/utils.ts";
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert.tsx";
import {AlertCircleIcon} from "lucide-react";
import {Button} from "@/components/ui/button.tsx";
import {FmdIcon} from "@/components/icons/fmd-icon.tsx";

export default function LoginPage() {
    const {isAuthenticated, initializing} = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!initializing && isAuthenticated) {
            void navigate("/", {replace: true});
        }
    }, [isAuthenticated, initializing, navigate]);

    if (initializing) return <div className="flex min-h-svh items-center justify-center" role="status">Checking your session…</div>;

    return (
        <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
            <div className="w-full max-w-sm">
                <LoginForm/>
            </div>
        </div>
    );
}

type GetAuthTokenResult = { tokenAuth: { payload: string } | null };
type GetAuthTokenVars = { username: string; password: string; };

function LoginForm({className, ...props}: React.ComponentProps<"div">) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [authenticationError, setAuthenticationError] = useState(false);
    const {logIn} = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [requestToken, {data, loading, error}] = useLazyQuery<
        GetAuthTokenResult,
        GetAuthTokenVars
    >(GET_AUTH_TOKEN, {fetchPolicy: "no-cache"});

    useEffect(() => {
        const tokenAuth = data?.tokenAuth;
        if (!tokenAuth) return;

        void (async () => {
            const authenticated = await logIn();
            if (!authenticated) {
                setAuthenticationError(true);
                return;
            }
            const state = location.state as {from?: {pathname?: unknown}} | null;
            const requestedPath = state?.from?.pathname;
            const destination = typeof requestedPath === "string" && requestedPath.startsWith("/") && !requestedPath.startsWith("//")
                ? requestedPath
                : "/";
            void navigate(destination, {replace: true});
        })();
    }, [data, logIn, navigate, location]);

    const onSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!username || !password || loading) return;
        setAuthenticationError(false);

        // Rely on Apollo client's customFetch to include the CSRF header and credentials.
        void requestToken({
            variables: {username: username, password: password},
        });
    }

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <div className="flex items-center justify-center gap-3">
                <FmdIcon className="size-10 rounded-xl shadow-md shrink-0" />
                <span className="fmd-wordmark text-2xl font-bold tracking-tight">
                    Firmware<span className="fmd-wordmark-accent">Droid</span>
                </span>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Login to your account</CardTitle>
                    <CardDescription>
                        Enter your username and password below
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={onSubmit} noValidate>
                        <div className="flex flex-col gap-6">
                            <div className="grid gap-3">
                                <Label htmlFor="username">Username</Label>
                                <Input
                                    id="username"
                                    type="text"
                                    required
                                    autoComplete="username"
                                    value={username}
                                    onChange={(e) => { setUsername(e.target.value); }}
                                    disabled={loading}
                                />
                            </div>

                            <div className="grid gap-3">
                                <div className="flex items-center">
                                    <Label htmlFor="password">Password</Label>
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    required
                                    autoComplete="current-password"
                                    value={password}
                                    onChange={(e) => { setPassword(e.target.value); }}
                                    disabled={loading}
                                />
                            </div>

                            {(error || authenticationError) && (
                                <Alert variant="destructive" role="alert">
                                    <AlertCircleIcon/>
                                    <AlertTitle>Authentication failed.</AlertTitle>
                                    <AlertDescription>Please verify your credentials and try again.</AlertDescription>
                                </Alert>
                            )}

                            <div className="flex flex-col gap-3">
                                <Button type="submit" className="w-full" disabled={loading || !username.trim() || !password} aria-busy={loading}>
                                    {loading ? "Signing in..." : "Login"}
                                </Button>
                            </div>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
