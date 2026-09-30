import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../firebase/config";
import ProdutoCard from "./ProdutoCard";

const produtosExemplo = [
  {
    id: "1",
    nome: "Bolo de Milho Verde",
    descricao: "Bolo caseiro de milho verde cremoso, feito no ponto perfeito.",
    preco: 25.0,
    imagem: "/bolos/milho.jpg",
    ativo: true,
    ordem: 1,
  },
  {
    id: "2",
    nome: "Bolo de Banana Caramelizada",
    descricao: "Banana caramelizada com cobertura cremosa. Uma delícia!",
    preco: 28.0,
    imagem: "/bolos/banana.jpg",
    ativo: true,
    ordem: 2,
  },
  {
    id: "3",
    nome: "Bolo de Cenoura com Chocolate",
    descricao: "Clássico bolo de cenoura com generosa cobertura de chocolate.",
    preco: 30.0,
    imagem: "/bolos/cenoura.jpg",
    ativo: true,
    ordem: 3,
  },
];

export default function Produtos() {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregar() {
      try {
        const q = query(collection(db, "produtos"), orderBy("ordem"));
        const snap = await getDocs(q);
        if (snap.empty) setProdutos(produtosExemplo);
        else
          setProdutos(
            snap.docs
              .map((d) => ({ id: d.id, ...d.data() }))
              .filter((p) => p.ativo !== false)
          );
      } catch {
        setProdutos(produtosExemplo);
      } finally {
        setLoading(false);
      }
    }
    carregar();
  }, []);

  return (
    <section id="produtos" className="py-16 md:py-24 px-4 bg-creme">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-titulo text-3xl md:text-5xl text-marrom mb-3">
            Nosso Cardápio
          </h2>
          <div className="w-24 h-1 bg-dourado mx-auto mb-4" />
          <p className="text-marromClaro max-w-2xl mx-auto">
            Encomende pelo WhatsApp para <strong>retirada ou entrega</strong>!
          </p>
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl h-96 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {produtos.map((p) => (
              <ProdutoCard key={p.id} produto={p} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}