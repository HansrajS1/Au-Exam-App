import axios from "axios";
import * as DocumentPicker from "expo-document-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface Paper {
  id: number;
  college: string;
  course: string;
  semester: number;
  subject: string;
  description: string;
  userEmail: string;
}

export default function EditPaper() {
  const { paperId } = useLocalSearchParams<{ paperId: string }>();
  const router = useRouter();

  const [paper, setPaper] = useState<Paper | null>(null);
  const [initialPaper, setInitialPaper] = useState<Paper | null>(null);
  const [file, setFile] = useState<DocumentPicker.DocumentPickerResult | null>(null);
  const [previewImage, setPreviewImage] = useState<DocumentPicker.DocumentPickerResult | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  
  const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL || "http://localhost:3000";

  useEffect(() => {
    const fetchPaper = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${BASE_URL}/api/papers/${paperId}`);
        if (!response.ok) throw new Error("Failed to load paper.");
        const data = await response.json();
        setPaper(data);
        setInitialPaper(data);
      } catch (error) {
        console.error(error);
        setSubmitMsg("Failed to load paper data.");
        setIsSuccess(false);
      } finally {
        setIsLoading(false);
      }
    };
    if (paperId) fetchPaper();
  }, [paperId]);

  const handleFilePick = async (type: 'file' | 'image') => {
    const result = await DocumentPicker.getDocumentAsync({
      type: type === 'image' ? ["image/*"] : ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
      copyToCacheDirectory: true,
    });
    if (!result.canceled) {
      if (type === 'image') setPreviewImage(result);
      else setFile(result);
    }
  };

  const showTemporaryMessage = (message: string, success: boolean) => {
    setSubmitMsg(message);
    setIsSuccess(success);
    setTimeout(() => {
      router.replace("/");
      setSubmitMsg("");
    }, 900);
  };

  const handleUpdate = async () => {
    if (!paper || isSubmitting) return;
    setIsSubmitting(true);

    if (!paper.subject.trim()) {
      showTemporaryMessage("Subject field cannot be empty.", false);
      setIsSubmitting(false);
      return;
    }

    const formData = new FormData();
    formData.append("data", JSON.stringify(paper));

    if (file?.assets?.[0]) {
      formData.append("file", {
        uri: file.assets[0].uri,
        name: file.assets[0].name,
        type: file.assets[0].mimeType,
      } as any);
    }
    if (previewImage?.assets?.[0]) {
      formData.append("preview", {
        uri: previewImage.assets[0].uri,
        name: previewImage.assets[0].name,
        type: previewImage.assets[0].mimeType,
      } as any);
    }

    try {
      const response = await axios.put(`${BASE_URL}/api/papers/${paperId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const updatedPaper = response.data;
      showTemporaryMessage("Paper updated successfully!", true);
      setInitialPaper(updatedPaper);
      setPaper(updatedPaper);
      setFile(null);
      setPreviewImage(null);

    } catch (error: any) {
      console.error("Update error:", error.response?.data || error.message);
      showTemporaryMessage("Update failed. Please try again.", false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasChanged = initialPaper && (JSON.stringify(initialPaper) !== JSON.stringify(paper) || file !== null || previewImage !== null);

  if (isLoading) {
    return (
      <View className="flex-1 bg-[#030014] justify-center items-center">
        <ActivityIndicator size="large" color="#FFFFFF" />
      </View>
    );
  }

  if (!paper) {
    return (
      <View className="flex-1 bg-[#030014] justify-center items-center px-4">
        <Text className="text-red-400 text-lg">{submitMsg || "Paper not found."}</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1 bg-[#030014]">
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }} className="px-4 py-6">
        <View className="w-full max-w-xl mx-auto">
          <Text className="text-white text-xl mb-4 text-center">Edit Paper</Text>

          <TextInput
            placeholder="Subject"
            value={paper.subject}
            onChangeText={(text) => setPaper({ ...paper, subject: text })}
            className="bg-white rounded-md px-4 py-3 mb-4 text-base"
            placeholderTextColor="#6B7280"
          />
          <TextInput
            placeholder="Short Description"
            value={paper.description}
            onChangeText={(text) => setPaper({ ...paper, description: text })}
            multiline
            className="bg-white rounded-md px-4 py-3 mb-4 text-base h-12"
            placeholderTextColor="#6B7280"
          />

          <TouchableOpacity onPress={() => handleFilePick('file')} className="bg-indigo-600 rounded-md px-4 py-3 mb-4">
            <Text className="text-white text-center" numberOfLines={1}>
              {file?.assets?.[0]?.name ?? "Replace Paper File (optional)"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => handleFilePick('image')} className="bg-purple-600 rounded-md px-4 py-3 mb-4">
            <Text className="text-white text-center" numberOfLines={1}>
              {previewImage?.assets?.[0]?.name ?? "Replace Preview Image (optional)"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleUpdate}
            disabled={!hasChanged || isSubmitting}
            className="bg-green-600 w-[50%] mx-auto rounded-md px-4 py-3 mb-4 items-center disabled:opacity-50"
          >
            <Text className="text-white text-center font-semibold">
              {isSubmitting ? 'Updating...' : 'Update'}
            </Text>
          </TouchableOpacity>
                    <View className="h-6 mb-2 text-center">
            {submitMsg && (
              <Text className={`text-center ${isSuccess ? "text-green-400" : "text-red-400"}`}>
                {submitMsg}
              </Text>
            )}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}