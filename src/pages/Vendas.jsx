import { useEffect, useState } from "react";
import {
  collection, getDocs, addDoc, deleteDoc, doc, orderBy, query,
  serverTimestamp, updateDoc,
} from "firebase/firestore";
import { FiPlus, FiTrash2, FiFilter, FiCheck } from "react-icons/fi";
import toast from "react-hot-toast";
import { db } from "../firebase/config";
import ModalVenda from "../components/admin/ModalVenda";
import { format } from "date-fns";

// 🔸 Fora do componente (não recria a cada render)
const STATUS_CORES = {
  pendente: "bg-yellow-100 text-yellow-800 border-yellow-300",
  confirmado: "bg-blue-100 text-blue-800 border-blue-300",
  entregue: "bg-green-100 text-green-800 border-green-300",
  cancelado: "bg-red-100 text-red-800 border-red-300",
};

const STATUS_LABEL = {
  pendente: "⏳ Pendente",
  confirmado: "✅ Confirmado",
  entregue: "📦 Entregue",
  cancelado: "❌ Cancelado",
};

// 🔸 Componente fora do componente principal
function BadgeStatus({ status }) {
  const s = status || "pendente";
  return (
    <span
      className={`text-xs px-2 py-1 rounded-full border font-medium whitespace-nowrap ${
        STATUS_CORES[s] || STATUS_CORES.pendente
      }`}
    >
      {STATUS_LABEL[s]}
    </span>
  );
}

