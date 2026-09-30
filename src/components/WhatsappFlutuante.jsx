import { FaWhatsapp } from "react-icons/fa";
export default function WhatsappFlutuante() {
  const numero = import.meta.env.VITE_WHATSAPP_NUMERO || "5527998036871";
  return (
    <a
      href={`https://wa.me/${numero}?text=${encodeURIComponent(
        "Olá Sabrina! Vim pelo site e gostaria de fazer uma encomenda 🍰"
      )}`}
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-5 right-5 z-40 bg-green-500 hover:bg-green-600 text-white w-14 h-14 rounded-full shadow-2xl flex items-center justify-center text-3xl transition hover:scale-110 animate-pulse"
      title="Falar no WhatsApp"
    >
    <FaWhatsapp/>
    </a>
  );
}