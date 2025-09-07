import { icons } from '@/constants/icons';
import { useAuth } from '@/lib/authcontext';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Image, KeyboardAvoidingView, Linking, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';


export default function AuthScreen() {
  const [isSignIn, setIsSignIn] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>("");

  const { signIn, signUp } = useAuth();
  const router = useRouter();

  const handleSwitch = () => setIsSignIn(prev => !prev);

  const openEmail = () => {
    Linking.openURL("mailto:auexamapp@gmail.com");
  };

  const handleAuth = async () => {
    if (!email || !password) {
      setError("Email and Password are required");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (!isSignIn) {
      const error = await signIn(email, password);
      if (error) {
        setError(error);
        return;
      }
      router.replace("/");
    } else {
      const error = await signUp(name, email, password);
      if (error) {
        setError(error);
        return;
      }
    }
    setError(null);
  };

  return (
    <KeyboardAvoidingView
      behavior='padding' 
      className="flex-1 bg-[#030014]"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <Image source={icons.logo} className="h-23 w-23 mt-10 pt-4 mx-auto" />
        <View className="flex-1 px-6 justify-center">
          <Text className="text-white text-3xl font-bold text-center mb-6">
            {isSignIn ? "Create Account" : "Welcome Back"}
          </Text>

          {isSignIn && (
            <TextInput
              placeholder="Name"
              placeholderTextColor="#aaa"
              onChangeText={setName}
              className="bg-[#1a1a2e] text-white px-4 py-3 rounded-md mb-4"
            />
          )}

          <TextInput
            placeholder="Email"
            placeholderTextColor="#aaa"
            onChangeText={setEmail}
            className="bg-[#1a1a2e] text-white px-4 py-3 rounded-md mb-4"
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <TextInput
            placeholder="Password"
            placeholderTextColor="#aaa"
            onChangeText={setPassword}
            className="bg-[#1a1a2e] text-white px-4 py-3 rounded-md mb-4"
            autoCapitalize="none"
            secureTextEntry
          />

          {error && (
            <Text className="text-red-500 text-center mb-4">{error}</Text>
          )}

          <TouchableOpacity
            onPress={handleAuth}
            className="bg-green-600 py-3 rounded-md mb-4"
          >
            <Text className="text-white text-center font-semibold">
              {isSignIn ? "Sign Up " : "Sign In "}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleSwitch} className="mb-2">
            <Text className="text-blue-400 text-xl mt-4 bold border border-blue-400 w-[80%] rounded-md mx-auto text-center font-medium">
              {isSignIn
                ? "Already have an account? Sign In"
                : "Don't have an account? Sign Up"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={openEmail}>
            <Text className="text-gray-400 text-center mt-6 text-sm">
              Forgot Password?  Contact Support
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
