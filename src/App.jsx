import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./AuthContext"; // From src/
import { UserProvider } from "./pages/UserContext"; // From src/pages/import AdminDashboard from "./pages/AdminDashboard";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Login from "./pages/Login";
import RegistrationPage from "./pages/RegistrationPage";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./pages/AdminDashboard"; // Add this import
import ProtectedRoute from './pages/ProtectedRoute';
import Complaints from './pages/Complaints';
import EmergencyPage from "./pages/EmergencyPage";
import GarbageComplaint from "./pages/GarbageComplaint";
import PaymentForm from "./pages/PaymentForm";
import ErrorBoundary from "./pages/ErrorBoundary";
import Childern from "./pages/Childern";
import Forms from "./pages/Forms";

const App = () => {
    return (
        <AuthProvider>
            <UserProvider> {/* Add this wrapper */}
                <Router>
                    <div className="App">
                        <Navbar />
                        <main>
                            <ErrorBoundary>
                                <Routes>
                                    <Route path="/" element={<Home />} />
                                    <Route path="/login" element={<Login />} />
                                    <Route path="/register" element={<RegistrationPage />} />
                                    <Route path="/complaints" element={<Complaints />} />
                                    <Route path="/emergency" element={<EmergencyPage />} />
                                    <Route path="/garbage-complaint" element={<GarbageComplaint />} />
                                    <Route path="/payments" element={<PaymentForm />} />
                                    <Route path="/children" element={<Childern />} />
                                    <Route path="/forms" element={<Forms/>} />
                                    <Route
                                        path="/admin"
                                        element={
                                            <ProtectedRoute allowedRoles={["ADMIN"]}>
                                                <AdminDashboard />
                                            </ProtectedRoute>
                                        }
                                    />
                                    <Route path="*" element={<NotFound />} />
                                </Routes>
                            </ErrorBoundary>
                        </main>
                        <Footer />
                    </div>
                </Router>
            </UserProvider> {/* Close the wrapper */}
        </AuthProvider>
    );
};

export default App;