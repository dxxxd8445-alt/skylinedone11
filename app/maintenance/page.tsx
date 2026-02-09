import { Settings, Wrench, Clock, Mail } from "lucide-react";

export default function MaintenancePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a1a3a] to-[#0a0a0a] flex items-center justify-center p-4">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#2563eb]/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#3b82f6]/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Main content */}
      <div className="relative z-10 max-w-2xl w-full">
        <div className="bg-gradient-to-br from-[#1a1a1a]/90 to-[#0a0a0a]/90 backdrop-blur-xl border-2 border-[#2563eb]/30 rounded-2xl p-8 md:p-12 shadow-2xl">
          {/* Icon */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-[#2563eb]/20 rounded-full blur-xl animate-pulse" />
              <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-[#2563eb] to-[#3b82f6] flex items-center justify-center shadow-lg">
                <Wrench className="w-12 h-12 text-white animate-bounce" />
              </div>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-4 bg-gradient-to-r from-[#2563eb] to-[#3b82f6] bg-clip-text text-transparent">
            Under Maintenance
          </h1>

          {/* Subtitle */}
          <p className="text-xl text-center text-white/80 mb-8">
            We're currently performing scheduled maintenance
          </p>

          {/* Description */}
          <div className="bg-[#0a0a0a]/50 border border-[#2563eb]/20 rounded-xl p-6 mb-8">
            <p className="text-white/70 text-center leading-relaxed">
              Our team is working hard to improve your experience. We'll be back online shortly. 
              Thank you for your patience!
            </p>
          </div>

          {/* Info cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-[#0a0a0a]/30 border border-[#2563eb]/20 rounded-lg p-4 text-center">
              <Clock className="w-6 h-6 text-[#2563eb] mx-auto mb-2" />
              <p className="text-white/60 text-sm">Estimated Time</p>
              <p className="text-white font-semibold">1-2 Hours</p>
            </div>

            <div className="bg-[#0a0a0a]/30 border border-[#2563eb]/20 rounded-lg p-4 text-center">
              <Settings className="w-6 h-6 text-[#3b82f6] mx-auto mb-2 animate-spin" style={{ animationDuration: '3s' }} />
              <p className="text-white/60 text-sm">Status</p>
              <p className="text-white font-semibold">In Progress</p>
            </div>

            <div className="bg-[#0a0a0a]/30 border border-[#2563eb]/20 rounded-lg p-4 text-center">
              <Mail className="w-6 h-6 text-[#2563eb] mx-auto mb-2" />
              <p className="text-white/60 text-sm">Support</p>
              <p className="text-white font-semibold text-xs">support@skylinecheats.org</p>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center">
            <p className="text-white/40 text-sm mb-4">
              Follow us for updates
            </p>
            <a
              href="https://discord.gg/skylineggs"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#2563eb] to-[#3b82f6] hover:from-[#3b82f6] hover:to-[#2563eb] text-white font-semibold rounded-lg transition-all duration-300 shadow-lg hover:shadow-[#2563eb]/50"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
              </svg>
              Join Discord
            </a>
          </div>
        </div>

        {/* Skyline branding */}
        <div className="text-center mt-8">
          <p className="text-white/40 text-sm">
            Powered by <span className="text-[#2563eb] font-semibold">Skyline Cheats</span>
          </p>
        </div>
      </div>
    </div>
  );
}
