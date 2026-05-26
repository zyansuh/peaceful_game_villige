import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Index from "./pages/Index";
import ClassPage from "./pages/ClassPage";
import TeacherDetail from "./pages/TeacherDetail";
import ApplicationForm from "./pages/ApplicationForm";
import ApplicationComplete from "./pages/ApplicationComplete";
import MyPage from "./pages/MyPage";
import GraduationInterview from "./pages/GraduationInterview";
import Dashboard from "./pages/admin/Dashboard";
import AdminApplications from "./pages/admin/AdminApplications";
import AdminTeachers from "./pages/admin/AdminTeachers";
import AdminInterviews from "./pages/admin/AdminInterviews";
import AuthCallback from "./pages/AuthCallback";
import Signup from "./pages/Signup";
import SignupComplete from "./pages/SignupComplete";

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/class/:classId" element={<ClassPage />} />
          <Route path="/teacher/:teacherId" element={<TeacherDetail />} />
          <Route path="/apply/:teacherId" element={<ApplicationForm />} />
          <Route path="/apply-complete" element={<ApplicationComplete />} />
          <Route path="/mypage" element={<MyPage />} />
          <Route path="/graduation-interview" element={<GraduationInterview />} />
          <Route path="/admin" element={<Dashboard />} />
          <Route path="/admin/applications" element={<AdminApplications />} />
          <Route path="/admin/teachers" element={<AdminTeachers />} />
          <Route path="/admin/interviews" element={<AdminInterviews />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/signup-complete" element={<SignupComplete />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;