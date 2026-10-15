import { motion } from "framer-motion";
import { fadeLeft, fadeRight } from "../utils/animacoes";
import bolo from "../assets/bolo.jpg";
export default function Sobre() {
  return (
    <section id="sobre" className="py-16 md:py-24 px-4 bg-creme overflow-hidden">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-10 items-center">
        <motion.img
          variants={fadeLeft}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          src={bolo}
          alt="Confeiteira"
          className="rounded-3xl shadow-xl w-full"
        />

        <motion.div
          variants={fadeRight}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <h2 className="font-titulo text-3xl md:text-5xl text-marrom mb-6">
            Feito à mão, com amor
          </h2>
          <p className="text-gray-600 mb-4 leading-relaxed">
            Há mais de 2 Meses transformamos momentos especiais em memórias doces.
             Cada bolo é preparado individualmente, com ingredientes frescos e receitas exclusivas
          </p>
          <p className="text-gray-600 mb-6 leading-relaxed">
            Bolo delicioso e cremoso de milho o classico para um cafe da manhã/tarde.
          </p>

          <div className="grid grid-cols-3 gap-4">
            {[
              { num: "+50", txt: "Bolos feitos" },
              { num: "2+", txt: "Meses experiência" },
              { num: "100%", txt: "Artesanal" },
            ].map((s, i) => (
              <motion.div
                key={s.txt}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
                whileHover={{ y: -5, scale: 1.05 }}
                className="text-center p-3 bg-white rounded-xl shadow cursor-default"
              >
                <div className="text-2xl font-bold text-secundaria">
                  {s.num}
                </div>
                <div className="text-xs text-gray-500 mt-1">{s.txt}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}