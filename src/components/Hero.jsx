import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { fadeUpComDelay, fadeLeft, fadeRight } from "../utils/animacoes";

export default function Hero() {
  const numero = "5527998036871";
  const ref = useRef(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const yImage = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const scaleImage = useTransform(scrollYProgress, [0, 0.5], [1, 1.08]);
  const opacityBg = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section
      ref={ref}
      id="inicio"
      className="pt-24 md:pt-32 pb-16 px-4 bg-gradient-to-br from-verdeEscuro via-verde to-verdeEscuro relative overflow-hidden min-h-screen flex items-center"
    >
      {/* Padrão decorativo animado */}
      <motion.div
        style={{ opacity: opacityBg }}
        className="absolute inset-0 opacity-10 pointer-events-none"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          className="absolute top-10 left-10 w-40 h-40 border-2 border-dourado"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-10 right-10 w-60 h-60 border-2 border-dourado"
        />
      </motion.div>

      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-10 items-center relative z-10 w-full">
        {/* TEXTO */}
        <div className="text-center md:text-left">
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="flex justify-center md:justify-start mb-6"
          >
            <motion.img
              src="/topo.jpg"
              alt="Bolos Caseiros Sabrina"
              whileHover={{ scale: 1.08, rotate: 3 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="w-32 h-32 md:w-40 md:h-40 rounded-full shadow-2xl border-4 border-dourado/50 bg-white object-cover"
            />
          </motion.div>

          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="inline-block bg-dourado/20 text-dourado px-4 py-1 rounded-full text-sm font-medium mb-4 border border-dourado/40"
          >
            ✨ Bolos Caseiros Sabrina
          </motion.span>

          <motion.h1
            variants={fadeUpComDelay(0.3)}
            initial="hidden"
            animate="visible"
            className="font-titulo text-4xl sm:text-5xl lg:text-6xl text-dourado leading-tight mb-6"
          >
            O MELHOR BOLO
            <br />
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="text-creme inline-block"
            >
              ESTÁ AQUI!
            </motion.span>
          </motion.h1>

          <motion.p
            variants={fadeUpComDelay(0.6)}
            initial="hidden"
            animate="visible"
            className="text-creme/90 text-lg mb-8 max-w-lg mx-auto md:mx-0"
          >
            Peça pelo WhatsApp para <strong>retirada ou entrega</strong>.
            Bolos caseiros feitos com carinho e ingredientes selecionados.
          </motion.p>

          <motion.div
            variants={fadeUpComDelay(0.9)}
            initial="hidden"
            animate="visible"
            className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start"
          >
            <motion.a
              href="#produtos"
              whileHover={{ scale: 1.05, y: -3 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="bg-dourado text-marrom px-8 py-3 rounded-full font-bold shadow-lg text-center"
            >
              Ver Cardápio
            </motion.a>
            <motion.a
              href={`https://wa.me/${numero}?text=${encodeURIComponent(
                "Olá Sabrina! Gostaria de fazer uma encomenda 🍰"
              )}`}
              target="_blank"
              rel="noreferrer"
              whileHover={{ scale: 1.05, y: -3 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="border-2 border-dourado text-dourado px-8 py-3 rounded-full font-medium text-center hover:bg-dourado hover:text-marrom transition-colors"
            >
              📱 Pedir Agora
            </motion.a>
          </motion.div>
        </div>

        {/* IMAGEM COM PARALLAX */}
        <motion.div
          style={{ y: yImage, scale: scaleImage }}
          className="flex justify-center"
        >
          <motion.img
            initial={{ opacity: 0, x: 80 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, delay: 0.5 }}
            src="/bolos/milho.jpg"
            alt="Bolo de milho"
            className="rounded-3xl shadow-2xl w-full max-w-md lg:max-w-lg object-cover aspect-square border-4 border-dourado/30"
          />
        </motion.div>
      </div>

      {/* Indicador de scroll */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-dourado/60"
      >
        <span className="text-xs uppercase tracking-widest">Role</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-1 h-6 bg-dourado/60 rounded-full"
        />
      </motion.div>
    </section>
  );
}