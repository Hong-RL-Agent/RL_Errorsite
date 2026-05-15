import React, { useState, useEffect } from 'react';
import { fetchTrafficData, exportDataCSV } from '../lib/api';
import { Download, AlertTriangle } from 'lucide-react';

export const DataTable: React.FC<{ simulateTimeout: boolean, regionFailover: boolean }> = ({ simulateTimeout, regionFailover }) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);

  // Defect 4: Excessive static loading spinners
  // We keep showing spinners for 3 seconds after data is loaded.
  const [showSpinners, setShowSpinners] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    setShowSpinners(true);

    fetchTrafficData(simulateTimeout, regionFailover)
      .then(res => {
        if (mounted) {
          setData(res.data);
          setLoading(false);
          // Intentional 3-second delay for spinners
          setTimeout(() => {
            if (mounted) setShowSpinners(false);
          }, 3000);
        }
      })
      .catch(err => {
        if (mounted) {
          setLoading(false);
          setShowSpinners(false);
          if (err.response?.status === 429) {
            setError(`429 Too Many Requests: Resource Quota Exceeded`);
          } else {
            setError(`Error: ${err.message}. Connection Timed Out or Blocked.`);
          }
        }
      });

    return () => { mounted = false; };
  }, [simulateTimeout, regionFailover]);

  // Defect 5: Data export failure
  const handleExport = async () => {
    try {
      setExportError(null);
      await exportDataCSV();
    } catch (err: any) {
      setExportError(err.response?.data || "500 Internal Server Error");
    }
  };

  return (
    <div className="glass-panel p-4 rounded-xl mt-4 relative">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-cyan-400 font-bold text-lg glow-text">Live Traffic Data</h3>
        <button 
          onClick={handleExport}
          className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-3 py-1 rounded text-sm transition-colors border border-slate-600"
        >
          <Download size={16} /> Export CSV
        </button>
      </div>

      {exportError && (
        <div className="mb-4 bg-red-900/50 border border-red-500 text-red-200 p-2 rounded text-sm flex items-center gap-2">
          <AlertTriangle size={16} /> {exportError}
        </div>
      )}

      {error ? (
        <div className="text-red-500 p-4 border border-red-500/30 bg-red-950/30 rounded">
          {error}
        </div>
      ) : (
        <div className="relative">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="text-xs uppercase bg-slate-800/50 text-slate-400">
              <tr>
                <th className="px-4 py-2 rounded-tl">ID</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Speed (km/h)</th>
                <th className="px-4 py-2 rounded-tr">Coordinates</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row: any) => (
                <tr key={row.id} className="border-b border-slate-800 hover:bg-slate-800/30">
                  <td className="px-4 py-2">{row.id}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${row.status === 'congestion' ? 'bg-pink-500/20 text-pink-400' : 'bg-green-500/20 text-green-400'}`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="px-4 py-2 font-mono text-cyan-400">{row.speed}</td>
                  <td className="px-4 py-2 font-mono text-xs text-slate-500">{row.lat}, {row.lng}</td>
                </tr>
              ))}
              {data.length === 0 && !loading && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                    No data available. (Region Isolation Error active?)
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Defect 4: Excessive unique spinners overlaying the table */}
          {showSpinners && (
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] flex items-center justify-center gap-8">
              <div className="w-8 h-8 rounded-full border-4 border-transparent spinner-1"></div>
              <div className="w-6 h-6 rounded-full border-4 border-transparent spinner-2"></div>
              <div className="w-10 h-10 rounded-full border-4 border-transparent spinner-3"></div>
              <div className="w-4 h-4 rounded-full border-4 border-transparent spinner-4"></div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
