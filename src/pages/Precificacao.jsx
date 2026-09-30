import { useEffect, useState } from "react";
import {
  collection, getDocs, addDoc, deleteDoc, doc, orderBy, query,
} from "firebase/firestore";
import {
  FiPlus, FiTrash2, FiSave, FiPercent, FiClock, FiPackage,
  FiAlertTriangle, FiX,
} from "react-icons/fi";
import toast from "react-hot-toast";
import { db } from "../firebase/config";

export default function Precificacao() {
  const [aba, setAba] = useState("calculadora");
  const [fichas, setFichas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregar();
  }, []);

  const carregar = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(
        query(collection(db, "fichas"), orderBy("criadoEm", "desc"))
      );
      setFichas(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const excluir = async (id) => {
    if (!confirm("Excluir esta ficha técnica?")) return;
    await deleteDoc(doc(db, "fichas", id));
    toast.success("Ficha excluída");
    carregar();
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-titulo text-3xl md:text-4xl text-marrom">
          Precificação
        </h1>
        <p className="text-gray-500 text-sm">
          Calcule o preço justo e nunca mais venda no prejuízo
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 bg-white rounded-full p-1 shadow-sm w-fit">
        <button
          onClick={() => setAba("calculadora")}
          className={`px-5 py-2 rounded-full text-sm font-medium transition ${
            aba === "calculadora"
              ? "bg-marrom text-creme"
              : "text-marrom hover:bg-creme"
          }`}
        >
          🧮 Calculadora
        </button>
        <button
          onClick={() => setAba("fichas")}
          className={`px-5 py-2 rounded-full text-sm font-medium transition ${
            aba === "fichas"
              ? "bg-marrom text-creme"
              : "text-marrom hover:bg-creme"
          }`}
        >
          📋 Fichas Salvas ({fichas.length})
        </button>
      </div>

      {aba === "calculadora" && (
        <Calculadora fichas={fichas} onSalvo={carregar} />
      )}
      {aba === "fichas" && (
        <ListaFichas
          fichas={fichas}
          loading={loading}
          onExcluir={excluir}
        />
      )}
    </div>
  );
}

/* ==================== CALCULADORA ==================== */

