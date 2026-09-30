import { useEffect, useState } from "react";
import {
  collection, getDocs, query, orderBy, where,
} from "firebase/firestore";
import { db } from "../firebase/config";
import {
  FiDollarSign, FiTrendingUp, FiShoppingBag, FiUsers,
} from "react-icons/fi";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import { format, subDays, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import CardResumo from "../components/admin/CardResumo";

export default function Dashboard() {
  const [vendas, setVendas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregar() {
      try {
        const snap = await getDocs(
          query(collection(db, "vendas"), orderBy("data", "desc"))
        );
        setVendas(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    }
    carregar();
  }, []);

  const hoje = new Date();
  const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);

  const vendasMes = vendas.filter((v) => {
    const d = v.data?.toDate ? v.data.toDate() : new Date(v.data);
    return d >= inicioMes;
  });

  const faturamentoMes = vendasMes.reduce((s, v) => s + (v.total || 0), 0);
  const lucroMes = vendasMes.reduce((s, v) => s + (v.lucro || 0), 0);
  const ticketMedio = vendasMes.length ? faturamentoMes / vendasMes.length : 0;
  const clientesUnicos = new Set(vendasMes.map((v) => v.telefone)).size;

  // Gráfico últimos 14 dias
  const dadosGrafico = Array.from({ length: 14 }).map((_, i) => {
    const dia = subDays(hoje, 13 - i);
    const diaStr = format(dia, "dd/MM");
    const total = vendas
      .filter((v) => {
        const d = v.data?.toDate ? v.data.toDate() : new Date(v.data);
        return format(d, "dd/MM/yyyy") === format(dia, "dd/MM/yyyy");
      })
      .reduce((s, v) => s + (v.total || 0), 0);
    return { dia: diaStr, total };
  });

  // Produtos mais vendidos
  const contProdutos = {};
  vendasMes.forEach((v) => {
    (v.itens || []).forEach((i) => {
      contProdutos[i.nome] = (contProdutos[i.nome] || 0) + i.quantidade;
    });
  });
  const topProdutos = Object.entries(contProdutos)
    .map(([nome, qtd]) => ({ nome, qtd }))
    .sort((a, b) => b.qtd - a.qtd)
    .slice(0, 5);

  const fmt = (v) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  if (loading)
    return <div className="text-center py-12 text-gray-500">Carregando...</div>;

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-titulo text-3xl md:text-4xl text-marrom">
          Dashboard
        </h1>
        <p className="text-gray-500">
          Resumo do mês de {format(hoje, "MMMM 'de' yyyy", { locale: ptBR })}
        </p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <CardResumo
          titulo="Faturamento"
          valor={fmt(faturamentoMes)}
          icone={<FiDollarSign />}
          cor="dourado"
        />
        <CardResumo
          titulo="Lucro"
          valor={fmt(lucroMes)}
          icone={<FiTrendingUp />}
          cor="verde"
        />
        <CardResumo
          titulo="Vendas"
          valor={vendasMes.length}
          icone={<FiShoppingBag />}
          cor="marrom"
        />
        <CardResumo
          titulo="Ticket Médio"
          valor={fmt(ticketMedio)}
          icone={<FiUsers />}
          cor="rosa"
        />
      </div>

      {/* Gráficos */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-5 shadow">
          <h3 className="font-titulo text-lg text-marrom mb-4">
            Faturamento (14 dias)
          </h3>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={dadosGrafico}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="dia" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip
                formatter={(v) => fmt(v)}
                contentStyle={{ borderRadius: 12, border: "1px solid #C9A227" }}
              />
              <Line
                type="monotone"
                dataKey="total"
                stroke="#C9A227"
                strokeWidth={3}
                dot={{ fill: "#3D2817", r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow">
          <h3 className="font-titulo text-lg text-marrom mb-4">
            Top 5 Produtos
          </h3>
          {topProdutos.length === 0 ? (
            <p className="text-gray-400 text-center py-16">
              Sem vendas no mês ainda
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={topProdutos} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis
                  dataKey="nome"
                  type="category"
                  width={130}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip contentStyle={{ borderRadius: 12 }} />
                <Bar dataKey="qtd" fill="#3D2817" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Últimas vendas */}
      <div className="bg-white rounded-2xl p-5 shadow">
        <h3 className="font-titulo text-lg text-marrom mb-4">
          Últimas vendas
        </h3>
        {vendas.length === 0 ? (
          <p className="text-gray-400 text-center py-8">
            Nenhuma venda registrada ainda
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="py-2">Data</th>
                  <th className="py-2">Cliente</th>
                  <th className="py-2">Itens</th>
                  <th className="py-2 text-right">Total</th>
                  <th className="py-2 text-right">Lucro</th>
                </tr>
              </thead>
              <tbody>
                {vendas.slice(0, 8).map((v) => {
                  const d = v.data?.toDate ? v.data.toDate() : new Date(v.data);
                  return (
                    <tr key={v.id} className="border-b last:border-0">
                      <td className="py-2">{format(d, "dd/MM/yy")}</td>
                      <td className="py-2">{v.cliente || "—"}</td>
                      <td className="py-2 text-gray-500">
                        {(v.itens || []).length} item(ns)
                      </td>
                      <td className="py-2 text-right font-medium text-dourado">
                        {fmt(v.total || 0)}
                      </td>
                      <td className="py-2 text-right font-medium text-green-600">
                        {fmt(v.lucro || 0)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}