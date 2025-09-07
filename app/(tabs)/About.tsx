import { icons } from "@/constants/icons";
import React from 'react';
import { Image, Text, View } from 'react-native';

const Login = () => {
    return (
        <View className='flex-1  bg-primary'>
            <View className='h-[95%] w-full align-center justify-center '>
            <View className='mx-auto w-[90%]'>
                <Image source={icons.logo} className="h-23 w-23 mb-4 mx-auto" />
                <Text className="text-xl font-bold  text-white mb-4 ">
                     About This App
                </Text>
                <Text className="text-gray-300 mb-6 text-lg text-justify">
                    Welcome to the <Text className="font-bold text-white">Au Exam App</Text>!
                    This app is designed to help students easily access previous year’s
                    end-semester question papers in one place.
                </Text>

                <Text className="text-xl font-semibold text-white mb-2"> Features:</Text>
                <Text className="text-gray-300 mb-1">• Create an account and Sign In.</Text>
                <Text className="text-gray-300 mb-1">• Browse sample papers easily.</Text>
                <Text className="text-gray-300 mb-1">• Access all semesters paper.</Text>
                <Text className="text-gray-300 mb-1">• View subjects and their details.</Text>
                <Text className="text-gray-300 mb-1 ">• Add question papers in PDF format.</Text>
                <Text className="text-gray-300 mb-8 ">• Download question papers in PDF format.</Text>

                <Text className="text-xl font-semibold mb-2 text-justify text-white "> Why use this app?</Text>
                <Text className=" text-lg text-gray-300  text-justify">
                    This app acts as your personal digital library of exam papers.
                    No more searching everywhere — just open the app, select your course,
                    semester, and subject, and download the papers instantly.
                </Text>

            </View>
            </View>
                <Text className="text-center text-gray-400 absolute right-0 left-0 bottom-1 text-xs">
                    Made for students, free forever
                </Text>
        </View>
    )
}

export default Login;