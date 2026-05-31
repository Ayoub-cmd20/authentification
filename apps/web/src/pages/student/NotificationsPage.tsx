import { useEffect, useState } from "react";
import { api } from "../../api/client";
import { Card, EmptyState } from "../../components/ui";

export const NotificationsPage = () => {
  const [items, setItems] = useState<any[]>([]);
  useEffect(() => {
    api.get("/student/notifications").then((response) => setItems(response.data));
  }, []);

  if (!items.length) return <EmptyState title="No notifications yet" />;
  return (
    <div className="grid gap-3">
      {items.map((item) => (
        <Card key={item.id}>
          <div className="flex flex-wrap justify-between gap-3">
            <div>
              <h3 className="font-bold">{item.title}</h3>
              <p className="mt-1 text-sm text-slate-600">{item.message}</p>
            </div>
            <p className="text-xs text-slate-500">{new Date(item.createdAt).toLocaleString()}</p>
          </div>
        </Card>
      ))}
    </div>
  );
};
