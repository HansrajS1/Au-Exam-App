import { useAuth } from "@/lib/authcontext";
import * as DocumentPicker from "expo-document-picker";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, KeyboardAvoidingView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Button } from "react-native-paper";

export default function AddPaper() {
  const { userVerified } = useAuth();
  const router = useRouter();

  const [college, setCollege] = useState("Alliance University");
  const [course, setCourse] = useState("");
  const [semester, setSemester] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<DocumentPicker.DocumentPickerResult | null>(null);

  useEffect(() => {
    if (!userVerified) {
      Alert.alert(
        "Verification Required",
        "Please verify your email to access this section.",
        [{ text: "Go to Verify", onPress: () => router.replace("/Login") }]
      );
    }
  }, [userVerified, router]);

  const handleFilePick = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ["application/pdf", "application/msword", "image/*"],
      copyToCacheDirectory: true,
    });

    if (!result.canceled) {
      setFile(result);
    }
  };

  const handleSubmit = async () => {
    if (!course || !semester || !subject || !description || !file) {
      Alert.alert(
        "Missing Fields",
        "Please fill out all fields and upload a file."
      );
      return;
    }

    const formData = new FormData();
    formData.append("college", college);
    formData.append("course", course);
    formData.append("semester", semester);
    formData.append("subject", subject);
    formData.append("description", description);
    if (file.assets && file.assets[0]) {
      formData.append("file", {
        uri: file.assets[0].uri,
        name: file.assets[0].name ?? "upload",
        type: file.assets[0].mimeType ?? "application/octet-stream",
      } as any);
    } else {
      Alert.alert("File Error", "Selected file is invalid.");
      return;
    }

    try {
      const response = await fetch("https://your-api.com/upload-paper", {
        method: "POST",
        headers: {
          "Content-Type": "multipart/form-data",
        },
        body: formData,
      });

      if (response.ok) {
        Alert.alert("Success", "Paper uploaded successfully!");
        router.replace("/");
      } else {
        Alert.alert("Error", "Failed to upload paper.");
      }
    } catch (error) {
      Alert.alert(
        error instanceof Error ? error.message : "Something went wrong.",
        "Something went wrong."
      );
    }
  };

  if (!userVerified) {
    return (
      <View className="flex-1 items-center justify-center bg-[#030014]">
        <Text className="text-red-500 text-lg mb-2">Access Denied</Text>
        <Text className="text-white text-lg m-2">Please verify your email to add papers.</Text>
        <Button className="w-1/2 mx-auto bg-indigo-600 mt-4" onPress={() => router.replace("/Login")} mode="contained" > Verify Now  </Button>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#030014] justify-center px-4 py-6">
      <KeyboardAvoidingView behavior='padding' className=" w-[90%] mx-auto">
      <Text className="text-white text-xl mb-4 text-center">Add Paper</Text>

      <TextInput
        placeholder="College"
        value={college}
        onChangeText={setCollege}
        className="bg-white rounded-md px-4 py-2 mb-4"
      />
      <TextInput
        placeholder="Course"
        value={course}
        onChangeText={setCourse}
        className="bg-white rounded-md px-4 py-2 mb-4"
      />

      <TextInput
        placeholder="Semester (1–10)"
        value={semester}
        onChangeText={setSemester}
        keyboardType="number-pad"
        maxLength={2}
        className="bg-white rounded-md px-4 py-2 mb-4"
      />

      <TextInput
        placeholder="Subject"
        value={subject}
        onChangeText={setSubject}
        className="bg-white rounded-md px-4 py-2 mb-4"
      />

      <TextInput
        placeholder="Short Description"
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
          {file && file.assets && file.assets[0] ? file.assets[0].name : "Upload Paper (PDF, Word, Image)"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={handleSubmit}
        className="bg-green-600 w-[50%] mx-auto rounded-md px-4 py-2 mb-4"
      >
        <Text className="text-white text-center font-semibold">Submit</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
    </View>
  );
}
