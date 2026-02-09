"use client";

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-black mb-8 text-white">Terms of Service</h1>
        
        <div className="space-y-6 text-white/70">
          <section>
            <h2 className="text-2xl font-bold mb-4 text-white">1. Acceptance of Terms</h2>
            <p>
              By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement. In addition, when using this websites particular services, you shall be subject to any posted guidelines or rules applicable to such services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-white">2. Use of License</h2>
            <p>
              Permission is granted to temporarily download one copy of the materials (information or software) on Skyline Cheats website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-white">3. Disclaimer</h2>
            <p>
              The materials on Skyline Cheats website are provided "as is". Skyline Cheats makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties, including without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-white">4. Limitations</h2>
            <p>
              In no event shall Skyline Cheats or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Skyline Cheats Internet site.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-white">5. Revisions and Errata</h2>
            <p>
              The materials appearing on Skyline Cheats web site could include technical, typographical, or photographic errors. Skyline Cheats does not warrant that any of the materials on its web site are accurate, complete, or current.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
