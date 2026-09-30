import { useState } from "react";
import { FiMenu, FiX, FiShoppingCart, FiInstagram } from "react-icons/fi";
import { useCarrinho } from "../context/CarrinhoContext";

export default function Navbar({ abrirCarrinho }) {
  const [aberto, setAberto] = useState(false);
  const { qtdTotal } = useCarrinho();

  const links = [
    { nome: "Início", href: "#inicio" },
    { nome: "Cardápio", href: "#produtos" },
    { nome: "Sobre", href: "#sobre" },
    { nome: "Depoimentos", href: "#depoimentos" },
    { nome: "Contato", href: "#contato" },
  ];

  return (
    <nav className="fixed top-0 w-full bg-verdeEscuro/95 backdrop-blur shadow-lg z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          <a href="#inicio" className="flex items-center gap-3">
            <img src="/topo.jpg" alt="Logo" className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-dourado" />
            <div className="hidden sm:block">
              <div className="font-titulo text-lg md:text-xl text-dourado leading-none">
                Bolos Caseiros
              </div>
              <div className="font-titulo text-base md:text-lg text-creme leading-none">
                Sabrina
              </div>
            </div>
          </a>

          <ul className="hidden md:flex space-x-8">
            {links.map((l) => (
              <li key={l.nome}>
                <a href={l.href} className="text-creme hover:text-dourado font-medium transition">
                  {l.nome}
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            <a
              href="https://instagram.com/Sabrina_BolosCaseiros"
              target="_blank"
              rel="noreferrer"
              className="hidden sm:flex p-2 text-dourado hover:text-creme transition"
            >
              <FiInstagram size={20} />
            </a>
            <button
              onClick={abrirCarrinho}
              className="relative p-2 text-dourado hover:text-creme transition"
            >
              <FiShoppingCart size={24} />
              {qtdTotal > 0 && (
                <span className="absolute -top-1 -right-1 bg-dourado text-marrom text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {qtdTotal}
                </span>
              )}
            </button>
            <button
              onClick={() => setAberto(!aberto)}
              className="md:hidden p-2 text-creme"
            >
              {aberto ? <FiX size={26} /> : <FiMenu size={26} />}
            </button>
          </div>
        </div>

        {aberto && (
          <ul className="md:hidden pb-4 space-y-2 animate-fade-in">
            {links.map((l) => (
              <li key={l.nome}>
                <a
                  href={l.href}
                  onClick={() => setAberto(false)}
                  className="block py-2 px-4 text-creme hover:bg-dourado/20 rounded-lg"
                >
                  {l.nome}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </nav>
  );
}