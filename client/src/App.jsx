import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Loader from "./components/Loader";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Chat from "./pages/Chat";
import Interviews from "./pages/Interviews";
import ResumeATS from "./pages/ResumeATS";
import MockTests from "./pages/MockTests";
import Landing from "./pages/Landing";
import AICopilot from "./pages/AICopilot";
import AIResumeAnalyzer from "./pages/AIResumeAnalyzer";
import AIResumeOptimizer from "./pages/AIResumeOptimizer";
import CoverLetterGen from "./pages/CoverLetterGen";
import JobMatcher from "./pages/JobMatcher";
import LearningRoadmap from "./pages/LearningRoadmap";
import GitHubAnalyzer from "./pages/GitHubAnalyzer";
import AIInterviewCoach from "./pages/AIInterviewCoach";
import RecruiterDashboard from "./pages/RecruiterDashboard";

// Protected Route wrapper
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <Loader />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
};

// Public Route wrapper
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <Loader />;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return children;
};

function App() {
  return (
    <div className="min-h-screen bg-animated-gradient">
      <Navbar />
      <main>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

          {/* Existing Protected Routes */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/interviews" element={<ProtectedRoute><Interviews /></ProtectedRoute>} />
          <Route path="/resume-ats" element={<ProtectedRoute><ResumeATS /></ProtectedRoute>} />
          <Route path="/mock-tests" element={<ProtectedRoute><MockTests /></ProtectedRoute>} />
          <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />

          {/* New AI Routes */}
          <Route path="/ai-copilot" element={<ProtectedRoute><AICopilot /></ProtectedRoute>} />
          <Route path="/ai-ats" element={<ProtectedRoute><AIResumeAnalyzer /></ProtectedRoute>} />
          <Route path="/ai-resume-optimizer" element={<ProtectedRoute><AIResumeOptimizer /></ProtectedRoute>} />
          <Route path="/cover-letter" element={<ProtectedRoute><CoverLetterGen /></ProtectedRoute>} />
          <Route path="/job-matcher" element={<ProtectedRoute><JobMatcher /></ProtectedRoute>} />
          <Route path="/learning-roadmap" element={<ProtectedRoute><LearningRoadmap /></ProtectedRoute>} />
          <Route path="/github-analyzer" element={<ProtectedRoute><GitHubAnalyzer /></ProtectedRoute>} />
          <Route path="/ai-interview-coach" element={<ProtectedRoute><AIInterviewCoach /></ProtectedRoute>} />
          <Route path="/command-center" element={<ProtectedRoute><RecruiterDashboard /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
