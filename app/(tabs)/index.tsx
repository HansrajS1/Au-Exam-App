import { images } from "@/constants/images";
import { useAuth } from "@/lib/authcontext";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { JSX, useEffect, useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface Paper {
  id: number;
  subject: string;
  description: string;
}

export default function Index(): JSX.Element {
  const { userName, userVerified } = useAuth();
  const [selected, setSelected] = useState<number | null>(null);
  const [query, setQuery] = useState<string>("");
  const [papers, setPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const loadAvatar = async (): Promise<void> => {
      const savedAvatar = await AsyncStorage.getItem("avatar");
      if (savedAvatar) setSelected(parseInt(savedAvatar, 10));
    };
    loadAvatar();
  }, []);

  useEffect(() => {
    if (userVerified) {
      fetchAllPapers();
    }
  }, [userVerified]);

  const fetchAllPapers = async (): Promise<void> => {
    setLoading(true);
    try {
      const response = await fetch("https://dummyjson.com/posts");
      const data = await response.json();
      setPapers(data.papers || []);
    } catch {
      Alert.alert("Error", "Failed to load papers.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (): Promise<void> => {
    if (!userVerified) {
      Alert.alert("Access Denied", "Please verify your email to search papers.");
      return;
    }

    if (!query.trim()) {
      fetchAllPapers();
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `https://your-api.com/papers?subject=${encodeURIComponent(query)}`
      );
      const data = await response.json();
      setPapers(data.papers || []);
    } catch {
      Alert.alert("Error", "Search failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-[#030014] px-4 pt-10">
      <View className="flex-row items-center justify-between mb-6">
        <View className="flex-row items-center">
          <Image
            source={selected === 1 ? images.logo : images.logo2}
            className="size-[32px] rounded-full"
          />
          <Text className="text-white text-base ml-2">
            {userName || "Guest"}
          </Text>
        </View>
      </View>

      <TextInput
        placeholder="Search by subject"
        value={query}
        onChangeText={setQuery}
        className="bg-white rounded-md px-4 py-2 mb-4"
      />
      <TouchableOpacity
        onPress={handleSearch}
        className="bg-indigo-600 rounded-md px-4 py-2 mb-4"
      >
        <Text className="text-white text-center font-semibold">
          {loading ? "Loading..." : "Search"}
        </Text>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
        <View className="flex-row flex-wrap justify-between">
          {papers.length > 0 ? (
            papers.map((paper) => (
              <View
                key={paper.id}
                className="w-[48%] bg-[#1a1a2e] rounded-xl p-3 mb-4"
              >
                <View className="bg-[#2e2e3e] h-24 rounded-lg items-center justify-center">
                  <Ionicons name="document-text-outline" size={36} color="#888" />
                </View>
                <Text className="text-white text-sm mt-3 mb-2 font-bold">
                  {paper.subject}
                </Text>
                <Text className="text-gray-300 text-xs mb-2">
                  {paper.description}
                </Text>
                <TouchableOpacity className="bg-primary py-1.5 rounded-md items-center">
                  <Text className="text-white font-semibold">View</Text>
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <Text className="text-white text-center mt-4">No papers found.</Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
