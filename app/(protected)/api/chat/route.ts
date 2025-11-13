import type { NextRequest } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const googleApiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
if (!googleApiKey) {
  throw new Error('Google API key is not defined in environment variables');
}
const genAI = new GoogleGenerativeAI(googleApiKey);

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();

    if (!message || typeof message !== 'string') {
      return Response.json({ error: 'Message is required' }, { status: 400 });
    }

    console.log('[chatbot] Incoming message:', message);

    // Deteksi apakah pesan masih relevan dengan konteks gizi & bantuan makanan pemerintah
    // const allowedKeywords = [
    //   'gizi',
    //   'makan bergizi',
    //   'bantuan gizi',
    //   'program pemerintah',
    //   'makanan gratis',
    //   'transparansi gizi',
    //   'bantuan makanan',
    //   'pemerintah',
    //   'asupan gizi',
    //   'menu bergizi',
    // ];

    // const inContext = allowedKeywords.some((kw) =>
    //   message.toLowerCase().includes(kw),
    // );

    // if (!inContext) {
    //   return Response.json({
    //     reply:
    //       'Pertanyaan Anda di luar konteks layanan Transparansi Gizi dan Program Makan Bergizi Gratis dari Pemerintah. Silakan tanyakan hal terkait program tersebut.',
    //   });
    // }

    // Jika masih dalam konteks → generate jawaban dari model Gemini
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash-preview-05-20', //gemini-2.0-flash-lite-001
    });

    const prompt = `

    ini adalah informasi untuk bahan pengetahuan Anda:
    ( Pemerintah meluncurkan program Makan Bergizi Gratis (MBG) dengan tujuan meningkatkan gizi masyarakat dan mengurangi angka kemiskinan. Program MBG menargetkan 82,9 juta penerima manfaat dengan alokasi anggaran sebesar Rp171 triliun. Fokus utama program ini adalah peningkatan gizi anak-anak dan ibu hamil, sekaligus berkontribusi pada pengurangan angka kemiskinan hingga 2,6 persen. MBG telah ditetapkan sebagai salah satu program prioritas nasional untuk periode 2025–2029 di bawah pemerintahan Presiden Prabowo Subianto.)

    Anda adalah ahli gizi propesional sekaligus asisten resmi dari layanan *Transparansi Gizi dan Program Makan Bergizi Gratis* milik pemerintah.
Jawablah pertanyaan pengguna dengan ramah, akurat, dan dalam bahasa Indonesia yang mudah dipahami.

Batasan:
- Hanya bahas hal-hal terkait gizi, makanan bergizi, transparansi data gizi, dan program makan bergizi gratis.
- Jangan menjawab pertanyaan di luar konteks tersebut.
- Jika pengguna meminta data spesifik, berikan penjelasan umum tentang cara akses data transparansi gizi melalui kanal resmi pemerintah.
- Jangan buat-buat data atau informasi yang tidak pasti.
- Gunakan bahasa yang sederhana dan mudah dipahami ringkas namun detail, jgn terlalu panjang jawabnya .
Pesan pengguna:
"${message}"
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const aiReply = response.text();

    console.log('[chatbot] Generated reply:', aiReply);

    return Response.json({ reply: aiReply });
  } catch (error) {
    console.error('[chatbot] API error:', error);
    let message = 'Terjadi kesalahan saat memproses pesan.';
    if (error instanceof Error) {
      message = error.message;
      if (message.includes('503')) {
        message =
          'Layanan sedang sibuk karena terlalu banyak permintaan. Silakan coba beberapa saat lagi.';
      }
    }

    return Response.json({ error: message }, { status: 500 });
  }
}