export default function Vendas() {
  const [vendas, setVendas] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [filtroMes, setFiltroMes] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("");

  const carregar = async () => {
    setLoading(true);
    try {
      const [snapVendas, snapProd] = await Promise.all([
        getDocs(query(collection(db, "vendas"), orderBy("data", "desc"))),
        getDocs(collection(db, "produtos")),
      ]);
      setVendas(snapVendas.docs.map((d) => ({ id: d.id, ...d.data() })));
      setProdutos(snapProd.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error(e);
      toast.error("Erro ao carregar");
    }
    setLoading(false);
  };

  useEffect(() => {
    carregar();
  }, []);

  const excluir = async (id) => {
    if (!confirm("Excluir esta venda?")) return;
    await deleteDoc(doc(db, "vendas", id));
    toast.success("Venda excluída");
    carregar();
  };

  // 🆕 Alterar status
  const alterarStatus = async (id, novoStatus) => {
    try {
      await updateDoc(doc(db, "vendas", id), { status: novoStatus });
      setVendas((prev) =>
        prev.map((v) => (v.id === id ? { ...v, status: novoStatus } : v))
      );
      toast.success(`Status: ${novoStatus}`, { icon: "🔄" });
    } catch (err) {
      console.error(err);
      toast.error("Erro ao atualizar status");
    }
  };

  // 🆕 Filtros combinados (mês + status)
  const vendasFiltradas = vendas.filter((v) => {
    if (filtroMes) {
      const d = v.data?.toDate ? v.data.toDate() : new Date(v.data);
      if (format(d, "yyyy-MM") !== filtroMes) return false;
    }
    if (filtroStatus && (v.status || "pendente") !== filtroStatus) return false;
    return true;
  });

  // 🆕 Ignorar canceladas nos totais
  const vendasValidas = vendasFiltradas.filter((v) => v.status !== "cancelado");
  const totalFiltro = vendasValidas.reduce((s, v) => s + (v.total || 0), 0);
  const lucroFiltro = vendasValidas.reduce((s, v) => s + (v.lucro || 0), 0);
  const custoFiltro = vendasValidas.reduce((s, v) => s + (v.custoTotal || 0), 0);

  // 🆕 Contadores por status
  const contPorStatus = {
    pendente: vendasFiltradas.filter((v) => (v.status || "pendente") === "pendente").length,
    confirmado: vendasFiltradas.filter((v) => v.status === "confirmado").length,
    entregue: vendasFiltradas.filter((v) => v.status === "entregue").length,
    cancelado: vendasFiltradas.filter((v) => v.status === "cancelado").length,
  };

  const fmt = (v) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <div>
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="font-titulo text-3xl md:text-4xl text-marrom">
            Vendas
          </h1>
          <p className="text-gray-500 text-sm">
            {vendasFiltradas.length} vendas — {fmt(totalFiltro)} em faturamento
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          {/* Filtro mês */}
          <div className="relative flex-1 sm:flex-none">
            <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="month"
              value={filtroMes}
              onChange={(e) => setFiltroMes(e.target.value)}
              className="pl-9 pr-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-dourado outline-none w-full"
            />
          </div>

          {/* 🆕 Filtro status */}
          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            className="px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-dourado outline-none bg-white"
          >
            <option value="">Todos os status</option>
            <option value="pendente">⏳ Pendentes ({contPorStatus.pendente})</option>
            <option value="confirmado">✅ Confirmados ({contPorStatus.confirmado})</option>
            <option value="entregue">📦 Entregues ({contPorStatus.entregue})</option>
            <option value="cancelado">❌ Cancelados ({contPorStatus.cancelado})</option>
          </select>

          <button
            onClick={() => setModalAberto(true)}
            className="bg-marrom text-creme px-4 py-2 rounded-lg hover:bg-dourado hover:text-marrom transition flex items-center gap-2 font-medium whitespace-nowrap justify-center"
          >
            <FiPlus /> Nova Venda
          </button>
        </div>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-gradient-to-br from-dourado/20 to-dourado/5 border-2 border-dourado/30 rounded-2xl p-4">
          <div className="text-xs uppercase text-dourado mb-1">Faturamento</div>
          <div className="font-titulo text-lg md:text-xl text-marrom truncate">
            {fmt(totalFiltro)}
          </div>
        </div>
        <div className="bg-gradient-to-br from-red-100 to-red-50 border-2 border-red-200 rounded-2xl p-4">
          <div className="text-xs uppercase text-red-700 mb-1">Custo</div>
          <div className="font-titulo text-lg md:text-xl text-marrom truncate">
            {fmt(custoFiltro)}
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-100 to-green-50 border-2 border-green-200 rounded-2xl p-4">
          <div className="text-xs uppercase text-green-700 mb-1">Lucro</div>
          <div className="font-titulo text-lg md:text-xl text-marrom truncate">
            {fmt(lucroFiltro)}
          </div>
        </div>
      </div>

      {/* Lista */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Carregando...</div>
      ) : vendasFiltradas.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow">
          <p className="text-gray-500">Nenhuma venda neste período</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[800px]">
              <thead className="bg-creme">
                <tr className="text-left text-marrom">
                  <th className="p-3">Data</th>
                  <th className="p-3">Cliente</th>
                  <th className="p-3">Itens</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Total</th>
                  <th className="p-3 text-right">Custo</th>
                  <th className="p-3 text-right">Lucro</th>
                  <th className="p-3"></th>
                </tr>
              </thead>
              <tbody>
                {vendasFiltradas.map((v) => {
                  const d = v.data?.toDate ? v.data.toDate() : new Date(v.data);
                  const status = v.status || "pendente";
                  const cancelada = status === "cancelado";

                  return (
                    <tr
                      key={v.id}
                      className={`border-t hover:bg-creme/50 ${
                        cancelada ? "opacity-50 line-through" : ""
                      }`}
                    >
                      <td className="p-3 whitespace-nowrap">
                        {format(d, "dd/MM/yyyy")}
                      </td>
                      <td className="p-3">
                        <div className="font-medium">{v.cliente || "—"}</div>
                        <div className="text-xs text-gray-500">
                          {v.telefone || ""}
                        </div>
                      </td>
                      <td className="p-3 text-gray-600">
                        {(v.itens || []).map((i, idx) => (
                          <div key={idx} className="text-xs whitespace-nowrap">
                            {i.quantidade}x {i.nome}
                          </div>
                        ))}
                      </td>
                      {/* 🆕 Status com select inline */}
                      <td className="p-3">
                        <select
                          value={status}
                          onChange={(e) => alterarStatus(v.id, e.target.value)}
                          className={`text-xs px-2 py-1 rounded-full border font-medium cursor-pointer outline-none ${
                            STATUS_CORES[status]
                          }`}
                        >
                          <option value="pendente">⏳ Pendente</option>
                          <option value="confirmado">✅ Confirmado</option>
                          <option value="entregue">📦 Entregue</option>
                          <option value="cancelado">❌ Cancelado</option>
                        </select>
                      </td>
                      <td className="p-3 text-right font-bold text-dourado whitespace-nowrap">
                        {fmt(v.total || 0)}
                      </td>
                      <td className="p-3 text-right text-red-500 whitespace-nowrap">
                        {fmt(v.custoTotal || 0)}
                      </td>
                      <td className="p-3 text-right font-bold text-green-600 whitespace-nowrap">
                        {fmt(v.lucro || 0)}
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => excluir(v.id)}
                          className="text-red-400 hover:text-red-600 p-1"
                          title="Excluir venda"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {modalAberto && (
        <ModalVenda
          produtos={produtos}
          fechar={() => setModalAberto(false)}
          onSalvo={carregar}
        />
      )}
    </div>
  );
}