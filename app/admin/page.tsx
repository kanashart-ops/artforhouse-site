"use client";

import { useEffect, useMemo, useState } from "react";
import type { GalleryItem, ShopItem } from "@/lib/contentStore";
import type { Article } from "@/lib/articles";

type Tab = "gallery" | "shop" | "articles";

const MAX_SHOP_IMAGES = 10;
const MAX_SHOP_VIDEOS = 3;

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
  const [password, setPassword] = useState("");
  const [requiresPassword, setRequiresPassword] = useState(false);

  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [shopItems, setShopItems] = useState<ShopItem[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [articleForm, setArticleForm] = useState<Article>(emptyArticle);

  const [galleryForm, setGalleryForm] = useState<GalleryItem>({
    name: "",
    category: "пейзаж",
    src: "",
  });

  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<string>("");

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/gallery").then((res) => res.json()),
      fetch("/api/admin/shop").then((res) => res.json()),
      fetch("/api/admin/articles").then((res) => res.json()),
      fetch("/api/admin/config").then((res) => res.json()),
    ]).then(([galleryData, shopData, articlesData, configData]) => {
      setGalleryItems(galleryData.items ?? []);
      setShopItems(shopData.items ?? []);
      setArticles(articlesData.items ?? []);
      setRequiresPassword(Boolean(configData.requiresPassword));
    });
  }, []);

  const categories = useMemo(
    () => [...new Set(galleryItems.map((item) => item.category))],
    [galleryItems]
  );

  const adminHeaders = {
    "Content-Type": "application/json",
    "x-admin-password": password,
  };

  const saveGallery = async () => {
    const res = await fetch("/api/admin/gallery", {
      method: "PUT",
      headers: adminHeaders,
      body: JSON.stringify({ items: galleryItems }),
    });
    setStatus(res.ok ? "Галерея сохранена" : "Ошибка сохранения галереи");
  };

  const saveShop = async () => {
    const res = await fetch("/api/admin/shop", {
      method: "PUT",
      headers: adminHeaders,
      body: JSON.stringify({ items: shopItems }),
    });
    setStatus(res.ok ? "Раздел «В наличии» сохранён" : "Ошибка сохранения раздела");
  };

  const saveArticles = async () => {
    const res = await fetch("/api/admin/articles", {
      method: "PUT",
      headers: adminHeaders,
      body: JSON.stringify({ items: articles }),
    });
    setStatus(res.ok ? "Статьи сохранены" : "Ошибка сохранения статей");
  };

  const uploadFile = async (
    file: File,
    folder: "gallery" | "shop" | "videos"
  ) => {
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);

    const res = await fetch("/api/admin/upload", {
      method: "POST",
      headers: { "x-admin-password": password },
      body: formData,
    });

    setUploading(false);

    if (!res.ok) {
      setStatus("Не удалось загрузить файл");
      return "";
    }

    const data = (await res.json()) as { src: string };
    return data.src;
  };

  const addGalleryItem = () => {
    if (!galleryForm.src || !galleryForm.name) {
      setStatus("Укажите название и изображение");
      return;
    }

    setGalleryItems((prev) => [...prev, galleryForm]);
    setGalleryForm({ name: "", category: galleryForm.category, src: "" });
    setStatus("Фото добавлено. Не забудьте сохранить галерею.");
  };

  const addArticle = () => {
    const normalizedTitle = articleForm.title.trim();
    const slug = (articleForm.slug || slugify(normalizedTitle)).trim();

    if (!normalizedTitle || !slug || !articleForm.contentHtml.trim()) {
      setStatus("Заполните название, slug и содержимое");
      return;
    }

    if (articles.some((a) => a.slug === slug)) {
      setStatus("Статья с таким slug уже существует");
      return;
    }

    setArticles((prev) => [
      {
        ...articleForm,
        title: normalizedTitle,
        slug,
        excerpt: articleForm.excerpt.trim() || "Новая статья",
        createdAt: articleForm.createdAt || new Date().toISOString(),
      },
      ...prev,
    ]);

    setArticleForm({ ...emptyArticle, createdAt: new Date().toISOString() });
    setStatus("Статья добавлена. Не забудьте сохранить статьи.");
  };

  const addShopMedia = (
    index: number,
    src: string,
    type: "image" | "video"
  ) => {
    setShopItems((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;

        const imageCount = item.media.filter((m) => m.type === "image").length;
        const videoCount = item.media.filter((m) => m.type === "video").length;

        if (type === "image" && imageCount >= MAX_SHOP_IMAGES) {
          setStatus(`Максимум ${MAX_SHOP_IMAGES} фото`);
          return item;
        }

        if (type === "video" && videoCount >= MAX_SHOP_VIDEOS) {
          setStatus(`Максимум ${MAX_SHOP_VIDEOS} видео`);
          return item;
        }

        return {
          ...item,
          media: [...item.media, { type, src }],
        };
      })
    );
  };

  return (
    <main className="max-w-6xl mx-auto p-6 md:p-10 text-gray-900">
      <h1 className="text-3xl font-bold mb-4">Админ-панель</h1>

      {/* пароль */}
      <div className="mb-6 max-w-md">
        {requiresPassword ? (
          <>
            <label className="block text-sm font-semibold mb-2">
              Код администратора
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-400 rounded px-3 py-2"
              placeholder="Введите ADMIN_PASSWORD"
            />
          </>
        ) : (
          <p className="text-sm text-amber-800 bg-amber-50 border border-amber-300 rounded px-3 py-2">
            ADMIN_PASSWORD не задан в .env.local
          </p>
        )}
      </div>

      {/* вкладки */}
      <div className="flex flex-wrap gap-3 mb-6">
        {(["gallery", "shop", "articles"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded ${
              tab === t ? "bg-black text-white" : "bg-gray-300"
            }`}
          >
            {t === "gallery"
              ? "Галерея"
              : t === "shop"
              ? "В наличии"
              : "Статьи"}
          </button>
        ))}
      </div>

      {tab === "gallery" && (
        <section className="space-y-4">
          <button
            className="px-4 py-2 bg-emerald-700 text-white rounded"
            onClick={saveGallery}
          >
            Сохранить галерею
          </button>
        </section>
      )}

      {tab === "shop" && (
        <section className="space-y-4">
          <button
            className="px-4 py-2 bg-emerald-700 text-white rounded"
            onClick={saveShop}
          >
            Сохранить «В наличии»
          </button>
        </section>
      )}

      {tab === "articles" && (
        <section className="space-y-4">
          <button
            className="px-4 py-2 bg-emerald-700 text-white rounded"
            onClick={saveArticles}
          >
            Сохранить статьи
          </button>
        </section>
      )}

      <p className="mt-6 text-sm font-medium">
        {uploading ? "Загрузка файла..." : status}
      </p>
    </main>
  );
}
