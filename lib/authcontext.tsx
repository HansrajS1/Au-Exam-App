import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { ID, Models } from "react-native-appwrite";
import { account } from "./appwrite";

type AuthContextType = {
    user: Models.User<Models.Preferences> | null;
    signUp: (name: string, email: string, password: string) => Promise<string | null>;
    signIn: (email: string, password: string) => Promise<string | null>;
    signOut: () => Promise<void>;
    isLoading: boolean;
    userEmail: string | null;
    userName: string | null;
    userVerified: boolean;
    setUserVerified: (verified: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null);
    const [userVerified, setUserVerified] = useState<boolean>(false);
    const [userEmail, setUserEmail] = useState<string | null>(null);
    const [userName, setUserName] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    
    useEffect(() => {
        fetchUser();
    }, []);

    const fetchUser = async () => {
        try {
            const userData = await account.get();
            setUserVerified(userData.emailVerification);
            setUser(userData);
            setUserEmail(userData.email);
            setUserName(userData.name);
        } catch (error) {
            console.log("No user logged in", error);
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    const signUp = async (name: string, email: string, password: string) => {
        try {
            await account.create(ID.unique(), email, password, name);
            await signIn(email, password);
            return null;
        } catch (error) {
            if (error instanceof Error) {
                return error.message;
            }
            return "An error occurred while signing up";
        }
    };

    const signIn = async (email: string, password: string) => {
        try {
            await account.createEmailPasswordSession(email, password);
            const userData = await account.get();
            setUser(userData);
            setUserEmail(userData.email);
            setUserName(userData.name);
            setUserVerified(userData.emailVerification);
            return null;
        } catch (error) {
            if (error instanceof Error) {
                return error.message;
            }
            return "An error occurred while signing in";
        }
    };

    const signOut = async () => {
        try {
            await account.deleteSession("current");
            setUserEmail("");
            setUserName("");
            setUser(null);
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, signIn, signUp, signOut, isLoading, userEmail, userName, userVerified ,setUserVerified }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    console.warn("useAuth must be used within an AuthProvider");
    return {
      user: null,
      signIn: async () => "Auth context not available",
      signUp: async () => "Auth context not available",
      signOut: async () => {},
      isLoading: false,
      userEmail: null,
      userName: null,
      userVerified: false,
      setUserVerified: () => {},
    };
  }
  return context;
}
