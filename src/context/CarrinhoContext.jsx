import { createContext, useContext, useState, useEffect } from "react";
import toast from "react-hot-toast";

const CarrinhoContext = createContext();

export function CarrinhoProvider({ children }) {
  const [itens, setItens] = useState(() => {
    const salvo = localStorage.getItem("carrinho");
    return salvo ? JSON.parse(salvo) : [];
  });

  useEffect(() => {
    localStorage.setItem("carrinho", JSON.stringify(itens));
  }, [itens]);

  const adicionar = (produto) => {
    setItens((prev) => {
      const existe = prev.find((i) => i.id === produto.id);
      if (existe) {
        return prev.map((i) =>
          i.id === produto.id ? { ...i, quantidade: i.quantidade + 1 } : i
        );
      }
      return [...prev, { ...produto, quantidade: 1 }];
    });

    // 🍞 Toast de sucesso
    toast.success(`${produto.nome} adicionado ao carrinho!`, {
      icon: "🛒",
    });
  };

  const remover = (id) => {
    const item = itens.find((i) => i.id === id);
    setItens((prev) => prev.filter((i) => i.id !== id));
    if (item) toast(`❌ ${item.nome} removido`, { icon: "🗑️" });
  };

  const alterarQtd = (id, qtd) => {
    if (qtd <= 0) return remover(id);
    setItens((prev) =>
      prev.map((i) => (i.id === id ? { ...i, quantidade: qtd } : i))
    );
  };

  const limpar = () => {
    setItens([]);
    toast.success("Carrinho esvaziado!");
  };

  const total = itens.reduce((acc, i) => acc + i.preco * i.quantidade, 0);
  const qtdTotal = itens.reduce((acc, i) => acc + i.quantidade, 0);

  return (
    <CarrinhoContext.Provider
      value={{ itens, adicionar, remover, alterarQtd, limpar, total, qtdTotal }}
    >
      {children}
    </CarrinhoContext.Provider>
  );
}

export const useCarrinho = () => useContext(CarrinhoContext);