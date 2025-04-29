import { createContext, ReactNode, useContext } from "react";
import { useAuth } from "@/hooks/use-auth";
import { User } from "@shared/schema";

// Type for the AuthContext
type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
};

// Create context with default values
export const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: false,
  error: null,
});

// Provider component that wraps the app
export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();

  return (
    <AuthContext.Provider
      value={{
        user: auth.user,
        isLoading: auth.isLoading,
        error: auth.error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Hook to use the auth context
export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
}
