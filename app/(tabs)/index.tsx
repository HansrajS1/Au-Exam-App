import { icons } from "@/constants/icons";
import { images } from "@/constants/images";
import { useAuth } from "@/lib/authcontext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import * as FileSystem from "expo-file-system/legacy";
import * as IntentLauncher from "expo-intent-launcher";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import { Button } from "react-native-paper";
import debounce from "lodash.debounce";
import React, { JSX, memo, useCallback, useState, useEffect } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

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

const PAGE_SIZE = 10;

const PaperCard = memo(
  ({
    paper,
    onOpenDetails,
    onDownload,
  }: {
    paper: Paper;
    onOpenDetails: (id: number) => void;
    onDownload: (url: string) => void;
  }) => (
    <View className="w-[48%] bg-[#1a1a2e] rounded-xl p-3 mb-4">
      <TouchableOpacity onPress={() => onOpenDetails(paper.id)}>
        <Image
          source={{ uri: paper.previewImageUrl }}
          className="h-24 w-full rounded-lg mb-2"
          resizeMode="contain"
        />
        <Text
          className="text-white text-sm font-bold mb-2 text-center"
          numberOfLines={2}
        >
          {paper.subject}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => onDownload(paper.fileUrl)}
        className="bg-green-600 py-1.5 rounded-md items-center"
      >
        <Text className="text-white font-semibold">Download</Text>
      </TouchableOpacity>
    </View>
  )
);

PaperCard.displayName = "PaperCard";

