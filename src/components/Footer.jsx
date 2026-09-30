import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-marrom text-creme py-8 px-4 text-center">
      <img src="/topo.jpg" alt="Logo" className="w-16 h-16 rounded-full mx-auto mb-3 border-2 border-dourado" />
      <p className="font-titulo text-2xl text-dourado mb-1">Bolos Caseiros Sabrina</p>
      <p className="text-sm text-dourado italic mb-3">O MELHOR BOLO ESTÁ AQUI!</p>
      <p className="text-sm text-creme/70">
        © {new Date().getFullYear()} Bolos Caseiros Sabrina — @Sabrina_BolosCaseiros
      </p>

      {/* 🔒 Link discreto para o admin */}
      <Link
        to="/login"
        className="inline-block mt-3 text-[10px] text-creme/30 hover:text-dourado transition"
      >
        ⚙️ Área administrativa
      </Link>
    </footer>
  );
}