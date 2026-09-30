import { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { FiX, FiPlus, FiMinus, FiTrash2 } from "react-icons/fi";
import toast from "react-hot-toast";
import { db } from "../../firebase/config";

export default function ModalVenda({ produtos, fechar, onSalvo }) {
  const [cliente, setCliente] = useState("");
  const [telefone, setTelefone] = useState("");
  const [itens, setItens] = useState([]);
  const [produtoSel, setProdutoSel] = useState("");

  const adicionarItem = () => {
    const prod = produtos.find((p) => p.id === produtoSel);
    if (!prod) return;
    const existe = itens.find((i) => i.id === prod.id);
    if (existe) {
      setItens((prev) =>
        prev.map((i) =>
          i.id === prod.id ? { ...i, quantidade: i.quantidade + 1 } : i
        )
      );
    } else {
      setItens((prev) => [
        ...prev,
        {
          id: prod.id,
          nome: prod.nome,
          preco: prod.preco,
          custo: prod.custo || 0,
          quantidade: 1,
        },
      ]);
    }
    setProdutoSel("");
  };

  const alterarQtd = (id, qtd) => {
    if (qtd <= 0) return setItens((p) => p.filter((i) => i.id !== id));
    setItens((p) =>
      p.map((i) => (i.id === id ? { ...i, quantidade: qtd } : i))
    );
  };

  const removerItem = (id) => setItens((p) => p.filter((i) => i.id !== id));

  const total = itens.reduce((s, i) => s + i.preco * i.quantidade, 0);
  const custoTotal = itens.reduce(
    (s, i) => s + (i.custo || 0) * i.quantidade,
    0
  );
  const lucro = total - custoTotal;

  const salvar = async (e) => {
    e.preventDefault();
    if (itens.length === 0) return toast.error("Adicione itens");
    if (!cliente.trim()) return toast.error("Informe o cliente");

    const toastId = toast.loading("Salvando venda...");
    try {
      await addDoc(collection(db, "vendas"), {
        cliente,
        telefone,
        itens,
        total,
        custoTotal,
        lucro,
        data: serverTimestamp(),
      });
      toast.success("Venda registrada!", { id: toastId });
      onSalvo();
      fechar();
    } catch (err) {
      console.error(err);
      toast.error("Erro ao salvar", { id: toastId });
    }
  };

  const fmt = (v) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <form
        onSubmit={salvar}
        className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl my-8"
      >
        <div className="flex justify-between items-center mb-5">
          <h3 className="font-titulo text-2xl text-marrom">Nova Venda</h3>
          <button
            type="button"
            onClick={fechar}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <FiX size={20} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <label className="col-span-2 sm:col-span-1">
            <span className="text-sm text-gray-600 font-medium">Cliente *</span>
            <input
              value={cliente}
              onChange={(e) => setCliente(e.target.value)}
              className="w-full mt-1 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-dourado outline-none"
              placeholder="Maria Silva"
            />
          </label>
          <label className="col-span-2 sm:col-span-1">
            <span className="text-sm text-gray-600 font-medium">Telefone</span>
            <input
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              className="w-full mt-1 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-dourado outline-none"
              placeholder="(27) 99999-9999"
            />
          </label>
        </div>

        <div className="mb-4">
          <span className="text-sm text-gray-600 font-medium block mb-2">
            Adicionar produto
          </span>
          <div className="flex gap-2">
            <select
              value={produtoSel}
              onChange={(e) => setProdutoSel(e.target.value)}
              className="flex-1 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-dourado outline-none"
            >
              <option value="">Selecione um produto...</option>
              {produtos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nome} — {fmt(p.preco)}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={adicionarItem}
              disabled={!produtoSel}
              className="px-4 py-2 bg-marrom text-creme rounded-lg hover:bg-dourado hover:text-marrom transition disabled:opacity-40"
            >
              <FiPlus />
            </button>
          </div>
        </div>

        {/* Itens */}
        <div className="mb-4 max-h-64 overflow-y-auto space-y-2">
          {itens.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-6">
              Nenhum item adicionado
            </p>
          ) : (
            itens.map((i) => (
              <div
                key={i.id}
                className="flex items-center gap-2 bg-creme p-2 rounded-lg"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-marrom truncate">
                    {i.nome}
                  </div>
                  <div className="text-xs text-gray-500">{fmt(i.preco)}</div>
                </div>
                <button
                  type="button"
                  onClick={() => alterarQtd(i.id, i.quantidade - 1)}
                  className="bg-white p-1 rounded-full border"
                >
                  <FiMinus size={12} />
                </button>
                <span className="text-sm w-6 text-center font-medium">
                  {i.quantidade}
                </span>
                <button
                  type="button"
                  onClick={() => alterarQtd(i.id, i.quantidade + 1)}
                  className="bg-white p-1 rounded-full border"
                >
                  <FiPlus size={12} />
                </button>
                <button
                  type="button"
                  onClick={() => removerItem(i.id)}
                  className="text-red-500 p-1 ml-1"
                >
                  <FiTrash2 size={14} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Resumo */}
        <div className="bg-creme rounded-xl p-4 mb-4 border border-dourado/30 space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Total:</span>
            <span className="font-bold text-dourado">{fmt(total)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Custo:</span>
            <span className="text-red-500">-{fmt(custoTotal)}</span>
          </div>
          <div className="flex justify-between text-base pt-2 border-t border-dourado/30">
            <span className="font-medium text-marrom">Lucro:</span>
            <span className="font-bold text-green-600">{fmt(lucro)}</span>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={fechar}
            className="flex-1 py-3 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100 transition"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="flex-1 py-3 rounded-full bg-marrom text-creme hover:bg-dourado hover:text-marrom transition font-medium"
          >
            Registrar Venda
          </button>
        </div>
      </form>
    </div>
  );
}