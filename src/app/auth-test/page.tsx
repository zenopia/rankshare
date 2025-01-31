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
    lastChecked: Date | null;
  }>({ token: null, error: null, lastChecked: null });

  const addLog = (message: string) => {
    setLogs(prev => [`${new Date().toISOString()}: ${message}`, ...prev]);
  };

  const checkToken = async () => {
    try {
      addLog("Attempting to get token...");
      const token = await getToken();
      const now = new Date();
      setTokenState({ token, error: null, lastChecked: now });
      
      if (token) {
        // Parse the JWT to check its contents
        try {
          const [header, payload, signature] = token.split('.');
          const decodedPayload = JSON.parse(atob(payload));
          addLog(`Token retrieved successfully - Expires: ${new Date(decodedPayload.exp * 1000).toISOString()}`);
          addLog(`Token issued at: ${new Date(decodedPayload.iat * 1000).toISOString()}`);
          
          // Check if token is expired
          if (decodedPayload.exp * 1000 < Date.now()) {
            addLog("WARNING: Token is expired!");
          }
        } catch (e) {
          addLog("Warning: Could not decode token payload");
        }
      } else {
        addLog("No token available");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      addLog(`Error getting token: ${errorMessage}`);
      setTokenState(prev => ({ ...prev, error: errorMessage }));
    }
  };

  const checkSession = async () => {
    try {
      addLog("Checking Clerk session...");
      if (clerk.session) {
        addLog(`Session found - ID: ${clerk.session.id}`);
        addLog(`Session status: ${clerk.session.status}`);
        addLog(`Last active: ${new Date(clerk.session.lastActiveAt).toISOString()}`);
        addLog(`Session expires: ${new Date(clerk.session.lastActiveAt + (clerk.session.expireAt || 0)).toISOString()}`);
        
        // Check token from session directly
        try {
          const sessionToken = await clerk.session.getToken();
          addLog(sessionToken ? "Session token available" : "No session token available");
        } catch (e) {
          addLog(`Error getting session token: ${e instanceof Error ? e.message : String(e)}`);
        }
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
        await checkSession();
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
        setTokenState({ token: null, error: null, lastChecked: new Date() });
      } else {
        addLog("No session to clear");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      addLog(`Error clearing session: ${errorMessage}`);
    }
  };

  // Continuous token monitoring
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isSignedIn) {
      interval = setInterval(async () => {
        const now = new Date();
        const lastCheck = tokenState.lastChecked;
        
        // Only log if more than 5 seconds have passed
        if (!lastCheck || now.getTime() - lastCheck.getTime() > 5000) {
          addLog("Periodic token check...");
          await checkToken();
        }
      }, 5000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isSignedIn, tokenState.lastChecked]);

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
              <li>Last Token Check: {tokenState.lastChecked?.toISOString() || 'Never'}</li>
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