import { createContext, ReactNode, useContext } from "react";
import {
    useQuery,
    useMutation,
    UseQueryResult,
    UseMutationResult,
} from "@tanstack/react-query";
import { insertUserSchema, User as SelectUser, InsertUser } from "@shared/schema";
import { queryClient, scopedFetch } from "../lib/queryClient";
import { useToast } from "./use-toast";

type AuthContextType = {
    user: SelectUser | null;
    isLoading: boolean;
    error: Error | null;
    loginMutation: UseMutationResult<SelectUser, Error, LoginData>;
    logoutMutation: UseMutationResult<void, Error, void>;
    registerMutation: UseMutationResult<SelectUser, Error, InsertUser>;
};

type LoginData = Pick<InsertUser, "email" | "password">;

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const { toast } = useToast();

    const {
        data: user,
        error,
        isLoading,
    } = useQuery<SelectUser | null, Error>({
        queryKey: ["/api/user"],
        queryFn: async () => {
            const response = await scopedFetch("/api/user");
            if (response.status === 401) return null;
            if (!response.ok) throw new Error("Could not fetch current user");
            return response.json();
        },
        retry: false,
    });

    const loginMutation = useMutation<SelectUser, Error, LoginData>({
        mutationFn: async (credentials) => {
            const response = await scopedFetch("/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(credentials),
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || "Login failed");
            }
            return response.json();
        },
        onSuccess: (user) => {
            queryClient.setQueryData(["/api/user"], user);
            toast({
                title: "Welcome back!",
                description: `Logged in as ${user.email}`,
            });
        },
        onError: (error: Error) => {
            toast({
                title: "Login failed",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    const logoutMutation = useMutation<void, Error, void>({
        mutationFn: async () => {
            const response = await scopedFetch("/api/logout", { method: "POST" });
            if (!response.ok) throw new Error("Logout failed");
        },
        onSuccess: () => {
            localStorage.removeItem("safe_school_remember_me_super");
            localStorage.removeItem("safe_school_remember_me_admin");
            queryClient.setQueryData(["/api/user"], null);
            toast({
                title: "Logged out",
                description: "See you next time!",
            });
        },
    });

    const registerMutation = useMutation<SelectUser, Error, InsertUser>({
        mutationFn: async (newUser) => {
            const response = await scopedFetch("/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newUser),
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || "Registration failed");
            }
            return response.json();
        },
        onSuccess: (user) => {
            queryClient.setQueryData(["/api/user"], user);
        },
    });

    return (
        <AuthContext.Provider
            value={{
                user: user ?? null,
                isLoading,
                error,
                loginMutation,
                logoutMutation,
                registerMutation,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
