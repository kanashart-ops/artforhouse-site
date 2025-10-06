import Image from "next/image";

export default function InteriorPaintingsPage() {
  return (
    <main className="flex flex-col">
      {/* Hero-блок */}
      <section
        className="relative flex flex-col items-center justify-center min-h-[70vh] text-white text-center"
        style={{
          backgroundImage: "url('/images/interior-bg.jpg')", // ⚡ фото интерьера с картиной
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="relative z-10 px-6 max-w-3xl">
          <h1 className="text-5xl font-extrabold mb-6">Интерьерные картины на заказ</h1>
          <p className="text-xl">
            Авторские картины, созданные специально для вашего пространства —
            искусство, которое гармонично вписывается в интерьер и подчеркивает ваш стиль.
          </p>
        </div>
      </section>

      {/* Преимущества интерьерных картин */}
      <section className="py-20 px-6 bg-white">
        <h2 className="text-3xl font-bold mb-10 text-center text-gray-900">
          Почему интерьерные картины?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-5xl mx-auto text-lg text-gray-700">
          <div>
            <p className="mb-6">
              <span className="font-bold">🏡 Гармония с пространством.</span> Картины подбираются под
              интерьер, создавая целостный образ комнаты.
            </p>
            <p className="mb-6">
              <span className="font-bold">🎨 Индивидуальность.</span> Каждая работа создаётся с учётом
              ваших пожеланий и стиля помещения.
            </p>
          </div>
          <div>
            <p className="mb-6">
              <span className="font-bold">✨ Атмосфера.</span> Интерьерная живопись делает пространство
              уютным, стильным и завершённым.
            </p>
            <p className="mb-6">
              <span className="font-bold">📸 Эффектность.</span> Картины становятся акцентом и точкой
              притяжения в интерьере.
            </p>
          </div>
        </div>
      </section>

      {/* Примеры интерьерных картин */}
      <section className="py-20 px-6 bg-gray-50">
        <h2 className="text-3xl font-bold mb-10 text-center text-gray-900">
          Примеры интерьерных картин
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <a
            href="/gallery"
            className="block bg-white rounded shadow hover:shadow-lg transition overflow-hidden"
          >
            <Image
              src="/images/gallery/interior1.jpg"
              alt="Интерьерная картина 1"
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
              src="/images/gallery/interior2.jpg"
              alt="Интерьерная картина 2"
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
              src="/images/gallery/interior3.jpg"
              alt="Интерьерная картина 3"
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
          Почему выбирают Art for House?
        </h2>
        <div className="max-w-4xl mx-auto space-y-6 text-lg text-gray-700 text-center">
          <p>
            ✨ Более 6 лет я создаю интерьерные картины для домов, квартир и коммерческих помещений.
          </p>
          <p>
            🌍 Работы уже представлены в интерьерах Беларуси, Европы и Ближнего Востока.
          </p>
          <p>
            💡 Индивидуальный подход: мы подберём сюжет, цветовую гамму и формат под ваш интерьер.
          </p>
          <p>
            📷 Вы сможете наблюдать процесс создания картины и быть уверенными в результате.
          </p>
        </div>
      </section>

      {/* Кнопка заказать */}
      <section className="py-20 px-6 bg-gray-50 text-center">
        <h2 className="text-2xl font-semibold mb-6">
          Хотите заказать интерьерную картину?
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
