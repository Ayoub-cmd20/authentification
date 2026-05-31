import { useEffect, useState } from "react";
import { api } from "../../api/client";
import { Badge, Button, Card } from "../../components/ui";

export const UsersPage = ({ institutionsOnly = false }: { institutionsOnly?: boolean }) => {
  const [users, setUsers] = useState<any[]>([]);
  const load = () => api.get("/super-admin/users").then((response) => setUsers(response.data));
  useEffect(() => {
    load();
  }, []);
  const toggle = async (user: any) => {
    await api.patch(`/super-admin/users/${user.id}/status`, { isActive: !user.isActive });
    await load();
  };
  const filtered = institutionsOnly ? users.filter((user) => user.role === "INSTITUTION") : users;
  return (
    <Card>
      <h2 className="text-xl font-bold">{institutionsOnly ? "Manage institutions and subscriptions" : "Manage users"}</h2>
      <div className="mt-5 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b text-slate-500">
            <tr>
              <th className="py-2">Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((user) => (
              <tr key={user.id} className="border-b last:border-0">
                <td className="py-3 font-semibold">{user.fullName}</td>
                <td>{user.email}</td>
                <td>{user.role.replace("_", " ")}</td>
                <td>
                  <Badge status={user.isActive ? "VALID" : "INVALID"} />
                </td>
                <td>
                  <Button variant="secondary" onClick={() => toggle(user)}>
                    {user.isActive ? "Deactivate" : "Activate"}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
