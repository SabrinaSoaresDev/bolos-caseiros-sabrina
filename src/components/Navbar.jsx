import { useState } from "react";
import {
  FiMenu,
  FiX,
  FiShoppingCart,
  FiInstagram,
} from "react-icons/fi";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useCarrinho } from "../context/CarrinhoContext";

export default function Navbar({ abrirCarrinho }) {
  const [aberto, setAberto] = useState(false);
  const { qtdTotal } = useCarrinho();

  const { scrollY } = useScroll();
  const shadow = useTransform(
    scrollY,
    [0, 100],
    ["0 0 0 rgba(0,0,0,0)", "0 4px 20px rgba(0,0,0,0.25)"]
  );

  const links = [
    { nome: "Início", href: "#inicio" },
    { nome: "Cardápio", href: "#produtos" },
    { nome: "Sobre", href: "#sobre" },
    { nome: "Depoimentos", href: "#depoimentos" },
    { nome: "Contato", href: "#contato" },
  ];

  return (
    <motion.nav
      style={{ boxShadow: shadow }}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed top-0 w-full bg-verdeEscuro/95 backdrop-blur z-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          <motion.a
            href="#inicio"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-3"
          >
            <motion.img
              src="/topo.jpg"
              alt="Logo"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-dourado object-cover"
            />
            <div className="hidden sm:block">
              <div className="font-titulo text-lg md:text-xl text-dourado leading-none">
                Bolos Caseiros
              </div>
              <div className="font-titulo text-base md:text-lg text-creme leading-none">
                Sabrina
              </div>
            </div>
          </motion.a>

          <ul className="hidden md:flex space-x-8">
            {links.map((l, i) => (
              <motion.li
                key={l.nome}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.1, duration: 0.5 }}
              >
                <a
                  href={l.href}
                  className="text-creme hover:text-dourado font-medium transition-colors relative group"
                >
                  {l.nome}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-dourado group-hover:w-full transition-all duration-300" />
                </a>
              </motion.li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            <motion.a
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              href="https://instagram.com/Sabrina_BolosCaseiros"
              target="_blank"
              rel="noreferrer"
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.95 }}
              className="hidden sm:flex p-2 text-dourado hover:text-creme transition-colors"
            >
              <FiInstagram size={20} />
            </motion.a>

            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={abrirCarrinho}
              className="relative p-2 text-dourado hover:text-creme transition-colors"
              aria-label="Abrir carrinho"
            >
              <FiShoppingCart size={24} />
              <AnimatePresence>
                {qtdTotal > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-1 -right-1 bg-dourado text-marrom text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold"
                  >
                    {qtdTotal}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>

            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setAberto(!aberto)}
              className="md:hidden p-2 text-creme"
              aria-label="Menu"
            >
              {aberto ? <FiX size={26} /> : <FiMenu size={26} />}
            </motion.button>
          </div>
        </div>

        <AnimatePresence>
          {aberto && (
            <motion.ul
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden overflow-hidden space-y-2 pb-4"
            >
              {links.map((l, i) => (
                <motion.li
                  key={l.nome}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <a
                    href={l.href}
                    onClick={() => setAberto(false)}
                    className="block py-2 px-4 text-creme hover:bg-dourado/20 rounded-lg transition-colors"
                  >
                    {l.nome}
                  </a>
                </motion.li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
}