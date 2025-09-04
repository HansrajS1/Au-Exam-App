import { images } from "@/constants/images";
import { account } from "@/lib/appwrite";
import { useAuth } from "@/lib/authcontext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { Button } from "react-native-paper";

const Login = () => {
  const { signOut, userEmail, userName, userVerified } = useAuth();
  const username = userName ? (userName.charAt(0).toUpperCase() + userName.slice(1)) : "Guest";
  const userEmailDisplay = userEmail ? userEmail : "Guest@example.com";

  const [selected, setSelected] = useState<number | null>(null);

  const [isVerified, setIsVerified] = useState<boolean>(userVerified);


  useEffect(() => {
    const loadAvatar = async () => {
      const savedAvatar = await AsyncStorage.getItem("avatar");
      if (savedAvatar) setSelected(parseInt(savedAvatar, 10));
    };
    loadAvatar();
    setIsVerified(userVerified);
  }, [userVerified]);

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
    alert("Check your email for the verification link!");
    await account.createVerification("http://localhost:8081/verify");
    const updatedUser = await account.get();
    if (updatedUser.emailVerification) {
      alert("Your account is now verified!");
      setIsVerified(true);
    }
  } catch (error) {
    alert("Error verifying account");
  }
};


  return (
    <View className="flex-1 bg-[#030014] justify-center items-center px-4">
      {!selected ? (
        <>
          <Text className="text-white text-lg mb-4">
            Choose your avatar 👇
          </Text>
          <View className="flex-row mb-6">
            <TouchableOpacity onPress={() => chooseAvatar(1)} className="mx-3">
              <Image source={images.logo} className="w-20 h-20 rounded-full border border-white" />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => chooseAvatar(2)} className="mx-3">
              <Image source={images.logo2} className="w-20 h-20 rounded-full border border-white" />
            </TouchableOpacity>

          </View>
        </>
      ) : (
        <View className="relative mb-5">
  <Image
    source={selected === 1 ? images.logo : images.logo2}
    className="w-24 h-24 rounded-full"
  />
  {isVerified && (
    <View className="absolute -top-2 -right-2 bg-green-500 rounded-full p-1">
      <Text className="text-white text-xs font-bold">✔</Text>
    </View>
  )}
</View>

      )}

      <Text className="text-white text-xl mb-2 text-center">
        Welcome, {username} 👋
      </Text>
      <Text className="text-white mb-2 text-center">{userEmailDisplay}</Text>

      <View className="flex-row mt-4 mb-10">
        <Button
          mode="outlined"
          onPress={resetAvatar}
          className="mx-2 border-white text-white"
        >
          Reset Avatar
        </Button>
        {!isVerified && (
          <Button
            mode="outlined"
            onPress={verifyAccount}
            className="mx-2 border-white text-white"
          >
            Verify Account
          </Button>
        )}

      </View>

      <Button
        className="w-1/2 mx-auto bg-indigo-600"
        onPress={signOut}
        mode="contained"
        icon="logout"
      >
        Sign Out
      </Button>
    </View>
  );
};

export default Login;
