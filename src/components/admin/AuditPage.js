import React, { useState, useEffect } from 'react';

const AuditPage = () => {
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch audit logs from backend
  useEffect(() => {
    setLoading(true);
    fetch('/api/audit')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch audit logs');
        return res.json();
      })
      .then(data => {
        setLogs(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const filteredLogs = logs.filter(log =>
    log.User.toLowerCase().includes(search.toLowerCase()) ||
    log.Action.toLowerCase().includes(search.toLowerCase()) ||
    log.Timestamp.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Audit Logs</h2>
        <p className="text-gray-600">View system audit logs and activity history</p>
      </div>
      <div className="mb-4">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by user, action, or date..."
          className="w-full sm:w-64 border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
          aria-label="Search audit logs"
        />
      </div>
      <div className="bg-white rounded-lg shadow p-6 overflow-x-auto">
        {loading ? (
          <p>Loading audit logs...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead>
              <tr>
                <th className="px-4 py-2">LogID</th>
                <th className="px-4 py-2">User</th>
                <th className="px-4 py-2">Action</th>
                <th className="px-4 py-2">Timestamp</th>
                <th className="px-4 py-2">Details</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center text-gray-500 py-4">No logs found.</td>
                </tr>
              ) : (
                filteredLogs.map(log => (
                  <tr key={log.LogID}>
                    <td className="border px-4 py-2">{log.LogID}</td>
                    <td className="border px-4 py-2">{log.User}</td>
                    <td className="border px-4 py-2">{log.Action}</td>
                    <td className="border px-4 py-2">{log.Timestamp}</td>
                    <td className="border px-4 py-2">{log.Details}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AuditPage; 