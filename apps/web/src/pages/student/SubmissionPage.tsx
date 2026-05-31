import { FormEvent, useEffect, useState } from "react";
import { api, downloadFile } from "../../api/client";
import { Badge, Button, Card, DataTable, EmptyState, Field, PageHeader, Select } from "../../components/ui";
import type { Submission } from "../../types";

const documentTypes = [
  "BACCALAUREATE_TRANSCRIPT",
  "UNIVERSITY_TRANSCRIPTS",
  "GRADUATION_CERTIFICATE",
  "ACADEMIC_LEAVE",
  "FAILED_YEAR_TRANSCRIPT",
  "DEBT_CLEARANCE",
  "INTERRUPTION_CERTIFICATE",
  "TRANSFER_FORM",
  "PREVIOUS_UNIVERSITY_DOCUMENTS",
  "OTHER"
];

export const SubmissionPage = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [active, setActive] = useState<Submission | null>(null);
  const [message, setMessage] = useState("");

  const load = () =>
    api.get("/student/submissions").then((response) => {
      setSubmissions(response.data);
      setActive(response.data[0] ?? null);
    });

  useEffect(() => {
    load();
  }, []);

  const createSubmission = async () => {
    const response = await api.post("/student/submissions");
    setActive(response.data);
    await load();
  };

  const upload = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!active) return;
    const form = new FormData(event.currentTarget);
    await api.post(`/student/submissions/${active.id}/documents`, form, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    event.currentTarget.reset();
    await load();
  };

  const submit = async () => {
    if (!active) return;
    try {
      await api.post(`/student/submissions/${active.id}/submit`);
      setMessage("File submitted for university review.");
      await load();
    } catch (error: any) {
      setMessage(error.response?.data?.message ?? "Unable to submit file.");
    }
  };

  const createPayment = async () => {
    if (!active) return;
    const response = await api.post("/payments/create", { submissionId: active.id, provider: "MOCK" });
    setMessage(`Payment intent created: ${response.data.transactionReference}`);
    await load();
  };

  const current = submissions.find((item) => item.id === active?.id) ?? active;

  const payMock = async () => {
    if (!current?.payment) return;
    await api.post("/payments/mock-success", { paymentId: current.payment.id });
    setMessage("Mock payment marked as paid.");
    await load();
  };

  return (
    <div className="grid gap-5">
      <PageHeader
        eyebrow="Certification request"
        title="Upload and submit academic documents"
        description="Create a request, upload PDF evidence, complete service payment, and submit the file for university certification."
        actions={<Button onClick={createSubmission}>Create draft</Button>}
      />
      {!current ? (
        <EmptyState title="No active file" body="Create a draft to start uploading documents." />
      ) : (
        <>
          <Card>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase text-muted">Certification request ID</p>
                <p className="font-semibold text-ink">{current.id}</p>
              </div>
              <Badge status={current.status} />
            </div>
            {current.adminNotes && <p className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-warning">{current.adminNotes}</p>}
          </Card>

          <Card>
            <h3 className="font-bold text-ink">Upload PDF document</h3>
            <form onSubmit={upload} className="mt-4 grid gap-4 md:grid-cols-[1fr_1fr_auto]">
              <Field label="Document type">
                <Select name="documentType">
                  {documentTypes.map((type) => (
                    <option key={type} value={type}>
                      {type.replaceAll("_", " ")}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="PDF file">
                <input name="file" type="file" accept="application/pdf" required className="min-h-10 rounded-md border border-border bg-white p-2 text-sm" />
              </Field>
              <Button className="self-end">Upload</Button>
            </form>
          </Card>

          <Card>
            <h3 className="font-bold text-ink">Uploaded documents</h3>
            <div className="mt-4">
              <DataTable>
                <thead className="border-b border-border bg-slate-50 text-xs uppercase text-muted">
                  <tr>
                    <th className="px-3 py-2">Type</th>
                    <th>File</th>
                    <th>Size</th>
                  </tr>
                </thead>
                <tbody>
                  {current.documents.map((doc) => (
                    <tr key={doc.id} className="border-b border-border last:border-0">
                      <td className="px-3 py-3 font-semibold">{doc.documentType.replaceAll("_", " ")}</td>
                      <td>{doc.fileName}</td>
                      <td>{Math.round(doc.size / 1024)} KB</td>
                    </tr>
                  ))}
                </tbody>
              </DataTable>
            </div>
            {current.missingDocuments?.length ? (
              <div className="mt-5 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-warning">
                <p className="font-semibold">Missing documents</p>
                <ul className="mt-2 list-disc pl-5">
                  {current.missingDocuments.map((item) => (
                    <li key={item.id}>{item.documentRequirement.label}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </Card>

          <Card>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-ink">Service payment</h3>
                <p className="text-sm text-muted">One-time mock payment, ready for future payment provider integration.</p>
              </div>
              <Badge status={current.payment?.status ?? "PENDING"} />
            </div>
            {current.payment ? (
              <dl className="mt-4 grid gap-3 sm:grid-cols-3">
                <div className="rounded-md border border-border bg-slate-50 p-3">
                  <dt className="text-xs font-semibold uppercase text-muted">Reference</dt>
                  <dd className="mt-1 break-all font-semibold text-ink">{current.payment.transactionReference}</dd>
                </div>
                <div className="rounded-md border border-border bg-slate-50 p-3">
                  <dt className="text-xs font-semibold uppercase text-muted">Amount</dt>
                  <dd className="mt-1 font-semibold text-ink">{current.payment.amount} DZD</dd>
                </div>
                <div className="rounded-md border border-border bg-slate-50 p-3">
                  <dt className="text-xs font-semibold uppercase text-muted">Status</dt>
                  <dd className="mt-1 font-semibold text-ink">{current.payment.status}</dd>
                </div>
              </dl>
            ) : (
              <p className="mt-3 text-sm text-muted">No payment intent has been created for this submission.</p>
            )}
            <div className="mt-5 flex flex-wrap gap-3">
              {!current.payment && <Button onClick={createPayment}>Create payment</Button>}
              {current.payment?.status === "PENDING" && <Button onClick={payMock}>Pay with mock gateway</Button>}
              <Button onClick={submit} disabled={!["DRAFT", "INCOMPLETE"].includes(current.status)}>
                Submit file
              </Button>
              <Button variant="secondary" onClick={() => downloadFile(`/student/submissions/${current.id}/receipt`, `receipt-${current.id}.pdf`)}>
                Download receipt
              </Button>
            </div>
            {message && <p className="mt-3 rounded-md border border-blue-100 bg-blue-50 p-3 text-sm font-semibold text-civic">{message}</p>}
          </Card>
        </>
      )}
    </div>
  );
};
