import axios from "axios";
import * as DocumentPicker from "expo-document-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function EditPaper() {
  const { paperId } = useLocalSearchParams();
  const router = useRouter();

  const [paper, setPaper] = useState<any>(null);
  const [file, setFile] = useState<DocumentPicker.DocumentPickerResult | null>(null);
  const [previewImage, setPreviewImage] = useState<DocumentPicker.DocumentPickerResult | null>(null);
  const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL || "http://localhost:3000";

  useEffect(() => {
    const fetchPaper = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/papers/${paperId}`);
        const data = await response.json();
        setPaper(data);
      } catch {
        Alert.alert("Error", "Failed to load paper.");
      }
    };
    fetchPaper();
  }, [paperId]);

  const handleFilePick = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ["application/pdf", "application/msword"],
      copyToCacheDirectory: true,
    });
    if (!result.canceled) setFile(result);
  };

  const handlePreviewPick = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ["image/*"],
      copyToCacheDirectory: true,
    });
    if (!result.canceled) setPreviewImage(result);
  };

  const handleUpdate = async () => {
    if (!paper.subject || !paper.description || !paper.userEmail) {
      Alert.alert("Missing Fields", "Subject, description, and user email are required.");
      return;
    }

    const dto = {
      college: paper.college,
      course: paper.course,
      semester: paper.semester,
      subject: paper.subject,
      description: paper.description,
      userEmail: paper.userEmail,
    };

    const formData = new FormData();
    formData.append("data", JSON.stringify(dto));

    if (file?.assets?.[0]) {
      formData.append("file", {
        uri: file.assets[0].uri,
        name: file.assets[0].name ?? "paper.pdf",
        type: file.assets[0].mimeType ?? "application/pdf",
      } as any);
    }

    if (previewImage?.assets?.[0]) {
      formData.append("preview", {
        uri: previewImage.assets[0].uri,
        name: previewImage.assets[0].name ?? "preview.jpg",
        type: previewImage.assets[0].mimeType ?? "image/jpeg",
      } as any);
    }

    try {
      const response = await axios.put(
        `${BASE_URL}/api/papers/${paperId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      Alert.alert("Success", "Paper updated successfully!");
      router.replace("/");
    } catch (error: any) {
      console.error("Update error:", error.response?.data || error.message);
      Alert.alert("Error", "Update failed. Please try again.");
    }
  };

  if (!paper) return null;

  return (
    <View className="flex-1 bg-[#030014] justify-center px-4 py-6">
      <KeyboardAvoidingView behavior="padding" className="w-[90%] mx-auto">
        <Text className="text-white text-xl mb-4 text-center">Edit Paper</Text>

        <TextInput
          placeholder="Subject"
          value={paper.subject}
          onChangeText={(text) => setPaper({ ...paper, subject: text })}
          className="bg-white rounded-md px-4 py-2 mb-4"
        />
        <TextInput
          placeholder="Short Description"
          value={paper.description}
          onChangeText={(text) => setPaper({ ...paper, description: text })}
          multiline
          className="bg-white rounded-md px-4 py-2 mb-4"
        />

        <TouchableOpacity
          onPress={handleFilePick}
          className="bg-indigo-600 rounded-md px-4 py-2 mb-4"
        >
          <Text className="text-white text-center">
            {file?.assets?.[0]?.name ?? "Replace Paper File (optional)"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handlePreviewPick}
          className="bg-purple-600 rounded-md px-4 py-2 mb-4"
        >
          <Text className="text-white text-center">
            {previewImage?.assets?.[0]?.name ?? "Replace Preview Image (optional)"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleUpdate}
          className="bg-green-600 w-[50%] mx-auto rounded-md px-4 py-2 mb-4"
        >
          <Text className="text-white text-center font-semibold">Update</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </View>
  );
}
