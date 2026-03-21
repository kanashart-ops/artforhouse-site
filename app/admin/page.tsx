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

  const [status, setStatus] = useState("Р—Р°РіСЂСѓР·РєР° РґР°РЅРЅС‹С…...");
  const [galleryUploadState, setGalleryUploadState] = useState<UploadState>({
    status: "idle",
    message: "",
  });
  const [shopUploadState, setShopUploadState] = useState<UploadState>({
    status: "idle",
    message: "",
  });

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

    setStatus("РђРґРјРёРЅРєР° РіРѕС‚РѕРІР° Рє СЂР°Р±РѕС‚Рµ.");
  }

  useEffect(() => {
    fetchAdminData().catch(() => {
      setStatus("РќРµ СѓРґР°Р»РѕСЃСЊ Р·Р°РіСЂСѓР·РёС‚СЊ РґР°РЅРЅС‹Рµ Р°РґРјРёРЅРєРё.");
    });
  }, []);

  const galleryCategories = useMemo(() => {
    return orderGalleryCategories([
      ...GALLERY_CATEGORIES,
      ...galleryItems.map((item) => item.category).filter(Boolean),
    ]);
  }, [galleryItems]);

  async function saveArticles(
    nextItems: Article[],
    message = "РЎС‚Р°С‚СЊРё СЃРѕС…СЂР°РЅРµРЅС‹."
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
          ? `РќРµ СѓРґР°Р»РѕСЃСЊ СЃРѕС…СЂР°РЅРёС‚СЊ СЃС‚Р°С‚СЊРё: ${data.details}`
          : "РќРµ СѓРґР°Р»РѕСЃСЊ СЃРѕС…СЂР°РЅРёС‚СЊ СЃС‚Р°С‚СЊРё."
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
      setStatus("РќРµРІРµСЂРЅС‹Р№ Р»РѕРіРёРЅ РёР»Рё РїР°СЂРѕР»СЊ.");
      return;
    }

    await fetchAdminData();
    setConfig((prev) => (prev ? { ...prev, isAuthorized: true } : prev));
    setStatus("Р’С…РѕРґ РІС‹РїРѕР»РЅРµРЅ. РўРµРїРµСЂСЊ РјРѕР¶РЅРѕ РґРѕР±Р°РІР»СЏС‚СЊ РєР°СЂС‚РёРЅС‹.");
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    setConfig((prev) => (prev ? { ...prev, isAuthorized: false } : prev));
    setStatus("Р’С‹ РІС‹С€Р»Рё РёР· Р°РґРјРёРЅРєРё.");
  }

  async function uploadFile(
    file: File,
    folder: "gallery" | "shop" | "videos",
    setUploadState: (state: UploadState) => void
  ) {
    setUploadState({
      status: "uploading",
      message: `Р—Р°РіСЂСѓР¶Р°РµС‚СЃСЏ С„Р°Р№Р»: ${file.name}`,
    });
    setStatus(`Р—Р°РіСЂСѓР¶Р°РµС‚СЃСЏ С„Р°Р№Р»: ${file.name}`);

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
          data?.details || data?.error || "РќРµ СѓРґР°Р»РѕСЃСЊ Р·Р°РіСЂСѓР·РёС‚СЊ С„Р°Р№Р».";

        setUploadState({
          status: "error",
          message,
        });
        setStatus(`РћС€РёР±РєР° Р·Р°РіСЂСѓР·РєРё: ${message}`);
        return null;
      }

      const successMessage =
        data?.storage === "blob"
          ? "Р¤Р°Р№Р» Р·Р°РіСЂСѓР¶РµРЅ РІ Vercel Blob. РўРµРїРµСЂСЊ РјРѕР¶РЅРѕ РЅР°Р¶РёРјР°С‚СЊ В«Р”РѕР±Р°РІРёС‚СЊВ»."
          : "Р¤Р°Р№Р» Р·Р°РіСЂСѓР¶РµРЅ Р»РѕРєР°Р»СЊРЅРѕ. РўРµРїРµСЂСЊ РјРѕР¶РЅРѕ РЅР°Р¶РёРјР°С‚СЊ В«Р”РѕР±Р°РІРёС‚СЊВ».";

      setUploadState({
        status: "success",
        message: successMessage,
      });
      setStatus(successMessage);

      return data?.src ?? null;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "РќРµРёР·РІРµСЃС‚РЅР°СЏ РѕС€РёР±РєР° Р·Р°РіСЂСѓР·РєРё.";

      setUploadState({
        status: "error",
        message,
      });
      setStatus(`РћС€РёР±РєР° Р·Р°РіСЂСѓР·РєРё: ${message}`);
      return null;
    }
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
      setStatus("Р”Р»СЏ СЃС‚Р°С‚СЊРё Р·Р°РїРѕР»РЅРёС‚Рµ Р·Р°РіРѕР»РѕРІРѕРє, slug Рё С‚РµРєСЃС‚ HTML.");
      return;
    }

    if (articles.some((article) => article.slug === slug)) {
      setStatus("РЎС‚Р°С‚СЊСЏ СЃ С‚Р°РєРёРј slug СѓР¶Рµ СЃСѓС‰РµСЃС‚РІСѓРµС‚.");
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

    const ok = await saveArticles(nextItems, "РЎС‚Р°С‚СЊСЏ РѕРїСѓР±Р»РёРєРѕРІР°РЅР°.");

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
        Р—Р°РіСЂСѓР·РєР° Р°РґРјРёРЅРєРё...
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
          <h1 className="text-3xl font-bold">РђРґРјРёРЅ-РїР°РЅРµР»СЊ</h1>
          <p className="mt-2 max-w-3xl text-sm text-gray-600">
            Р—РґРµСЃСЊ РјРѕР¶РЅРѕ Р±РµР·РѕРїР°СЃРЅРѕ РІРѕР№С‚Рё, Р·Р°РіСЂСѓР·РёС‚СЊ С„РѕС‚Рѕ, РІС‹Р±СЂР°С‚СЊ СЂР°Р·РґРµР»,
            РЅР°РїРёСЃР°С‚СЊ РѕРїРёСЃР°РЅРёРµ Рё СЃСЂР°Р·Сѓ РѕРїСѓР±Р»РёРєРѕРІР°С‚СЊ СЂР°Р±РѕС‚Сѓ РЅР° СЃР°Р№С‚Рµ.
          </p>
        </div>

        {!loginRequired && config.requiresLogin && (
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-800 transition hover:border-gray-900"
          >
            Р’С‹Р№С‚Рё
          </button>
        )}
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm font-semibold text-gray-500">РђРІС‚РѕСЂРёР·Р°С†РёСЏ</p>
          <p className="mt-1 text-lg font-bold">
            {config.requiresLogin ? "Р—Р°С‰РёС‰РµРЅР°" : "РћС‚РєСЂС‹С‚Р° РґР»СЏ dev"}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm font-semibold text-gray-500">Vercel Blob</p>
          <p className="mt-1 text-lg font-bold">
            {config.blobConfigured ? "РўРѕРєРµРЅ РЅР°Р№РґРµРЅ" : "РўРѕРєРµРЅ РµС‰С‘ РЅРµ РґРѕР±Р°РІР»РµРЅ"}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm font-semibold text-gray-500">
            Prisma / Postgres
          </p>
          <p className="mt-1 text-lg font-bold">
            {config.databaseConfigured
              ? "DATABASE_URL РЅР°Р№РґРµРЅ"
              : "РќСѓР¶РЅРѕ РїРѕРґРєР»СЋС‡РёС‚СЊ Р‘Р”"}
          </p>
        </div>
      </div>

      {loginRequired ? (
        <section className="max-w-xl rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-bold">Р’С…РѕРґ РІ Р°РґРјРёРЅРєСѓ</h2>
          <p className="mt-2 text-sm text-gray-600">
            Р—Р°РґР°Р№С‚Рµ РІ `.env.local` СЃРІРѕРё `ADMIN_USERNAME` Рё `ADMIN_PASSWORD`,
            Р·Р°С‚РµРј РІРѕР№РґРёС‚Рµ Р·РґРµСЃСЊ.
          </p>

          <div className="mt-6 space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold">
                РРјСЏ Р°РґРјРёРЅРёСЃС‚СЂР°С‚РѕСЂР°
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
              <span className="mb-2 block text-sm font-semibold">РџР°СЂРѕР»СЊ</span>
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
                placeholder="Р’РІРµРґРёС‚Рµ РїР°СЂРѕР»СЊ"
              />
            </label>

            <button
              type="button"
              onClick={handleLogin}
              className="rounded-full bg-gray-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
            >
              Р’РѕР№С‚Рё
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
                  ? "Р“Р°Р»РµСЂРµСЏ"
                  : item === "shop"
                  ? "Р’ РЅР°Р»РёС‡РёРё"
                  : "РЎС‚Р°С‚СЊРё"}
              </button>
            ))}
          </div>

          {tab === "gallery" && (
            <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                <h2 className="text-2xl font-bold">
                  Р”РѕР±Р°РІРёС‚СЊ СЂР°Р±РѕС‚Сѓ РІ РіР°Р»РµСЂРµСЋ
                </h2>

                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <label className="block md:col-span-2">
                    <span className="mb-2 block text-sm font-semibold">
                      РќР°Р·РІР°РЅРёРµ
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
                      placeholder="РќР°РїСЂРёРјРµСЂ: РўС‘РїР»С‹Р№ РёРЅС‚РµСЂСЊРµСЂ"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold">
                      Р Р°Р·РґРµР»
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
                      Р—Р°РіСЂСѓР·РєР° С„РѕС‚Рѕ
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
                      РР»Рё РІСЃС‚Р°РІСЊС‚Рµ URL РІСЂСѓС‡РЅСѓСЋ
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
                      placeholder="/images/gallery/example.jpg РёР»Рё https://..."
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
                      ? "РРґС‘С‚ Р·Р°РіСЂСѓР·РєР°. Р”РѕР¶РґРёС‚РµСЃСЊ Р·Р°РІРµСЂС€РµРЅРёСЏ РїРµСЂРµРґ РґРѕР±Р°РІР»РµРЅРёРµРј."
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
                    ? "Р—Р°РіСЂСѓР·РєР° С„РѕС‚Рѕ..."
                    : "Р”РѕР±Р°РІРёС‚СЊ Рё СЃСЂР°Р·Сѓ РѕРїСѓР±Р»РёРєРѕРІР°С‚СЊ"}
                </button>
              </div>

              <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                <h3 className="text-xl font-bold">РџРѕСЃР»РµРґРЅРёРµ СЂР°Р±РѕС‚С‹</h3>

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
              </div>
            </section>
          )}

          {tab === "shop" && (
            <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                <h2 className="text-2xl font-bold">
                  Р”РѕР±Р°РІРёС‚СЊ РєР°СЂС‚РёРЅСѓ РІ В«Р’ РЅР°Р»РёС‡РёРёВ»
                </h2>

                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold">
                      РќР°Р·РІР°РЅРёРµ
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
                      Р Р°Р·РјРµСЂ
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
                      placeholder="РќР°РїСЂРёРјРµСЂ: 80Г—100 СЃРј"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold">
                      Р¦РµРЅР°
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
                      placeholder="РќР°РїСЂРёРјРµСЂ: 950 BYN"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold">
                      Р¤РѕС‚Рѕ
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
                          "shop",
                          setShopUploadState
                        );
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
                      РћРїРёСЃР°РЅРёРµ
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
                      placeholder="РњРѕР¶РЅРѕ РѕСЃС‚Р°РІРёС‚СЊ РїСѓСЃС‚С‹Рј, РµСЃР»Рё РѕРїРёСЃР°РЅРёРµ РЅРµ РЅСѓР¶РЅРѕ."
                    />
                  </label>
                </div>

                {shopForm.media.length > 0 && (
                  <div className="mt-4 rounded-2xl border border-gray-100 bg-gray-50 p-4">
                    <p className="text-sm font-semibold">Р—Р°РіСЂСѓР¶РµРЅРЅС‹Рµ С„Р°Р№Р»С‹</p>
                    <ul className="mt-2 space-y-2 text-sm text-gray-600">
                      {shopForm.media.map((media, index) => (
                        <li key={`${media.src}-${index}`}>{media.src}</li>
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
                      ? "РРґС‘С‚ Р·Р°РіСЂСѓР·РєР°. Р”РѕР¶РґРёС‚РµСЃСЊ Р·Р°РІРµСЂС€РµРЅРёСЏ РїРµСЂРµРґ РґРѕР±Р°РІР»РµРЅРёРµРј."
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
              </div>

              <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                <h3 className="text-xl font-bold">РЎРµР№С‡Р°СЃ РІ РїСЂРѕРґР°Р¶Рµ</h3>

                <div className="mt-4 space-y-3">
                  {shopItems.slice(0, 8).map((item) => (
                    <div
                      key={`${item.title}-${item.price}`}
                      className="rounded-2xl border border-gray-100 bg-gray-50 p-3"
                    >
                      <p className="font-semibold">{item.title}</p>
                      <p className="text-sm text-gray-600">
                        {item.size || "Р Р°Р·РјРµСЂ РЅРµ СѓРєР°Р·Р°РЅ"}
                      </p>
                      <p className="text-sm text-amber-700">
                        {item.price || "Р¦РµРЅР° РЅРµ СѓРєР°Р·Р°РЅР°"}
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
                <h2 className="text-2xl font-bold">Р”РѕР±Р°РІРёС‚СЊ СЃС‚Р°С‚СЊСЋ</h2>

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
                    placeholder="Р—Р°РіРѕР»РѕРІРѕРє"
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
                    placeholder="РљРѕСЂРѕС‚РєРѕРµ РѕРїРёСЃР°РЅРёРµ"
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
                    placeholder="HTML СЃС‚Р°С‚СЊРё"
                  />
                </div>

                <button
                  type="button"
                  onClick={addArticle}
                  className="mt-6 rounded-full bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
                >
                  РћРїСѓР±Р»РёРєРѕРІР°С‚СЊ СЃС‚Р°С‚СЊСЋ
                </button>
              </div>

              <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                <h3 className="text-xl font-bold">РџРѕСЃР»РµРґРЅРёРµ СЃС‚Р°С‚СЊРё</h3>

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
