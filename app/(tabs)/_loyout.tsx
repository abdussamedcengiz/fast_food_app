import { Redirect, Slot } from "expo-router";
import React from "react";

export default function _loyout() {
  const isAuthenticated = false;
  if (!isAuthenticated) return <Redirect href={"/(auth)/SignIn"} />;
  return <Slot />;
}
