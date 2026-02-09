"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { loadAnnouncements } from "@/app/actions/admin-announcements";

export default function DebugAnnouncementsPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function testLoad() {
      try {
        console.log('Testing loadAnnouncements...');
        const res = await loadAnnouncements();
        console.log('Result:', res);
        setResult(res);
      } catch (err: any) {
        console.error('Error:', err);
        setError(err.message || 'Unknown error');
      } finally {
        setLoading(false);
      }
    }
    testLoad();
  }, []);

  return (
    <AdminShell title="Debug Announcements" subtitle="Testing announcements system">
      <div className="bg-[#1a1a1a] border border-[#262626] rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Announcements Debug Test</h2>
        
        {loading && (
          <div className="text-white/60">Loading...</div>
        )}
        
        {error && (
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-4">
            <h3 className="text-blue-400 font-semibold mb-2">Error:</h3>
            <p className="text-white/80">{error}</p>
          </div>
        )}
        
        {result && (
          <div className="space-y-4">
            <div className={`p-4 rounded-lg border ${
              result.success 
                ? 'bg-green-500/10 border-green-500/30' 
                : 'bg-blue-500/10 border-blue-500/30'
            }`}>
              <h3 className={`font-semibold mb-2 ${
                result.success ? 'text-green-400' : 'text-blue-400'
              }`}>
                {result.success ? 'Success!' : 'Failed'}
              </h3>
              
              {result.success ? (
                <div>
                  <p className="text-white/80 mb-2">
                    Retrieved {result.announcements?.length || 0} announcements
                  </p>
                  {result.announcements?.map((ann: any, index: number) => (
                    <div key={ann.id} className="bg-[#0a0a0a] rounded p-3 mb-2">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          ann.type === 'info' ? 'bg-blue-500/20 text-blue-400' :
                          ann.type === 'success' ? 'bg-green-500/20 text-green-400' :
                          ann.type === 'warning' ? 'bg-amber-500/20 text-amber-400' :
                          'bg-blue-500/20 text-blue-400'
                        }`}>
                          {ann.type}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs ${
                          ann.is_active ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                        }`}>
                          {ann.is_active ? 'Active' : 'Hidden'}
                        </span>
                        <span className="text-white/40 text-xs">Priority: {ann.priority}</span>
                      </div>
                      <h4 className="text-white font-medium">{ann.title}</h4>
                      <p className="text-white/60 text-sm">{ann.message}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-white/80">{result.error}</p>
              )}
            </div>
            
            <div className="bg-[#0a0a0a] border border-[#262626] rounded-lg p-4">
              <h3 className="text-white font-semibold mb-2">Raw Response:</h3>
              <pre className="text-white/60 text-xs overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          </div>
        )}
        
        <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <h3 className="text-blue-400 font-semibold mb-2">Next Steps:</h3>
          <ul className="text-white/80 text-sm space-y-1">
            <li>1. If you see "Success!" above, the announcements system is working</li>
            <li>2. If you see an error, check that you're logged into the admin panel</li>
            <li>3. Try going to <code className="bg-[#0a0a0a] px-1 rounded">/mgmt-x9k2m7/login</code> first</li>
            <li>4. Then return to <code className="bg-[#0a0a0a] px-1 rounded">/mgmt-x9k2m7/announcements</code></li>
          </ul>
        </div>
      </div>
    </AdminShell>
  );
}