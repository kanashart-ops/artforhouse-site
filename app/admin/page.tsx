"use client";

import { useEffect, useMemo, useState } from "react";
import type { GalleryItem, ShopItem, ShopMediaItem } from "@/lib/contentStore";

type Tab = "gallery" | "shop";

const emptyShopItem: ShopItem = {
  title: "",
  size: "",
  price: "",
  description: "",
  media: [],
};

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>("gallery");
  const [password, setPassword] = useState("");
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [shopItems, setShopItems] = useState<ShopItem[]>([]);
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
    ]).then(([galleryData, shopData]) => {
      setGalleryItems(galleryData.items ?? []);
      setShopItems(shopData.items ?? []);
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
    setStatus(res.ok ? "Раздел в наличии сохранён" : "Ошибка сохранения раздела в наличии");
  };

  const uploadFile = async (file: File, folder: "gallery" | "shop" | "videos") => {
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
    setStatus("Фото добавлено в список. Не забудьте нажать «Сохранить галерею». ");
  };

  const parseMedia = (value: string): ShopMediaItem[] => {
    return value
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => ({
        type: line.endsWith(".mp4") ? "video" : "image",
        src: line,
      }));
  };

  return (
    <main className="max-w-6xl mx-auto p-6 md:p-10">
      <h1 className="text-3xl font-bold mb-6">Админ-панель</h1>
      <p className="text-sm text-gray-600 mb-4">
        Здесь можно обновлять галерею и раздел «В наличии». Для защиты укажите ADMIN_PASSWORD в .env.
      </p>

      <div className="mb-6 max-w-md">
        <label className="block text-sm font-semibold mb-2">Пароль администратора</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border rounded-md px-3 py-2"
          placeholder="Если ADMIN_PASSWORD не задан, поле можно оставить пустым"
        />
      </div>

      <div className="flex gap-3 mb-6">
        <button
          className={`px-4 py-2 rounded-md ${tab === "gallery" ? "bg-black text-white" : "bg-gray-100"}`}
          onClick={() => setTab("gallery")}
        >
          Галерея
        </button>
        <button
          className={`px-4 py-2 rounded-md ${tab === "shop" ? "bg-black text-white" : "bg-gray-100"}`}
          onClick={() => setTab("shop")}
        >
          В наличии
        </button>
      </div>

      {tab === "gallery" && (
        <section className="space-y-6">
          <div className="border rounded-lg p-4 bg-gray-50">
            <h2 className="text-xl font-semibold mb-3">Добавить фото в галерею</h2>
            <div className="grid md:grid-cols-3 gap-3">
              <input
                className="border rounded px-3 py-2"
                placeholder="Название (например a22)"
                value={galleryForm.name}
                onChange={(e) => setGalleryForm((prev) => ({ ...prev, name: e.target.value }))}
              />
              <input
                className="border rounded px-3 py-2"
                placeholder="Категория"
                list="categories"
                value={galleryForm.category}
                onChange={(e) => setGalleryForm((prev) => ({ ...prev, category: e.target.value }))}
              />
              <input
                type="file"
                accept="image/*"
                className="border rounded px-3 py-2"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const src = await uploadFile(file, "gallery");
                  if (src) {
                    setGalleryForm((prev) => ({ ...prev, src }));
                    setStatus(`Файл загружен: ${src}`);
                  }
                }}
              />
            </div>
            <datalist id="categories">
              {categories.map((cat) => (
                <option key={cat} value={cat} />
              ))}
            </datalist>

            <div className="flex gap-3 mt-3">
              <button className="px-4 py-2 bg-black text-white rounded" onClick={addGalleryItem}>
                Добавить в список
              </button>
              <button className="px-4 py-2 bg-emerald-600 text-white rounded" onClick={saveGallery}>
                Сохранить галерею
              </button>
            </div>
          </div>

          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-3">Текущие фото ({galleryItems.length})</h3>
            <div className="max-h-[420px] overflow-auto space-y-2">
              {galleryItems.map((item, index) => (
                <div key={`${item.src}-${index}`} className="grid grid-cols-[1fr_1fr_auto] gap-3 items-center border-b pb-2">
                  <span className="truncate">{item.name}</span>
                  <span className="truncate text-gray-600">{item.category}</span>
                  <button
                    className="px-3 py-1 text-sm rounded bg-red-100 text-red-700"
                    onClick={() => setGalleryItems((prev) => prev.filter((_, i) => i !== index))}
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
        <section className="space-y-4">
          <button
            className="px-4 py-2 bg-black text-white rounded"
            onClick={() => setShopItems((prev) => [...prev, { ...emptyShopItem }])}
          >
            Добавить картину
          </button>

          {shopItems.map((item, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold">Картина #{index + 1}</h3>
                <button
                  className="px-3 py-1 text-sm rounded bg-red-100 text-red-700"
                  onClick={() => setShopItems((prev) => prev.filter((_, i) => i !== index))}
                >
                  Удалить
                </button>
              </div>
              <div className="grid md:grid-cols-3 gap-3">
                <input
                  className="border rounded px-3 py-2"
                  placeholder="Название"
                  value={item.title}
                  onChange={(e) =>
                    setShopItems((prev) =>
                      prev.map((old, i) => (i === index ? { ...old, title: e.target.value } : old))
                    )
                  }
                />
                <input
                  className="border rounded px-3 py-2"
                  placeholder="Размер"
                  value={item.size}
                  onChange={(e) =>
                    setShopItems((prev) =>
                      prev.map((old, i) => (i === index ? { ...old, size: e.target.value } : old))
                    )
                  }
                />
                <input
                  className="border rounded px-3 py-2"
                  placeholder="Цена"
                  value={item.price}
                  onChange={(e) =>
                    setShopItems((prev) =>
                      prev.map((old, i) => (i === index ? { ...old, price: e.target.value } : old))
                    )
                  }
                />
              </div>

              <textarea
                className="w-full border rounded px-3 py-2 min-h-24"
                placeholder="Описание"
                value={item.description}
                onChange={(e) =>
                  setShopItems((prev) =>
                    prev.map((old, i) => (i === index ? { ...old, description: e.target.value } : old))
                  )
                }
              />

              <label className="block text-sm font-medium">Медиа (каждый URL с новой строки)</label>
              <textarea
                className="w-full border rounded px-3 py-2 min-h-24"
                value={item.media.map((media) => media.src).join("\n")}
                onChange={(e) =>
                  setShopItems((prev) =>
                    prev.map((old, i) =>
                      i === index ? { ...old, media: parseMedia(e.target.value) } : old
                    )
                  )
                }
              />

              <div className="flex flex-wrap gap-3 items-center">
                <input
                  type="file"
                  accept="image/*,video/mp4"
                  className="border rounded px-3 py-2"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const folder = file.type.startsWith("video/") ? "videos" : "shop";
                    const src = await uploadFile(file, folder);
                    if (!src) return;

                    setShopItems((prev) =>
                      prev.map((old, i) =>
                        i === index
                          ? {
                              ...old,
                              media: [
                                ...old.media,
                                {
                                  type: folder === "videos" ? "video" : "image",
                                  src,
                                },
                              ],
                            }
                          : old
                      )
                    );
                    setStatus(`Файл загружен: ${src}`);
                  }}
                />
              </div>
            </div>
          ))}

          <button className="px-4 py-2 bg-emerald-600 text-white rounded" onClick={saveShop}>
            Сохранить раздел «В наличии»
          </button>
        </section>
      )}

      <p className="mt-6 text-sm text-gray-600">{uploading ? "Загрузка файла..." : status}</p>
    </main>
  );
}
