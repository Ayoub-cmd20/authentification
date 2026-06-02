import { Navigate, Route, Routes } from "react-router-dom";
import { DashboardLayout } from "./layouts/DashboardLayout";
import { PublicLayout } from "./layouts/PublicLayout";
import { AdminOverview } from "./pages/admin/AdminOverview";
import { SubmissionReviewPage } from "./pages/admin/SubmissionReviewPage";
import { SubmissionsListPage } from "./pages/admin/SubmissionsListPage";
import { HistoryPage } from "./pages/institution/HistoryPage";
import { InstitutionOverview } from "./pages/institution/InstitutionOverview";
import { SearchPage } from "./pages/institution/SearchPage";
import { MinistryAuditLogsPage } from "./pages/ministry/MinistryAuditLogsPage";
import { MinistryOverview } from "./pages/ministry/MinistryOverview";
import { LandingPage } from "./pages/public/LandingPage";
import { ForgotPasswordPage } from "./pages/public/ForgotPasswordPage";
import { LoginPage } from "./pages/public/LoginPage";
import { PublicVerificationPage } from "./pages/public/PublicVerificationPage";
import { RegisterPage } from "./pages/public/RegisterPage";
import { NotificationsPage } from "./pages/student/NotificationsPage";
import { ProfilePage } from "./pages/student/ProfilePage";
import { StudentOverview } from "./pages/student/StudentOverview";
import { SubmissionPage } from "./pages/student/SubmissionPage";
import { AuditLogsPage } from "./pages/super-admin/AuditLogsPage";
import { DocumentRequirementsPage } from "./pages/super-admin/DocumentRequirementsPage";
import { SuperAdminOverview } from "./pages/super-admin/SuperAdminOverview";
import { UsersPage } from "./pages/super-admin/UsersPage";

export const App = () => (
  <Routes>
    <Route element={<PublicLayout />}>
      <Route index element={<LandingPage />} />
      <Route path="login" element={<LoginPage />} />
      <Route path="forgot-password" element={<ForgotPasswordPage />} />
      <Route path="register/student" element={<RegisterPage type="student" />} />
      <Route path="register/institution" element={<RegisterPage type="institution" />} />
      <Route path="verify" element={<PublicVerificationPage />} />
      <Route path="verify/:verificationCode" element={<PublicVerificationPage />} />
    </Route>

    <Route element={<DashboardLayout role="STUDENT" />}>
      <Route path="student" element={<StudentOverview />} />
      <Route path="student/profile" element={<ProfilePage />} />
      <Route path="student/submission" element={<SubmissionPage />} />
      <Route path="student/notifications" element={<NotificationsPage />} />
    </Route>

    <Route element={<DashboardLayout role="UNIVERSITY_ADMIN" />}>
      <Route path="admin" element={<AdminOverview />} />
      <Route path="admin/submissions" element={<SubmissionsListPage />} />
      <Route path="admin/submissions/:id" element={<SubmissionReviewPage />} />
    </Route>

    <Route element={<DashboardLayout role="INSTITUTION" />}>
      <Route path="institution" element={<InstitutionOverview />} />
      <Route path="institution/search" element={<SearchPage />} />
      <Route path="institution/history" element={<HistoryPage />} />
    </Route>

    <Route element={<DashboardLayout role="MINISTRY_ADMIN" />}>
      <Route path="ministry" element={<MinistryOverview />} />
      <Route path="ministry/audit-logs" element={<MinistryAuditLogsPage />} />
    </Route>

    <Route element={<DashboardLayout role="SUPER_ADMIN" />}>
      <Route path="super-admin" element={<SuperAdminOverview />} />
      <Route path="super-admin/users" element={<UsersPage />} />
      <Route path="super-admin/institutions" element={<UsersPage institutionsOnly />} />
      <Route path="super-admin/document-requirements" element={<DocumentRequirementsPage />} />
      <Route path="super-admin/audit-logs" element={<AuditLogsPage />} />
    </Route>

    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);
