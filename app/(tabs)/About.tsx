import React from "react";
import {
  ScrollView,
  View,
  Text,
  Image,
  TouchableOpacity,
  Linking,
} from "react-native";
import { icons } from "@/constants/icons";  

export default function About() {
  return (
    <View className="bg-[#030014] h-full pb-20">
      <ScrollView className="flex-1  bg-gradient-to-b from-[#030014] to-[#0a0a23] px-4 ">
        <View className="items-center">
          <Image
            source={icons.logo}
            className="h-25 w-25 m-7 rounded-xl animate-pulse"
            resizeMode="contain"
          />

          <Text className="text-3xl font-extrabold text-white mb-4 text-center">
            About <Text className="text-green-400">AU Exam App</Text>
          </Text>

          <Text className="text-gray-300 text-lg mb-8 text-center">
            Welcome to <Text className="font-bold text-white">AU Exam Web</Text>{" "}
            — your personal digital library for previous year’s end-semester
            question papers. Designed for students, by students.
          </Text>

          <View className="bg-[#1a1a2e] rounded-xl p-6 mb-8 shadow-md w-full">
            <Text className="text-2xl font-semibold text-white mb-4">
              Features
            </Text>
            <Text className="text-gray-300 mb-1">
              • Create an account and sign in securely.
            </Text>
            <Text className="text-gray-300 mb-1">
              • Browse and search sample papers easily.
            </Text>
            <Text className="text-gray-300 mb-1">
              • Access papers from all semesters.
            </Text>
            <Text className="text-gray-300 mb-1">
              • View subject details and metadata.
            </Text>
            <Text className="text-gray-300 mb-1">
              • Upload question papers in PDF format.
            </Text>
            <Text className="text-gray-300">
              • Download papers instantly in PDF format.
            </Text>
          </View>

          <View className="bg-[#1a1a2e] rounded-xl p-6 mb-8 shadow-md w-full">
            <Text className="text-2xl font-semibold text-white mb-4">
              Why Use This App?
            </Text>
            <Text className="text-gray-300 text-lg">
              No more endless searching. Just open the app, select your course,
              semester, and subject and download the papers instantly. It’s
              fast, reliable, and built for your academic success.
            </Text>
          </View>

          <View className="bg-[#1a1a2e] rounded-xl p-6 mb-8 shadow-md w-full">
            <Text className="text-2xl font-semibold text-center text-white mb-4">
              Project Repositories
            </Text>
            <Text className="text-gray-300 mb-2">
              <Text
                className="text-blue-400"
                onPress={() =>
                  Linking.openURL("https://github.com/hansrajS1/au-exam-web")
                }
              >
                Au-Exam-Web
              </Text>{" "}
              – Frontend React app for browsing and downloading papers
            </Text>
            <Text className="text-gray-300 mb-2">
              <Text
                className="text-blue-400"
                onPress={() =>
                  Linking.openURL(
                    "https://github.com/hansrajS1/au-exam-backend"
                  )
                }
              >
                Au-Exam-Backend
              </Text>{" "}
              – Backend Express API for paper management
            </Text>
            <Text className="text-gray-300 mb-2">
              <Text
                className="text-blue-400"
                onPress={() =>
                  Linking.openURL("https://github.com/hansrajS1/au-exam-app")
                }
              >
                Au-Exam-App
              </Text>{" "}
              – Android app built with React Native for mobile access
            </Text>
            <Text className="text-sm text-center text-gray-400 mt-2">
              Come contribute and make it better!
            </Text>
          </View>

          <View className="bg-[#1a1a2e] rounded-xl p-6 mb-8 shadow-md w-full">
            <Text className="text-2xl text-center font-semibold text-white mb-4">
              Contributors
            </Text>
            <Text className="text-gray-300 mb-2">
              <Text
                className="text-blue-400"
                onPress={() => Linking.openURL("https://github.com/hansrajS1")}
              >
                Hans Raj
              </Text>{" "}
              - BTech CSE Final Year Student at Alliance University, Bangalore.
            </Text>
            <Text className="text-gray-300 mb-2">
              <Text
                className="text-blue-400"
                onPress={() =>
                  Linking.openURL("https://github.com/Deepakkr004")
                }
              >
                Deepak Kumar
              </Text>{" "}
              - BTech CSE Final Year Student at Alliance University, Bangalore.
            </Text>
            <Text className="text-gray-300 mb-2">
              <Text
                className="text-blue-400"
                onPress={() => Linking.openURL("https://github.com/0Naveen2")}
              >
                Naveen Kumar
              </Text>{" "}
              - BTech CSE Final Year Student at Alliance University, Bangalore.
            </Text>
          </View>

          <View className="bg-[#1a1a2e] rounded-xl p-6 mb-8 shadow-md w-full">
            <Text className="text-2xl text-center font-semibold text-white mb-4">
              Get Involved
            </Text>
            <Text className="text-gray-300 text-lg">
              We welcome contributions from everyone! Whether it&apos;s
              reporting bugs, suggesting features, or submitting code, your
              input is valuable.
            </Text>
          </View>
          <TouchableOpacity
            className="bg-green-500 px-6 py-2 rounded-full mb-6"
            onPress={() => Linking.openURL("https://auexamapp.tech/app-download")}
          >
            <Text className="text-white font-semibold text-base">
              Android Download is Live!
            </Text>
          </TouchableOpacity>

          <Text className="text-gray-300 text-lg mb-4 text-center">
            Questions or feedback? Reach out at{" "}
            <Text
              className="text-blue-400 "
              onPress={() => Linking.openURL("mailto:auexamapp@gmail.com")}
            >
              auexamapp@gmail.com
            </Text>
          </Text>

          <View className="text-sm text-gray-500 space-y-1 mb-6 items-center">
            <Text className="text-center text-white">
              Made by{" "}
              <Text
                className="text-blue-400"
                onPress={() => Linking.openURL("https://github.com/hansrajS1")}
              >
                Hans Raj
              </Text>
            </Text>
            <Text className="text-center text-white">
              Open source on{" "}
              <Text
                className="text-blue-400 text-center"
                onPress={() =>
                  Linking.openURL("https://github.com/hansrajS1/au-exam-web")
                }
              >
                GitHub
              </Text>
            </Text>
          </View>
        </View>
      </ScrollView>
      <Text className="text-center text-gray-400 absolute right-0 left-0 bottom-1 text-xs">
        Made for students, free forever
      </Text>
    </View>
  );
}
