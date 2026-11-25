import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full bg-gray-900 text-white mt-10 relative">
      <div className="max-w-6xl mx-auto p-6 text-center text-gray-300">
        {/* Центральный текст */}
        <p>
          © {new Date().getFullYear()} Art f
          <Link
            href="/tacaltaz"
            className="text-white hover:text-amber-500 transition"
            title="🐾"
          >
            o
          </Link>
          r House. Все права защищены.
        </p>
        <p className="mt-3 text-sm leading-6 text-gray-400">
          Art For House (Арт Фор Хаус) — авторская живопись и картины на заказ
          художницы Анны Побитко. Минск, Беларусь.
        </p>
      </div>

      {/* Правый нижний угол */}
      <div className="absolute right-6 bottom-2 text-sm text-gray-400">
        Created by{" "}
        <Link
          href="https://t.me/Art_aeee"
          target="_blank"
          className="text-white hover:text-amber-500 transition font-semibold"
        >
          ArtPab
        </Link>
      </div>
    </footer>
  );
}
