import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  collection, getDocs, addDoc, updateDoc, deleteDoc,
  doc, orderBy, query,
} from "firebase/firestore";
import { FiEdit, FiTrash2, FiPlus, FiLogOut, FiX, FiUpload } from "react-icons/fi";
import toast from "react-hot-toast";
import { db } from "../firebase/config"; // 🔥 sem storage
import { useAuth } from "../context/AuthContext";
import { fileParaBase64, tamanhoBase64KB } from "../utils/imagem";

export default function Admin() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [produtos, setProdutos] = useState([]);
  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState({
    nome: "", descricao: "", preco: "", imagem: "", ordem: 1, ativo: true,
  });
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  const carregar = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "produtos"), orderBy("ordem"));
      const snap = await getDocs(q);
      setProdutos(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error(e);
      toast.error("Erro ao carregar produtos");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!user) navigate("/login");
    else carregar();
  }, [user]);

  const abrirNovo = () => {
    setEditando(null);
    setForm({
      nome: "", descricao: "", preco: "", imagem: "",
      ordem: produtos.length + 1, ativo: true,
    });
    setModal(true);
  };

  const abrirEditar = (p) => {
    setEditando(p);
    setForm({
      nome: p.nome,
      descricao: p.descricao,
      preco: p.preco,
      imagem: p.imagem,
      ordem: p.ordem || 1,
      ativo: p.ativo !== false,
    });
    setModal(true);
  };

  // ---------- UPLOAD BASE64 ----------
  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Valida tamanho original (5MB máx de entrada)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Imagem muito grande. Máximo 5MB.");
      return;
    }

    setUploading(true);
    const toastId = toast.loading("Processando imagem...");
    try {
      const base64 = await fileParaBase64(file, 800, 0.8);
      const tamanho = tamanhoBase64KB(base64);

      if (tamanho > 900) {
        toast.error(`Imagem ficou com ${tamanho}KB. Máx 900KB.`, { id: toastId });
        setUploading(false);
        return;
      }

      setForm((f) => ({ ...f, imagem: base64 }));
      toast.success(`Imagem carregada (${tamanho}KB)`, { id: toastId });
    } catch (err) {
      toast.error("Erro ao processar imagem: " + err.message, { id: toastId });
    }
    setUploading(false);
  };

  const removerImagem = () => {
    setForm((f) => ({ ...f, imagem: "" }));
    toast("Imagem removida", { icon: "🗑️" });
  };

  // ---------- SALVAR ----------
  const salvar = async (e) => {
    e.preventDefault();

    if (!form.imagem) {
      toast.error("Adicione uma imagem ao produto");
      return;
    }

    const dados = {
      ...form,
      preco: parseFloat(form.preco),
      ordem: parseInt(form.ordem) || 1,
    };

    const toastId = toast.loading(editando ? "Salvando..." : "Criando produto...");
    try {
      if (editando) {
        await updateDoc(doc(db, "produtos", editando.id), dados);
        toast.success("Produto atualizado!", { id: toastId });
      } else {
        await addDoc(collection(db, "produtos"), dados);
        toast.success("Produto criado!", { id: toastId });
      }
      setModal(false);
      carregar();
    } catch (err) {
      console.error(err);
      toast.error("Erro ao salvar produto", { id: toastId });
    }
  };

  const excluir = async (id) => {
    if (!confirm("Tem certeza que deseja excluir este produto?")) return;
    const toastId = toast.loading("Excluindo...");
    try {
      await deleteDoc(doc(db, "produtos", id));
      toast.success("Produto excluído!", { id: toastId });
      carregar();
    } catch {
      toast.error("Erro ao excluir", { id: toastId });
    }
  };

  const toggleAtivo = async (p) => {
    await updateDoc(doc(db, "produtos", p.id), { ativo: !p.ativo });
    toast.success(p.ativo ? "Produto desativado" : "Produto ativado");
    carregar();
  };

  const sair = async () => {
    await logout();
    navigate("/");
  };

  const tamanhoAtual = form.imagem ? tamanhoBase64KB(form.imagem) : 0;

  return (
    <div className="min-h-screen bg-creme">
     
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="font-titulo text-3xl text-marrom">Produtos</h2>
            <p className="text-gray-500 text-sm">{produtos.length} itens cadastrados</p>
          </div>
          <button
            onClick={abrirNovo}
            className="bg-marrom text-creme px-5 py-3 rounded-full hover:bg-dourado hover:text-marrom transition flex items-center gap-2 font-medium shadow-md"
          >
            <FiPlus /> Novo Produto
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500">Carregando...</div>
        ) : produtos.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow">
            <p className="text-gray-500 mb-4">Nenhum produto cadastrado ainda.</p>
            <button onClick={abrirNovo} className="text-dourado font-medium hover:underline">
              + Adicionar primeiro produto
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {produtos.map((p) => (
              <div
                key={p.id}
                className={`bg-white rounded-2xl shadow-md overflow-hidden border-2 ${
                  p.ativo !== false ? "border-green-200" : "border-red-200 opacity-60"
                }`}
              >
                <img src={p.imagem} alt={p.nome} className="w-full h-40 object-cover" />
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-marrom flex-1">{p.nome}</h3>
                    <span className="text-lg font-bold text-dourado ml-2">
                      R$ {p.preco.toFixed(2).replace(".", ",")}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-2 mb-3">{p.descricao}</p>

                  <div className="flex items-center gap-2 mb-3">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        p.ativo !== false
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {p.ativo !== false ? "Ativo" : "Inativo"}
                    </span>
                    <span className="text-xs text-gray-400">Ordem: {p.ordem || 1}</span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => abrirEditar(p)}
                      className="flex-1 bg-dourado/10 text-dourado py-2 rounded-lg hover:bg-dourado hover:text-white transition text-sm flex items-center justify-center gap-1"
                    >
                      <FiEdit size={14} /> Editar
                    </button>
                    <button
                      onClick={() => toggleAtivo(p)}
                      className="px-3 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition text-sm"
                      title="Ativar/Desativar"
                    >
                      {p.ativo !== false ? "🚫" : "✅"}
                    </button>
                    <button
                      onClick={() => excluir(p.id)}
                      className="px-3 py-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-500 hover:text-white transition"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <form
            onSubmit={salvar}
            className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl my-8"
          >
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-titulo text-2xl text-marrom">
                {editando ? "Editar Produto" : "Novo Produto"}
              </h3>
              <button
                type="button"
                onClick={() => setModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <FiX size={20} />
              </button>
            </div>

            <label className="block mb-3">
              <span className="text-sm text-gray-600 font-medium">Nome *</span>
              <input
                required
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
                className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-dourado outline-none"
                placeholder="Bolo de Milho Verde"
              />
            </label>

            <label className="block mb-3">
              <span className="text-sm text-gray-600 font-medium">Descrição</span>
              <textarea
                rows={3}
                value={form.descricao}
                onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-dourado outline-none"
                placeholder="Bolo caseiro de milho verde cremoso..."
              />
            </label>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <label className="block">
                <span className="text-sm text-gray-600 font-medium">Preço (R$) *</span>
                <input
                  required
                  type="number"
                  step="0.01"
                  value={form.preco}
                  onChange={(e) => setForm({ ...form, preco: e.target.value })}
                  className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-dourado outline-none"
                  placeholder="25.00"
                />
              </label>
              <label className="block">
                <span className="text-sm text-gray-600 font-medium">Ordem</span>
                <input
                  type="number"
                  value={form.ordem}
                  onChange={(e) => setForm({ ...form, ordem: e.target.value })}
                  className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-dourado outline-none"
                />
              </label>
            </div>

            {/* UPLOAD BASE64 */}
            <div className="mb-3">
              <span className="text-sm text-gray-600 font-medium block mb-2">
                Imagem * <span className="text-xs text-gray-400">(será convertida para Base64)</span>
              </span>

              <div className="flex items-center gap-3">
                {form.imagem ? (
                  <div className="relative">
                    <img
                      src={form.imagem}
                      alt="Preview"
                      className="w-24 h-24 object-cover rounded-lg border-2 border-dourado"
                    />
                    <button
                      type="button"
                      onClick={removerImagem}
                      className="absolute -top-2 -right-2 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs hover:bg-red-600 shadow"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-300">
                    <FiUpload size={24} />
                  </div>
                )}

                <label className="flex-1 cursor-pointer bg-dourado/10 hover:bg-dourado/20 transition p-4 rounded-lg border-2 border-dashed border-dourado text-center text-sm">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                  <FiUpload className="mx-auto mb-1 text-dourado" size={20} />
                  <span className="block font-medium text-dourado">
                    {uploading ? "Processando..." : form.imagem ? "Trocar imagem" : "Escolher imagem"}
                  </span>
                  <span className="block text-xs text-gray-500 mt-1">
                    Será redimensionada para 800px e comprimida
                  </span>
                </label>
              </div>

              {tamanhoAtual > 0 && (
                <div className="mt-2 text-xs text-gray-500 flex items-center justify-between">
                  <span>📦 Tamanho final: <strong>{tamanhoAtual}KB</strong></span>
                  <span className={tamanhoAtual > 900 ? "text-red-500" : "text-green-600"}>
                    {tamanhoAtual > 900 ? "⚠️ Muito grande" : "✅ OK"}
                  </span>
                </div>
              )}
            </div>

            <label className="flex items-center gap-2 mb-5">
              <input
                type="checkbox"
                checked={form.ativo}
                onChange={(e) => setForm({ ...form, ativo: e.target.checked })}
                className="w-4 h-4 accent-dourado"
              />
              <span className="text-sm text-gray-700">Produto visível no site</span>
            </label>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setModal(false)}
                className="flex-1 py-3 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100 transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={uploading}
                className="flex-1 py-3 rounded-full bg-marrom text-creme hover:bg-dourado hover:text-marrom transition font-medium disabled:opacity-50"
              >
                {editando ? "Salvar alterações" : "Criar produto"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}