import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";
import { Toaster } from "react-hot-toast";
import { CarrinhoProvider } from "./context/CarrinhoContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Produtos from "./components/Produtos";
import Sobre from "./components/Sobre";
import Depoimentos from "./components/Depoimentos";
import Contato from "./components/Contato";
import Footer from "./components/Footer";
import CarrinhoModal from "./components/CarrinhoModal";
import WhatsappFlutuante from "./components/WhatsappFlutuante";
import Login from "./pages/Login";
import AdminLayout from "./pages/AdminLayout";
import Dashboard from "./pages/Dashboard";
import Vendas from "./pages/Vendas";
import Precificacao from "./pages/Precificacao";
import Admin from "./pages/Admin"; // produtos
import Financeiro from "./pages/Financeiro";

function SitePrincipal() {
  const [carrinhoAberto, setCarrinhoAberto] = useState(false);
  return (
    <div className="min-h-screen bg-creme">
      <Navbar abrirCarrinho={() => setCarrinhoAberto(true)} />
      <Hero />
      <Produtos />
      <Sobre />
      <Depoimentos />
      <Contato />
      <Footer />
      <CarrinhoModal aberto={carrinhoAberto} fechar={() => setCarrinhoAberto(false)} />
      <WhatsappFlutuante />
    </div>
  );
}

function RotaProtegida({ children }) {
  const { user, loading } = useAuth();
  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Carregando...
      </div>
    );
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <CarrinhoProvider>
        <BrowserRouter>
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 2500,
              style: {
                background: "#3D2817",
                color: "#F5EFE0",
                border: "2px solid #C9A227",
                borderRadius: "9999px",
                padding: "12px 20px",
                fontWeight: "500",
                fontFamily: "Poppins, sans-serif",
              },
              success: { iconTheme: { primary: "#C9A227", secondary: "#3D2817" } },
            }}
          />

          <Routes>
            <Route path="/" element={<SitePrincipal />} />
            <Route path="/login" element={<Login />} />

            {/* Painel Admin com layout */}
            <Route
              path="/admin"
              element={
                <RotaProtegida>
                  <AdminLayout />
                </RotaProtegida>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="produtos" element={<Admin />} />
              <Route path="vendas" element={<Vendas />} />
              <Route path="precificacao" element={<Precificacao />} />
              <Route path="financeiro" element={<Financeiro />} />  
            </Route>
          </Routes>
        </BrowserRouter>
      </CarrinhoProvider>
    </AuthProvider>
  );
}