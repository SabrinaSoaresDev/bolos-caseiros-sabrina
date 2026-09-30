import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {Link} from  "react-router-dom";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro("");
    setLoading(true);
    try {
      await login(email, senha);
      navigate("/admin");
    } catch (err) {
      setErro("E-mail ou senha inválidos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-verdeEscuro px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md border-t-4 border-dourado"
      >
        <div className="text-center mb-6">
          <img
            src="/topo.jpg"
            alt="Logo"
            className="w-24 h-24 rounded-full mx-auto mb-3 border-2 border-dourado"
          />
          <h1 className="font-titulo text-2xl text-marrom">Painel Admin</h1>
          <p className="text-gray-500 text-sm">Bolos Caseiros Sabrina</p>
        </div>

        {erro && (
          <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-sm">
            {erro}
          </div>
        )}

        <label className="block mb-3">
          <span className="text-sm text-gray-600">E-mail</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-dourado outline-none"
          />
        </label>

        <label className="block mb-5">
          <span className="text-sm text-gray-600">Senha</span>
          <input
            type="password"
            required
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-dourado outline-none"
          />
        </label>

        <button
          disabled={loading}
          className="w-full bg-marrom text-creme py-3 rounded-full font-medium hover:bg-dourado hover:text-marrom transition disabled:opacity-50"
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>
        <Link
          to="/"
          className="mt-6 inline-flex items-center gap-2 text-sm text-marrom hover:text-dourado transition group"
        >
          <span className="group-hover:-translate-x-1 transition-transform">←</span>
          Voltar à página principal
        </Link>
      </form>
      
    </div>
  );
}