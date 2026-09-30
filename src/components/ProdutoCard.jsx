import { FiPlus } from "react-icons/fi";
import toast from "react-hot-toast";
import { useCarrinho } from "../context/CarrinhoContext";

export default function ProdutoCard({ produto }) {
  const { adicionar } = useCarrinho();

  const handleAdicionar = () => {
    adicionar(produto);
    toast.success(`${produto.nome} adicionado ao carrinho!`, {
      icon: "🍰",
      style: {
        borderRadius: "12px",
      },
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-2xl transition overflow-hidden group border-2 border-dourado/20">
      <div className="overflow-hidden h-56 sm:h-64 bg-cremeClaro flex items-center justify-center">
        <img
          src={produto.imagem}
          alt={produto.nome}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
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
          <button
            onClick={handleAdicionar}
            className="bg-marrom text-creme px-4 py-2 rounded-full hover:bg-dourado hover:text-marrom transition shadow-md font-medium text-sm flex items-center gap-2 active:scale-95"
          >
            <FiPlus size={16} /> Adicionar
          </button>
        </div>
      </div>
    </div>
  );
}