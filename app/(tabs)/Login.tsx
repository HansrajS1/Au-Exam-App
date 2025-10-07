import { images } from "@/constants/images";
import { account } from "@/lib/appwrite";
import { useAuth } from "@/lib/authcontext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import { Image, Linking, Share, Text, TouchableOpacity, View } from "react-native";
import { Button } from "react-native-paper";

const Login = () => {
  const { signOut, userEmail, userName, userVerified , setUserVerified } = useAuth();
  const username = userName
    ? userName.charAt(0).toUpperCase() + userName.slice(1)
    : "Guest";
  const userEmailDisplay = userEmail ? userEmail : "Guest@example.com";
  const [selected, setSelected] = useState<number | null>(null);
  const [verifiedmessage, setVerifiedMessage] = useState<string | null>(null);

  useEffect(() => {
    const loadAvatar = async () => {
      const savedAvatar = await AsyncStorage.getItem("avatar");
      if (savedAvatar) setSelected(parseInt(savedAvatar, 10));
    };
    loadAvatar();
    setUserVerified(userVerified);
  }, [userVerified, setUserVerified]);

  const chooseAvatar = async (id: number) => {
    setSelected(id);
    await AsyncStorage.setItem("avatar", id.toString());
  };

  const resetAvatar = async () => {
    await AsyncStorage.removeItem("avatar");
    setSelected(null);
  };

  const verifyAccount = async () => {
    try {
      setVerifiedMessage("Check your email for the verification link!");
      await account.createVerification("https://auexamapp.tech/verify-email");
      pollVerification();
    } catch (error) {
      console.error("Error verifying account:", error);
      setVerifiedMessage("Error verifying account");
    }
  };


const pollVerification = async () => {
  const phases = [
    { duration: 10000, interval: 2000 },
    { duration: 10000, interval: 3000 },
    { duration: 10000, interval: 5000 }, 
    { duration: 10000, interval: 5000 },
    { duration: 10000, interval: 5000 },
    { duration: 10000, interval: 5000 },
    { duration: 10000, interval: 5000 },
    { duration: 10000, interval: 5000 },
    { duration: 10000, interval: 5000 }
  ];

  let verified = false;

  for (const phase of phases) {
    const start = Date.now();
    while (Date.now() - start < phase.duration) {
      try {
        const user = await account.get();
        if (user.emailVerification) {
          setVerifiedMessage("Your account is now verified!");
          setUserVerified(true);
          verified = true;
          return;
        }
      } catch (err) {
        console.error("Verification check failed:", err);
      }
      await new Promise(resolve => setTimeout(resolve, phase.interval));
    }
  }

  if (!verified) {
    setVerifiedMessage(" Verification not detected. Please refresh or try again.");
  }
};

  const openEmail = () => {
    Linking.openURL("mailto:auexamapp@gmail.com");
  };

  const handleShare = async () => {
    try {
      const result = await Share.share({
        message:
          "Check out the AU Exam App - built for Alliance University students to upload and manage their academic resources. Download it here: https://auexamapp.tech/app-download",
      });
    } catch (error) {
      console.error("Error sharing the app:", error);
    }
  }

  return (
    <View className="flex-1 bg-[#030014] justify-center items-center px-4">
      {!selected ? (
        <>
          <Text className="text-white text-lg mb-4">Choose your avatar</Text>
          <View className="flex-row mb-6">
            <TouchableOpacity onPress={() => chooseAvatar(1)} className="mx-3">
              <Image
                source={images.AvatarBoy}
                className="w-20 h-20 rounded-full border border-white"
              />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => chooseAvatar(2)} className="mx-3">
              <Image
                source={images.AvatarGirl}
                className="w-20 h-20 rounded-full border border-white"
              />
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <View className="relative mb-5">
          <Image
            source={selected === 1 ? images.AvatarBoy : images.AvatarGirl}
            className="w-24 h-24 rounded-full"
          />
          {userVerified && (
            <View className="absolute -top-2 -right-2 bg-green-500 rounded-full p-1">
              <Text className="text-white text-xs font-bold">✔</Text>
            </View>
          )}
        </View>
      )}

      <Text className="text-white text-xl mb-2 text-center">{username}</Text>
      <Text className="text-white mb-2 text-center">{userEmailDisplay}</Text>

      <View className="flex-row mt-3 mb-5">
        <Button
          mode="outlined"
          onPress={resetAvatar}
          className="mx-2 border-white text-white"
        >
          Reset Avatar
        </Button>
        {!userVerified && (
          <Button
            mode="outlined"
            onPress={verifyAccount}
            className="mx-2 border-white text-white"
          >
            Verify Account
          </Button>
        )}
      </View>
      {verifiedmessage && (
        userVerified ? (
          <Text className="text-green-500 text-center mb-4 px-2">
            {verifiedmessage}
          </Text>
        ) : (
          <Text className="text-red-500 text-center mb-4 px-2">
            {verifiedmessage}
          </Text>
        )
      )}
      <View className="items-center">
        <Button
          className="w-1/2 mt-2 mx-auto bg-indigo-600"
          onPress={signOut}
          mode="contained"
          icon="logout"
        >
          Sign Out
        </Button>
      </View>
        <TouchableOpacity
          onPress={openEmail}
          className="bg-blue-700 p-4 rounded-lg mt-5"
        >
          <Text className="text-white font-semibold">⚙️  Contact Support </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleShare}
          className="bg-black py-3 px-4 rounded-md "
        >
          <Text className="text-white text-center mt-4 font-semibold">
           𖹭  Share this App 
          </Text>
        </TouchableOpacity>
      <Text className="text-gray-400 absolute bottom-0 text-xs">
        © {new Date().getFullYear()} AU Exam App. All rights reserved.
      </Text>
    </View>
  );
};

export default Login;

