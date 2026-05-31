import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api/client";
import { Badge, Card, EmptyState } from "../../components/ui";
import type { Submission } from "../../types";

export const SubmissionsListPage = () => {
  const [items, setItems] = useState<Submission[]>([]);
  useEffect(() => {
    api.get("/admin/submissions").then((response) => setItems(response.data));
  }, []);

  if (!items.length) return <EmptyState title="No submissions found" />;
  return (
    <Card>
      <h2 className="text-xl font-bold">Student submissions</h2>
      <div className="mt-5 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b text-slate-500">
            <tr>
              <th className="py-2">Student</th>
              <th>Registration no.</th>
              <th>University</th>
              <th>Status</th>
              <th>Submitted</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b last:border-0">
                <td className="py-3 font-semibold">{item.student?.user.fullName}</td>
                <td>{item.student?.studentRegistrationNumber ?? "N/A"}</td>
                <td>{item.student?.university ?? "N/A"}</td>
                <td>
                  <Badge status={item.status} />
                </td>
                <td>{item.submittedAt ? new Date(item.submittedAt).toLocaleDateString() : "Draft"}</td>
                <td>
                  <Link className="font-semibold text-civic" to={`/admin/submissions/${item.id}`}>
                    Review
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
