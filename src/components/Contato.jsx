import { motion } from "framer-motion";
import { FiPhone, FiInstagram, FiMapPin, FiClock } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { staggerContainer } from "../utils/animacoes";

export default function Contato() {
  const numero = "5527998036871";

  return (
    <section id="contato" className="py-16 md:py-24 px-4 bg-verdeEscuro overflow-hidden">
      <div className="max-w-5xl mx-auto text-center">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="font-titulo text-3xl md:text-5xl text-dourado mb-4"
        >
          Peça já!
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-creme/90 mb-2 text-lg"
        >
          Encomendas pelo WhatsApp para <strong>retirada ou entrega</strong>
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="text-creme/70 mb-10 text-sm flex items-center justify-center gap-2"
        >
          <FiClock /> Antecedência mínima de 24h
        </motion.p>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid sm:grid-cols-2 gap-4 max-w-2xl mx-auto mb-10"
        >
          <motion.a
            variants={{
              hidden: { opacity: 0, x: -40 },
              visible: { opacity: 1, x: 0, transition: { duration: 0.6 } },
            }}
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.98 }}
            href={`https://wa.me/${numero}?text=${encodeURIComponent(
              "Olá Sabrina! Gostaria de fazer uma encomenda 🍰"
            )}`}
            target="_blank"
            rel="noreferrer"
            className="bg-green-500 hover:bg-green-600 text-white p-6 rounded-2xl shadow-lg transition-colors flex items-center justify-center gap-3"
          >
            <FaWhatsapp size={28} />
            <div className="text-left">
              <div className="font-bold">WhatsApp</div>
              <div className="text-sm">(27) 99803-6871</div>
            </div>
          </motion.a>

          <motion.a
            variants={{
              hidden: { opacity: 0, x: 40 },
              visible: { opacity: 1, x: 0, transition: { duration: 0.6 } },
            }}
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.98 }}
            href="https://instagram.com/Sabrina_BolosCaseiros"
            target="_blank"
            rel="noreferrer"
            className="bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 text-white p-6 rounded-2xl shadow-lg transition-transform flex items-center justify-center gap-3"
          >
            <FiInstagram size={28} />
            <div className="text-left">
              <div className="font-bold">Instagram</div>
              <div className="text-sm">@Sabrina_BolosCaseiros</div>
            </div>
          </motion.a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="max-w-3xl mx-auto mb-10"
        >
          <div className="bg-creme/10 border-2 border-dourado/40 rounded-2xl p-6">
            <div className="flex items-start gap-4 text-left mb-4">
              <div className="bg-dourado text-marrom p-3 rounded-full shrink-0">
                <FiMapPin size={22} />
              </div>
              <div className="flex-1">
                <h3 className="font-titulo text-xl text-dourado mb-1">
                  📍 Local de Retirada
                </h3>
                <p className="text-creme font-medium leading-relaxed">
                  Av. Guerino Gilbert, 446 — Ap 101
                  <br />
                  <span className="text-sm text-creme/70">
                    (encima do Marobar) — Linhares/ES
                  </span>
                </p>
              </div>
            </div>

            <div className="rounded-xl overflow-hidden border-2 border-dourado/30 shadow-lg">
              <iframe
                title="Local de retirada — Bolos Caseiros Sabrina"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2935.4049414301244!2d-40.07518071114503!3d-19.3868555!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xb625e68c8219e5%3A0x42e025ee8ce27ddc!2sAv.%20Guerino%20Gilberto%2C%20446%20-%20Nossa%20Sra.%20da%20Concei%C3%A7%C3%A3o%2C%20Linhares%20-%20ES%2C%20Brasil!5e1!3m2!1spt-BR!2sbr!4v1790361705447!5m2!1spt-BR!2sbr"
                width="100%"
                height="300"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

            <motion.a
              href="https://www.google.com/maps/search/?api=1&query=Av.+Guerino+Gilbert,+446,+Linhares+-+ES"
              target="_blank"
              rel="noreferrer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center justify-center gap-2 mt-4 bg-dourado hover:bg-douradoClaro text-marrom text-sm font-bold px-5 py-2.5 rounded-full transition-colors"
            >
              🗺️ Abrir no Google Maps
            </motion.a>
          </div>
        </motion.div>

        <motion.a
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          whileHover={{ scale: 1.05, y: -3 }}
          whileTap={{ scale: 0.97 }}
          href={`https://wa.me/${numero}?text=${encodeURIComponent(
            "Olá Sabrina! Gostaria de fazer uma encomenda 🍰"
          )}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 bg-dourado hover:bg-douradoClaro text-marrom px-10 py-4 rounded-full font-bold shadow-xl transition-colors text-lg"
        >
          <FiPhone /> Fazer Encomenda Agora
        </motion.a>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="text-creme/50 text-xs mt-6"
        >
          Atendemos Linhares e região • Consulte taxa de entrega
        </motion.p>
      </div>
    </section>
  );
}