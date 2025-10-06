import Image from "next/image";

export default function AcrylicPaintingsPage() {
  return (
    <main className="flex flex-col">
      {/* Hero-блок */}
      <section
        className="relative flex flex-col items-center justify-center min-h-[70vh] text-white text-center"
        style={{
          backgroundImage: "url('/images/acrylic-bg.jpg')", // ⚡ фото/фон для акрила
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="relative z-10 px-6 max-w-3xl">
          <h1 className="text-5xl font-extrabold mb-6">Картины акрилом на заказ</h1>
          <p className="text-xl">
            Яркость, динамика и современный стиль акриловой живописи —
            идеальное решение для интерьера с характером.
          </p>
        </div>
      </section>

      {/* Преимущества акриловой живописи */}
      <section className="py-20 px-6 bg-white">
        <h2 className="text-3xl font-bold mb-10 text-center text-gray-900">
          Почему картины акрилом?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-5xl mx-auto text-lg text-gray-700">
          <div>
            <p className="mb-6">
              <span className="font-bold">🌈 Яркие цвета.</span> Акрил даёт сочные и насыщенные
              оттенки, которые долго сохраняют свежесть.
            </p>
            <p className="mb-6">
              <span className="font-bold">⚡ Быстрое высыхание.</span> Картины акрилом создаются
              динамично, сохраняя энергию замысла.
            </p>
          </div>
          <div>
            <p className="mb-6">
              <span className="font-bold">✨ Универсальность.</span> Подходит для разных стилей —
              от абстракций до минимализма и современных интерьеров.
            </p>
            <p className="mb-6">
              <span className="font-bold">💎 Лёгкость ухода.</span> Акриловые картины прочные,
              устойчивы к выцветанию и влажности.
            </p>
          </div>
        </div>
      </section>

      {/* Примеры картин акрилом */}
      <section className="py-20 px-6 bg-gray-50">
        <h2 className="text-3xl font-bold mb-10 text-center text-gray-900">
          Примеры картин акрилом
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <a href="/gallery" className="block bg-white rounded shadow hover:shadow-lg transition overflow-hidden">
            <Image
              src="/images/gallery/acrylic1.jpg"
              alt="Пример картины акрилом 1"
              width={600}
              height={400}
              className="w-full h-64 object-cover hover:scale-105 transition-transform"
            />
          </a>
          <a href="/gallery" className="block bg-white rounded shadow hover:shadow-lg transition overflow-hidden">
            <Image
              src="/images/gallery/acrylic2.jpg"
              alt="Пример картины акрилом 2"
              width={600}
              height={400}
              className="w-full h-64 object-cover hover:scale-105 transition-transform"
            />
          </a>
          <a href="/gallery" className="block bg-white rounded shadow hover:shadow-lg transition overflow-hidden">
            <Image
              src="/images/gallery/acrylic3.jpg"
              alt="Пример картины акрилом 3"
              width={600}
              height={400}
              className="w-full h-64 object-cover hover:scale-105 transition-transform"
            />
          </a>
        </div>

        <div className="mt-10 text-center">
          <a
            href="/gallery"
            className="inline-block px-8 py-3 bg-black text-white font-semibold rounded-full shadow hover:bg-gray-800 transition"
          >
            Смотреть все работы
          </a>
        </div>
      </section>

      {/* Почему выбирают у меня */}
      <section className="py-20 px-6 bg-white">
        <h2 className="text-3xl font-bold mb-10 text-center text-gray-900">
          Почему стоит выбрать Art for House?
        </h2>
        <div className="max-w-4xl mx-auto space-y-6 text-lg text-gray-700 text-center">
          <p>
            ✨ Более 6 лет я создаю картины акрилом и маслом, помогая клиентам подчеркнуть стиль их интерьера.
          </p>
          <p>
            🌍 Мои работы находятся в частных коллекциях Беларуси, Европы и Ближнего Востока.
          </p>
          <p>
            💡 Индивидуальный подход: вместе мы подберём сюжет и формат, которые лучше всего подойдут вашему пространству.
          </p>
          <p>
            📷 Я показываю процесс работы в Instagram и TikTok, чтобы вы видели, как рождается ваша картина.
          </p>
        </div>
      </section>

      {/* Кнопка заказать */}
      <section className="py-20 px-6 bg-gray-50 text-center">
        <h2 className="text-2xl font-semibold mb-6">
          Хотите заказать картину акрилом?
        </h2>
        <a
          href="/order"
          className="inline-block px-10 py-4 bg-black text-white text-lg font-semibold rounded-full shadow hover:bg-gray-800 transition"
        >
          Заказать картину
        </a>
      </section>
    </main>
  );
}
