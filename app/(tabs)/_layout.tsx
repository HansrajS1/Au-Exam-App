import { icons } from "@/constants/icons";
import { images } from "@/constants/images";
import { Tabs } from "expo-router";
import { Image, ImageBackground, Text, View } from "react-native";

const TabIcon = ({ focused, icon, title }: any) => {
  return (
    focused ? (
      <ImageBackground source={images.highlight} className=" flex-row w-full min-h-16 min-w-[120px] justify-center items-center rounded-full overflow-hidden">
        <Image source={icon} tintColor="#151312" className="size-5" />
        <Text className="text-secondary text-base font-semibold ml-4">{title}</Text>
      </ImageBackground>
    ) : (
      <View className="size-full justify-center items-center rounded-full">
        <Image source={icon} tintColor="#A8B5DB" className="size-5" />
      </View>
    )
  )
}


export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: "#0f0D23",
          borderRadius: 50,
          marginHorizontal: 2,
          marginBottom: 33,
          height: 52,
          position: "absolute",
          overflow: "hidden",
          borderWidth: 0,
          borderColor: "#0f0D23"
        },
        tabBarIconStyle: {
          width: "100%",
          height: "100%",
          justifyContent: "center",
          alignItems: "center",
          paddingLeft: 2,
          paddingRight: 2
        }
      }}
    >
      <Tabs.Screen name="index" options={{
        title: "Home",
        headerShown: false,
        tabBarIcon: ({ focused }) => (
          <TabIcon
            focused={focused}
            icon={icons.home}
            title="Home"
          />
        )
      }}
      />
      <Tabs.Screen name="AddPaper" options={{
        title: "AddPaper",
        headerShown: false,
        tabBarIcon: ({ focused }) => (
          <TabIcon
            focused={focused}
            icon={icons.add}
            title="Add Paper"
          />
        )
      }}
      />
      <Tabs.Screen name="AskAI" options={{
        title: "Ask AI",
        headerShown: false,
        tabBarIcon: ({ focused }) => (
          <TabIcon
            focused={focused}
            icon={icons.askai}
            title="Ask AI"
          />
        )
      }}
      />
      <Tabs.Screen name="About" options={{
        title: "About",
        headerShown: false,
        tabBarIcon: ({ focused }) => (
          <TabIcon
            focused={focused}
            icon={icons.about}
            title="About"
          />
        )
      }}
      />
      <Tabs.Screen name="Login" options={{
        title: "Login",
        headerShown: false,
        tabBarIcon: ({ focused }) => (
          <TabIcon
            focused={focused}
            icon={icons.person}
            title="Profile"
          />
        )
      }}
      />
    </Tabs>
  );
}