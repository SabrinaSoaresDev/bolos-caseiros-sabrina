import { motion } from "framer-motion";
import { staggerContainer } from "../utils/animacoes";

const depoimentos = [
  { nome: "Ana Silva", texto: "O bolo de morango foi um sucesso no aniversário da minha filha! Sabor incrível.", nota: 5 },
  { nome: "Carlos Souza", texto: "Simplesmente perfeito. Atendimento atencioso e bolo delicioso.", nota: 5 },
  { nome: "Marina Costa", texto: "Encomendei o red velvet e superou todas as expectativas! Recomendo.", nota: 5 },
];

export default function Depoimentos() {
  return (
    <section id="depoimentos" className="py-16 md:py-24 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="font-titulo text-3xl md:text-5xl text-primaria text-center mb-12"
        >
          O que dizem nossos clientes
        </motion.h2>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {depoimentos.map((d) => (
            <motion.div
              key={d.nome}
              variants={{
                hidden: { opacity: 0, y: 50, rotate: -2 },
                visible: {
                  opacity: 1,
                  y: 0,
                  rotate: 0,
                  transition: { duration: 0.6 },
                },
              }}
              whileHover={{ y: -8, rotate: 1, scale: 1.02 }}
              className="bg-creme p-6 rounded-2xl shadow-md hover:shadow-xl transition-shadow"
            >
              <div className="text-yellow-500 text-xl mb-3">
                {"⭐".repeat(d.nota)}
              </div>
              <p className="text-gray-600 italic mb-4">"{d.texto}"</p>
              <div className="font-medium text-primaria">— {d.nome}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}