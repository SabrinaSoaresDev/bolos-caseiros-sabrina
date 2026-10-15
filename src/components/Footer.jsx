import { Link } from "react-router-dom";
import { FiMapPin } from "react-icons/fi";
import { motion } from "framer-motion";

export default function Footer() {
  return (
    <footer className="bg-marrom text-creme py-8 px-4 text-center overflow-hidden">
      <motion.img
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        whileHover={{ scale: 1.1, rotate: 5 }}
        transition={{ type: "spring", stiffness: 300 }}
        src="/topo.jpg"
        alt="Logo"
        className="w-16 h-16 rounded-full mx-auto mb-3 border-2 border-dourado object-cover"
      />

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="font-titulo text-2xl text-dourado mb-1"
      >
        Bolos Caseiros Sabrina
      </motion.p>

      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
        className="text-sm text-dourado italic mb-4"
      >
        O MELHOR BOLO ESTÁ AQUI!
      </motion.p>

      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3 }}
        className="text-sm text-creme/80 flex items-center justify-center gap-2 mb-1"
      >
        <FiMapPin size={14} className="text-dourado" />
        Av. Guerino Gilbert, 446 — Ap 101 (encima do Marobar)
      </motion.p>

      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4 }}
        className="text-sm text-creme/80 mb-4"
      >
        📱 (27) 99803-6871 • 📷 @Sabrina_BolosCaseiros
      </motion.p>

      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.5 }}
        className="text-xs text-creme/50"
      >
        © {new Date().getFullYear()} Bolos Caseiros Sabrina — Todos os direitos
        reservados
      </motion.p>

      <Link
        to="/login"
        className="inline-block mt-3 text-[10px] text-creme/30 hover:text-dourado transition-colors"
      >
        ⚙️ Área administrativa
      </Link>
    </footer>
  );
}