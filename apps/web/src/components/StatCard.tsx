import { Card } from "./ui";

export const StatCard = ({ label, value }: { label: string; value: number | string }) => (
  <Card className="p-4">
    <p className="text-xs font-semibold uppercase text-muted">{label}</p>
    <p className="mt-3 text-3xl font-bold text-ink">{value}</p>
    <div className="mt-4 h-1 w-10 rounded-full bg-civic/70" />
  </Card>
);
