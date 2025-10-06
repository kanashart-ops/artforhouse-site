import Image from "next/image";

export default function OilPaintingsPage() {
  return (
    <main className="flex flex-col">
      {/* Hero-блок */}
      <section
        className="relative flex flex-col items-center justify-center min-h-[70vh] text-white text-center"
        style={{
          backgroundImage: "url('/images/order-bg.jpg')", // ⚡ фото с тобой и картиной
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="relative z-10 px-6 max-w-3xl">
          <h1 className="text-5xl font-extrabold mb-6">Картины маслом на заказ</h1>
          <p className="text-xl">
            Глубина цвета, фактура мазков и живая энергия масляной живописи —
            искусство, которое становится частью вашего интерьера.
          </p>
        </div>
      </section>

      {/* Преимущества масляной живописи */}
      <section className="py-20 px-6 bg-white">
        <h2 className="text-3xl font-bold mb-10 text-center text-gray-900">
          Почему картины маслом?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-5xl mx-auto text-lg text-gray-700">
          <div>
            <p className="mb-6">
              <span className="font-bold">🎨 Глубина цвета.</span> Масляные краски обладают
              насыщенной палитрой, создают игру оттенков и объём, который невозможно
              достичь другими техниками.
            </p>
            <p className="mb-6">
              <span className="font-bold">🖌 Живые мазки.</span> Каждый штрих кисти сохраняет
              фактуру, добавляя картине уникальность и «дыхание» художника.
            </p>
          </div>
          <div>
            <p className="mb-6">
              <span className="font-bold">⏳ Долговечность.</span> Картины маслом сохраняют
              красоту десятилетиями и становятся семейной ценностью.
            </p>
            <p className="mb-6">
              <span className="font-bold">🏛 Престиж.</span> Масляная живопись всегда считалась
              классикой в интерьере — символ вкуса и утончённости.
            </p>
          </div>
        </div>
      </section>

      {/* Примеры картин маслом */}
      <section className="py-20 px-6 bg-gray-50">
        <h2 className="text-3xl font-bold mb-10 text-center text-gray-900">
          Примеры картин маслом
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <a
            href="/gallery"
            className="block bg-white rounded shadow hover:shadow-lg transition overflow-hidden"
          >
            <Image
              src="/images/gallery/oil1.jpg"
              alt="Пример картины маслом 1"
              width={600}
              height={400}
              className="w-full h-64 object-cover hover:scale-105 transition-transform"
            />
          </a>
          <a
            href="/gallery"
            className="block bg-white rounded shadow hover:shadow-lg transition overflow-hidden"
          >
            <Image
              src="/images/gallery/oil2.jpg"
              alt="Пример картины маслом 2"
              width={600}
              height={400}
              className="w-full h-64 object-cover hover:scale-105 transition-transform"
            />
          </a>
          <a
            href="/gallery"
            className="block bg-white rounded shadow hover:shadow-lg transition overflow-hidden"
          >
            <Image
              src="/images/gallery/oil3.jpg"
              alt="Пример картины маслом 3"
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
            ✨ Более 6 лет я создаю картины маслом для интерьеров, совмещая классику и современность.
          </p>
          <p>
            🌍 Работы уже украшают дома в Беларуси, Дубае, Испании, Литве, Польше, Нидерландах и других странах.
          </p>
          <p>
            💡 Индивидуальный подход: мы обсудим ваши идеи и подберём сюжет и формат, подходящий именно вашему пространству.
          </p>
          <p>
            📷 На каждом этапе вы сможете видеть процесс — от эскиза до финального мазка.
          </p>
        </div>
      </section>

      {/* Кнопка заказать */}
      <section className="py-20 px-6 bg-gray-50 text-center">
        <h2 className="text-2xl font-semibold mb-6">
          Готовы заказать картину маслом?
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
