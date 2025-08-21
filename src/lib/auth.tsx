import {createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useState} from "react";
import {useApolloClient, useMutation, useQuery} from "@apollo/client";
import {GET_CURRENT_USER_ID} from "@/components/graphql/current-user.graphql.ts";
import {DELETE_TOKEN_COOKIE} from "@/components/graphql/auth.graphql.ts";


type AuthContextValue = {
    currentUser: {__typename?: "UserType", id: string} | null | undefined;
    isAuthenticated: boolean;
    initializing: boolean;
    refreshMe: () => Promise<boolean>;
    logIn: () => Promise<boolean>;
    logOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({children}: Readonly<{ children: ReactNode }>) {
    const {data, loading, refetch} = useQuery(GET_CURRENT_USER_ID, {
        fetchPolicy: "network-only",
        errorPolicy: "ignore",
    });

    const client = useApolloClient();
    const [doLogout] = useMutation(DELETE_TOKEN_COOKIE);

    // Avoid flashing during initial load
    const [bootstrapped, setBootstrapped] = useState(false);
    useEffect(() => {
        if (!loading) setBootstrapped(true);
    }, [loading]);

    const currentUser = data?.me ?? null;
    const isAuthenticated = !!currentUser;
    const initializing = !bootstrapped;

    const refreshMe = useCallback(async () => {
        try {
            const res = await refetch();
            return Boolean(res.data.me);
        } catch {
            return false;
        }
    }, [refetch]);

    const logIn = useCallback(async () => {
        return refreshMe();
    }, [refreshMe]);

    const logOut = useCallback(async () => {
        try {
            await doLogout({fetchPolicy: "no-cache"});
        } catch {
            // ignore
        }
        await client.clearStore().catch(() => {});
        try {
            await refetch();
        } catch {
            // ignore
        }
    }, [client, doLogout, refetch]);

    const value = useMemo<AuthContextValue>(
        () => ({
            currentUser,
            isAuthenticated,
            initializing,
            refreshMe,
            logIn,
            logOut,
        }),
        [currentUser, isAuthenticated, initializing, refreshMe, logIn, logOut]
    );

    return <AuthContext value={value}>{children}</AuthContext>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within a AuthProvider');
    return context;
}
