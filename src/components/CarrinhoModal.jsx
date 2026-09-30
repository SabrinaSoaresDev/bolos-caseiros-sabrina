import { useState } from "react";
import {
  FiX, FiTrash2, FiMinus, FiPlus, FiUser, FiPhone,
  FiMapPin, FiShoppingBag, FiTruck, FiArrowLeft, FiCheck,
} from "react-icons/fi";
import toast from "react-hot-toast";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/config";
import { useCarrinho } from "../context/CarrinhoContext";

export default function CarrinhoModal({ aberto, fechar }) {
  const { itens, remover, alterarQtd, total, limpar } = useCarrinho();
  const numero = import.meta.env.VITE_WHATSAPP_NUMERO || "5527998036871";

  const [etapa, setEtapa] = useState("carrinho");
  const [tipoEntrega, setTipoEntrega] = useState("retirada");
  const [enviando, setEnviando] = useState(false);
  const [cliente, setCliente] = useState({
    nome: "",
    telefone: "",
    rua: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    referencia: "",
    observacoes: "",
  });
  const [erros, setErros] = useState({});

  const resetarFluxo = () => {
    setEtapa("carrinho");
    setTipoEntrega("retirada");
    setCliente({
      nome: "", telefone: "", rua: "", numero: "",
      complemento: "", bairro: "", cidade: "", referencia: "", observacoes: "",
    });
    setErros({});
  };

  const fecharModal = () => {
    fechar();
    setTimeout(resetarFluxo, 300);
  };

  // ---------- Máscara de telefone ----------
  const formatarTelefone = (v) => {
    const nums = v.replace(/\D/g, "").slice(0, 11);
    if (nums.length <= 2) return nums;
    if (nums.length <= 6) return `(${nums.slice(0, 2)}) ${nums.slice(2)}`;
    if (nums.length <= 10)
      return `(${nums.slice(0, 2)}) ${nums.slice(2, 6)}-${nums.slice(6)}`;
    return `(${nums.slice(0, 2)}) ${nums.slice(2, 7)}-${nums.slice(7)}`;
  };

  const setCampo = (campo, valor) => {
    setCliente((c) => ({ ...c, [campo]: valor }));
    if (erros[campo]) setErros((e) => ({ ...e, [campo]: null }));
  };

  // ---------- Validação ----------
  const validarCheckout = () => {
    const e = {};
    if (!cliente.nome.trim()) e.nome = "Informe seu nome";
    if (cliente.telefone.replace(/\D/g, "").length < 10)
      e.telefone = "Informe um telefone válido";

    if (tipoEntrega === "entrega") {
      if (!cliente.rua.trim()) e.rua = "Informe a rua";
      if (!cliente.numero.trim()) e.numero = "Informe o número";
      if (!cliente.bairro.trim()) e.bairro = "Informe o bairro";
      if (!cliente.cidade.trim()) e.cidade = "Informe a cidade";
    }

    setErros(e);
    return Object.keys(e).length === 0;
  };

  // ---------- Salvar venda + Enviar WhatsApp ----------
  const enviarWhatsApp = async () => {
    if (!validarCheckout()) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }

    if (enviando) return;
    setEnviando(true);
    const toastId = toast.loading("Registrando pedido...");

    // 🔹 1. Salvar venda no Firestore
    try {
      const custoTotal = itens.reduce(
        (s, i) => s + (i.custo || 0) * i.quantidade,
        0
      );
      const lucro = total - custoTotal;

      await addDoc(collection(db, "vendas"), {
        cliente: cliente.nome,
        telefone: cliente.telefone,
        tipoEntrega,
        endereco:
          tipoEntrega === "entrega"
            ? {
                rua: cliente.rua,
                numero: cliente.numero,
                complemento: cliente.complemento,
                bairro: cliente.bairro,
                cidade: cliente.cidade,
                referencia: cliente.referencia,
              }
            : null,
        observacoes: cliente.observacoes,
        itens,
        total,
        custoTotal,
        lucro,
        status: "pendente",
        origem: "site",
        data: serverTimestamp(),
      });
    } catch (err) {
      console.error("Erro ao salvar venda:", err);
      toast.error("Erro ao registrar pedido. Tente novamente.", { id: toastId });
      setEnviando(false);
      return;
    }

    // 🔹 2. Montar mensagem do WhatsApp
    let msg = "🍰 *NOVO PEDIDO - Bolos Caseiros Sabrina*\n";
    msg += "━━━━━━━━━━━━━━━━━━━━\n\n";

    msg += "👤 *DADOS DO CLIENTE*\n";
    msg += `*Nome:* ${cliente.nome}\n`;
    msg += `*Telefone:* ${cliente.telefone}\n\n`;

    msg += "📦 *TIPO DE ENTREGA*\n";
    msg += tipoEntrega === "entrega" ? "🚚 *Entrega*\n" : "🏠 *Retirada no local*\n";

    if (tipoEntrega === "entrega") {
      msg += "\n📍 *ENDEREÇO DE ENTREGA*\n";
      msg += `${cliente.rua}, ${cliente.numero}`;
      if (cliente.complemento) msg += ` - ${cliente.complemento}`;
      msg += `\n*Bairro:* ${cliente.bairro}\n`;
      msg += `*Cidade:* ${cliente.cidade}\n`;
      if (cliente.referencia) msg += `*Referência:* ${cliente.referencia}\n`;
    }
    msg += "\n";

    msg += "🛒 *ITENS DO PEDIDO*\n";
    itens.forEach((i) => {
      msg += `▪️ *${i.nome}*\n`;
      msg += `   ${i.quantidade}x R$ ${i.preco
        .toFixed(2)
        .replace(".", ",")} = R$ ${(i.preco * i.quantidade)
        .toFixed(2)
        .replace(".", ",")}\n`;
    });

    msg += "\n━━━━━━━━━━━━━━━━━━━━\n";
    msg += `💰 *TOTAL: R$ ${total.toFixed(2).replace(".", ",")}*\n`;

    if (cliente.observacoes) {
      msg += `\n📝 *Observações:*\n${cliente.observacoes}\n`;
    }

    msg += "\n✅ Aguardo a confirmação do pedido! 😊";

    // 🔹 3. Abrir WhatsApp
    window.open(
      `https://wa.me/${numero}?text=${encodeURIComponent(msg)}`,
      "_blank"
    );

    toast.success("Pedido enviado!", { id: toastId, icon: "💬" });
    setEnviando(false);
    limpar();
    fecharModal();
  };

  return (
    <>
      {/* Backdrop */}
      {aberto && (
        <div
          onClick={fecharModal}
          className="fixed inset-0 bg-black/60 z-[60] animate-fade-in"
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-[440px] bg-white shadow-2xl z-[70] transform transition-transform duration-300 flex flex-col ${
          aberto ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b bg-verdeEscuro text-creme">
          <div className="flex items-center gap-2">
            {etapa === "checkout" && (
              <button
                onClick={() => setEtapa("carrinho")}
                className="p-1 hover:bg-white/10 rounded-full"
              >
                <FiArrowLeft size={20} />
              </button>
            )}
            <h2 className="font-titulo text-xl text-dourado">
              {etapa === "carrinho" ? "Meu Carrinho" : "Finalizar Pedido"}
            </h2>
          </div>
          <button
            onClick={fecharModal}
            className="p-2 hover:bg-white/10 rounded-full"
          >
            <FiX size={22} />
          </button>
        </div>

        {/* ETAPA 1 — CARRINHO */}
        {etapa === "carrinho" && (
          <>
            <div className="flex-1 p-5 overflow-y-auto">
              {itens.length === 0 ? (
                <div className="text-center text-gray-500 mt-20">
                  <FiShoppingBag size={48} className="mx-auto mb-3 text-gray-300" />
                  <p>Seu carrinho está vazio 🛒</p>
                </div>
              ) : (
                <ul className="space-y-4">
                  {itens.map((i) => (
                    <li key={i.id} className="flex gap-3 bg-creme p-3 rounded-xl">
                      <img
                        src={i.imagem}
                        alt={i.nome}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm text-marrom truncate">
                          {i.nome}
                        </h4>
                        <p className="text-dourado font-bold text-sm">
                          R$ {(i.preco * i.quantidade).toFixed(2).replace(".", ",")}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => alterarQtd(i.id, i.quantidade - 1)}
                            className="bg-white p-1 rounded-full border hover:bg-gray-50"
                          >
                            <FiMinus size={14} />
                          </button>
                          <span className="text-sm w-6 text-center font-medium">
                            {i.quantidade}
                          </span>
                          <button
                            onClick={() => alterarQtd(i.id, i.quantidade + 1)}
                            className="bg-white p-1 rounded-full border hover:bg-gray-50"
                          >
                            <FiPlus size={14} />
                          </button>
                          <button
                            onClick={() => remover(i.id)}
                            className="ml-auto text-red-500 p-1 hover:bg-red-50 rounded-full"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {itens.length > 0 && (
              <div className="p-5 bg-white border-t">
                <div className="flex justify-between mb-4 text-lg">
                  <span className="font-medium text-marrom">Total:</span>
                  <span className="font-bold text-dourado">
                    R$ {total.toFixed(2).replace(".", ",")}
                  </span>
                </div>
                <button
                  onClick={() => setEtapa("checkout")}
                  className="w-full bg-marrom hover:bg-dourado hover:text-marrom text-creme py-3 rounded-full font-bold transition shadow-md flex items-center justify-center gap-2"
                >
                  Continuar <FiArrowLeft className="rotate-180" />
                </button>
              </div>
            )}
          </>
        )}

        {/* ETAPA 2 — CHECKOUT */}
        {etapa === "checkout" && (
          <>
            <div className="flex-1 p-5 overflow-y-auto space-y-5">
              {/* DADOS DO CLIENTE */}
              <div>
                <h3 className="font-titulo text-lg text-marrom mb-3 flex items-center gap-2">
                  <FiUser /> Seus dados
                </h3>
                <Campo
                  label="Nome completo *"
                  value={cliente.nome}
                  onChange={(v) => setCampo("nome", v)}
                  erro={erros.nome}
                  placeholder="Ex: Maria Silva"
                />
                <Campo
                  label="Telefone / WhatsApp *"
                  value={cliente.telefone}
                  onChange={(v) => setCampo("telefone", formatarTelefone(v))}
                  erro={erros.telefone}
                  placeholder="(27) 99999-9999"
                  icon={<FiPhone />}
                />
              </div>

              {/* TIPO DE ENTREGA */}
              <div>
                <h3 className="font-titulo text-lg text-marrom mb-3 flex items-center gap-2">
                  <FiTruck /> Como deseja receber?
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <BotaoTipoEntrega
                    ativo={tipoEntrega === "retirada"}
                    onClick={() => setTipoEntrega("retirada")}
                    icone="🏠"
                    titulo="Retirada"
                    sub="Buscar no local"
                  />
                  <BotaoTipoEntrega
                    ativo={tipoEntrega === "entrega"}
                    onClick={() => setTipoEntrega("entrega")}
                    icone="🚚"
                    titulo="Entrega"
                    sub="Receber em casa"
                  />
                </div>
              </div>

             {/* INFO DE RETIRADA COM MAPA */}
              {tipoEntrega === "retirada" && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 animate-fade-in">
                  <h4 className="font-medium text-green-800 text-sm flex items-center gap-2 mb-1">
                    📍 Local de Retirada
                  </h4>
                  <p className="text-sm text-green-700 mb-3">
                    Av. Guerino Gilbert, 446 — Ap 101
                    <br />
                    <span className="text-xs">(encima do Marobar) — Linhares/ES</span>
                  </p>

                  {/* Mapa embutido */}
                  <div className="rounded-lg overflow-hidden border border-green-200 mb-3">
                    <iframe
                      title="Local de retirada — Bolos Caseiros Sabrina"
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2935.4049414301244!2d-40.07518071114503!3d-19.3868555!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xb625e68c8219e5%3A0x42e025ee8ce27ddc!2sAv.%20Guerino%20Gilberto%2C%20446%20-%20Nossa%20Sra.%20da%20Concei%C3%A7%C3%A3o%2C%20Linhares%20-%20ES%2C%20Brasil!5e1!3m2!1spt-BR!2sbr!4v1790361705447!5m2!1spt-BR!2sbr"
                      width="100%"
                      height="220"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>

                  <a
                    href="https://www.google.com/maps/search/?api=1&query=Av.+Guerino+Gilbert,+446,+Linhares+-+ES"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block text-xs text-green-700 underline hover:text-green-900"
                  >
                    Abrir no Google Maps →
                  </a>
                </div>
              )}

              {/* ENDEREÇO (só se entrega) */}
              {tipoEntrega === "entrega" && (
                <div className="animate-fade-in">
                  <h3 className="font-titulo text-lg text-marrom mb-3 flex items-center gap-2">
                    <FiMapPin /> Endereço de entrega
                  </h3>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-2">
                      <Campo
                        label="Rua *"
                        value={cliente.rua}
                        onChange={(v) => setCampo("rua", v)}
                        erro={erros.rua}
                        placeholder="Rua das Flores"
                      />
                    </div>
                    <Campo
                      label="Nº *"
                      value={cliente.numero}
                      onChange={(v) => setCampo("numero", v)}
                      erro={erros.numero}
                      placeholder="123"
                    />
                  </div>

                  <Campo
                    label="Complemento"
                    value={cliente.complemento}
                    onChange={(v) => setCampo("complemento", v)}
                    placeholder="Apto 302, Bloco B"
                  />

                  <div className="grid grid-cols-2 gap-2">
                    <Campo
                      label="Bairro *"
                      value={cliente.bairro}
                      onChange={(v) => setCampo("bairro", v)}
                      erro={erros.bairro}
                      placeholder="Centro"
                    />
                    <Campo
                      label="Cidade *"
                      value={cliente.cidade}
                      onChange={(v) => setCampo("cidade", v)}
                      erro={erros.cidade}
                      placeholder="Vitória"
                    />
                  </div>

                  <Campo
                    label="Ponto de referência"
                    value={cliente.referencia}
                    onChange={(v) => setCampo("referencia", v)}
                    placeholder="Próximo à praça..."
                  />
                </div>
              )}

              {/* OBSERVAÇÕES */}
              <div>
                <label className="block">
                  <span className="text-sm font-medium text-gray-700">
                    Observações do pedido
                  </span>
                  <textarea
                    rows={3}
                    value={cliente.observacoes}
                    onChange={(e) => setCampo("observacoes", e.target.value)}
                    placeholder="Ex: sem açúcar, escrever 'Parabéns' no bolo..."
                    className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-dourado outline-none text-sm resize-none"
                  />
                </label>
              </div>

              {/* RESUMO */}
              <div className="bg-creme rounded-xl p-4 border border-dourado/30">
                <h4 className="font-medium text-marrom mb-2 text-sm">
                  Resumo do pedido
                </h4>
                <ul className="text-xs text-gray-600 space-y-1 mb-3">
                  {itens.map((i) => (
                    <li key={i.id} className="flex justify-between">
                      <span>
                        {i.quantidade}x {i.nome}
                      </span>
                      <span>
                        R$ {(i.preco * i.quantidade).toFixed(2).replace(".", ",")}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="flex justify-between font-bold text-marrom pt-2 border-t border-dourado/30">
                  <span>Total</span>
                  <span className="text-dourado">
                    R$ {total.toFixed(2).replace(".", ",")}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer checkout */}
            <div className="p-5 bg-white border-t">
              <button
                onClick={enviarWhatsApp}
                disabled={enviando}
                className="w-full bg-green-500 hover:bg-green-600 text-white py-3.5 rounded-full font-bold transition shadow-md flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <FiCheck /> {enviando ? "Enviando..." : "Finalizar no WhatsApp"}
              </button>
              <p className="text-center text-xs text-gray-400 mt-2">
                Você será redirecionado(a) para o WhatsApp
              </p>
            </div>
          </>
        )}
      </div>
    </>
  );
}

// ================ COMPONENTES AUXILIARES ================

function Campo({ label, value, onChange, erro, placeholder, icon }) {
  return (
    <label className="block mb-3">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <div className="relative mt-1">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
          </span>
        )}
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full ${
            icon ? "pl-10" : "px-3"
          } pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-dourado outline-none text-sm transition ${
            erro ? "border-red-400 bg-red-50" : "border-gray-300"
          }`}
        />
      </div>
      {erro && <span className="text-xs text-red-500 mt-1 block">{erro}</span>}
    </label>
  );
}

function BotaoTipoEntrega({ ativo, onClick, icone, titulo, sub }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`p-3 rounded-xl border-2 text-left transition ${
        ativo
          ? "border-dourado bg-dourado/10 shadow-sm"
          : "border-gray-200 hover:border-dourado/50"
      }`}
    >
      <div className="text-2xl mb-1">{icone}</div>
      <div className="font-bold text-sm text-marrom">{titulo}</div>
      <div className="text-xs text-gray-500">{sub}</div>
    </button>
  );
}