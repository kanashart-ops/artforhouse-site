import { NextResponse } from "next/server";

export const runtime = "nodejs";

type OrderInput = {
  name?: unknown;
  contact?: unknown;
  comment?: unknown;
};

type TelegramResponse = {
  ok?: boolean;
};

export async function POST(request: Request) {
  try {
    // Обычная форма должна отправлять запрос с того же сайта.
    const origin = request.headers.get("origin");
    if (origin && origin !== new URL(request.url).origin) {
      return NextResponse.json(
        { error: "Недопустимый источник запроса." },
        { status: 403 }
      );
    }

    const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
    const chatIds = (process.env.TELEGRAM_CHAT_IDS || "")
      .split(",")
      .map((chatId) => chatId.trim())
      .filter(Boolean);

    if (!token || chatIds.length === 0) {
      return NextResponse.json(
        { error: "Отправка заявок временно недоступна." },
        { status: 503 }
      );
    }

    if (!request.headers.get("content-type")?.includes("application/json")) {
      return NextResponse.json(
        { error: "Неверный тип запроса." },
        { status: 415 }
      );
    }

    const contentLength = Number(request.headers.get("content-length"));
    if (Number.isFinite(contentLength) && contentLength > 10_000) {
      return NextResponse.json(
        { error: "Слишком большая заявка." },
        { status: 413 }
      );
    }

    const body = (await request.json().catch(() => null)) as OrderInput | null;
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json(
        { error: "Неверный формат заявки." },
        { status: 400 }
      );
    }

    if (
      typeof body.name !== "string" ||
      typeof body.contact !== "string" ||
      (body.comment !== undefined && typeof body.comment !== "string")
    ) {
      return NextResponse.json(
        { error: "Некорректные данные заявки." },
        { status: 400 }
      );
    }

    const name = body.name.trim();
    const contact = body.contact.trim();
    const comment = (body.comment ?? "").trim();

    if (
      !name ||
      !contact ||
      name.length > 100 ||
      contact.length > 150 ||
      comment.length > 2000
    ) {
      return NextResponse.json(
        { error: "Проверьте заполненные поля." },
        { status: 400 }
      );
    }

    const dateTime = new Date().toLocaleString("ru-RU", {
      timeZone: "Europe/Minsk",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const message = [
      "Новая заявка Art For House",
      "",
      `Дата: ${dateTime}`,
      `Имя: ${name}`,
      `Контакт: ${contact}`,
      `Комментарий: ${comment || "Не указан"}`,
    ].join("\n");

    const results = await Promise.allSettled(
      chatIds.map(async (chatId) => {
        const response = await fetch(
          `https://api.telegram.org/bot${token}/sendMessage`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ chat_id: chatId, text: message }),
            signal: AbortSignal.timeout(10_000),
            cache: "no-store",
          }
        );

        if (!response.ok) return false;
        const result = (await response.json()) as TelegramResponse;
        return result.ok === true;
      })
    );

    const delivered = results.filter(
      (result) => result.status === "fulfilled" && result.value === true
    ).length;

    if (delivered === 0) {
      console.error("Order API: Telegram did not confirm delivery.");
      return NextResponse.json(
        { error: "Не удалось доставить заявку. Попробуйте позже." },
        { status: 502 }
      );
    }

    if (delivered !== chatIds.length) {
      console.warn("Order API: some Telegram recipients did not receive the order.");
    }

    return NextResponse.json({ ok: true });
  } catch {
    console.error("Order API: request processing failed.");
    return NextResponse.json(
      { error: "Ошибка сервера. Попробуйте позже." },
      { status: 500 }
    );
  }
}
