import React, { useEffect } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { Toaster } from "./components/ui/toaster";

// Components
import Header from "./components/Header";
import Footer from "./components/Footer";

// Pages
import Home from "./pages/Home";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import ParentDashboard from "./pages/ParentDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import ReportCards from "./pages/ReportCards";
import GradeManagement from "./pages/GradeManagement";

function App() {
  useEffect(() => {
    // Asegurar el título correcto
    document.title = "GADA - Gimnasio Americano del Atlántico | Sistema Académico";
    
    // Actualizar meta description si es necesario
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 
        'Sistema Académico del Gimnasio Americano del Atlántico Sede 2 Manuela Beltrán. Desarrollado por Pedro Hurtado - Coordinador Académico.'
      );
    }
  }, []);

  return (
    <AuthProvider>
      <div className="App min-h-screen bg-white">
        <BrowserRouter>
          <Header />
          <main className="min-h-screen">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/teacher" element={<TeacherDashboard />} />
              <Route path="/parent" element={<ParentDashboard />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/report-cards" element={<ReportCards />} />
              <Route path="/grades" element={<GradeManagement />} />
            </Routes>
          </main>
          <Footer />
          <Toaster />
        </BrowserRouter>
      </div>
    </AuthProvider>
  );
}

export default App;