"use client";

import Link from "next/link";

export default function GalleryError({ reset }: { reset: () => void }) {
  return (
    <main className="mx-auto max-w-2xl px-6 py-20 text-center">
      <h1 className="text-3xl font-bold text-gray-900">
        Галерея временно недоступна
      </h1>
      <p className="mt-4 text-gray-700">
        Не удалось получить список картин. Это не означает, что работы удалены.
        Попробуйте загрузить страницу снова.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-full bg-gray-900 px-6 py-3 font-semibold text-white hover:bg-gray-800"
        >
          Повторить
        </button>
        <Link
          href="/contacts"
          className="rounded-full border border-gray-300 px-6 py-3 font-semibold text-gray-900"
        >
          Контакты
        </Link>
      </div>
    </main>
  );
}
