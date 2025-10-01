import { useAuth } from "@/lib/authcontext";
import axios from "axios";
import * as DocumentPicker from "expo-document-picker";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Button } from "react-native-paper";

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

  useEffect(() => {
    if (!userVerified) {
      Alert.alert(
        "Verification Required",
        "Please verify your email to access this section.",
        [{ text: "Go to Verify", onPress: () => router.replace("/Login") }]
      );
    }
  }, [router, userVerified]);

  const handleFilePick = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]
      ,
      copyToCacheDirectory: true,
    });

    if (!result.canceled) {
      setFile(result);
    }
  };

  const handlePreviewPick = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ["image/*"],
      copyToCacheDirectory: true,
    });

    if (!result.canceled) {
      setPreviewImage(result);
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
      Alert.alert(
        "Missing Fields",
        "Please fill out all fields and upload both files."
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

    if (!file.assets || !previewImage.assets) {
      Alert.alert(
        "File Error",
        "Selected files are invalid. Please re-upload."
      );
      return;
    }

    formData.append("file", {
      uri: file.assets[0].uri,
      name: file.assets[0].name ?? "paper.pdf",
      type: file.assets[0].mimeType ?? "application/pdf",
    } as any);

    formData.append("preview", {
      uri: previewImage.assets[0].uri,
      name: previewImage.assets[0].name ?? "preview.jpg",
      type: previewImage.assets[0].mimeType ?? "image/jpeg",
    } as any);

    try {
      const response = await axios.post(
        `${BASE_URL}/api/papers/upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log("Upload response:", response.data);
      Alert.alert("Success", "Paper uploaded successfully!");
      router.replace("/");
      setCollege("Alliance University");
      setCourse("");
      setSemester("");
      setSubject("");
      setDescription("");
      setFile(null);
      setPreviewImage(null);
      setIsSubmitting(true);
    } catch (error: any) {
      console.error("Upload error:", error.response?.data || error.message);
      Alert.alert(
        "Error",
        "Upload failed. Please check your input and try again."
      );
    }
    finally {
      setIsSubmitting(false); 
      console.log("Submission process completed.");
    }
  };

  if (!userVerified) {
    return (
      <View className="flex-1 items-center justify-center bg-[#030014]">
        <Text className="text-red-500 text-lg mb-2">Access Denied</Text>
        <Text className="text-white text-lg m-2">
          Please verify your email to add papers.
        </Text>
        <Button
          className="w-1/2 mx-auto bg-indigo-600 mt-4"
          onPress={() => router.replace("/Login")}
          mode="contained"
        >
          Verify Now
        </Button>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#030014] justify-center px-4 py-6">
      <KeyboardAvoidingView behavior="padding" className="w-[90%] mx-auto">
        <Text className="text-white text-xl mb-4 text-center">Add Paper</Text>

        <TextInput
          placeholder="College"
          placeholderTextColor="#aaa"
          value={college}
          onChangeText={setCollege}
          className="bg-white rounded-md px-4 py-2 mb-4"
        />
        <TextInput
          placeholder="Course"
          placeholderTextColor="#aaa"
          value={course}
          onChangeText={setCourse}
          className="bg-white rounded-md px-4 py-2 mb-4"
        />
        <TextInput
          placeholder="Semester"
          placeholderTextColor="#aaa"
          value={semester}
          onChangeText={setSemester}
          keyboardType="number-pad"
          maxLength={1}
          className="bg-white rounded-md px-4 py-2 mb-4"
        />
        <TextInput
          placeholder="Subject"
          placeholderTextColor="#aaa"
          value={subject}
          onChangeText={setSubject}
          className="bg-white rounded-md px-4 py-2 mb-4"
        />
        <TextInput
          placeholder="Short Description"
          placeholderTextColor="#aaa"
          value={description}
          onChangeText={setDescription}
          multiline
          className="bg-white rounded-md px-4 py-2 mb-4"
        />

        <TouchableOpacity
          onPress={handleFilePick}
          className="bg-indigo-600 rounded-md px-4 py-2 mb-4"
        >
          <Text className="text-white text-center">
            {file?.assets?.[0]?.name ?? "Upload Paper (PDF, Word)"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handlePreviewPick}
          className="bg-purple-600 rounded-md px-4 py-2 mb-4"
        >
          <Text className="text-white text-center">
            {previewImage?.assets?.[0]?.name ?? "Upload Preview Image"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleSubmit}
          disabled={isSubmitting}
          className="bg-green-600 w-[50%] mx-auto rounded-md px-4 py-2 mb-4"
        >
          <Text className="text-white text-center font-semibold">Submit</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
      <Text className="text-center text-gray-400 absolute right-0 left-0 bottom-1 text-xs">
        Thank you for contributing!
      </Text>
    </View>
  );
}
