import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
} from "react-native";
import { useAuth } from "@/lib/authcontext";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Message = {
  role: "user" | "assistant";
  content: string;
};

const STORAGE_KEY = "chat_messages";

const ChatMessage = ({ role, content }: Message) => {
  const isUser = role === "user";
  return (
    <View
      className={`flex w-full flex-row pt-4 items-start gap-3 ${
        isUser ? "justify-end" : ""
      }`}
    >
      {!isUser && (
        <View className="bg-indigo-600 p-2 rounded-full">
          <Text className="text-white text-lg">🤖</Text>
        </View>
      )}
      <View
        className={`max-w-[80%] rounded-xl px-4 py-3 ${
          isUser ? "bg-indigo-600" : "bg-slate-800"
        }`}
      >
        <Text className={isUser ? "text-white" : "text-gray-300"}>
          {content}
        </Text>
      </View>
      {isUser && (
        <View className="bg-gray-600 p-2 rounded-full">
          <Text className="text-white text-lg">👤</Text>
        </View>
      )}
    </View>
  );
};

export default function AskAI() {
  const { userVerified } = useAuth();
  const router = useRouter();
  const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL || "http://localhost:3000";
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    (async () => {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (saved) setMessages(JSON.parse(saved));
    })();
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages, loading]);

  const createUserMessage = (content: string): Message => ({
    role: "user",
    content,
  });
  const createAssistantMessage = (content: string): Message => ({
    role: "assistant",
    content,
  });

  const resetChat = () => {
    setMessages([]);
    AsyncStorage.removeItem(STORAGE_KEY);
  };

  const sendMessage = async () => {
    if (!userVerified) return;
    const trimmed = input.trim();
    if (!trimmed || loading || !userVerified) return;

    const newMessages = [...messages, createUserMessage(trimmed)];
    setMessages(newMessages);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newMessages));
    setInput("");
    setLoading(true);

    try {
      const response = await fetch(`${BASE_URL}/api/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!response.ok) {
        let errorText = "Something went wrong.";
        switch (response.status) {
          case 401:
            errorText = "Unauthorized: Check your API key or login.";
            break;
          case 403:
            errorText = "Forbidden: You don’t have access to this model.";
            break;
          case 429:
            errorText = "Rate limit exceeded. Please wait and try again.";
            break;
          case 423:
            errorText = "Model is temporarily locked. Try again later.";
            break;
          case 400:
            errorText = "Bad request. Please check your input.";
            break;
          default:
            errorText = `Unexpected error (${response.status})`;
        }

        const updated = [
          ...newMessages,
          createAssistantMessage(`Error: ${errorText}`),
        ];
        setMessages(updated);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        return;
      }

      const data = await response.json();
      const reply = data.choices?.[0]?.message?.content || "No response.";
      const updated = [...newMessages, createAssistantMessage(reply)];
      setMessages(updated);
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Network error occurred.";
      const updated = [
        ...newMessages,
        createAssistantMessage(`Error: ${errorMessage}`),
      ];
      setMessages(updated);
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } finally {
      setLoading(false);
    }
  };

  if (!userVerified) {
    return (
      <View className="flex-1 items-center justify-center bg-[#030014]">
        <View className="max-w-md items-center justify-center text-center">
          <Text className="text-2xl font-bold mb-4 text-white">
            Email Verification Required
          </Text>
          <Text className="mb-4 text-white">
            Please verify your email to access the Ask AI feature.
          </Text>
          <TouchableOpacity
            onPress={() => router.replace("/Login")}
            className="bg-indigo-600 py-2 px-4 rounded"
          >
            <Text className="text-white font-semibold">Go to Profile</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#030014] pt-20 pb-20">
      <KeyboardAvoidingView
        className="flex-1"
        behavior="padding"
      >
        <ScrollView
          ref={scrollRef}
          className="flex px-4 py-6 space-y-6"
          contentContainerStyle={{ paddingBottom: 120 }}
        >
          {messages.length === 0 && !loading ? (
            <View className="items-center justify-center text-gray-400">
              <Text className="text-4xl mb-4">🤖</Text>
              <Text className="text-2xl font-semibold mb-2 text-white">
                Welcome to Ask AI
              </Text>
              <Text className="mb-4 text-gray-400">
                Start a conversation by typing below.
              </Text>
              <View className="flex-row flex-wrap justify-center gap-2">
                {[
                  "Summarize the key concepts of Machine Learning in CSE syllabus",
                  "Explain backpropagation algorithm in simple terms",
                  "How do I make an HTTP request in Javascript?",
                ].map((preset, idx) => (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => setInput(preset)}
                    className="bg-gray-700 p-2 rounded-lg"
                  >
                    <Text className="text-white text-sm">
                      {preset.split(" ")[0]}...
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ) : (
            messages.map((msg, idx) => <ChatMessage key={idx} {...msg} />)
          )}

          {loading && (
            <View className="flex-row items-start gap-3">
              <View className="bg-indigo-600 p-2 rounded-full">
                <Text className="text-white text-lg">🤖</Text>
              </View>
              <View className="bg-slate-800 px-4 py-3 rounded-xl">
                <View className="flex-row gap-1">
                  <View className="h-2 w-2 bg-gray-500 rounded-full animate-pulse" />
                  <View className="h-2 w-2 bg-gray-500 rounded-full animate-pulse delay-150" />
                  <View className="h-2 w-2 bg-gray-500 rounded-full animate-pulse delay-300" />
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        <View className="w-full bg-[#030014] pb-7 px-4 pt-2">
          <View className="flex-row  items-center gap-2">
            <TouchableOpacity
              onPress={resetChat}
              className="bg-gray-600 rounded-full px-4 py-2"
            >
              <Text className="text-white font-semibold text-xl">+</Text>
            </TouchableOpacity>
            <View className="flex-1 relative">
              <TextInput
                value={input}
                onChangeText={setInput}
                onSubmitEditing={sendMessage}
                placeholder="Type your question..."
                placeholderTextColor="#94a3b8"
                multiline
                className="text-white border border-gray-600 rounded-lg p-3 bg-[#0f172a] max-h-40"
              />
              <TouchableOpacity
                onPress={sendMessage}
                disabled={loading || !input.trim()}
                className="absolute bottom-1 right-2 bg-gray-600 px-3 rounded-full"
              >
                <Text className="text-white text-3xl font-bold">↑</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
