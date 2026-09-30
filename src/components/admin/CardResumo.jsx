export default function CardResumo({ titulo, valor, icone, cor = "dourado" }) {
  const cores = {
    dourado: "from-dourado/20 to-dourado/5 text-dourado border-dourado/30",
    verde: "from-green-100 to-green-50 text-green-700 border-green-200",
    marrom: "from-marrom/20 to-marrom/5 text-marrom border-marrom/30",
    rosa: "from-pink-100 to-pink-50 text-pink-700 border-pink-200",
  };

  return (
    <div
      className={`bg-gradient-to-br ${cores[cor]} border-2 rounded-2xl p-4 md:p-5 shadow-sm`}
    >
      <div className="flex justify-between items-start mb-3">
        <span className="text-xs uppercase tracking-wider opacity-70">
          {titulo}
        </span>
        <span className="text-2xl">{icone}</span>
      </div>
      <div className="font-titulo text-xl md:text-2xl truncate">{valor}</div>
    </div>
  );
}