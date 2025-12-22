'use client';

import { Inter } from 'next/font/google';
import Image from 'next/image';
import { motion } from 'framer-motion';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
});

const ease = [0.16, 1, 0.3, 1] as const;

const container = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease,
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease } },
};

const pop = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.6, ease } },
};

export default function Hero() {
  return (
    <main
      className={`${inter.className} relative min-h-[100svh] overflow-hidden bg-background `}
    >
      {/* Decorative ornaments */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{ hidden: {}, visible: {} }}
        aria-hidden
        className="pointer-events-none select-none  "
      >
        <motion.div
          variants={pop}
          className="absolute left-0 hidden md:block md:-top-9"
        >
          <Image
            src="/media/benner/top.png"
            alt=""
            width={608}
            height={243}
            priority
            className="h-auto w-40 md:w-64 lg:w-80"
          />
        </motion.div>

        <motion.div
          variants={pop}
          className="absolute right-0 hidden md:block md:-top-9"
        >
          <Image
            src="/media/benner/top.png"
            alt=""
            width={608}
            height={243}
            priority
            className="h-auto w-40 md:w-64 lg:w-80 [transform:scaleX(-1)]"
          />
        </motion.div>

        <motion.div variants={pop} className="absolute bottom-0 left-0">
          <Image
            src="/media/benner/beside.png"
            alt=""
            width={426}
            height={851}
            className="h-auto w-24 md:w-36 lg:w-48"
          />
        </motion.div>

        <motion.div variants={pop} className="absolute bottom-0 right-0">
          <Image
            src="/media/benner/beside.png"
            alt=""
            width={426}
            height={851}
            className="h-auto w-24 md:w-36 lg:w-48 [transform:scaleX(-1)]"
          />
        </motion.div>

        <motion.div
          variants={pop}
          className="absolute inset-0 flex items-center justify-center"
        >
          <Image
            src="/media/benner/mid.png"
            alt=""
            width={1344}
            height={768}
            className="h-auto w-[90%] opacity-10 md:w-[70%] lg:w-[55%]"
          />
        </motion.div>
      </motion.div>

      {/* Content */}
      <motion.section
        initial="hidden"
        animate="visible"
        variants={container}
        className="relative z-10 mx-auto flex max-w-5xl flex-col items-center px-6 pt-28 text-center md:pt-52"
      >
        <motion.h1
          variants={item}
          className="text-balance text-4xl font-extrabold leading-tight tracking-tight md:text-6xl"
        >
          <span className="block">
            Transparansi <span className="text-primary">Gizi Menu </span>
          </span>
          <span className="block">
            <span className="text-primary">MBG </span>Hari Ini Di <br />
            <span className="text-primary">
              SPPG Pamijen, Sokaraja, Banyumas
            </span>
          </span>
        </motion.h1>

        <motion.p
          variants={item}
          className="mt-4 max-w-xl text-pretty text-muted-foreground md:max-w-2xl"
        >
          Dengan dukungan <strong>AI Scanner</strong>, setiap menu MBG dapat
          diverifikasi kandungan gizinya, memastikan transparansi penyaluran dan
          kualitas asupan anak-anak Indonesia.
        </motion.p>

        <motion.div
          variants={item}
          className="mt-6 flex items-center justify-center gap-4"
        >
          <a
            href="/aiscanner"
            className="rounded-full  bg-primary text-white px-5 py-3 text-sm font-semibold transition-colors"
          >
            Mulai analisis
          </a>
        </motion.div>
      </motion.section>
    </main>
  );
}
