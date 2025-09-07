import { AuthProvider, useAuth } from "@/lib/authcontext";
import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import "./globals.css";

function RouterGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const segment = useSegments();

  useEffect(() => {
    if (isLoading || !Array.isArray(segment) || segment.length < 1) return;

    const currentSegment = segment[0];
    if (typeof currentSegment !== "string") return;

    const isAuth = currentSegment === "auth";

    if (!user && !isAuth) {
      router.replace("/auth");
    } else if (user && isAuth) {
      router.replace("/");
    }
  }, [user, segment, isLoading, router]);

  return <>{children}</>;
}

export default function RootLayout() {
  const { isLoading } = useAuth();

  if (isLoading) return null;

  return (
    <AuthProvider>
      <RouterGuard>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="auth" options={{ headerShown: false }} />
          <Stack.Screen name="EditPaper" options={{ headerShown: false }} />
        </Stack>
      </RouterGuard>
    </AuthProvider>
  );
}
