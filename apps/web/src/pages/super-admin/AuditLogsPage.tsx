import { useEffect, useState } from "react";
import { api } from "../../api/client";
import { Card, EmptyState } from "../../components/ui";

export const AuditLogsPage = () => {
  const [logs, setLogs] = useState<any[]>([]);
  useEffect(() => {
    api.get("/super-admin/audit-logs").then((response) => setLogs(response.data));
  }, []);
  if (!logs.length) return <EmptyState title="No audit logs yet" />;
  return (
    <Card>
      <h2 className="text-xl font-bold">System audit logs</h2>
      <div className="mt-5 overflow-x-auto">
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
                <td className="py-3 font-semibold">{log.action.replaceAll("_", " ")}</td>
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
