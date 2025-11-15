"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowUpRight, Send, Github, Instagram } from "lucide-react";

export default function ArtPabPage() {
  const projects = [
    { name: "Art for House", url: "https://artforhouse.vercel.app", desc: "Студия интерьерного искусства" },
    { name: "Shumskaya Hair", url: "https://shumskaya-hair.vercel.app", desc: "Сайт мастера по наращиванию волос" },
    { name: "Dalnoboy24", url: "https://dalnoboy24.vercel.app", desc: "Портал для дальнобойщиков по Европе" },
  ];

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-16 bg-gradient-to-b from-gray-50 to-white text-gray-800">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl w-full text-center space-y-8"
      >
        <h1 className="text-4xl md:text-5xl font-extrabold">Привет, я Артём 👋</h1>
        <p className="text-lg leading-relaxed text-gray-600">
          Я создаю современные сайты на <strong>Next.js 15 + Tailwind CSS</strong>.  
          Сейчас делаю сайты <strong>бесплатно</strong>, пока не соберу 10 полностью готовых проектов.  
          Уже запущены:
        </p>

        <ul className="space-y-4 text-left mx-auto max-w-md">
          {projects.map((p, i) => (
            <li key={i} className="border border-gray-200 rounded-2xl p-4 hover:shadow-md transition">
              <Link href={p.url} target="_blank" className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{p.name}</h3>
                  <p className="text-sm text-gray-500">{p.desc}</p>
                </div>
                <ArrowUpRight className="w-5 h-5 text-gray-400" />
              </Link>
            </li>
          ))}
        </ul>

        <div className="pt-8 space-y-2">
          <p className="text-gray-600">
            Хочу собрать коллекцию из 10 уникальных сайтов — арт-проектов, студий, новостных порталов и т.д.
          </p>
          <p className="font-medium">Если хочешь свой сайт — пиши 👇</p>

          <div className="flex items-center justify-center gap-6 pt-4">
            <Link href="https://t.me/kanashart" target="_blank" className="flex items-center gap-2 hover:text-blue-600">
              <Send className="w-5 h-5" /> Telegram
            </Link>
            <Link href="https://github.com/kanashart-ops" target="_blank" className="flex items-center gap-2 hover:text-gray-900">
              <Github className="w-5 h-5" /> GitHub
            </Link>
            <Link href="https://instagram.com/art.for.house" target="_blank" className="flex items-center gap-2 hover:text-pink-600">
              <Instagram className="w-5 h-5" /> Instagram
            </Link>
          </div>
        </div>

        <p className="pt-10 text-sm text-gray-400">
          © 2025 ArtPab — веб-разработка и креативный код.
        </p>
      </motion.div>
    </main>
  );
}
