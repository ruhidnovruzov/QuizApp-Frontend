import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import AuthGuard from "./components/common/AuthGuard";

// Menim importlarim 
import UserPage from "./pages/Users/UserPage";
import DepartmentPage from "./pages/Departments/DepartmentPage";
import SubjectPage from "./pages/Topics/TopicPage"; // TopicPage yerine SubjectPage
import GroupPage from "./pages/Groups/GroupPage";
import QuizPage from "./pages/Quiz/QuizPage";
import AssignmentPage from "./pages/Assignments/AssignmentPage";
import GradingPage from "./pages/Grading/GradingPage";
import StudentQuizList from "./pages/Student/StudentQuizList";
import StudentResults from "./pages/Student/StudentResults";
import EditQuizPage from "./pages/Quiz/EditQuizPage";
import CreateQuizPage from "./pages/Quiz/CreateQuizPage";
import QuizResultsPage from "./pages/Grading/QuizResultsPage";
import TakeQuizPage from "./pages/Quiz/TakeQuizPage";
import StudentResultDetail from "./pages/Student/StudentResultDetail";
import MyResultDetail from "./pages/Student/MyResult";
import ForgotPassword from "./pages/AuthPages/ForgotPassword";
import VerifyOTP from "./pages/AuthPages/VerifyOTP";
import ResetPassword from "./pages/AuthPages/ResetPassword";


// Rolları qısaltmaq üçün dəyişənlər
const ALL = ['Admin', 'Teacher', 'Student'];
const ADMIN = ['Admin'];
const TEACHER_ADMIN = ['Admin', 'Teacher'];
const STUDENT = ['Student'];


export default function App() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <Routes>

          {/* Qorunmayan Auth Yolları */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/verify-otp" element={<VerifyOTP />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          {/* Qorunan Əsas Layout (AppLayout) */}
          <Route element={<AppLayout />}>

            {/* Əsas Səhifə (Bütün rollar) */}
            <Route index element={
              <AuthGuard allowedRoles={ALL}>
                <Home />
              </AuthGuard>
            } />

            {/* ✅ YENİLİK: /quizzes/create yolu ümumi yola köçürülür. */}
            <Route path="/quizzes/create" element={
              <AuthGuard allowedRoles={TEACHER_ADMIN}>
                <CreateQuizPage />
              </AuthGuard>
            } />


              <Route path="quizzes" element={
                <AuthGuard allowedRoles={TEACHER_ADMIN}><QuizPage /></AuthGuard>
              } />
            
                 <Route path="quizzes/edit/:id" element={
                <AuthGuard allowedRoles={TEACHER_ADMIN}><EditQuizPage /></AuthGuard> // Quiz redaktə et
              } />



            {/* 1. ADMIN Modulları */}
            <Route path="/admin">
              <Route path="dashboard" element={
                <AuthGuard allowedRoles={ADMIN}><Home /></AuthGuard>
              } />
              <Route path="users" element={
                <AuthGuard allowedRoles={ADMIN}><UserPage /></AuthGuard>
              } />
              <Route path="departments" element={
                <AuthGuard allowedRoles={ADMIN}><DepartmentPage /></AuthGuard>
              } />
              <Route path="groups" element={
                <AuthGuard allowedRoles={ADMIN}><GroupPage /></AuthGuard>
              } />
              <Route path="subjects" element={
                <AuthGuard allowedRoles={ADMIN}><SubjectPage /></AuthGuard>
              } />
        
              {/* Buradakı 'quizzes/create' yolu silindi, çünki üstdə əlavə edildi. */}
              <Route path="assignments" element={
                <AuthGuard allowedRoles={ADMIN}><AssignmentPage /></AuthGuard>
              } />
            </Route>


            {/* 2. TEACHER Modulları */}
            <Route path="/teacher">
              <Route path="dashboard" element={
                <AuthGuard allowedRoles={TEACHER_ADMIN}><Home /></AuthGuard>
              } />

              <Route path="subjects" element={
                <AuthGuard allowedRoles={TEACHER_ADMIN}><SubjectPage /></AuthGuard> // Fənnlərim
              } />

              {/* /quizzes/results/:quizId */}
              <Route path="quizzes/results/:quizId" element={
                <AuthGuard allowedRoles={TEACHER_ADMIN}><QuizResultsPage /></AuthGuard> // Quiz nəticələri
              } />

              <Route path="results/detail/:resultId" element={
                <AuthGuard allowedRoles={TEACHER_ADMIN}><StudentResultDetail /></AuthGuard>
              } />

              {/* Buradakı 'quizzes/create' yolu silindi, çünki üstdə əlavə edildi. */}
         
              <Route path="results" element={
                <AuthGuard allowedRoles={TEACHER_ADMIN}><GradingPage /></AuthGuard> // Nəticələrə baxış (Grading)
              } />
            </Route>


            {/* 3. STUDENT Modulları */}
            <Route path="/student">
              <Route path="dashboard" element={
                <AuthGuard allowedRoles={STUDENT}><Home /></AuthGuard>
              } />
              <Route path="subjects" element={
                <AuthGuard allowedRoles={STUDENT}><SubjectPage /></AuthGuard> // Qeydiyyatlı Fənnlər
              } />
              <Route path="quizzes" element={
                <AuthGuard allowedRoles={STUDENT}><StudentQuizList /></AuthGuard> // Quiz İştirakı (List)
              } />
              <Route path="quiz/take/:id" element={
                <AuthGuard allowedRoles={STUDENT}><TakeQuizPage /></AuthGuard> // Quiz İştirakı (Take)
              } />
              <Route path="my-results" element={
                <AuthGuard allowedRoles={STUDENT}><StudentResults /></AuthGuard> // Mənim Nəticələrim
              } />
              <Route path="results/detail/:resultId" element={
                <AuthGuard allowedRoles={STUDENT}><MyResultDetail /></AuthGuard>
              } />
              <Route path="quiz/take/:id" element={
                <AuthGuard allowedRoles={STUDENT}>{/* <TakeQuizPage /> */}</AuthGuard>
              } />
            </Route>

          </Route>


          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}