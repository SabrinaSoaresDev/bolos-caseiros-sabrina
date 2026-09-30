const depoimentos = [
  { nome: "Ana Silva", texto: "O bolo de milho foi um sucesso no cafe da tarde! Sabor incrível.", nota: 5 },
  { nome: "Carlos Souza", texto: "Simplesmente perfeito. Atendimento atencioso e bolo delicioso.", nota: 5 },
  { nome: "Marina Costa", texto: "Encomendei o banana caramelizada e superou todas as expectativas! Recomendo.", nota: 5 },
];

export default function Depoimentos() {
  return (
    <section id="depoimentos" className="py-16 md:py-24 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <h2 className="font-titulo text-3xl md:text-5xl text-primaria text-center mb-12">
          O que dizem nossos clientes
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {depoimentos.map((d) => (
            <div key={d.nome} className="bg-creme p-6 rounded-2xl shadow-md">
              <div className="text-yellow-500 text-xl mb-3">{"⭐".repeat(d.nota)}</div>
              <p className="text-gray-600 italic mb-4">"{d.texto}"</p>
              <div className="font-medium text-primaria">— {d.nome}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}