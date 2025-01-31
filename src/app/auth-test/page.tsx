"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth.context";
import { useClerk, useUser } from "@clerk/nextjs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AuthTestPage() {
  const { isLoaded, getToken, isSignedIn } = useAuth();
  const { user } = useUser();
  const clerk = useClerk();
  const [logs, setLogs] = useState<string[]>([]);
  const [tokenState, setTokenState] = useState<{
    token: string | null;
    error: string | null;
  }>({ token: null, error: null });

  const addLog = (message: string) => {
    setLogs(prev => [`${new Date().toISOString()}: ${message}`, ...prev]);
  };

  const checkToken = async () => {
    try {
      addLog("Attempting to get token...");
      const token = await getToken();
      addLog(token ? "Token retrieved successfully" : "No token available");
      setTokenState({ token: token, error: null });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      addLog(`Error getting token: ${errorMessage}`);
      setTokenState({ token: null, error: errorMessage });
    }
  };

  const checkSession = async () => {
    try {
      addLog("Checking Clerk session...");
      if (clerk.session) {
        addLog(`Session found - ID: ${clerk.session.id}`);
        addLog(`Session status: ${clerk.session.status}`);
        addLog(`Last active: ${new Date(clerk.session.lastActiveAt).toISOString()}`);
      } else {
        addLog("No active session found");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      addLog(`Error checking session: ${errorMessage}`);
    }
  };

  const refreshSession = async () => {
    try {
      addLog("Attempting to refresh session...");
      if (clerk.session) {
        await clerk.session.touch();
        addLog("Session refreshed successfully");
        await checkToken();
      } else {
        addLog("No session to refresh");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      addLog(`Error refreshing session: ${errorMessage}`);
    }
  };

  const clearSession = async () => {
    try {
      addLog("Attempting to clear session...");
      if (clerk.session) {
        await clerk.session.remove();
        addLog("Session cleared successfully");
      } else {
        addLog("No session to clear");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      addLog(`Error clearing session: ${errorMessage}`);
    }
  };

  useEffect(() => {
    // Log initial state
    addLog(`Initial load - isLoaded: ${isLoaded}, isSignedIn: ${isSignedIn}`);
    if (user) {
      addLog(`User found - ID: ${user.id}`);
    }

    // Check if we're on a mobile browser
    const isMobile = typeof window !== 'undefined' && 
      /Mobile|Android|iPhone/i.test(window.navigator.userAgent);
    addLog(`Browser type: ${isMobile ? 'Mobile' : 'Desktop'}`);

    // Check initial token
    checkToken();
    checkSession();
  }, [isLoaded, isSignedIn, user]);

  return (
    <div className="container py-8 space-y-8">
      <Card className="p-6">
        <h1 className="text-2xl font-bold mb-4">Auth Debug Page</h1>
        
        <div className="space-y-4 mb-8">
          <div>
            <h2 className="font-semibold mb-2">Current State:</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>isLoaded: {String(isLoaded)}</li>
              <li>isSignedIn: {String(isSignedIn)}</li>
              <li>Has User: {String(!!user)}</li>
              <li>Has Session: {String(!!clerk.session)}</li>
            </ul>
          </div>

          <div>
            <h2 className="font-semibold mb-2">Token State:</h2>
            {tokenState.error ? (
              <p className="text-red-500">Error: {tokenState.error}</p>
            ) : tokenState.token ? (
              <p className="text-green-500">Token available</p>
            ) : (
              <p className="text-yellow-500">No token</p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-4 mb-8">
          <Button onClick={checkToken}>
            Check Token
          </Button>
          <Button onClick={checkSession}>
            Check Session
          </Button>
          <Button onClick={refreshSession}>
            Refresh Session
          </Button>
          <Button onClick={clearSession} variant="destructive">
            Clear Session
          </Button>
        </div>

        <div>
          <h2 className="font-semibold mb-2">Debug Logs:</h2>
          <div className="bg-muted p-4 rounded-lg max-h-96 overflow-y-auto">
            {logs.map((log, index) => (
              <div key={index} className="font-mono text-sm mb-1">
                {log}
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
} 