import { useAuth } from '@/lib/authcontext';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Text, TextInput, View } from 'react-native';
import { Button } from 'react-native-paper';


export default function AuthScreen() {
    const [isSignIn, setIsSignIn] = useState<boolean>(false);
    const [email, setEmail] = useState<string>("");
    const [name, setName] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [error, setError] = useState<string | null>("");
    
    const { signIn, signUp } = useAuth();

    const router = useRouter();

    const handleSwitch = () => {
        setIsSignIn(prev => !prev)
    }
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
        <KeyboardAvoidingView behavior='padding' className="flex-1" >
            <View className='flex-1 p-16 justify-center'>
                <Text className='text-center text-3xl mb-4 '>{isSignIn ? "Create Account" : "Welcome Back"}</Text>
                {isSignIn && (<TextInput placeholder="Name" onChangeText={setName} className="border-2 mb-4 rounded-md"  />)}
                <TextInput placeholder="Email" onChangeText={setEmail} className="border-2 mb-4 rounded-md" autoCapitalize='none' keyboardType='email-address' />
                <TextInput placeholder="Password" onChangeText={setPassword} className="border-2 mb-4 rounded-md" autoCapitalize='none' secureTextEntry />
                {error && <Text className="text-red-500 mb-4">{error}</Text>}
                <Button onPress={handleAuth} className="border-2 mb-4" mode='contained'>{isSignIn ? "Sign Up" : "Sign In"}</Button>

                <Button onPress={handleSwitch}>{isSignIn ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}</Button>
            </View>
        </KeyboardAvoidingView>
    );

}
