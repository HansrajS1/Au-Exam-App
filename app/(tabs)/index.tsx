import { icons } from "@/constants/icons";
import { images } from "@/constants/images";
import { useAuth } from "@/lib/authcontext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import * as FileSystem from "expo-file-system/legacy";
import { router } from "expo-router";
import debounce from "lodash.debounce";
import React, { JSX, useCallback, useEffect, useState } from "react";
import { Button } from "react-native-paper";
import * as IntentLauncher from "expo-intent-launcher";
import * as Linking from "expo-linking";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { blue100 } from "react-native-paper/lib/typescript/styles/themes/v2/colors";

interface Paper {
  id: number;
  subject: string;
  previewImageUrl: string;
  fileUrl: string;
}

interface PaperDetail extends Paper {
  description: string;
  college: string;
  course: string;
  semester: number;
  userEmail: string;
}

export default function Index(): JSX.Element {
  const { userName, userVerified, userEmail } = useAuth();
  const [selected, setSelected] = useState<number | null>(null);
  const [query, setQuery] = useState<string>("");
  const [papers, setPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedPaper, setSelectedPaper] = useState<PaperDetail | null>(null);
  const [userNameState, setUserNameState] = useState<string | null>(userName);
  const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL || "http://localhost:3000";

  useFocusEffect(
    useCallback(() => {
      const loadAvatar = async (): Promise<void> => {
        setUserNameState(userName);
        const savedAvatar = await AsyncStorage.getItem("avatar");
        if (savedAvatar) setSelected(parseInt(savedAvatar, 10));
      };
      loadAvatar();
      if (userVerified) {
        fetchAllPapers();
      }
    }, [userVerified, userName])
  );

  const fetchAllPapers = async (): Promise<void> => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/api/papers`);
      const data = await response.json();
      const sorted = [...data].sort((a, b) => b.id - a.id);
      setPapers(sorted || []);
    } catch {
      console.error("Error", "Failed to load papers.");
    } finally {
      setLoading(false);
    }
  };

  const searchPapers = async (text: string): Promise<void> => {
    if (!userVerified) return;

    if (!text.trim()) {
      fetchAllPapers();
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${BASE_URL}/api/papers/search?subject=${encodeURIComponent(text)}`
      );

      const data = await response.json();
      const sorted = [...data].sort((a, b) => b.id - a.id);
      setPapers(sorted);
    } catch {
      console.error("Search failed.");
    } finally {
      setLoading(false);
    }
  };

  const debouncedSearch = useCallback(debounce(searchPapers, 500), [
    userVerified,
  ]);

  useEffect(() => {
    debouncedSearch(query);
  }, [query, debouncedSearch]);

  const fetchPaperById = async (id: number): Promise<void> => {
    try {
      const response = await fetch(`${BASE_URL}/api/papers/${id}`);
      const data = await response.json();
      setSelectedPaper(data);
    } catch {
      Alert.alert("Error", "Failed to load paper details.");
    }
  };

  const downloadAndOpenDocument = async (url: string) => {
    try {
      const fileName = url.split("/").pop() || "document.docx";
      const fileUri = FileSystem.documentDirectory + fileName;

      const { uri } = await FileSystem.downloadAsync(url, fileUri);
      const fileInfo = await FileSystem.getInfoAsync(uri);

      if (!fileInfo.exists || fileInfo.size === 0) {
        Alert.alert("File Error", "Downloaded file is empty or missing.");
        return;
      }

      const extension = fileName.split(".").pop()?.toLowerCase();
      let mimeType = "application/octet-stream";

      if (extension === "docx") {
        mimeType =
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
      } else if (extension === "doc") {
        mimeType = "application/msword";
      } else if (extension === "pdf") {
        mimeType = "application/pdf";
      } else {
        Alert.alert(
          "Unsupported File",
          `Cannot open .${extension} files on this device.`
        );
        return;
      }

      if (Platform.OS === "android") {
        const contentUri = await FileSystem.getContentUriAsync(uri);
        try {
          await IntentLauncher.startActivityAsync(
            "android.intent.action.VIEW",
            {
              data: contentUri,
              flags: 1,
              type: mimeType,
            }
          );
        } catch (error) {
          Alert.alert(
            "No Viewer Found",
            `No app available to open .${extension} files.`
          );
        }
      } else {
        const canOpen = await Linking.canOpenURL(uri);
        if (canOpen) {
          Linking.openURL(uri);
        } else {
          Alert.alert("Error", "Cannot open document on this device.");
        }
      }
    } catch (error) {
      console.error("Download error:", error);
      Alert.alert("Download Failed", "Unable to open this document.");
    }
  };

  const confirmDelete = (id?: number) => {
    if (!id) return;

    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this paper?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => handleDelete(id),
        },
      ]
    );
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`${BASE_URL}/api/papers/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        Alert.alert("Deleted", "Paper has been deleted.");
        setSelectedPaper(null);
        fetchAllPapers();
      } else {
        Alert.alert("Error", "Failed to delete paper.");
      }
    } catch (error) {
      console.error("Delete error:", error);
      Alert.alert("Error", "Something went wrong.");
    }
  };

  return (
    <View className="flex-1 bg-[#030014] px-4 pt-10">
      <View className="flex-row items-center justify-between mb-6">
        <View className="flex-row items-center">
          <Image
            source={selected === 1 ? images.AvatarBoy : images.AvatarGirl}
            className="size-[32px] rounded-full"
          />
          <Text className="text-white text-base ml-2">
            {userNameState || "Student"}
          </Text>
        </View>
      </View>

      <View className="mb-2 flex flex-row items-center align-center border border-gray-600 justify-between rounded-xl">
        <TextInput
          placeholder="Search Subject"
          value={query}
          onChangeText={setQuery}
          placeholderTextColor={"#ababab"}
          className="bg-dark-100 w-[90%] text-white rounded-md px-4 py-2"
        />
        <Image source={icons.search} className="opacity-50 mr-4" />
      </View>
      <View
        style={{ height: 24, justifyContent: "center", alignItems: "center" }}
      >
        {loading && <ActivityIndicator size="small" color="#888" />}
      </View>
      <View className="h-[77%]">
        <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
          <View className="flex-row flex-wrap justify-between">
            {papers.length > 0
              ? papers.map((paper) => (
                  <View
                    key={paper.id}
                    className="w-[48%] bg-[#1a1a2e] rounded-xl p-3 mb-4"
                  >
                    <TouchableOpacity onPress={() => fetchPaperById(paper.id)}>
                      <Image
                        source={{ uri: paper.previewImageUrl }}
                        className="h-24 w-full rounded-lg mb-2"
                        resizeMode="contain"
                      />
                      <Text className="text-white text-sm font-bold mb-2 text-center">
                        {paper.subject}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => downloadAndOpenDocument(paper.fileUrl)}
                      className="bg-green-600 py-1.5 rounded-md items-center"
                    >
                      <Text className="text-white font-semibold">
                        Download Paper
                      </Text>
                    </TouchableOpacity>
                  </View>
                ))
              : !loading &&
                query && (
                  <Text className="text-white text-center mt-4">
                    No papers found starting with &quot;{query}&quot;.
                  </Text>
                )}
          </View>
          {!userVerified && (
            <>
              <Text className="text-red-500 text-center mt-4">
                Access denied. Please verify your account.
              </Text>

              <Button
                className="w-1/2 mx-auto bg-indigo-600 mt-4"
                onPress={() => router.replace("/Login")}
                mode="contained"
              >
                Verify Now
              </Button>
            </>
          )}
        </ScrollView>
      </View>

      <Modal visible={!!selectedPaper} transparent animationType="slide">
        <View className="flex-1 bg-black bg-opacity-80 justify-center px-6">
          <View className="bg-[#1a1a2e] p-4 rounded-lg">
            <Text className="text-white text-lg font-bold mb-2">
              {selectedPaper?.subject}
            </Text>
            <Text className="text-gray-300 mb-1">
              College: {selectedPaper?.college}
            </Text>
            <Text className="text-gray-300 mb-1">
              Course: {selectedPaper?.course}
            </Text>
            <Text className="text-gray-300 mb-1">
              Semester: {selectedPaper?.semester}
            </Text>
            <Text className="text-gray-300 mb-1">
              Uploaded by: {selectedPaper?.userEmail}
            </Text>
            <Text className="text-gray-300 mb-3">
              {selectedPaper?.description}
            </Text>

            {selectedPaper?.userEmail === userEmail && (
              <View className="mb-1 flex-row justify-around">
                <TouchableOpacity
                  onPress={() => {
                    setSelectedPaper(null);
                    router.push({
                      pathname: "/EditPaper",
                      params: { paperId: selectedPaper.id.toString() },
                    });
                  }}
                  className="bg-yellow-600 py-2 rounded-md mb-2 w-[30%]"
                >
                  <Text className="text-white mx-2 text-center  font-semibold">
                    Edit
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() =>
                    selectedPaper && confirmDelete(selectedPaper.id)
                  }
                  className="bg-red-600 py-2 rounded-md w-[30%] mb-2"
                >
                  <Text className="text-white mx-3 text-center font-semibold">
                    Delete
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity
              onPress={() => setSelectedPaper(null)}
              className="bg-blue-600 py-2 rounded-md mt-2"
            >
              <Text className="text-white text-center font-semibold">
                Close
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Text className="text-center text-gray-400 absolute right-0 left-0 bottom-1 text-xs">
        Best of luck for your exams!
      </Text>
    </View>
  );
}
