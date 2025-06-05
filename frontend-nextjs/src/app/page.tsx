'use client';

import { useState, useEffect } from "react";
import ClientProvider, { apolloClient } from "./client-provider";
import Auth from "../components/Auth";
import Dashboard from "../components/Dashboard";

function AppContent() {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is already logged in
    const savedToken = localStorage.getItem("token");
    if (savedToken) {
      setToken(savedToken);
    }
  }, []);

  const handleLogin = (newToken: string) => {
    setToken(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
    // Clear Apollo cache using the exported client
    apolloClient.clearStore();
  };

  return (
    <>
      {token ? (
        <Dashboard onLogout={handleLogout} />
      ) : (
        <Auth onLogin={handleLogin} />
      )}
    </>
  );
}

export default function Home() {
  return (
    <ClientProvider>
      <AppContent />
    </ClientProvider>
  );
}
