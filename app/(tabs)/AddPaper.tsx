import { useAuth } from "@/lib/authcontext";
import axios from "axios";
import * as DocumentPicker from "expo-document-picker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function AddPaper() {
  const { userVerified, userEmail } = useAuth();
  const router = useRouter();
  const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL || "http://localhost:3000";

  const [college, setCollege] = useState("Alliance University");
  const [course, setCourse] = useState("");
  const [semester, setSemester] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<DocumentPicker.DocumentPickerResult | null>(
    null
  );
  const [previewImage, setPreviewImage] =
    useState<DocumentPicker.DocumentPickerResult | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const showTemporaryMessage = (message: string, success: boolean) => {
    setSubmitMsg(message);
    setIsSuccess(success);
    setTimeout(() => {
      router.replace("/");
      setSubmitMsg("");
    }, 800);
  };

  const handleFilePick = async (type: "file" | "image") => {
    const result = await DocumentPicker.getDocumentAsync({
      type:
        type === "image"
          ? ["image/*"]
          : [
              "application/pdf",
              "application/msword",
              "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            ],
      copyToCacheDirectory: true,
    });
    if (!result.canceled) {
      if (type === "image") setPreviewImage(result);
      else setFile(result);
    }
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    if (
      !course ||
      !semester ||
      !subject ||
      !file ||
      !previewImage ||
      !userEmail
    ) {
      showTemporaryMessage(
        "Please fill out all fields and upload both files.",
        false
      );
      setIsSubmitting(false);
      return;
    }

    const dto = {
      college,
      course,
      semester: parseInt(semester),
      subject,
      description,
      userEmail,
    };
    const formData = new FormData();
    formData.append("data", JSON.stringify(dto));

    if (!file.assets?.[0] || !previewImage.assets?.[0]) {
      showTemporaryMessage(
        "Selected files are invalid. Please re-select.",
        false
      );
      setIsSubmitting(false);
      return;
    }

    formData.append("file", {
      uri: file.assets[0].uri,
      name: file.assets[0].name,
      type: file.assets[0].mimeType,
    } as any);
    formData.append("preview", {
      uri: previewImage.assets[0].uri,
      name: previewImage.assets[0].name,
      type: previewImage.assets[0].mimeType,
    } as any);

    try {
      const response = await axios.post(
        `${BASE_URL}/api/papers/upload`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      const newPaper = response.data;
      const cachedData = await AsyncStorage.getItem("allPapers");
      if (cachedData) {
        const papers = JSON.parse(cachedData);
        papers.unshift(newPaper);
        await AsyncStorage.setItem("allPapers", JSON.stringify(papers));
      }

      showTemporaryMessage("Paper uploaded successfully!", true);

      setCollege("Alliance University");
      setCourse("");
      setSemester("");
      setSubject("");
      setDescription("");
      setFile(null);
      setPreviewImage(null);
    } catch (error: any) {
      console.error("Upload error:", error.response?.data || error.message);
      showTemporaryMessage("Upload failed. Please try again.", false);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!userVerified) {
    return (
      <View className="flex-1 items-center justify-center bg-[#030014]">
        <Text className="text-red-500 text-lg mb-2">Access Denied</Text>
        <Text className="text-white text-lg m-2 text-center">
          Please verify your email to add papers.
        </Text>
        <TouchableOpacity
          onPress={() => router.replace("/Login")}
          className="bg-indigo-600 mt-4 px-6 py-2 rounded-md"
        >
          <Text className="text-white font-semibold">Verify Now</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-[#030014]"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
        className="px-4 py-6"
      >
        <View className="w-full max-w-xl mx-auto">
          <Text className="text-white text-xl mb-4 text-center">Add Paper</Text>

          <TextInput
            placeholder="College"
            value={college}
            onChangeText={setCollege}
            className="bg-white rounded-md px-4 py-3 mb-4 text-base"
            placeholderTextColor="#6B7280"
          />
          <TextInput
            placeholder="Course"
            value={course}
            onChangeText={setCourse}
            className="bg-white rounded-md px-4 py-3 mb-4 text-base"
            placeholderTextColor="#6B7280"
          />
          <TextInput
            placeholder="Semester (1-10)"
            value={semester}
            onChangeText={(text) => {
              if (/^([1-9]|10)?$/.test(text)) {
                setSemester(text);
              }
            }}
            keyboardType="number-pad"
            maxLength={2}
            className="bg-white rounded-md px-4 py-3 mb-4 text-base"
            placeholderTextColor="#6B7280"
          />
          <TextInput
            placeholder="Subject"
            value={subject}
            onChangeText={setSubject}
            className="bg-white rounded-md px-4 py-3 mb-4 text-base"
            placeholderTextColor="#6B7280"
          />
          <TextInput
            placeholder="Short Description"
            value={description}
            onChangeText={setDescription}
            multiline
            className="bg-white rounded-md px-4 py-3 mb-4 text-base h-12"
            placeholderTextColor="#6B7280"
          />

          <TouchableOpacity
            onPress={() => handleFilePick("file")}
            className="bg-indigo-600 rounded-md px-4 py-3 mb-4"
          >
            <Text className="text-white text-center" numberOfLines={1}>
              {file?.assets?.[0]?.name ?? "Upload Paper (PDF, Word)"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleFilePick("image")}
            className="bg-purple-600 rounded-md px-4 py-3 mb-4"
          >
            <Text className="text-white text-center" numberOfLines={1}>
              {previewImage?.assets?.[0]?.name ?? "Upload Preview Image"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isSubmitting}
            className="bg-green-600 w-[50%] mx-auto rounded-md px-4 py-3 items-center disabled:opacity-50"
          >
            <Text className="text-white text-center font-semibold">
              {isSubmitting ? "Submitting..." : "Submit"}
            </Text>
          </TouchableOpacity>

          <View className="h-6 mb-2 items-center">
            {submitMsg && (
              <Text
                className={`text-center ${
                  isSuccess ? "text-green-400" : "text-red-400"
                }`}
              >
                {submitMsg}
              </Text>
            )}
          </View>
        </View>
      </ScrollView>
      <Text className="text-center text-gray-400 absolute right-0 left-0 bottom-1 text-xs">
        Thank you for contributing!
      </Text>
    </KeyboardAvoidingView>
  );
}
