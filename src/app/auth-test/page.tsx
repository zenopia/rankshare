"use client";

import { useEffect, useState } from "react";
import { useAuthService } from "@/lib/services/auth.service";
import { useClerk } from "@clerk/nextjs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AuthTestPage() {
  const auth = useAuthService();
  const clerk = useClerk();
  const [logs, setLogs] = useState<string[]>([]);
  const [sessionState, setSessionState] = useState<any>(null);

  const addLog = (message: string) => {
    setLogs(prev => [`${new Date().toISOString()}: ${message}`, ...prev.slice(0, 49)]);
  };

  // Monitor auth state changes
  useEffect(() => {
    const state = {
      isLoaded: auth.isLoaded,
      isSignedIn: auth.isSignedIn,
      hasUser: !!auth.user,
      hasSession: !!clerk.session,
      sessionId: clerk.session?.id,
      userId: auth.user?.id,
      username: auth.user?.username,
    };
    setSessionState(state);
    addLog(`Auth state changed: ${JSON.stringify(state)}`);
  }, [auth.isLoaded, auth.isSignedIn, auth.user, clerk.session]);

  // Test functions
  const checkToken = async () => {
    addLog('Checking token...');
    try {
      const token = await auth.getToken();
      if (token) {
        // Decode JWT to check expiry
        const [, payload] = token.split('.');
        const decoded = JSON.parse(atob(payload));
        const expiresIn = new Date(decoded.exp * 1000).getTime() - Date.now();
        addLog(`Token found! Expires in ${Math.round(expiresIn / 1000)}s`);
      } else {
        addLog('No token found');
      }
    } catch (e) {
      addLog(`Token check error: ${e}`);
    }
  };

  const checkSession = async () => {
    addLog('Checking session...');
    try {
      if (clerk.session) {
        const lastActive = clerk.session.lastActiveAt;
        const expireAt = clerk.session.expireAt;
        addLog(`Session found: ${clerk.session.id}`);
        addLog(`Last active: ${lastActive}`);
        addLog(`Expires at: ${expireAt}`);
      } else {
        addLog('No active session');
      }
    } catch (e) {
      addLog(`Session check error: ${e}`);
    }
  };

  const refreshSession = async () => {
    addLog('Attempting to refresh session...');
    try {
      if (clerk.session) {
        await clerk.session.touch();
        addLog('Session refreshed');
        await checkSession();
      } else {
        addLog('No session to refresh');
      }
    } catch (e) {
      addLog(`Session refresh error: ${e}`);
    }
  };

  const clearSession = async () => {
    addLog('Clearing session...');
    try {
      if (clerk.session) {
        await clerk.session.end();
        addLog('Session cleared');
      } else {
        addLog('No session to clear');
      }
    } catch (e) {
      addLog(`Session clear error: ${e}`);
    }
  };

  const testProtectedRequest = async () => {
    addLog('Testing protected request...');
    try {
      const token = await auth.getToken();
      if (!token) {
        addLog('No token available for request');
        return;
      }
      
      const response = await fetch('/api/auth/test', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        addLog(`Protected request successful: ${JSON.stringify(data)}`);
      } else {
        addLog(`Protected request failed: ${response.status}`);
      }
    } catch (e) {
      addLog(`Protected request error: ${e}`);
    }
  };

  return (
    <div className="container py-8 space-y-8">
      <h1 className="text-2xl font-bold">Auth Debug Page</h1>
      
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Current State:</h2>
        <pre className="bg-muted p-4 rounded-lg overflow-auto">
          {JSON.stringify(sessionState, null, 2)}
        </pre>
      </Card>

      <div className="flex flex-wrap gap-4">
        <Button onClick={checkToken}>Check Token</Button>
        <Button onClick={checkSession}>Check Session</Button>
        <Button onClick={refreshSession}>Refresh Session</Button>
        <Button onClick={clearSession} variant="destructive">Clear Session</Button>
        <Button onClick={testProtectedRequest}>Test Protected Request</Button>
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Debug Logs:</h2>
        <div className="bg-muted p-4 rounded-lg max-h-96 overflow-y-auto">
          {logs.map((log, i) => (
            <pre key={i} className="font-mono text-sm mb-1 whitespace-pre-wrap break-words">
              {log}
            </pre>
          ))}
        </div>
      </Card>
    </div>
  );
} 