function Calculadora({ onSalvo }) {
  const [nome, setNome] = useState("");
  const [rendimento, setRendimento] = useState(1); // quantos bolos a receita rende
  const [ingredientes, setIngredientes] = useState([
    { nome: "", quantidade: "", unidade: "g", precoPago: "", quantidadePaga: "" },
  ]);
  const [horasTrabalho, setHorasTrabalho] = useState(2);
  const [valorHora, setValorHora] = useState(25);
  const [custosFixos, setCustosFixos] = useState(5); // gás, energia, embalagem
  const [margemLucro, setMargemLucro] = useState(100); // % sobre o custo
  const [precoVendaManual, setPrecoVendaManual] = useState("");

  // ---- Cálculos ----
  const custoIngredientes = ingredientes.reduce((soma, ing) => {
    const qtdUsada = parseFloat(ing.quantidade) || 0;
    const precoPago = parseFloat(ing.precoPago) || 0;
    const qtdPaga = parseFloat(ing.quantidadePaga) || 0;
    if (!qtdUsada || !precoPago || !qtdPaga) return soma;
    // Regra de três: quanto custa a quantidade usada
    return soma + (precoPago / qtdPaga) * qtdUsada;
  }, 0);

  const custoMaoDeObra = horasTrabalho * valorHora;
  const custoTotalReceita = custoIngredientes + custoMaoDeObra + custosFixos;
  const custoPorUnidade = custoTotalReceita / (rendimento || 1);

  const lucroDesejado = (custoPorUnidade * margemLucro) / 100;
  const precoSugerido = custoPorUnidade + lucroDesejado;
  const precoFinal = parseFloat(precoVendaManual) || precoSugerido;

  const margemReal = precoFinal > 0 
    ? ((precoFinal - custoPorUnidade) / precoFinal) * 100 
    : 0;
  const lucroReal = precoFinal - custoPorUnidade;

  const adicionarIngrediente = () => {
    setIngredientes((prev) => [
      ...prev,
      { nome: "", quantidade: "", unidade: "g", precoPago: "", quantidadePaga: "" },
    ]);
  };

  const removerIngrediente = (i) => {
    setIngredientes((prev) => prev.filter((_, idx) => idx !== i));
  };

  const atualizarIngrediente = (i, campo, valor) => {
    setIngredientes((prev) =>
      prev.map((ing, idx) => (idx === i ? { ...ing, [campo]: valor } : ing))
    );
  };

  const salvarFicha = async () => {
    if (!nome.trim()) return toast.error("Dê um nome para a ficha");
    if (ingredientes.every((i) => !i.nome)) {
      return toast.error("Adicione pelo menos 1 ingrediente");
    }

    const toastId = toast.loading("Salvando ficha...");
    try {
      await addDoc(collection(db, "fichas"), {
        nome,
        rendimento,
        ingredientes,
        horasTrabalho,
        valorHora,
        custosFixos,
        margemLucro,
        custoIngredientes,
        custoMaoDeObra,
        custoTotalReceita,
        custoPorUnidade,
        precoSugerido,
        precoFinal,
        margemReal,
        lucroReal,
        criadoEm: new Date().toISOString(),
      });
      toast.success("Ficha salva!", { id: toastId });
      onSalvo();
      // Reset
      setNome("");
      setIngredientes([
        { nome: "", quantidade: "", unidade: "g", precoPago: "", quantidadePaga: "" },
      ]);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao salvar", { id: toastId });
    }
  };

  const fmt = (v) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Coluna esquerda - Inputs */}
      <div className="lg:col-span-2 space-y-5">
        {/* Nome da receita */}
        <div className="bg-white rounded-2xl p-5 shadow">
          <label className="block">
            <span className="text-sm font-medium text-gray-700">
              Nome do bolo/receita
            </span>
            <input
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-dourado outline-none"
              placeholder="Ex: Bolo de Milho Verde"
            />
          </label>
          <label className="block mt-3">
            <span className="text-sm font-medium text-gray-700">
              Rendimento (quantos bolos essa receita faz?)
            </span>
            <input
              type="number"
              min="1"
              value={rendimento}
              onChange={(e) => setRendimento(parseFloat(e.target.value) || 1)}
              className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-dourado outline-none"
            />
          </label>
        </div>

        {/* Ingredientes */}
        <div className="bg-white rounded-2xl p-5 shadow">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-titulo text-lg text-marrom flex items-center gap-2">
              <FiPackage /> Ingredientes
            </h3>
            <button
              onClick={adicionarIngrediente}
              className="text-sm text-dourado hover:text-marrom flex items-center gap-1"
            >
              <FiPlus size={14} /> Adicionar
            </button>
          </div>

          <div className="space-y-3">
            {ingredientes.map((ing, i) => (
              <div
                key={i}
                className="grid grid-cols-12 gap-2 items-end bg-creme/50 p-3 rounded-lg"
              >
                <div className="col-span-12 sm:col-span-4">
                  <label className="text-xs text-gray-500">Ingrediente</label>
                  <input
                    value={ing.nome}
                    onChange={(e) =>
                      atualizarIngrediente(i, "nome", e.target.value)
                    }
                    placeholder="Farinha"
                    className="w-full px-2 py-1.5 border rounded text-sm focus:ring-2 focus:ring-dourado outline-none"
                  />
                </div>
                <div className="col-span-5 sm:col-span-2">
                  <label className="text-xs text-gray-500">Qtd usada</label>
                  <input
                    type="number"
                    step="0.01"
                    value={ing.quantidade}
                    onChange={(e) =>
                      atualizarIngrediente(i, "quantidade", e.target.value)
                    }
                    placeholder="200"
                    className="w-full px-2 py-1.5 border rounded text-sm focus:ring-2 focus:ring-dourado outline-none"
                  />
                </div>
                <div className="col-span-3 sm:col-span-1">
                  <label className="text-xs text-gray-500">Un.</label>
                  <select
                    value={ing.unidade}
                    onChange={(e) =>
                      atualizarIngrediente(i, "unidade", e.target.value)
                    }
                    className="w-full px-1 py-1.5 border rounded text-sm focus:ring-2 focus:ring-dourado outline-none"
                  >
                    <option>g</option>
                    <option>kg</option>
                    <option>ml</option>
                    <option>L</option>
                    <option>un</option>
                  </select>
                </div>
                <div className="col-span-4 sm:col-span-2">
                  <label className="text-xs text-gray-500">R$ pago</label>
                  <input
                    type="number"
                    step="0.01"
                    value={ing.precoPago}
                    onChange={(e) =>
                      atualizarIngrediente(i, "precoPago", e.target.value)
                    }
                    placeholder="8.50"
                    className="w-full px-2 py-1.5 border rounded text-sm focus:ring-2 focus:ring-dourado outline-none"
                  />
                </div>
                <div className="col-span-4 sm:col-span-2">
                  <label className="text-xs text-gray-500">Qtd paga (g)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={ing.quantidadePaga}
                    onChange={(e) =>
                      atualizarIngrediente(i, "quantidadePaga", e.target.value)
                    }
                    placeholder="1000"
                    className="w-full px-2 py-1.5 border rounded text-sm focus:ring-2 focus:ring-dourado outline-none"
                  />
                </div>
                <div className="col-span-12 sm:col-span-1 flex justify-end">
                  {ingredientes.length > 1 && (
                    <button
                      onClick={() => removerIngrediente(i)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                    >
                      <FiTrash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t flex justify-between text-sm">
            <span className="text-gray-600">Subtotal ingredientes:</span>
            <span className="font-bold text-dourado">
              {fmt(custoIngredientes)}
            </span>
          </div>
        </div>

        {/* Custos adicionais */}
        <div className="bg-white rounded-2xl p-5 shadow">
          <h3 className="font-titulo text-lg text-marrom mb-4 flex items-center gap-2">
            <FiClock /> Tempo e custos fixos
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-sm text-gray-600 font-medium">
                Horas de trabalho
              </span>
              <input
                type="number"
                step="0.5"
                value={horasTrabalho}
                onChange={(e) =>
                  setHorasTrabalho(parseFloat(e.target.value) || 0)
                }
                className="w-full mt-1 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-dourado outline-none"
              />
            </label>
            <label className="block">
              <span className="text-sm text-gray-600 font-medium">
                Valor da sua hora (R$)
              </span>
              <input
                type="number"
                step="0.5"
                value={valorHora}
                onChange={(e) => setValorHora(parseFloat(e.target.value) || 0)}
                className="w-full mt-1 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-dourado outline-none"
              />
            </label>
            <label className="block col-span-2">
              <span className="text-sm text-gray-600 font-medium">
                Custos fixos (gás, energia, embalagem) - R$
              </span>
              <input
                type="number"
                step="0.5"
                value={custosFixos}
                onChange={(e) => setCustosFixos(parseFloat(e.target.value) || 0)}
                className="w-full mt-1 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-dourado outline-none"
              />
            </label>
          </div>
        </div>

        {/* Margem */}
        <div className="bg-white rounded-2xl p-5 shadow">
          <h3 className="font-titulo text-lg text-marrom mb-4 flex items-center gap-2">
            <FiPercent /> Margem de lucro desejada
          </h3>
          <input
            type="range"
            min="10"
            max="300"
            step="10"
            value={margemLucro}
            onChange={(e) => setMargemLucro(parseFloat(e.target.value))}
            className="w-full accent-dourado"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>10%</span>
            <span className="font-bold text-dourado text-base">
              {margemLucro}%
            </span>
            <span>300%</span>
          </div>

          <label className="block mt-4">
            <span className="text-sm font-medium text-gray-700">
              Preço manual (opcional - sobrescreve o sugerido)
            </span>
            <input
              type="number"
              step="0.01"
              value={precoVendaManual}
              onChange={(e) => setPrecoVendaManual(e.target.value)}
              placeholder="Deixe vazio para usar o sugerido"
              className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-dourado outline-none"
            />
          </label>
        </div>
      </div>

      {/* Coluna direita - Resultado */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-2xl shadow-lg p-5 sticky top-4">
          <h3 className="font-titulo text-xl text-marrom mb-4">
            📊 Resultado
          </h3>

          <div className="space-y-3 text-sm">
            <Linha label="Ingredientes" valor={fmt(custoIngredientes)} />
            <Linha label="Mão de obra" valor={fmt(custoMaoDeObra)} />
            <Linha label="Custos fixos" valor={fmt(custosFixos)} />
            <div className="pt-3 border-t border-dashed">
              <Linha
                label="Custo total receita"
                valor={fmt(custoTotalReceita)}
                destaque
              />
              {rendimento > 1 && (
                <Linha
                  label={`Custo por unidade (${rendimento}x)`}
                  valor={fmt(custoPorUnidade)}
                  destaque
                />
              )}
            </div>
          </div>

          <div className="mt-5 p-4 bg-gradient-to-br from-dourado/20 to-dourado/5 rounded-xl border-2 border-dourado/40">
            <div className="text-xs uppercase text-dourado mb-1">
              Preço sugerido
            </div>
            <div className="font-titulo text-3xl text-marrom">
              {fmt(precoSugerido)}
            </div>

            {precoVendaManual && parseFloat(precoVendaManual) > 0 && (
              <>
                <div className="text-xs text-gray-500 mt-3">
                  Preço final escolhido
                </div>
                <div className="font-titulo text-2xl text-marrom">
                  {fmt(precoFinal)}
                </div>
              </>
            )}
          </div>

          <div className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Lucro por unidade</span>
              <span className="font-bold text-green-600">{fmt(lucroReal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Margem real</span>
              <span
                className={`font-bold ${
                  margemReal < 30
                    ? "text-red-500"
                    : margemReal < 60
                    ? "text-yellow-600"
                    : "text-green-600"
                }`}
              >
                {margemReal.toFixed(1)}%
              </span>
            </div>
          </div>

          {margemReal < 30 && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex gap-2">
              <FiAlertTriangle className="text-red-500 shrink-0 mt-0.5" />
              <span className="text-xs text-red-700">
                Margem baixa! Considere aumentar o preço.
              </span>
            </div>
          )}

          <button
            onClick={salvarFicha}
            className="w-full mt-5 bg-marrom text-creme py-3 rounded-full font-medium hover:bg-dourado hover:text-marrom transition flex items-center justify-center gap-2"
          >
            <FiSave /> Salvar Ficha Técnica
          </button>
        </div>
      </div>
    </div>
  );
}

function Linha({ label, valor, destaque }) {
  return (
    <div className={`flex justify-between ${destaque ? "font-bold text-marrom" : "text-gray-600"}`}>
      <span>{label}</span>
      <span>{valor}</span>
    </div>
  );
}

/* ==================== LISTA DE FICHAS ==================== */

function ListaFichas({ fichas, loading, onExcluir }) {
  const [detalhe, setDetalhe] = useState(null);
  const fmt = (v) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  if (loading)
    return <div className="text-center py-12 text-gray-500">Carregando...</div>;

  if (fichas.length === 0)
    return (
      <div className="bg-white rounded-2xl p-12 text-center shadow">
        <p className="text-gray-500">
          Nenhuma ficha salva. Use a calculadora para começar!
        </p>
      </div>
    );

  return (
    <>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {fichas.map((f) => (
          <div
            key={f.id}
            className="bg-white rounded-2xl shadow-md p-5 border-2 border-dourado/20 hover:shadow-lg transition"
          >
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-titulo text-lg text-marrom">{f.nome}</h3>
              <button
                onClick={() => onExcluir(f.id)}
                className="text-red-400 hover:text-red-600 p-1"
              >
                <FiTrash2 size={16} />
              </button>
            </div>

            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between">
                <span className="text-gray-500">Custo/un:</span>
                <span className="font-medium">{fmt(f.custoPorUnidade || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Preço:</span>
                <span className="font-bold text-dourado">
                  {fmt(f.precoFinal || 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Lucro:</span>
                <span className="font-bold text-green-600">
                  {fmt(f.lucroReal || 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Margem:</span>
                <span
                  className={`font-bold ${
                    (f.margemReal || 0) < 30
                      ? "text-red-500"
                      : "text-green-600"
                  }`}
                >
                  {(f.margemReal || 0).toFixed(1)}%
                </span>
              </div>
            </div>

            <button
              onClick={() => setDetalhe(f)}
              className="w-full text-sm py-2 rounded-lg bg-creme text-marrom hover:bg-dourado/20 transition"
            >
              Ver detalhes
            </button>
          </div>
        ))}
      </div>

      {/* Modal detalhes */}
      {detalhe && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl my-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-titulo text-2xl text-marrom">
                {detalhe.nome}
              </h3>
              <button
                onClick={() => setDetalhe(null)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <FiX size={20} />
              </button>
            </div>

            <h4 className="text-sm font-medium text-gray-600 mb-2">
              Ingredientes
            </h4>
            <ul className="text-sm space-y-1 mb-4">
              {(detalhe.ingredientes || []).map((i, idx) => (
                <li key={idx} className="flex justify-between">
                  <span>
                    {i.nome} — {i.quantidade}
                    {i.unidade}
                  </span>
                  <span className="text-gray-500">
                    R$ {i.precoPago}/{i.quantidadePaga}
                    {i.unidade}
                  </span>
                </li>
              ))}
            </ul>

            <div className="space-y-2 text-sm bg-creme p-4 rounded-xl">
              <Linha label="Custo ingredientes" valor={fmt(detalhe.custoIngredientes || 0)} />
              <Linha label="Mão de obra" valor={fmt(detalhe.custoMaoDeObra || 0)} />
              <Linha label="Custos fixos" valor={fmt(detalhe.custosFixos || 0)} />
              <Linha
                label="Custo total receita"
                valor={fmt(detalhe.custoTotalReceita || 0)}
                destaque
              />
              <Linha
                label={`Custo/un (${detalhe.rendimento}x)`}
                valor={fmt(detalhe.custoPorUnidade || 0)}
                destaque
              />
              <div className="pt-2 border-t border-dourado/30">
                <Linha
                  label="Preço final"
                  valor={fmt(detalhe.precoFinal || 0)}
                  destaque
                />
                <Linha
                  label="Lucro/un"
                  valor={fmt(detalhe.lucroReal || 0)}
                  destaque
                />
                <Linha
                  label="Margem"
                  valor={`${(detalhe.margemReal || 0).toFixed(1)}%`}
                  destaque
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}