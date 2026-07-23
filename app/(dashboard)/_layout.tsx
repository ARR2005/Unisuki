import { Tabs } from "expo-router";
import React from "react";
import CustomNavBar from "../../components/CustomNavbar";

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomNavBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          href: "/(dashboard)/home",
        }}
      />

      <Tabs.Screen
        name="message"
        options={{
          title: "Message",
          href: "/(dashboard)/message",
        }}
      />

      <Tabs.Screen
        name="postProduct"
        options={{
          title: "Post Product",
          href: "/(dashboard)/postProduct",
        }}
      />

      <Tabs.Screen
        name="reserve"
        options={{
          title: "Reserve",
          href: "/(dashboard)/reserve",
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          href: "/(dashboard)/profile",
        }}
      />
    </Tabs>
  );
}
