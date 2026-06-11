import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import AuthCallback from "@/pages/auth/AuthCallback";
import Login from "@/pages/auth/Login";
import Signup from "@/pages/auth/Signup";
import SignupComplete from "@/pages/auth/SignupComplete";
import InterviewComplete from "@/pages/interview/InterviewComplete";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Admin pages with sidebar */}
        <Route path="/admin" element={<AdminLayout><Dashboard /></AdminLayout>} />
        <Route path="/admin/applications" element={<AdminLayout><AdminApplications /></AdminLayout>} />
        <Route path="/admin/teachers" element={<AdminLayout><AdminTeachers /></AdminLayout>} />
        <Route path="/admin/interviews" element={<AdminLayout><AdminInterviews /></AdminLayout>} />

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
        <Route path="/signup" element={<Layout><Signup /></Layout>} />
        <Route path="/signup-complete" element={<Layout><SignupComplete /></Layout>} />
        <Route path="/interview-complete" element={<Layout><InterviewComplete /></Layout>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
