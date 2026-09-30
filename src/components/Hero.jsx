export default function Hero() {
  const numero = "5527998036871";

  return (
    <section
      id="inicio"
      className="pt-24 md:pt-32 pb-16 px-4 bg-gradient-to-br from-verdeEscuro via-verde to-verdeEscuro relative overflow-hidden"
    >
      {/* Padrão geométrico decorativo */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-40 h-40 border-2 border-dourado rotate-45" />
        <div className="absolute bottom-10 right-10 w-60 h-60 border-2 border-dourado rotate-12" />
      </div>

      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-10 items-center relative z-10">
        <div className="text-center md:text-left animate-fade-in">
          <div className="flex justify-center md:justify-start mb-6">
            <img
              src="/topo.jpg"
              alt="Bolos Caseiros Sabrina"
              className="w-32 h-32 md:w-40 md:h-40 rounded-full shadow-2xl border-4 border-dourado/50 bg-white"
            />
          </div>

          <span className="inline-block bg-dourado/20 text-dourado px-4 py-1 rounded-full text-sm font-medium mb-4 border border-dourado/40">
            ✨ Bolos Caseiros Sabrina
          </span>

          <h1 className="font-titulo text-4xl sm:text-5xl lg:text-6xl text-dourado leading-tight mb-6">
            O MELHOR BOLO <br />
            <span className="text-creme">ESTÁ AQUI!</span>
          </h1>

          <p className="text-creme/90 text-lg mb-8 max-w-lg mx-auto md:mx-0">
            Peça pelo WhatsApp para <strong>retirada ou entrega</strong>.
            Bolos caseiros feitos com carinho e ingredientes selecionados.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            <a
              href="#produtos"
              className="bg-dourado text-marrom px-8 py-3 rounded-full font-bold hover:bg-douradoClaro transition shadow-lg"
            >
              Ver Cardápio
            </a>
            <a
              href={`https://wa.me/${numero}?text=${encodeURIComponent(
                "Olá Sabrina! Gostaria de fazer uma encomenda 🍰"
              )}`}
              target="_blank"
              rel="noreferrer"
              className="border-2 border-dourado text-dourado px-8 py-3 rounded-full font-medium hover:bg-dourado hover:text-marrom transition"
            >
              📱 Pedir Agora
            </a>
          </div>
        </div>

        <div className="flex justify-center">
          <img
            src="/bolos/milho.jpg"
            alt="Bolo de milho"
            className="rounded-3xl shadow-2xl w-full max-w-md lg:max-w-lg object-cover aspect-square border-4 border-dourado/30"
          />
        </div>
      </div>
    </section>
  );
}