import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "./contexts/ThemeContext";
import ErrorBoundary from "./components/ErrorBoundary";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import AdminRoute from "./components/auth/AdminRoute";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import Home from "./pages/Home";
import Chat from "./pages/Chat";
import Profile from "./pages/Profile";
import Friends from "./pages/Friends";
import Clubs from "./pages/Clubs";
import ClubDetail from "./pages/ClubDetail";
import Articles from "./pages/Articles";
import Marketplace from "./pages/Marketplace";
import ArticleView from "./components/ArticleView";
import Settings from "./pages/Settings";
import Help from "./pages/Help";
import Notifications from "./pages/Notifications";
import Rewards from "./pages/Rewards";
import StudentVoices from "./pages/StudentVoices";
import Subscription from "./pages/Subscription";
import PaymentSuccess from "./pages/PaymentSuccess";
import BoostedPosts from "./pages/BoostedPosts";
import PublicProfile from "./pages/PublicProfile";
import PostDetail from "./pages/PostDetail";
import AdminLayout from "./layouts/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import UserManagement from "./pages/admin/UserManagement";
import StudentVerification from "./pages/admin/StudentVerification";
import ChatManagement from "./pages/admin/ChatManagement";
import ClubManagement from "./pages/admin/ClubManagement";
import ArticleManagement from "./pages/admin/ArticleManagement";
import PostManagement from "./pages/admin/PostManagement";
import ReportsManagement from "./pages/admin/ReportsManagement";
import ActivityLogs from "./pages/admin/ActivityLogs";
import Analytics from "./components/admin/Analytics";
import AdminRewardsDashboard from "./components/AdminRewardsDashboard";
import CertificateManagement from "./components/admin/CertificateManagement";
import CertificateVerification from "./pages/CertificateVerification";
import ResetPassword from "./pages/ResetPassword";
import VerifyEmail from "./pages/VerifyEmail";
import Winners from "./pages/Winners";
import WinnersManagement from "./pages/admin/WinnersManagement";
import MediaHouseManagement from "./pages/admin/MediaHouseManagement";
import MediaHouses from "./pages/MediaHouses";
import MediaHouseProfile from "./pages/MediaHouseProfile";
import SellArticle from "./pages/SellArticle";
import MediaHouseDashboard from "./pages/MediaHouseDashboard";
import socketService from "./services/socketService";


function App() {
  // Connect socket on app mount
  React.useEffect(() => {
    socketService.connect();
    console.log("SocketService: connect() called from App.jsx");
  }, []);

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <Router>
          <div className="App min-h-screen bg-theme text-theme transition-colors duration-300">
            <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route
              path="/verify-certificate/:id"
              element={<CertificateVerification />}
            />
            <Route path="/winners" element={<Winners />} />

            {/* Protected Routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              }
            />
            <Route
              path="/chat"
              element={
                <ProtectedRoute>
                  <Chat />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/friends"
              element={
                <ProtectedRoute>
                  <Friends />
                </ProtectedRoute>
              }
            />
            <Route
              path="/clubs"
              element={
                <ProtectedRoute>
                  <Clubs />
                </ProtectedRoute>
              }
            />
            <Route
              path="/clubs/:id"
              element={
                <ProtectedRoute>
                  <ClubDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/marketplace" element={<Marketplace />} />
            <Route
              path="/articles"
              element={
                <ProtectedRoute>
                  <Articles />
                </ProtectedRoute>
              }
            />
            {/* Public Routes - Posts and Articles can be viewed without login */}
            <Route
              path="/articles/:id"
              element={<ArticleView />}
            />

            <Route
              path="/post/:id"
              element={<PostDetail />}
            />

            {/* Short URL Routes */}
            <Route path="/p/:id" element={<PostDetail />} />
            <Route path="/a/:id" element={<ArticleView />} />
            <Route path="/c/:id" element={<ClubDetail />} />
            <Route path="/u/:username" element={<PublicProfile />} />

            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/help"
              element={
                <ProtectedRoute>
                  <Help />
                </ProtectedRoute>
              }
            />
            <Route
              path="/notifications"
              element={
                <ProtectedRoute>
                  <Notifications />
                </ProtectedRoute>
              }
            />
            <Route
              path="/rewards"
              element={
                <ProtectedRoute>
                  <Rewards />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student-voices"
              element={
                <ProtectedRoute>
                  <StudentVoices />
                </ProtectedRoute>
              }
            />
            <Route
              path="/subscription"
              element={
                <ProtectedRoute>
                  <Subscription />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payment/success"
              element={
                <ProtectedRoute>
                  <PaymentSuccess />
                </ProtectedRoute>
              }
            />
            <Route
              path="/boosted-posts"
              element={
                <ProtectedRoute>
                  <BoostedPosts />
                </ProtectedRoute>
              }
            />
            <Route
              path="/media-houses"
              element={
                <ProtectedRoute>
                  <MediaHouses />
                </ProtectedRoute>
              }
            />
            <Route
              path="/media-houses/:id"
              element={
                <ProtectedRoute>
                  <MediaHouseProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/sell-article"
              element={
                <ProtectedRoute>
                  <SellArticle />
                </ProtectedRoute>
              }
            />
            <Route
              path="/media-house-dashboard"
              element={
                <ProtectedRoute>
                  <MediaHouseDashboard />
                </ProtectedRoute>
              }
            />
            <Route path="/profile/:username" element={<PublicProfile />} />
            <Route path="/profile/username/:username" element={<PublicProfile />} />

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminLayout />
                </AdminRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="students" element={<StudentVerification />} />
              <Route path="chats" element={<ChatManagement />} />
              <Route path="clubs" element={<ClubManagement />} />
              <Route path="articles" element={<ArticleManagement />} />
              <Route path="posts" element={<PostManagement />} />
              <Route path="reports" element={<ReportsManagement />} />
              <Route path="logs" element={<ActivityLogs />} />
              <Route path="rewards" element={<AdminRewardsDashboard />} />
              <Route path="winners" element={<WinnersManagement />} />
              <Route path="media-houses" element={<MediaHouseManagement />} />
              <Route path="certificates" element={<CertificateManagement />} />
            </Route>

            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>

          {/* Toast Notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: "#363636",
                color: "#fff",
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: "#10B981",
                  secondary: "#fff",
                },
              },
              error: {
                duration: 4000,
                iconTheme: {
                  primary: "#EF4444",
                  secondary: "#fff",
                },
              },
            }}
          />

          </div>
        </Router>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
