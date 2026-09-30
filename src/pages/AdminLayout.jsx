import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  FiPackage, FiDollarSign, FiTrendingUp, FiLogOut,
  FiHome, FiMenu, FiX,FiPieChart,
} from "react-icons/fi";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarAberta, setSidebarAberta] = useState(false);

  const sair = async () => {
    await logout();
    navigate("/");
  };

  const links = [
    { to: "/admin", label: "Dashboard", icon: <FiHome size={20} />, exact: true },
    { to: "/admin/produtos", label: "Produtos", icon: <FiPackage size={20} /> },
    { to: "/admin/vendas", label: "Vendas", icon: <FiDollarSign size={20} /> },
    { to: "/admin/financeiro", label: "Financeiro", icon: <FiPieChart size={20} /> },
    { to: "/admin/precificacao", label: "Precificação", icon: <FiTrendingUp size={20} /> },
  ];

  return (
    <div className="min-h-screen bg-creme flex">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex md:flex-col w-64 bg-verdeEscuro text-creme shadow-xl">
        <div className="p-5 border-b border-dourado/20 flex items-center gap-3">
          <img
            src="/topo.jpg"
            alt="Logo"
            className="w-12 h-12 rounded-full border-2 border-dourado"
          />
          <div>
            <div className="font-titulo text-dourado leading-none">Sabrina</div>
            <div className="text-xs text-creme/60">Admin</div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.exact}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                  isActive
                    ? "bg-dourado text-marrom font-bold shadow-md"
                    : "text-creme/80 hover:bg-white/10"
                }`
              }
            >
              {l.icon}
              <span>{l.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-dourado/20">
          <div className="text-xs text-creme/60 mb-2 truncate">
            {user?.email}
          </div>
          <button
            onClick={sair}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-dourado/20 hover:bg-dourado/30 text-dourado transition"
          >
            <FiLogOut size={16} /> Sair
          </button>
        </div>
      </aside>

      {/* Sidebar Mobile (drawer) */}
      {sidebarAberta && (
        <>
          <div
            onClick={() => setSidebarAberta(false)}
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
          />
          <aside className="fixed top-0 left-0 h-full w-64 bg-verdeEscuro text-creme shadow-2xl z-50 md:hidden animate-fade-in">
            <div className="p-5 border-b border-dourado/20 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <img src="/topo.jpg" className="w-10 h-10 rounded-full border-2 border-dourado" />
                <span className="font-titulo text-dourado">Sabrina</span>
              </div>
              <button onClick={() => setSidebarAberta(false)}>
                <FiX size={22} />
              </button>
            </div>
            <nav className="p-4 space-y-1">
              {links.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  end={l.exact}
                  onClick={() => setSidebarAberta(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                      isActive
                        ? "bg-dourado text-marrom font-bold"
                        : "text-creme/80 hover:bg-white/10"
                    }`
                  }
                >
                  {l.icon}
                  <span>{l.label}</span>
                </NavLink>
              ))}
            </nav>
            <div className="p-4 border-t border-dourado/20">
              <button
                onClick={sair}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-dourado/20 text-dourado"
              >
                <FiLogOut size={16} /> Sair
              </button>
            </div>
          </aside>
        </>
      )}

      {/* Conteúdo */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar mobile */}
        <header className="md:hidden bg-verdeEscuro text-creme p-4 flex justify-between items-center shadow-lg sticky top-0 z-30">
          <button
            onClick={() => setSidebarAberta(true)}
            className="p-2 rounded-lg bg-white/10"
          >
            <FiMenu size={22} />
          </button>
          <span className="font-titulo text-dourado">Admin Sabrina</span>
          <button
            onClick={() => navigate("/")}
            className="p-2 rounded-lg bg-white/10 text-dourado"
            title="Ver site"
          >
            <FiHome size={20} />
          </button>
        </header>

        <main className="flex-1 p-4 md:p-8 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}