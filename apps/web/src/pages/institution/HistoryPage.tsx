import { useEffect, useState } from "react";
import { api } from "../../api/client";
import { Badge, Card, EmptyState } from "../../components/ui";

export const HistoryPage = () => {
  const [items, setItems] = useState<any[]>([]);
  useEffect(() => {
    api.get("/institution/verification-history").then((response) => setItems(response.data));
  }, []);
  if (!items.length) return <EmptyState title="No search history yet" />;
  return (
    <Card>
      <h2 className="text-xl font-bold">Verification history</h2>
      <div className="mt-5 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b text-slate-500">
            <tr>
              <th className="py-2">Query</th>
              <th>Result</th>
              <th>Searched at</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b last:border-0">
                <td className="py-3 font-semibold">{item.searchQuery}</td>
                <td>
                  <Badge status={item.resultFound ? "VALID" : "INVALID"} />
                </td>
                <td>{new Date(item.searchedAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
