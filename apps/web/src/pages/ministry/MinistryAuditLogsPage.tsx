import { useEffect, useState } from "react";
import { api } from "../../api/client";
import { Card } from "../../components/ui";

export const MinistryAuditLogsPage = () => {
  const [logs, setLogs] = useState<any[]>([]);
  useEffect(() => {
    api.get("/ministry/audit-logs").then((response) => setLogs(response.data));
  }, []);
  return (
    <Card>
      <h2 className="text-xl font-bold">National audit logs</h2>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b text-slate-500">
            <tr>
              <th className="py-2">Action</th>
              <th>User</th>
              <th>Entity</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-b last:border-0">
                <td className="py-3 font-semibold">{log.action}</td>
                <td>{log.user?.email ?? "System"}</td>
                <td>{log.entityType}</td>
                <td>{new Date(log.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
