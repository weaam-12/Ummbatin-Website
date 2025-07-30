import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./AuthContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Login from "./pages/Login";
import RegistrationPage from "./pages/RegistrationPage";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./pages/AdminDashboard";
import ProtectedRoute from './pages/ProtectedRoute';
import Complaints from './pages/Complaints';
import EmergencyPage from "./pages/EmergencyPage";
import GarbageComplaint from "./pages/GarbageComplaint";
import Payments from "./pages/Payments";
import AdminPayments from "./pages/AdminPayments";
import AdminGeneral from "./pages/AdminGeneral.jsx";
import ErrorBoundary from "./pages/ErrorBoundary";
import Childern from "./pages/Children.jsx";
import Forms from "./pages/Forms";
import Profile from "./pages/Profile"; // Added
import AdminComplaints from "./pages/AdminComplaints"
import AdminKinder from "./pages/AdminKinder";
import About from "./pages/About.jsx";
import PrivacyPolicy from "./pages/PrivacyPolicy.jsx";
const App = () => {
    return (
        <AuthProvider>
            <Router>
                <div className="App">
                    <Navbar />
                    <main>
                        <ErrorBoundary>
                            <Routes>
                                {/* Public Routes */}
                                <Route path="/" element={<Home />} />
                                <Route path="/Ummbatin-Website" element={<Home />} />
                                <Route path="/admin/complaints" element={
                                    <ProtectedRoute allowedRoles={['ADMIN']}>
                                        <AdminComplaints />
                                    </ProtectedRoute>
                                } />
                                <Route path="/admin/education" element={
                                    <ProtectedRoute allowedRoles={['ADMIN']}>
                                        <AdminKinder />
                                    </ProtectedRoute>
                                } />

                                <Route path="/login" element={<Login />} />
                                <Route path="/register" element={<RegistrationPage />} />

                                <Route path="/profile" element={
                                    <ProtectedRoute>
                                        <Profile />
                                    </ProtectedRoute>
                                } />
                                <Route path="/payments" element={
                                    <ProtectedRoute allowedRoles={['RESIDENT', 'USER']}>
                                        <Payments />
                                    </ProtectedRoute>
                                } />

                                <Route path="/complaints" element={
                                    <ProtectedRoute allowedRoles={['RESIDENT', 'USER']}> {/* أو أي أدوار أخرى للمستخدمين العاديين */}
                                        <Complaints />
                                    </ProtectedRoute>
                                } />

                                <Route path="/emergency" element={
                                    <ProtectedRoute>
                                        <EmergencyPage />
                                    </ProtectedRoute>
                                } />

                                <Route path="/garbage-complaint" element={
                                    <ProtectedRoute>
                                        <GarbageComplaint />
                                    </ProtectedRoute>
                                } />

                                <Route path="/admin/payments" element={
                                    <ProtectedRoute allowedRoles={['ADMIN']}>
                                        <AdminPayments />
                                    </ProtectedRoute>
                                } />

                                <Route path="/admin/general" element={
                                    <ProtectedRoute allowedRoles={['ADMIN']}>
                                        <AdminGeneral />
                                    </ProtectedRoute>
                                } />
                                <Route path="/children" element={
                                    <ProtectedRoute>
                                        <Childern />
                                    </ProtectedRoute>
                                } />

                                <Route path="/forms" element={
                                    <ProtectedRoute>
                                        <Forms />
                                    </ProtectedRoute>
                                } />
                                <Route path="/garbage-complaints" element={
                                    <ProtectedRoute>
                                        <GarbageComplaint />
                                    </ProtectedRoute>
                                } />
                                <Route path="/garbage-complaints" element={
                                    <ProtectedRoute>
                                        <About />
                                    </ProtectedRoute>
                                } />
                                <Route path="/garbage-complaints" element={
                                    <ProtectedRoute>
                                        <PrivacyPolicy />
                                    </ProtectedRoute>
                                } />
                                <Route path="/admin" element={
                                    <ProtectedRoute allowedRoles={["ADMIN"]}>
                                        <AdminDashboard />
                                    </ProtectedRoute>
                                } />

                                {/* 404 Route */}
                                <Route path="*" element={<NotFound />} />
                            </Routes>
                        </ErrorBoundary>
                    </main>
                    <Footer />
                </div>
            </Router>
        </AuthProvider>
    );
};

export default App;