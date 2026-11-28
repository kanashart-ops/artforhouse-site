import Link from "next/link";

export default function Footer() {
  return (
    <footer className="relative mt-10 w-full bg-gray-900 text-white">
      <div className="mx-auto max-w-6xl px-5 pb-3 pt-7 text-center text-gray-300 sm:px-6 sm:pb-10">
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
      <div className="pb-5 text-center text-sm text-gray-400 sm:absolute sm:bottom-2 sm:right-6 sm:pb-0 sm:text-right">
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
