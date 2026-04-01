"use client";

import { useAuth } from "@clerk/nextjs";
import React from "react";

export function AuthLayout({
  signedIn,
  signedOut,
}: {
  signedIn: React.ReactNode;
  signedOut: React.ReactNode;
}) {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) return null;

  return <>{isSignedIn ? signedIn : signedOut}</>;
}
