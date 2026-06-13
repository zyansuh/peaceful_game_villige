import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Layout from "@/components/layout/Layout";
import AdminLayout from "@/components/admin/AdminLayout";
import Index from "@/pages/home/Index";
import ClassPage from "@/pages/class/ClassPage";
import TeacherDetail from "@/pages/teacher/TeacherDetail";
import ApplicationForm from "@/pages/application/ApplicationForm";
import ApplicationComplete from "@/pages/application/ApplicationComplete";
import MyPage from "@/pages/member/MyPage";
import GraduationInterview from "@/pages/interview/GraduationInterview";
import Dashboard from "@/pages/admin/Dashboard";
import AdminApplications from "@/pages/admin/AdminApplications";
import AdminTeachers from "@/pages/admin/AdminTeachers";
import AdminInterviews from "@/pages/admin/AdminInterviews";
import AdminRoles from "@/pages/admin/AdminRoles";
import AdminMembers from "@/pages/admin/AdminMembers";
import AuthCallback from "@/pages/auth/AuthCallback";
import Login from "@/pages/auth/Login";
import InterviewComplete from "@/pages/interview/InterviewComplete";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Admin pages with sidebar */}
          <Route path="/admin" element={<AdminLayout><Dashboard /></AdminLayout>} />
          <Route path="/admin/applications" element={<AdminLayout><AdminApplications /></AdminLayout>} />
          <Route path="/admin/teachers" element={<AdminLayout><AdminTeachers /></AdminLayout>} />
          <Route path="/admin/interviews" element={<AdminLayout><AdminInterviews /></AdminLayout>} />
          <Route path="/admin/members" element={<AdminLayout><AdminMembers /></AdminLayout>} />
          <Route path="/admin/roles" element={<AdminLayout><AdminRoles /></AdminLayout>} />

          {/* Public pages with main layout */}
          <Route path="/" element={<Layout><Index /></Layout>} />
          <Route path="/class/:classId" element={<Layout><ClassPage /></Layout>} />
          <Route path="/teacher/:teacherId" element={<Layout><TeacherDetail /></Layout>} />
          <Route path="/apply/:teacherId" element={<Layout><ApplicationForm /></Layout>} />
          <Route path="/apply-complete" element={<Layout><ApplicationComplete /></Layout>} />
          <Route path="/mypage" element={<Layout><MyPage /></Layout>} />
          <Route path="/graduation-interview" element={<Layout><GraduationInterview /></Layout>} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/login" element={<Layout><Login /></Layout>} />
          <Route path="/signup" element={<Navigate to="/login" replace />} />
          <Route path="/signup-complete" element={<Navigate to="/login" replace />} />
          <Route path="/forgot-password" element={<Navigate to="/login" replace />} />
          <Route path="/interview-complete" element={<Layout><InterviewComplete /></Layout>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
