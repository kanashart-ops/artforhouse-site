"use client";

import { useEffect, useMemo, useState } from "react";
import type { GalleryItem, ShopItem } from "@/lib/contentStore";
import type { Article } from "@/lib/articles";

type Tab = "gallery" | "shop" | "articles";

type AdminConfig = {
  requiresLogin: boolean;
  username: string;
  isAuthorized: boolean;
  blobConfigured: boolean;
  databaseConfigured: boolean;
};

const emptyGalleryItem: GalleryItem = {
  name: "",
  category: "абстракция",
  src: "",
};

const emptyShopItem: ShopItem = {
  title: "",
  size: "",
  price: "",
  description: "",
  media: [],
};

const emptyArticle: Article = {
  slug: "",
  title: "",
  excerpt: "",
  coverImage: "",
  createdAt: new Date().toISOString(),
  contentHtml: "",
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>("gallery");
  const [config, setConfig] = useState<AdminConfig | null>(null);
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });

  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [shopItems, setShopItems] = useState<ShopItem[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);

  const [galleryForm, setGalleryForm] =
    useState<GalleryItem>(emptyGalleryItem);
  const [shopForm, setShopForm] = useState<ShopItem>(emptyShopItem);
  const [articleForm, setArticleForm] = useState<Article>(emptyArticle);

  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState("Загрузка данных...");

  async function fetchAdminData() {
    const [configRes, galleryRes, shopRes, articlesRes] = await Promise.all([
      fetch("/api/admin/config", { cache: "no-store" }),
      fetch("/api/admin/gallery", { cache: "no-store" }),
      fetch("/api/admin/shop", { cache: "no-store" }),
      fetch("/api/admin/articles", { cache: "no-store" }),
    ]);

    const configData = (await configRes.json()) as AdminConfig;
    setConfig(configData);
    setLoginForm((prev) => ({
      username: prev.username || configData.username || "admin",
      password: prev.password,
    }));

    setGalleryItems(
      ((await galleryRes.json()) as { items?: GalleryItem[] }).items ?? []
    );
    setShopItems(
      ((await shopRes.json()) as { items?: ShopItem[] }).items ?? []
    );
    setArticles(
      ((await articlesRes.json()) as { items?: Article[] }).items ?? []
    );

    setStatus("Админка готова к работе.");
  }

  useEffect(() => {
    fetchAdminData().catch(() => {
      setStatus("Не удалось загрузить данные админки.");
    });
  }, []);

  const galleryCategories = useMemo(() => {
    const defaults = ["абстракция", "интерьер", "масло", "акрил", "пейзаж"];

    return [
      ...new Set([
        ...defaults,
        ...galleryItems.map((item) => item.category).filter(Boolean),
      ]),
    ];
  }, [galleryItems]);

  async function saveGallery(
    nextItems: GalleryItem[],
    message = "Галерея сохранена."
  ) {
    const res = await fetch("/api/admin/gallery", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: nextItems }),
    });

    if (!res.ok) {
      setStatus("Не удалось сохранить галерею.");
      if (res.status === 401) {
        setConfig((prev) => (prev ? { ...prev, isAuthorized: false } : prev));
      }
      return false;
    }

    setGalleryItems(nextItems);
    setStatus(message);
    return true;
  }

  async function saveShop(
    nextItems: ShopItem[],
    message = "Раздел «В наличии» сохранён."
  ) {
    const res = await fetch("/api/admin/shop", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: nextItems }),
    });

    if (!res.ok) {
      setStatus("Не удалось сохранить раздел «В наличии».");
      if (res.status === 401) {
        setConfig((prev) => (prev ? { ...prev, isAuthorized: false } : prev));
      }
      return false;
    }

    setShopItems(nextItems);
    setStatus(message);
    return true;
  }

  async function saveArticles(
    nextItems: Article[],
    message = "Статьи сохранены."
  ) {
    const res = await fetch("/api/admin/articles", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: nextItems }),
    });

    if (!res.ok) {
      setStatus("Не удалось сохранить статьи.");
      if (res.status === 401) {
        setConfig((prev) => (prev ? { ...prev, isAuthorized: false } : prev));
      }
      return false;
    }

    setArticles(nextItems);
    setStatus(message);
    return true;
  }

  async function handleLogin() {
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(loginForm),
    });

    if (!res.ok) {
      setStatus("Неверный логин или пароль.");
      return;
    }

    await fetchAdminData();
    setConfig((prev) => (prev ? { ...prev, isAuthorized: true } : prev));
    setStatus("Вход выполнен. Теперь можно добавлять картины.");
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    setConfig((prev) => (prev ? { ...prev, isAuthorized: false } : prev));
    setStatus("Вы вышли из админки.");
  }

  async function uploadFile(
    file: File,
    folder: "gallery" | "shop" | "videos"
  ) {
    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);

    const res = await fetch("/api/admin/upload", {
      method: "POST",
      body: formData,
    });

    setUploading(false);

    if (!res.ok) {
      setStatus("Не удалось загрузить файл.");
      return null;
    }

    const data = (await res.json()) as { src: string; storage?: string };

    setStatus(
      data.storage === "local-fallback"
        ? "Файл загружен локально. Когда подключите @vercel/blob, этот шаг можно переключить на Blob."
        : "Файл загружен."
    );

    return data.src;
  }

  async function addGalleryItem() {
    if (!galleryForm.name.trim() || !galleryForm.src.trim()) {
      setStatus("Для галереи нужны фото, название и раздел.");
      return;
    }

    const nextItems = [
      {
        ...galleryForm,
        name: galleryForm.name.trim(),
        category: galleryForm.category.trim(),
        src: galleryForm.src.trim(),
      },
      ...galleryItems,
    ];

    const ok = await saveGallery(
      nextItems,
      "Картина добавлена в галерею и сразу опубликована."
    );

    if (ok) {
      setGalleryForm({
        ...emptyGalleryItem,
        category: galleryForm.category,
      });
    }
  }

  async function addShopItem() {
    if (!shopForm.title.trim() || shopForm.media.length === 0) {
      setStatus("Для раздела «В наличии» нужны хотя бы название и одно фото.");
      return;
    }

    const nextItems = [
      { ...shopForm, title: shopForm.title.trim() },
      ...shopItems,
    ];

    const ok = await saveShop(
      nextItems,
      "Картина добавлена в «В наличии» и сразу появилась на сайте."
    );

    if (ok) {
      setShopForm(emptyShopItem);
    }
  }

  async function addArticle() {
    const normalizedTitle = articleForm.title.trim();
    const slug = (articleForm.slug || slugify(normalizedTitle)).trim();

    if (!normalizedTitle || !slug || !articleForm.contentHtml.trim()) {
      setStatus("Для статьи заполните заголовок, slug и текст HTML.");
      return;
    }

    if (articles.some((article) => article.slug === slug)) {
      setStatus("Статья с таким slug уже существует.");
      return;
    }

    const nextItems = [
      {
        ...articleForm,
        title: normalizedTitle,
        slug,
        excerpt: articleForm.excerpt.trim() || normalizedTitle,
        createdAt: articleForm.createdAt || new Date().toISOString(),
      },
      ...articles,
    ];

    const ok = await saveArticles(nextItems, "Статья опубликована.");

    if (ok) {
      setArticleForm({
        ...emptyArticle,
        createdAt: new Date().toISOString(),
      });
    }
  }

  if (!config) {
    return (
      <main className="mx-auto max-w-6xl p-6 md:p-10">
        Загрузка админки...
      </main>
    );
  }

  const loginRequired = config.requiresLogin && !config.isAuthorized;

  return (
    <main className="mx-auto max-w-6xl p-6 md:p-10 text-gray-900">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-amber-700">
            Art for House
          </p>
          <h1 className="text-3xl font-bold">Админ-панель</h1>
          <p className="mt-2 max-w-3xl text-sm text-gray-600">
            Здесь можно безопасно войти, загрузить фото, выбрать раздел,
            написать описание и сразу опубликовать работу на сайте.
          </p>
        </div>

        {!loginRequired && config.requiresLogin && (
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-800 transition hover:border-gray-900"
          >
            Выйти
          </button>
        )}
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm font-semibold text-gray-500">Авторизация</p>
          <p className="mt-1 text-lg font-bold">
            {config.requiresLogin ? "Защищена" : "Открыта для dev"}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm font-semibold text-gray-500">Vercel Blob</p>
          <p className="mt-1 text-lg font-bold">
            {config.blobConfigured ? "Токен найден" : "Токен ещё не добавлен"}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm font-semibold text-gray-500">
            Prisma / Postgres
          </p>
          <p className="mt-1 text-lg font-bold">
            {config.databaseConfigured
              ? "DATABASE_URL найден"
              : "Нужно подключить БД"}
          </p>
        </div>
      </div>

      {loginRequired ? (
        <section className="max-w-xl rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-bold">Вход в админку</h2>
          <p className="mt-2 text-sm text-gray-600">
            Задайте в `.env.local` свои `ADMIN_USERNAME` и `ADMIN_PASSWORD`,
            затем войдите здесь.
          </p>

          <div className="mt-6 space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold">
                Имя администратора
              </span>
              <input
                value={loginForm.username}
                onChange={(event) =>
                  setLoginForm((prev) => ({
                    ...prev,
                    username: event.target.value,
                  }))
                }
                className="w-full rounded-xl border border-gray-300 px-4 py-3"
                placeholder="admin"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold">Пароль</span>
              <input
                type="password"
                value={loginForm.password}
                onChange={(event) =>
                  setLoginForm((prev) => ({
                    ...prev,
                    password: event.target.value,
                  }))
                }
                className="w-full rounded-xl border border-gray-300 px-4 py-3"
                placeholder="Введите пароль"
              />
            </label>

            <button
              type="button"
              onClick={handleLogin}
              className="rounded-full bg-gray-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
            >
              Войти
            </button>
          </div>
        </section>
      ) : (
        <>
          <div className="mb-6 flex flex-wrap gap-3">
            {(["gallery", "shop", "articles"] as Tab[]).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setTab(item)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  tab === item
                    ? "bg-gray-900 text-white"
                    : "border border-gray-300 bg-white text-gray-700"
                }`}
              >
                {item === "gallery"
                  ? "Галерея"
                  : item === "shop"
                  ? "В наличии"
                  : "Статьи"}
              </button>
            ))}
          </div>

          {tab === "gallery" && (
            <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                <h2 className="text-2xl font-bold">
                  Добавить работу в галерею
                </h2>

                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <label className="block md:col-span-2">
                    <span className="mb-2 block text-sm font-semibold">
                      Название
                    </span>
                    <input
                      value={galleryForm.name}
                      onChange={(event) =>
                        setGalleryForm((prev) => ({
                          ...prev,
                          name: event.target.value,
                        }))
                      }
                      className="w-full rounded-xl border border-gray-300 px-4 py-3"
                      placeholder="Например: Тёплый интерьер"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold">
                      Раздел
                    </span>
                    <select
                      value={galleryForm.category}
                      onChange={(event) =>
                        setGalleryForm((prev) => ({
                          ...prev,
                          category: event.target.value,
                        }))
                      }
                      className="w-full rounded-xl border border-gray-300 px-4 py-3"
                    >
                      {galleryCategories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold">
                      Загрузка фото
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="block w-full text-sm"
                      onChange={async (event) => {
                        const file = event.target.files?.[0];
                        if (!file) return;

                        const src = await uploadFile(file, "gallery");
                        if (src) {
                          setGalleryForm((prev) => ({ ...prev, src }));
                        }
                      }}
                    />
                  </label>

                  <label className="block md:col-span-2">
                    <span className="mb-2 block text-sm font-semibold">
                      Или вставьте URL вручную
                    </span>
                    <input
                      value={galleryForm.src}
                      onChange={(event) =>
                        setGalleryForm((prev) => ({
                          ...prev,
                          src: event.target.value,
                        }))
                      }
                      className="w-full rounded-xl border border-gray-300 px-4 py-3"
                      placeholder="/images/gallery/example.jpg или https://..."
                    />
                  </label>
                </div>

                <button
                  type="button"
                  onClick={addGalleryItem}
                  className="mt-6 rounded-full bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
                >
                  Добавить и сразу опубликовать
                </button>
              </div>

              <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                <h3 className="text-xl font-bold">Последние работы</h3>

                <div className="mt-4 space-y-3">
                  {galleryItems.slice(0, 8).map((item) => (
                    <div
                      key={`${item.src}-${item.name}`}
                      className="rounded-2xl border border-gray-100 bg-gray-50 p-3"
                    >
                      <p className="font-semibold">{item.name}</p>
                      <p className="text-sm text-gray-600">{item.category}</p>
                      <p className="truncate text-xs text-gray-500">
                        {item.src}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {tab === "shop" && (
            <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                <h2 className="text-2xl font-bold">
                  Добавить картину в «В наличии»
                </h2>

                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold">
                      Название
                    </span>
                    <input
                      value={shopForm.title}
                      onChange={(event) =>
                        setShopForm((prev) => ({
                          ...prev,
                          title: event.target.value,
                        }))
                      }
                      className="w-full rounded-xl border border-gray-300 px-4 py-3"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold">
                      Размер
                    </span>
                    <input
                      value={shopForm.size}
                      onChange={(event) =>
                        setShopForm((prev) => ({
                          ...prev,
                          size: event.target.value,
                        }))
                      }
                      className="w-full rounded-xl border border-gray-300 px-4 py-3"
                      placeholder="Например: 80×100 см"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold">
                      Цена
                    </span>
                    <input
                      value={shopForm.price}
                      onChange={(event) =>
                        setShopForm((prev) => ({
                          ...prev,
                          price: event.target.value,
                        }))
                      }
                      className="w-full rounded-xl border border-gray-300 px-4 py-3"
                      placeholder="Например: 950 BYN"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold">
                      Фото
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="block w-full text-sm"
                      onChange={async (event) => {
                        const file = event.target.files?.[0];
                        if (!file) return;

                        const src = await uploadFile(file, "shop");
                        if (src) {
                          setShopForm((prev) => ({
                            ...prev,
                            media: [...prev.media, { type: "image", src }],
                          }));
                        }
                      }}
                    />
                  </label>

                  <label className="block md:col-span-2">
                    <span className="mb-2 block text-sm font-semibold">
                      Описание
                    </span>
                    <textarea
                      value={shopForm.description}
                      onChange={(event) =>
                        setShopForm((prev) => ({
                          ...prev,
                          description: event.target.value,
                        }))
                      }
                      className="min-h-32 w-full rounded-xl border border-gray-300 px-4 py-3"
                      placeholder="Можно оставить пустым, если описание не нужно."
                    />
                  </label>
                </div>

                {shopForm.media.length > 0 && (
                  <div className="mt-4 rounded-2xl border border-gray-100 bg-gray-50 p-4">
                    <p className="text-sm font-semibold">Загруженные файлы</p>
                    <ul className="mt-2 space-y-2 text-sm text-gray-600">
                      {shopForm.media.map((media, index) => (
                        <li key={`${media.src}-${index}`}>{media.src}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <button
                  type="button"
                  onClick={addShopItem}
                  className="mt-6 rounded-full bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
                >
                  Добавить и сразу опубликовать
                </button>
              </div>

              <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                <h3 className="text-xl font-bold">Сейчас в продаже</h3>

                <div className="mt-4 space-y-3">
                  {shopItems.slice(0, 8).map((item) => (
                    <div
                      key={`${item.title}-${item.price}`}
                      className="rounded-2xl border border-gray-100 bg-gray-50 p-3"
                    >
                      <p className="font-semibold">{item.title}</p>
                      <p className="text-sm text-gray-600">
                        {item.size || "Размер не указан"}
                      </p>
                      <p className="text-sm text-amber-700">
                        {item.price || "Цена не указана"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {tab === "articles" && (
            <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                <h2 className="text-2xl font-bold">Добавить статью</h2>

                <div className="mt-5 grid gap-4">
                  <input
                    value={articleForm.title}
                    onChange={(event) =>
                      setArticleForm((prev) => ({
                        ...prev,
                        title: event.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-gray-300 px-4 py-3"
                    placeholder="Заголовок"
                  />

                  <input
                    value={articleForm.slug}
                    onChange={(event) =>
                      setArticleForm((prev) => ({
                        ...prev,
                        slug: event.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-gray-300 px-4 py-3"
                    placeholder="slug"
                  />

                  <input
                    value={articleForm.excerpt}
                    onChange={(event) =>
                      setArticleForm((prev) => ({
                        ...prev,
                        excerpt: event.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-gray-300 px-4 py-3"
                    placeholder="Короткое описание"
                  />

                  <textarea
                    value={articleForm.contentHtml}
                    onChange={(event) =>
                      setArticleForm((prev) => ({
                        ...prev,
                        contentHtml: event.target.value,
                      }))
                    }
                    className="min-h-60 w-full rounded-xl border border-gray-300 px-4 py-3"
                    placeholder="HTML статьи"
                  />
                </div>

                <button
                  type="button"
                  onClick={addArticle}
                  className="mt-6 rounded-full bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
                >
                  Опубликовать статью
                </button>
              </div>

              <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                <h3 className="text-xl font-bold">Последние статьи</h3>

                <div className="mt-4 space-y-3">
                  {articles.slice(0, 8).map((article) => (
                    <div
                      key={article.slug}
                      className="rounded-2xl border border-gray-100 bg-gray-50 p-3"
                    >
                      <p className="font-semibold">{article.title}</p>
                      <p className="text-sm text-gray-600">/{article.slug}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}
        </>
      )}

      <p className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        {uploading ? "Загрузка файла..." : status}
      </p>
    </main>
  );
}