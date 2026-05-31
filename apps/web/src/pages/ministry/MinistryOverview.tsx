import { useEffect, useState } from "react";
import { api, downloadFile } from "../../api/client";
import { StatCard } from "../../components/StatCard";
import { Button, Card } from "../../components/ui";

export const MinistryOverview = () => {
  const [stats, setStats] = useState<Record<string, number>>({});
  const [universities, setUniversities] = useState<any[]>([]);

  useEffect(() => {
    api.get("/ministry/stats").then((response) => setStats(response.data));
    api.get("/ministry/stats/universities").then((response) => setUniversities(response.data));
  }, []);

  return (
    <div className="grid gap-5">
      <Card className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase text-civic">Ministry supervision</p>
          <h2 className="mt-1 text-xl font-bold text-navy">National platform dashboard</h2>
          <p className="mt-2 text-sm text-slate-600">Ministry-level view of certificate authentication activity.</p>
        </div>
        <Button variant="secondary" onClick={() => downloadFile("/ministry/export", "tawtheeq-ministry-export.csv")}>
          Export CSV
        </Button>
      </Card>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Object.entries({
          totalStudents: "Students",
          totalSubmissions: "Submissions",
          totalVerifiedCertificates: "Verified certificates",
          totalRejectedSubmissions: "Rejected files",
          totalIncompleteFiles: "Incomplete files",
          totalInstitutions: "Institutions",
          totalInstitutionSearches: "Institution searches",
          fraudSuspiciousSearchAttempts: "Suspicious searches"
        }).map(([key, label]) => (
          <StatCard key={key} label={label} value={stats[key] ?? 0} />
        ))}
      </div>
      <Card>
        <h3 className="font-bold">University performance</h3>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b text-slate-500">
              <tr>
                <th className="py-2">University</th>
                <th>Code</th>
                <th>City</th>
                <th>Students</th>
              </tr>
            </thead>
            <tbody>
              {universities.map((item) => (
                <tr key={item.id} className="border-b last:border-0">
                  <td className="py-3 font-semibold">{item.name}</td>
                  <td>{item.code}</td>
                  <td>{item.city ?? "N/A"}</td>
                  <td>{item._count?.students ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
