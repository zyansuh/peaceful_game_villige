import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Index from "./pages/Index";
import ClassPage from "./pages/ClassPage";
import TeacherDetail from "./pages/TeacherDetail";
import ApplicationForm from "./pages/ApplicationForm";
import ApplicationComplete from "./pages/ApplicationComplete";
import Dashboard from "./pages/admin/Dashboard";
import AdminApplications from "./pages/admin/AdminApplications";
import AdminTeachers from "./pages/admin/AdminTeachers";
import AuthCallback from "./pages/AuthCallback";

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
          <Route path="/admin" element={<Dashboard />} />
          <Route path="/admin/applications" element={<AdminApplications />} />
          <Route path="/admin/teachers" element={<AdminTeachers />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;