"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ShieldAlert, ArrowLeft, Home } from "lucide-react";

export default function AccessDeniedPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#111111] to-[#0a0a0a] flex items-center justify-center p-4">
      <Card className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border-2 border-[#6b7280]/20 max-w-md w-full">
        <CardContent className="p-8">
          <div className="text-center space-y-6">
            {/* Icon */}
            <div className="relative mx-auto w-20 h-20">
              <div className="absolute inset-0 bg-[#6b7280]/20 rounded-full blur-xl animate-pulse" />
              <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-[#6b7280]/20 to-[#9ca3af]/10 border-2 border-[#6b7280]/30 flex items-center justify-center">
                <ShieldAlert className="w-10 h-10 text-[#6b7280]" />
              </div>
            </div>

            {/* Title */}
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Access Denied</h1>
              <p className="text-white/60 text-sm">
                You don't have permission to access this page.
              </p>
            </div>

            {/* Message */}
            <div className="bg-[#6b7280]/10 border border-[#6b7280]/20 rounded-lg p-4">
              <p className="text-white/80 text-sm">
                This page requires specific permissions that haven't been granted to your account. 
                Please contact the administrator if you believe this is an error.
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() => router.back()}
                variant="outline"
                className="flex-1 bg-transparent border-[#262626] text-white hover:bg-[#262626] hover:text-white"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
              </Button>
              <Button
                onClick={() => router.push("/mgmt-x9k2m7")}
                className="flex-1 bg-[#6b7280] hover:bg-[#9ca3af] text-white"
              >
                <Home className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
            </div>

            {/* Help Text */}
            <p className="text-white/40 text-xs">
              Need help? Contact your system administrator
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
