#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const dashboardPath = path.join(__dirname, 'app/mgmt-x9k2m7/page.tsx');

const customDatePickerModal = `
      {/* Custom Date Range Modal */}
      {customDateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a] border border-[#262626] shadow-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-white">Custom Date Range</h3>
                <p className="text-sm text-white/50">Select start and end dates</p>
              </div>
              <button
                onClick={() => setCustomDateOpen(false)}
                className="text-white/50 hover:text-white p-1 text-2xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  max={customEndDate || new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 bg-[#0a0a0a] border border-[#262626] rounded-lg text-white focus:outline-none focus:border-[#2563eb] transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  min={customStartDate}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 bg-[#0a0a0a] border border-[#262626] rounded-lg text-white focus:outline-none focus:border-[#2563eb] transition-colors"
                />
              </div>

              {customStartDate && customEndDate && (
                <div className="p-3 rounded-lg bg-[#2563eb]/10 border border-[#2563eb]/20">
                  <p className="text-sm text-[#2563eb]">
                    <strong>Selected Range:</strong> {new Date(customStartDate).toLocaleDateString()} - {new Date(customEndDate).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-[#2563eb]/70 mt-1">
                    {Math.ceil((new Date(customEndDate).getTime() - new Date(customStartDate).getTime()) / (1000 * 60 * 60 * 24)) + 1} days
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setCustomStartDate("");
                    setCustomEndDate("");
                    setCustomDateOpen(false);
                    setDateRange("last30days");
                  }}
                  className="flex-1 px-4 py-2 bg-[#1a1a1a] border border-[#262626] rounded-lg text-white hover:bg-[#262626] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (customStartDate && customEndDate) {
                      setDateRange("custom");
                      setCustomDateOpen(false);
                      toast({
                        title: "Custom Range Applied",
                        description: \`Showing data from \${new Date(customStartDate).toLocaleDateString()} to \${new Date(customEndDate).toLocaleDateString()}\`,
                      });
                    } else {
                      toast({
                        title: "Error",
                        description: "Please select both start and end dates",
                        variant: "destructive",
                      });
                    }
                  }}
                  disabled={!customStartDate || !customEndDate}
                  className="flex-1 px-4 py-2 bg-[#2563eb] hover:bg-[#3b82f6] disabled:bg-[#2563eb]/50 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-colors"
                >
                  Apply Range
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
`;

try {
  let content = fs.readFileSync(dashboardPath, 'utf8');
  
  // Check if modal already exists
  if (content.includes('Custom Date Range Modal')) {
    console.log('✅ Custom date picker modal already exists');
    process.exit(0);
  }
  
  // Find the last </AdminShell> tag and insert before it
  const lastAdminShellIndex = content.lastIndexOf('</AdminShell>');
  
  if (lastAdminShellIndex === -1) {
    console.error('❌ Could not find </AdminShell> tag');
    process.exit(1);
  }
  
  // Insert the modal before the closing tag
  content = content.slice(0, lastAdminShellIndex) + customDatePickerModal + '\n    ' + content.slice(lastAdminShellIndex);
  
  // Write back
  fs.writeFileSync(dashboardPath, content, 'utf8');
  
  console.log('✅ Custom date picker modal added successfully!');
  console.log('');
  console.log('Features added:');
  console.log('  - Custom date range selector');
  console.log('  - Start and end date inputs');
  console.log('  - Date validation (start <= end)');
  console.log('  - Visual date range preview');
  console.log('  - Days count display');
  console.log('');
  
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
