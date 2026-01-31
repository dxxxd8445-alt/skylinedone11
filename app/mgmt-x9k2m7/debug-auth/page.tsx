"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, CheckCircle, XCircle, AlertTriangle } from "lucide-react";

interface AuthDebugInfo {
  authenticated: boolean;
  context: any;
  timestamp: string;
  error?: string;
}

export default function DebugAuthPage() {
  const [authInfo, setAuthInfo] = useState<AuthDebugInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/auth-test");
      const data = await response.json();
      setAuthInfo(data);
    } catch (error: any) {
      setAuthInfo({
        authenticated: false,
        context: null,
        timestamp: new Date().toISOString(),
        error: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const testAuditLogs = async () => {
    try {
      const response = await fetch("/api/admin/audit-log");
      const data = await response.json();
      
      if (response.ok) {
        alert(`✅ Audit logs API works! Found ${data.logs?.length || 0} logs`);
      } else {
        alert(`❌ Audit logs API failed: ${data.error}`);
      }
    } catch (error: any) {
      alert(`❌ Audit logs API error: ${error.message}`);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AdminShell
      title="Authentication Debug"
      subtitle="Debug authentication and permissions"
    >
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Authentication Status</CardTitle>
              <Button
                onClick={checkAuth}
                disabled={loading}
                variant="outline"
                size="sm"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Checking authentication...</span>
              </div>
            ) : authInfo ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  {authInfo.authenticated ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  <span className="font-medium">
                    {authInfo.authenticated ? "Authenticated" : "Not Authenticated"}
                  </span>
                </div>

                {authInfo.context && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Auth Context:</h4>
                    <pre className="text-sm overflow-auto">
                      {JSON.stringify(authInfo.context, null, 2)}
                    </pre>
                  </div>
                )}

                {authInfo.error && (
                  <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-red-800">Error:</p>
                      <p className="text-sm text-red-600">{authInfo.error}</p>
                    </div>
                  </div>
                )}

                <p className="text-sm text-gray-500">
                  Last checked: {new Date(authInfo.timestamp).toLocaleString()}
                </p>
              </div>
            ) : (
              <p>No authentication data available</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>API Tests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button onClick={testAuditLogs} variant="outline" className="w-full">
                Test Audit Logs API
              </Button>
              
              <div className="text-sm text-gray-600">
                <p>Use these tests to debug API access:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Check if you're properly authenticated</li>
                  <li>Test audit logs API permissions</li>
                  <li>Verify database table exists</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button 
                onClick={() => window.location.href = "/mgmt-x9k2m7/login"} 
                variant="outline" 
                className="w-full"
              >
                Go to Login Page
              </Button>
              
              <Button 
                onClick={() => window.location.href = "/mgmt-x9k2m7/logs"} 
                variant="outline" 
                className="w-full"
              >
                Go to Audit Logs
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}