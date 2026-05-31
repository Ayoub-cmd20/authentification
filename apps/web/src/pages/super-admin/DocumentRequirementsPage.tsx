import { useEffect, useState } from "react";
import { api } from "../../api/client";
import { Badge, Button, Card, Input, Textarea } from "../../components/ui";

export const DocumentRequirementsPage = () => {
  const [items, setItems] = useState<any[]>([]);
  const [savingId, setSavingId] = useState("");
  const load = () => api.get("/super-admin/document-requirements").then((response) => setItems(response.data));
  useEffect(() => {
    load();
  }, []);

  const update = async (item: any) => {
    setSavingId(item.id);
    await api.patch(`/super-admin/document-requirements/${item.id}`, item);
    setSavingId("");
    await load();
  };

  return (
    <Card>
      <h2 className="text-xl font-bold">Manage document requirements</h2>
      <p className="mt-1 text-sm text-slate-500">Configure the documents required for academic path authentication cases.</p>
      <div className="mt-5 grid gap-4">
        {items.map((item) => (
          <div key={item.id} className="grid gap-3 rounded-md border border-slate-200 p-4 lg:grid-cols-[1fr_1fr_120px_auto]">
            <div>
              <p className="mb-1 text-xs font-semibold text-slate-500">{item.documentType.replaceAll("_", " ")}</p>
              <Input
                value={item.label}
                onChange={(event) => setItems((current) => current.map((row) => (row.id === item.id ? { ...row, label: event.target.value } : row)))}
              />
            </div>
            <Textarea
              value={item.appliesWhen ?? ""}
              onChange={(event) => setItems((current) => current.map((row) => (row.id === item.id ? { ...row, appliesWhen: event.target.value } : row)))}
            />
            <label className="flex items-center gap-2 text-sm font-semibold">
              <input
                type="checkbox"
                checked={item.isRequired}
                onChange={(event) => setItems((current) => current.map((row) => (row.id === item.id ? { ...row, isRequired: event.target.checked } : row)))}
              />
              Required
            </label>
            <div className="flex items-center gap-3">
              <Badge status={item.isRequired ? "VALID" : "DRAFT"} />
              <Button variant="secondary" onClick={() => update(item)} disabled={savingId === item.id}>
                {savingId === item.id ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
