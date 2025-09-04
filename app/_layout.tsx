import { AuthProvider, useAuth } from "@/lib/authcontext";
import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import "./globals.css";

function RouterGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const segment = useSegments();

  useEffect(() => {
    const isAuth = segment[0] === "auth";

    if (!user && !isAuth && !isLoading) {
      router.replace("/auth");
    } else if (user && isAuth && !isLoading) {
      router.replace("/");
    }
  }, [user, segment]);

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RouterGuard>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="auth" options={{ headerShown: false }} />
          <Stack.Screen name="verify" options={{ headerShown: false }} />
        </Stack>
      </RouterGuard>
    </AuthProvider>
  );
}
