"use client";

import { useEffect, useState } from "react";
import { useAuthService } from "@/lib/services/auth.service";
import { useClerk } from "@clerk/nextjs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Constants
const LOG_STORAGE_KEY = 'auth_debug_logs';
const STATE_STORAGE_KEY = 'auth_debug_states';
const MAX_LOGS = 100;

export default function AuthTestPage() {
  const auth = useAuthService();
  const clerk = useClerk();
  const [logs, setLogs] = useState<string[]>([]);
  const [sessionState, setSessionState] = useState<any>(null);
  const [stateHistory, setStateHistory] = useState<any[]>([]);

  // Load persisted data on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedLogs = localStorage.getItem(LOG_STORAGE_KEY);
        if (savedLogs) {
          setLogs(JSON.parse(savedLogs));
        }

        const savedStates = localStorage.getItem(STATE_STORAGE_KEY);
        if (savedStates) {
          setStateHistory(JSON.parse(savedStates));
        }

        // Add page load marker
        addLog('=== Page Loaded ===');
      } catch (e) {
        console.error('Error loading persisted debug data:', e);
      }
    }
  }, []);

  const addLog = (message: string) => {
    const timestamp = new Date().toISOString();
    const newLog = `${timestamp}: ${message}`;
    setLogs(prev => {
      const updated = [newLog, ...prev.slice(0, MAX_LOGS - 1)];
      if (typeof window !== 'undefined') {
        localStorage.setItem(LOG_STORAGE_KEY, JSON.stringify(updated));
      }
      return updated;
    });
  };

  const addStateToHistory = (state: any) => {
    const stateWithTimestamp = {
      ...state,
      timestamp: new Date().toISOString()
    };
    setStateHistory(prev => {
      const updated = [stateWithTimestamp, ...prev.slice(0, 19)]; // Keep last 20 states
      if (typeof window !== 'undefined') {
        localStorage.setItem(STATE_STORAGE_KEY, JSON.stringify(updated));
      }
      return updated;
    });
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
    addStateToHistory(state);
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
        addLog(`Token payload: ${JSON.stringify(decoded, null, 2)}`);
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
        addLog(`Session status: ${clerk.session.status}`);
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

  const clearLogs = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(LOG_STORAGE_KEY);
      localStorage.removeItem(STATE_STORAGE_KEY);
      setLogs([]);
      setStateHistory([]);
      addLog('=== Logs Cleared ===');
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

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">State History:</h2>
        <div className="bg-muted p-4 rounded-lg max-h-96 overflow-y-auto">
          {stateHistory.map((state, i) => (
            <div key={i} className="mb-4 last:mb-0">
              <div className="font-semibold text-sm text-muted-foreground mb-1">
                {new Date(state.timestamp).toLocaleString()}
              </div>
              <pre className="font-mono text-sm whitespace-pre-wrap break-words">
                {JSON.stringify(state, null, 2)}
              </pre>
            </div>
          ))}
        </div>
      </Card>

      <div className="flex flex-wrap gap-4">
        <Button onClick={checkToken}>Check Token</Button>
        <Button onClick={checkSession}>Check Session</Button>
        <Button onClick={refreshSession}>Refresh Session</Button>
        <Button onClick={clearSession} variant="destructive">Clear Session</Button>
        <Button onClick={testProtectedRequest}>Test Protected Request</Button>
        <Button onClick={clearLogs} variant="outline">Clear Logs</Button>
      </div>

      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Debug Logs:</h2>
          <div className="text-sm text-muted-foreground">
            {logs.length} entries
          </div>
        </div>
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