export default function Index(): JSX.Element {
  const { userName, userVerified, userEmail } = useAuth();
  const [selected, setSelected] = useState<number | null>(null);
  const [query, setQuery] = useState<string>("");
  const [allPapers, setAllPapers] = useState<Paper[]>([]);
  const [displayedPapers, setDisplayedPapers] = useState<Paper[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedPaper, setSelectedPaper] = useState<PaperDetail | null>(null);
  const [userNameState, setUserNameState] = useState<string | null>(userName);
  const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL || "http://localhost:3000";
  const router = useRouter();

  const loadInitialData = useCallback(async () => {
    setLoading(true);
    setPage(1);
    try {
      const cachedPapers = await AsyncStorage.getItem("allPapers");
      if (cachedPapers) {
        const papers = JSON.parse(cachedPapers);
        setAllPapers(papers);
        setDisplayedPapers(papers.slice(0, PAGE_SIZE));
      } else {
        await fetchAllPapers();
      }
    } catch (e) {
      console.error("Failed to load initial data", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      const setup = async () => {
        setUserNameState(userName);
        const savedAvatar = await AsyncStorage.getItem("avatar");
        if (savedAvatar) setSelected(parseInt(savedAvatar, 10));

        if (userVerified) {
          loadInitialData();
          const intervalId = setInterval(fetchAllPapers, 90000);
          return () => clearInterval(intervalId);
        }
      };
      setup();
    }, [userVerified, userName, loadInitialData])
  );

  const fetchAllPapers = async (): Promise<void> => {
    try {
      const response = await fetch(`${BASE_URL}/api/papers`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      const sorted = Array.isArray(data)
        ? [...data].sort((a, b) => b.id - a.id)
        : [];
      setAllPapers(sorted);
      setDisplayedPapers(sorted.slice(0, page * PAGE_SIZE));
      await AsyncStorage.setItem("allPapers", JSON.stringify(sorted));
    } catch (err) {
      console.error("Failed to fetch latest papers:", err);
    }
  };

  const searchPapers = async (text: string): Promise<void> => {
    if (!userVerified) return;
    if (!text.trim()) {
      setDisplayedPapers(allPapers.slice(0, PAGE_SIZE));
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(
        `${BASE_URL}/api/papers/search?subject=${encodeURIComponent(text)}`
      );
      const data = await response.json();
      const sorted = [...data].sort((a, b) => b.id - a.id);
      setDisplayedPapers(sorted);
    } catch (e) {
      console.error("Search failed.", e);
    } finally {
      setLoading(false);
    }
  };

  const debouncedSearch = useCallback(debounce(searchPapers, 500), [
    userVerified,
    allPapers,
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

  const confirmDelete = (id: number) => {
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
    const originalPapers = [...allPapers];
    const updatedPapers = originalPapers.filter((p) => p.id !== id);

    setAllPapers(updatedPapers);
    setDisplayedPapers((papers) => papers.filter((p) => p.id !== id));
    await AsyncStorage.setItem("allPapers", JSON.stringify(updatedPapers));
    setSelectedPaper(null);

    try {
      const response = await fetch(`${BASE_URL}/api/papers/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Server delete failed");
    } catch (error) {
      setAllPapers(originalPapers);
      setDisplayedPapers(originalPapers.slice(0, page * PAGE_SIZE));
      await AsyncStorage.setItem("allPapers", JSON.stringify(originalPapers));
      Alert.alert("Error", "Failed to delete paper. Please try again.");
    }
  };

  const loadMorePapers = () => {
    if (loading || displayedPapers.length >= allPapers.length) return;
    setPage((prevPage) => {
      const nextPage = prevPage + 1;
      const newPapers = allPapers.slice(0, nextPage * PAGE_SIZE);
      setDisplayedPapers(newPapers);
      return nextPage;
    });
  };

  return (
    <View className="flex-1 bg-[#030014] px-4 pt-10 pb-16">
      <View className="flex-row items-center justify-between mb-6">
        <TouchableOpacity
          className="flex-row items-center"
          onPress={() => router.replace("/Login")}
        >
          <Image
            source={selected === 1 ? images.AvatarBoy : images.AvatarGirl}
            className="size-8 rounded-full"
          />
          <Text className="text-white text-base ml-2">
            {userNameState || "Student"}
          </Text>
        </TouchableOpacity>
      </View>

      <View className="mb-2 flex-row items-center border border-gray-600 rounded-xl bg-[#1a1a2e]">
        <TextInput
          placeholder="Search Subject"
          value={query}
          onChangeText={setQuery}
          placeholderTextColor={"#ababab"}
          className="flex-1 text-white px-4 py-2"
        />
        <Image source={icons.search} className="opacity-50 mr-4 size-5" />
      </View>

      <View className="h-6 justify-center items-center">
        {loading && <ActivityIndicator size="small" color="#888" />}
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

      <FlatList
        data={displayedPapers}
        renderItem={({ item }) => (
          <PaperCard
            paper={item}
            onOpenDetails={fetchPaperById}
            onDownload={downloadAndOpenDocument}
          />
        )}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: "space-between" }}
        contentContainerStyle={{ paddingBottom: 80 }}
        onEndReached={loadMorePapers}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loading && displayedPapers.length > 0 ? (
            <ActivityIndicator color="#888" style={{ marginTop: 10 }} />
          ) : null
        }
        ListEmptyComponent={
          !loading ? (
            <Text className="text-white text-center mt-10">
              {query
                ? `No papers found for "${query}"`
                : "Failed to load papers"}
            </Text>
          ) : null
        }
      />

      <Modal visible={!!selectedPaper} transparent animationType="slide">
        <View className="flex-1 bg-black/80 justify-center px-6">
          <View className="bg-[#1a1a2e] p-4 rounded-lg h-content">
            <ScrollView>
              {selectedPaper?.previewImageUrl && (
                <Image
                  source={{ uri: selectedPaper.previewImageUrl }}
                  className="w-full min-h-[450] rounded-lg mb-1"
                  resizeMode="contain"
                />
              )}
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
                <View className="flex-row justify-around mb-2">
                  <TouchableOpacity
                    onPress={() => {
                      setSelectedPaper(null);
                      router.push({
                        pathname: "/EditPaper",
                        params: { paperId: selectedPaper.id.toString() },
                      });
                    }}
                    className="bg-yellow-600 py-2 rounded-md flex-1 mx-1 items-center"
                  >
                    <Text className="text-white font-semibold">Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => confirmDelete(selectedPaper.id)}
                    className="bg-red-600 py-2 rounded-md flex-1 mx-1 items-center"
                  >
                    <Text className="text-white font-semibold">Delete</Text>
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
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
