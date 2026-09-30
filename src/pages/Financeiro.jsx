import { useEffect, useMemo, useState } from "react";
import {
  collection, getDocs, addDoc, deleteDoc, doc, orderBy, query,
  serverTimestamp,
} from "firebase/firestore";
import {
  FiPlus, FiTrash2, FiX, FiTrendingUp, FiTrendingDown, FiDollarSign,
  FiFilter,
} from "react-icons/fi";
import toast from "react-hot-toast";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend, BarChart, Bar,
} from "recharts";
import { format, subDays, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { db } from "../firebase/config";

const CATEGORIAS_DESPESA = [
  "Ingredientes",
  "Embalagens",
  "Gás/Energia",
  "Transporte",
  "Marketing",
  "Equipamentos",
  "Impostos",
  "Outros",
];

export default function Financeiro() {
  const [vendas, setVendas] = useState([]);
  const [despesas, setDespesas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalDespesa, setModalDespesa] = useState(false);
  const [filtroMes, setFiltroMes] = useState(
    format(new Date(), "yyyy-MM")
  );

  const carregar = async () => {
    setLoading(true);
    try {
      const [snapVendas, snapDesp] = await Promise.all([
        getDocs(query(collection(db, "vendas"), orderBy("data", "desc"))),
        getDocs(query(collection(db, "despesas"), orderBy("data", "desc"))),
      ]);
      setVendas(snapVendas.docs.map((d) => ({ id: d.id, ...d.data() })));
      setDespesas(snapDesp.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error(e);
      toast.error("Erro ao carregar dados");
    }
    setLoading(false);
  };

  useEffect(() => {
    carregar();
  }, []);

  const excluirDespesa = async (id) => {
    if (!confirm("Excluir esta despesa?")) return;
    await deleteDoc(doc(db, "despesas", id));
    toast.success("Despesa excluída");
    carregar();
  };

  const fmt = (v) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  // ----- Filtros -----
  const noMes = (item) => {
    const d = item.data?.toDate ? item.data.toDate() : new Date(item.data);
    return format(d, "yyyy-MM") === filtroMes;
  };

  const vendasMes = useMemo(
    () => vendas.filter(noMes).filter((v) => v.status !== "cancelado"),
    [vendas, filtroMes]
  );
  const despesasMes = useMemo(() => despesas.filter(noMes), [despesas, filtroMes]);

  // ----- Totais -----
  const totalEntradas = vendasMes.reduce((s, v) => s + (v.total || 0), 0);
  const totalSaidas = despesasMes.reduce((s, d) => s + (d.valor || 0), 0);
  const lucroBruto = vendasMes.reduce((s, v) => s + (v.lucro || 0), 0);
  const saldoLiquido = totalEntradas - totalSaidas;
  const lucroReal = lucroBruto - totalSaidas;

  // ----- Gráfico últimos 30 dias -----
  const dadosGrafico = useMemo(() => {
    const hoje = new Date();
    return Array.from({ length: 30 }).map((_, i) => {
      const dia = subDays(hoje, 29 - i);
      const chaveDia = format(dia, "dd/MM");

      const entradas = vendas
        .filter((v) => {
          const d = v.data?.toDate ? v.data.toDate() : new Date(v.data);
          return (
            format(d, "dd/MM/yyyy") === format(dia, "dd/MM/yyyy") &&
            v.status !== "cancelado"
          );
        })
        .reduce((s, v) => s + (v.total || 0), 0);

      const saidas = despesas
        .filter((d) => {
          const dd = d.data?.toDate ? d.data.toDate() : new Date(d.data);
          return format(dd, "dd/MM/yyyy") === format(dia, "dd/MM/yyyy");
        })
        .reduce((s, d) => s + (d.valor || 0), 0);

      return { dia: chaveDia, entradas, saidas };
    });
  }, [vendas, despesas]);

  // ----- Despesas por categoria -----
  const porCategoria = useMemo(() => {
    const mapa = {};
    despesasMes.forEach((d) => {
      mapa[d.categoria] = (mapa[d.categoria] || 0) + (d.valor || 0);
    });
    return Object.entries(mapa)
      .map(([categoria, valor]) => ({ categoria, valor }))
      .sort((a, b) => b.valor - a.valor);
  }, [despesasMes]);

  // ----- Movimentações unificadas -----
  const movimentacoes = useMemo(() => {
    const lista = [
      ...vendasMes.map((v) => ({
        tipo: "entrada",
        data: v.data,
        descricao: `Venda — ${v.cliente}`,
        categoria: "Venda",
        valor: v.total,
        status: v.status,
        id: v.id,
      })),
      ...despesasMes.map((d) => ({
        tipo: "saida",
        data: d.data,
        descricao: d.descricao,
        categoria: d.categoria,
        valor: d.valor,
        id: d.id,
      })),
    ];
    return lista.sort((a, b) => {
      const da = a.data?.toDate ? a.data.toDate() : new Date(a.data);
      const db_ = b.data?.toDate ? b.data.toDate() : new Date(b.data);
      return db_ - da;
    });
  }, [vendasMes, despesasMes]);

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-titulo text-3xl md:text-4xl text-marrom">
            Financeiro
          </h1>
          <p className="text-gray-500 text-sm">
            Controle de entradas, saídas e lucro real
          </p>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="month"
              value={filtroMes}
              onChange={(e) => setFiltroMes(e.target.value)}
              className="pl-9 pr-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-dourado outline-none w-full"
            />
          </div>
          <button
            onClick={() => setModalDespesa(true)}
            className="bg-marrom text-creme px-4 py-2 rounded-lg hover:bg-dourado hover:text-marrom transition flex items-center gap-2 font-medium whitespace-nowrap"
          >
            <FiPlus /> Nova Despesa
          </button>
        </div>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <CardFin
          titulo="Entradas"
          valor={fmt(totalEntradas)}
          icone={<FiTrendingUp />}
          cor="verde"
        />
        <CardFin
          titulo="Saídas"
          valor={fmt(totalSaidas)}
          icone={<FiTrendingDown />}
          cor="vermelho"
        />
        <CardFin
          titulo="Saldo líquido"
          valor={fmt(saldoLiquido)}
          icone={<FiDollarSign />}
          cor={saldoLiquido >= 0 ? "dourado" : "vermelho"}
        />
        <CardFin
          titulo="Lucro real"
          valor={fmt(lucroReal)}
          icone={<FiDollarSign />}
          cor={lucroReal >= 0 ? "verde" : "vermelho"}
          subtitle={`Lucro bruto: ${fmt(lucroBruto)}`}
        />
      </div>

      {/* Gráficos */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-2xl p-5 shadow">
          <h3 className="font-titulo text-lg text-marrom mb-4">
            Entradas vs Saídas (30 dias)
          </h3>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={dadosGrafico}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="dia" tick={{ fontSize: 10 }} interval={4} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip
                formatter={(v) => fmt(v)}
                contentStyle={{ borderRadius: 12 }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="entradas"
                stroke="#16a34a"
                strokeWidth={2}
                name="Entradas"
              />
              <Line
                type="monotone"
                dataKey="saidas"
                stroke="#dc2626"
                strokeWidth={2}
                name="Saídas"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow">
          <h3 className="font-titulo text-lg text-marrom mb-4">
            Despesas por categoria
          </h3>
          {porCategoria.length === 0 ? (
            <p className="text-center text-gray-400 py-20 text-sm">
              Nenhuma despesa neste mês
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={porCategoria} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis
                  dataKey="categoria"
                  type="category"
                  width={100}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip formatter={(v) => fmt(v)} />
                <Bar dataKey="valor" fill="#C9A227" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Movimentações */}
      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <div className="p-5 border-b">
          <h3 className="font-titulo text-lg text-marrom">
            Movimentações do mês
          </h3>
        </div>

        {loading ? (
          <p className="text-center py-12 text-gray-500">Carregando...</p>
        ) : movimentacoes.length === 0 ? (
          <p className="text-center py-12 text-gray-400">
            Nenhuma movimentação neste mês
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-creme">
                <tr className="text-left text-marrom">
                  <th className="p-3">Data</th>
                  <th className="p-3">Descrição</th>
                  <th className="p-3">Categoria</th>
                  <th className="p-3 text-right">Valor</th>
                  <th className="p-3"></th>
                </tr>
              </thead>
              <tbody>
                {movimentacoes.map((m) => {
                  const d = m.data?.toDate
                    ? m.data.toDate()
                    : new Date(m.data);
                  return (
                    <tr key={`${m.tipo}-${m.id}`} className="border-t">
                      <td className="p-3">{format(d, "dd/MM/yy")}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              m.tipo === "entrada"
                                ? "bg-green-500"
                                : "bg-red-500"
                            }`}
                          />
                          <span>{m.descricao}</span>
                        </div>
                      </td>
                      <td className="p-3 text-gray-500">{m.categoria}</td>
                      <td
                        className={`p-3 text-right font-bold ${
                          m.tipo === "entrada"
                            ? "text-green-600"
                            : "text-red-500"
                        }`}
                      >
                        {m.tipo === "entrada" ? "+ " : "− "}
                        {fmt(m.valor || 0)}
                      </td>
                      <td className="p-3 text-right">
                        {m.tipo === "saida" && (
                          <button
                            onClick={() => excluirDespesa(m.id)}
                            className="text-red-400 hover:text-red-600 p-1"
                          >
                            <FiTrash2 size={14} />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalDespesa && (
        <ModalDespesa
          fechar={() => setModalDespesa(false)}
          onSalvo={carregar}
        />
      )}
    </div>
  );
}

// ================ COMPONENTES AUXILIARES ================

function CardFin({ titulo, valor, icone, cor = "dourado", subtitle }) {
  const cores = {
    dourado: "from-dourado/20 to-dourado/5 text-dourado border-dourado/30",
    verde: "from-green-100 to-green-50 text-green-700 border-green-200",
    vermelho: "from-red-100 to-red-50 text-red-700 border-red-200",
  };
  return (
    <div
      className={`bg-gradient-to-br ${cores[cor]} border-2 rounded-2xl p-4 shadow-sm`}
    >
      <div className="flex justify-between items-start mb-2">
        <span className="text-xs uppercase tracking-wider opacity-80">
          {titulo}
        </span>
        <span className="text-xl">{icone}</span>
      </div>
      <div className="font-titulo text-lg md:text-xl truncate">{valor}</div>
      {subtitle && (
        <div className="text-xs opacity-60 mt-1 truncate">{subtitle}</div>
      )}
    </div>
  );
}

function ModalDespesa({ fechar, onSalvo }) {
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [categoria, setCategoria] = useState("Ingredientes");
  const [data, setData] = useState(format(new Date(), "yyyy-MM-dd"));

  const salvar = async (e) => {
    e.preventDefault();
    if (!descricao || !valor) return toast.error("Preencha tudo");

    const toastId = toast.loading("Salvando despesa...");
    try {
      await addDoc(collection(db, "despesas"), {
        descricao,
        valor: parseFloat(valor),
        categoria,
        data: new Date(data + "T12:00:00"),
        criadoEm: serverTimestamp(),
      });
      toast.success("Despesa registrada!", { id: toastId });
      onSalvo();
      fechar();
    } catch (err) {
      console.error(err);
      toast.error("Erro ao salvar", { id: toastId });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <form
        onSubmit={salvar}
        className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl my-8"
      >
        <div className="flex justify-between items-center mb-5">
          <h3 className="font-titulo text-2xl text-marrom">Nova Despesa</h3>
          <button
            type="button"
            onClick={fechar}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <FiX size={20} />
          </button>
        </div>

        <label className="block mb-3">
          <span className="text-sm text-gray-600 font-medium">Descrição *</span>
          <input
            required
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-dourado outline-none"
            placeholder="Ex: Comprei 5kg de farinha"
          />
        </label>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <label className="block">
            <span className="text-sm text-gray-600 font-medium">Valor (R$) *</span>
            <input
              required
              type="number"
              step="0.01"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-dourado outline-none"
              placeholder="45.90"
            />
          </label>
          <label className="block">
            <span className="text-sm text-gray-600 font-medium">Data</span>
            <input
              type="date"
              value={data}
              onChange={(e) => setData(e.target.value)}
              className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-dourado outline-none"
            />
          </label>
        </div>

        <label className="block mb-5">
          <span className="text-sm text-gray-600 font-medium">Categoria</span>
          <select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-dourado outline-none"
          >
            {CATEGORIAS_DESPESA.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>

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
            Salvar Despesa
          </button>
        </div>
      </form>
    </div>
  );
}