"use client";

import { useEffect, useMemo, useState } from "react";
import type { GalleryItem, ShopItem } from "@/lib/contentStore";
import type { Article } from "@/lib/articles";
import {
  GALLERY_CATEGORIES,
  orderGalleryCategories,
} from "@/lib/galleryCategories";

type Tab = "gallery" | "shop" | "articles";

type AdminConfig = {
  requiresLogin: boolean;
  username: string;
  isAuthorized: boolean;
  blobConfigured: boolean;
  databaseConfigured: boolean;
};

type UploadStatus = "idle" | "uploading" | "success" | "error";

type UploadState = {
  status: UploadStatus;
  message: string;
};

const emptyGalleryItem: GalleryItem = {
  name: "",
  category: GALLERY_CATEGORIES[0],
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

const GALLERY_ADMIN_PAGE_SIZE = 7;
const SHOP_IMAGE_LIMIT = 10;
const SHOP_VIDEO_LIMIT = 4;

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

  const [status, setStatus] = useState("Загрузка данных...");
  const [galleryUploadState, setGalleryUploadState] = useState<UploadState>({
    status: "idle",
    message: "",
  });
  const [shopUploadState, setShopUploadState] = useState<UploadState>({
    status: "idle",
    message: "",
  });
  const [galleryAdminCategory, setGalleryAdminCategory] = useState("Все");
  const [galleryAdminPage, setGalleryAdminPage] = useState(1);

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
    return orderGalleryCategories([
      ...GALLERY_CATEGORIES,
      ...galleryItems.map((item) => item.category).filter(Boolean),
    ]);
  }, [galleryItems]);

  const galleryAdminItems = useMemo(() => {
    const filtered =
      galleryAdminCategory === "Все"
        ? galleryItems
        : galleryItems.filter((item) => item.category === galleryAdminCategory);

    const totalPages = Math.max(
      1,
      Math.ceil(filtered.length / GALLERY_ADMIN_PAGE_SIZE)
    );
    const safePage = Math.min(galleryAdminPage, totalPages);
    const start = (safePage - 1) * GALLERY_ADMIN_PAGE_SIZE;

    return {
      filtered,
      totalPages,
      page: safePage,
      items: filtered.slice(start, start + GALLERY_ADMIN_PAGE_SIZE),
    };
  }, [galleryAdminCategory, galleryAdminPage, galleryItems]);

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
      const data = (await res.json().catch(() => null)) as
        | { error?: string; details?: string }
        | null;

      setStatus(
        data?.details
          ? `Не удалось сохранить статьи: ${data.details}`
          : "Не удалось сохранить статьи."
      );
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
    folder: "gallery" | "shop" | "videos",
    setUploadState: (state: UploadState) => void
  ) {
    setUploadState({
      status: "uploading",
      message: `Загружается файл: ${file.name}`,
    });
    setStatus(`Загружается файл: ${file.name}`);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = (await res.json().catch(() => null)) as
        | { src?: string; storage?: string; error?: string; details?: string }
        | null;

      if (!res.ok) {
        const message =
          data?.details || data?.error || "Не удалось загрузить файл.";

        setUploadState({
          status: "error",
          message,
        });
        setStatus(`Ошибка загрузки: ${message}`);
        return null;
      }

      const successMessage =
        data?.storage === "blob"
          ? "Файл загружен в Vercel Blob. Теперь можно нажимать «Добавить»."
          : "Файл загружен локально. Теперь можно нажимать «Добавить».";

      setUploadState({
        status: "success",
        message: successMessage,
      });
      setStatus(successMessage);

      return data?.src ?? null;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Неизвестная ошибка загрузки.";

      setUploadState({
        status: "error",
        message,
      });
      setStatus(`Ошибка загрузки: ${message}`);
      return null;
    }
  }

  async function uploadShopFiles(
    files: FileList | null,
    kind: "image" | "video"
  ) {
    if (!files?.length) {
      return;
    }

    const selectedFiles = Array.from(files);
    const currentImages = shopForm.media.filter((media) => media.type === "image").length;
    const currentVideos = shopForm.media.filter((media) => media.type === "video").length;
    const limit = kind === "image" ? SHOP_IMAGE_LIMIT : SHOP_VIDEO_LIMIT;
    const currentCount = kind === "image" ? currentImages : currentVideos;

    if (currentCount >= limit) {
      setStatus(
        kind === "image"
          ? `Можно добавить максимум ${SHOP_IMAGE_LIMIT} фотографий.`
          : `Можно добавить максимум ${SHOP_VIDEO_LIMIT} видео.`
      );
      return;
    }

    const availableSlots = limit - currentCount;
    const queue = selectedFiles.slice(0, availableSlots);

    if (queue.length < selectedFiles.length) {
      setStatus(
        kind === "image"
          ? `Добавятся только первые ${availableSlots} фото: достигнут лимит ${SHOP_IMAGE_LIMIT}.`
          : `Добавятся только первые ${availableSlots} видео: достигнут лимит ${SHOP_VIDEO_LIMIT}.`
      );
    }

    const uploadedMedia: { type: "image" | "video"; src: string }[] = [];

    for (const file of queue) {
      const src = await uploadFile(
        file,
        kind === "image" ? "shop" : "videos",
        setShopUploadState
      );

      if (!src) {
        return;
      }

      uploadedMedia.push({ type: kind, src });
    }

    setShopForm((prev) => ({
      ...prev,
      media: [...prev.media, ...uploadedMedia],
    }));
  }

  function removeShopMedia(targetIndex: number) {
    setShopForm((prev) => ({
      ...prev,
      media: prev.media.filter((_, index) => index !== targetIndex),
    }));
  }

  async function addGalleryItem() {
    if (!galleryForm.name.trim() || !galleryForm.src.trim()) {
      setStatus("Для галереи нужны фото, название и раздел.");
      return;
    }

    const payload = {
      ...galleryForm,
      name: galleryForm.name.trim(),
      category: galleryForm.category.trim(),
      src: galleryForm.src.trim(),
    };

    const res = await fetch("/api/admin/gallery", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ item: payload }),
    });

    if (!res.ok) {
      const data = (await res.json().catch(() => null)) as
        | { error?: string; details?: string }
        | null;

      setStatus(
        data?.details
          ? `Не удалось добавить работу: ${data.details}`
          : "Не удалось добавить работу в галерею."
      );
      return;
    }

    const data = (await res.json()) as { item: GalleryItem };

    setGalleryItems((prev) => [data.item, ...prev]);
    setStatus("Картина добавлена в галерею и сразу опубликована.");
    setGalleryForm({
      ...emptyGalleryItem,
      category: galleryForm.category,
    });
    setGalleryUploadState({
      status: "idle",
      message: "",
    });
  }

  async function addShopItem() {
    if (!shopForm.title.trim() || shopForm.media.length === 0) {
      setStatus("Для раздела «В наличии» нужны хотя бы название и одно фото.");
      return;
    }

    const payload = {
      ...shopForm,
      title: shopForm.title.trim(),
    };

    const res = await fetch("/api/admin/shop", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ item: payload }),
    });

    if (!res.ok) {
      const data = (await res.json().catch(() => null)) as
        | { error?: string; details?: string }
        | null;

      setStatus(
        data?.details
          ? `Не удалось добавить работу в «В наличии»: ${data.details}`
          : "Не удалось добавить работу в «В наличии»."
      );
      return;
    }

    const data = (await res.json()) as { item: ShopItem };

    setShopItems((prev) => [data.item, ...prev]);
    setStatus("Картина добавлена в «В наличии» и сразу появилась на сайте.");
    setShopForm(emptyShopItem);
    setShopUploadState({
      status: "idle",
      message: "",
    });
  }

  async function handleDeleteGalleryItem(item: GalleryItem) {
    const res = await fetch("/api/admin/gallery", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: item.id,
        name: item.name,
        src: item.src,
      }),
    });

    if (!res.ok) {
      const data = (await res.json().catch(() => null)) as
        | { error?: string; details?: string }
        | null;

      setStatus(
        data?.details
          ? `Не удалось удалить работу: ${data.details}`
          : "Не удалось удалить работу из галереи."
      );
      return;
    }

    setGalleryItems((prev) =>
      prev.filter(
        (current) =>
          (current.id || `${current.name}::${current.src}`) !==
          (item.id || `${item.name}::${item.src}`)
      )
    );
    setStatus("Работа удалена из галереи.");
  }

  async function handleDeleteShopItem(item: ShopItem) {
    const res = await fetch("/api/admin/shop", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: item.id,
        title: item.title,
        src: item.media[0]?.src,
      }),
    });

    if (!res.ok) {
      const data = (await res.json().catch(() => null)) as
        | { error?: string; details?: string }
        | null;

      setStatus(
        data?.details
          ? `Не удалось удалить работу из «В наличии»: ${data.details}`
          : "Не удалось удалить работу из «В наличии»."
      );
      return;
    }

    setShopItems((prev) =>
      prev.filter(
        (current) =>
          (current.id || `${current.title}::${current.media[0]?.src || ""}`) !==
          (item.id || `${item.title}::${item.media[0]?.src || ""}`)
      )
    );
    setStatus("Работа удалена из раздела «В наличии».");
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

                        const src = await uploadFile(
                          file,
                          "gallery",
                          setGalleryUploadState
                        );
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

                {galleryUploadState.status !== "idle" && (
                  <p
                    className={`mt-4 rounded-2xl px-4 py-3 text-sm ${
                      galleryUploadState.status === "error"
                        ? "bg-red-50 text-red-700"
                        : galleryUploadState.status === "success"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-amber-50 text-amber-800"
                    }`}
                  >
                    {galleryUploadState.status === "uploading"
                      ? "Идёт загрузка. Дождитесь завершения перед добавлением."
                      : galleryUploadState.message}
                  </p>
                )}

                <button
                  type="button"
                  onClick={addGalleryItem}
                  disabled={galleryUploadState.status === "uploading"}
                  className="mt-6 rounded-full bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-emerald-300"
                >
                  {galleryUploadState.status === "uploading"
                    ? "Загрузка фото..."
                    : "Добавить и сразу опубликовать"}
                </button>
              </div>

              <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                <h3 className="text-xl font-bold">Последние работы</h3>

                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <select
                    value={galleryAdminCategory}
                    onChange={(event) => {
                      setGalleryAdminCategory(event.target.value);
                      setGalleryAdminPage(1);
                    }}
                    className="rounded-full border border-gray-300 px-4 py-2 text-sm text-gray-700"
                  >
                    <option value="Все">Все категории</option>
                    {galleryCategories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>

                  <p className="text-sm text-gray-500">
                    Найдено: {galleryAdminItems.filtered.length}
                  </p>
                </div>

                <div className="mt-4 space-y-3">
                  {galleryAdminItems.items.map((item) => (
                    <div
                      key={item.id || `${item.src}-${item.name}`}
                      className="rounded-2xl border border-gray-100 bg-gray-50 p-3"
                    >
                      <p className="font-semibold">{item.name}</p>
                      <p className="text-sm text-gray-600">{item.category}</p>
                      <p className="truncate text-xs text-gray-500">
                        {item.src}
                      </p>
                      <button
                        type="button"
                        onClick={() => handleDeleteGalleryItem(item)}
                        className="mt-3 rounded-full border border-red-200 px-3 py-1 text-xs font-semibold text-red-700 transition hover:bg-red-50"
                      >
                        Удалить
                      </button>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setGalleryAdminPage((prev) => Math.max(1, prev - 1))
                    }
                    disabled={galleryAdminItems.page <= 1}
                    className="rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Назад
                  </button>

                  <p className="text-sm text-gray-500">
                    Страница {galleryAdminItems.page} из{" "}
                    {galleryAdminItems.totalPages}
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      setGalleryAdminPage((prev) =>
                        Math.min(galleryAdminItems.totalPages, prev + 1)
                      )
                    }
                    disabled={
                      galleryAdminItems.page >= galleryAdminItems.totalPages
                    }
                    className="rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Вперёд
                  </button>
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
                      Фотографии
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="block w-full text-sm"
                      onChange={async (event) => {
                        await uploadShopFiles(event.target.files, "image");
                        event.currentTarget.value = "";
                      }}
                    />
                    <span className="mt-2 block text-xs text-gray-500">
                      До {SHOP_IMAGE_LIMIT} фото для одной работы.
                    </span>
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold">
                      Видео
                    </span>
                    <input
                      type="file"
                      accept="video/*"
                      multiple
                      className="block w-full text-sm"
                      onChange={async (event) => {
                        await uploadShopFiles(event.target.files, "video");
                        event.currentTarget.value = "";
                      }}
                    />
                    <span className="mt-2 block text-xs text-gray-500">
                      До {SHOP_VIDEO_LIMIT} видео для одной работы.
                    </span>
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
                        <li
                          key={`${media.src}-${index}`}
                          className="flex items-center justify-between gap-3"
                        >
                          <span className="truncate">
                            {media.type === "video" ? "Видео" : "Фото"}:{" "}
                            {media.src}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeShopMedia(index)}
                            className="rounded-full border border-red-200 px-3 py-1 text-xs font-semibold text-red-700 transition hover:bg-red-50"
                          >
                            Удалить
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {shopUploadState.status !== "idle" && (
                  <p
                    className={`mt-4 rounded-2xl px-4 py-3 text-sm ${
                      shopUploadState.status === "error"
                        ? "bg-red-50 text-red-700"
                        : shopUploadState.status === "success"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-amber-50 text-amber-800"
                    }`}
                  >
                    {shopUploadState.status === "uploading"
                      ? "Идёт загрузка. Дождитесь завершения перед добавлением."
                      : shopUploadState.message}
                  </p>
                )}

                <button
                  type="button"
                  onClick={addShopItem}
                  disabled={shopUploadState.status === "uploading"}
                  className="mt-6 rounded-full bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-emerald-300"
                >
                  {shopUploadState.status === "uploading"
                    ? "Загрузка фото..."
                    : "Добавить и сразу опубликовать"}
                </button>

                <p className="mt-4 text-xs leading-6 text-gray-500">
                  Цены на сайте ориентировочные, не являются публичной офертой.
                  Сайт не является интернет-магазином.
                </p>
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
                      <button
                        type="button"
                        onClick={() => handleDeleteShopItem(item)}
                        className="mt-3 rounded-full border border-red-200 px-3 py-1 text-xs font-semibold text-red-700 transition hover:bg-red-50"
                      >
                        Удалить
                      </button>
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
        {status}
      </p>
    </main>
  );
}
