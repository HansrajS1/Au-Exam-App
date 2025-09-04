import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { account } from "@/lib/appwrite";
import { View, Text, ActivityIndicator } from "react-native";

export default function VerifyScreen() {
  const { userId, secret } = useLocalSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState("Verifying...");

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        await account.updateVerification(userId as string, secret as string);
        setStatus("Email verified! Redirecting...");
        setTimeout(() => {
          router.replace("/");
        }, 2000);
      } catch {
        setStatus("Verification failed. Please try again.");
      }
    };

    if (userId && secret) verifyEmail();
  }, [userId, secret]);

  return (
    <View className="flex-1 items-center justify-center bg-[#030014]">
      <Text className="text-white text-lg mb-4">{status}</Text>
      {status === "Verifying..." && <ActivityIndicator color="#ff6b00" />}
    </View>
  );
}
