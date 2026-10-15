import { motion } from "framer-motion";
import { FiPlus } from "react-icons/fi";
import { useCarrinho } from "../context/CarrinhoContext";

export default function ProdutoCard({ produto }) {
  const { adicionar } = useCarrinho();

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 60 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.6, ease: "easeOut" },
        },
      }}
      whileHover={{ y: -10 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="bg-white rounded-2xl shadow-md hover:shadow-2xl transition-shadow overflow-hidden group border-2 border-dourado/20 relative"
    >
      <div className="overflow-hidden h-56 sm:h-64 bg-cremeClaro flex items-center justify-center">
        <motion.img
          src={produto.imagem}
          alt={produto.nome}
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.6 }}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="p-5">
        <h3 className="font-titulo text-xl text-marrom mb-2">{produto.nome}</h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {produto.descricao}
        </p>
        <div className="flex justify-between items-center">
          <span className="text-2xl font-bold text-dourado">
            R$ {produto.preco.toFixed(2).replace(".", ",")}
          </span>
          <motion.button
            onClick={() => adicionar(produto)}
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400 }}
            className="bg-marrom text-creme p-3 rounded-full hover:bg-dourado hover:text-marrom transition-colors shadow-md"
            aria-label="Adicionar ao carrinho"
          >
            <FiPlus size={20} />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}