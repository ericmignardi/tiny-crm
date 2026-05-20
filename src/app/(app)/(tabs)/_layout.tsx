import { NativeTabs } from "expo-router/unstable-native-tabs";
import React from "react";

export default function TabsLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="today">
        <NativeTabs.Trigger.Label>Today</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="house.fill" md="home" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="people">
        <NativeTabs.Trigger.Icon sf="person" md="person" />
        <NativeTabs.Trigger.Label>People</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="reminders">
        <NativeTabs.Trigger.Icon sf="bell" md="notifications" />
        <NativeTabs.Trigger.Label>Reminders</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="settings">
        <NativeTabs.Trigger.Icon sf="gear" md="settings" />
        <NativeTabs.Trigger.Label>Settings</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
