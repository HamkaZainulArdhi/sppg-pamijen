import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Camera, ChartBar, Download, Edit } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CustomBadge } from '@/components/custom/badge';
import { CustomSubtitle } from '@/components/custom/subtitle';
import { CustomTitle } from '@/components/custom/title';

const HowItWorks = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const manuallyTriggered = useRef(false);

  const steps = [
    {
      id: 1,
      title: 'Upload atau Potret Menu',
      description:
        'Ambil foto atau unggah gambar menu makanan untuk mulai analisis gizi.',
      image: 'media/fitur/1.png',
      imagedark: 'media/fitur/1-dark.png',
      icon: Camera,
    },
    {
      id: 2,
      title: 'Analisis Gizi Otomatis',
      description:
        'AI langsung membaca kandungan gizi dari menu yang dipindai.',
      image: 'media/fitur/2.png',
      imagedark: 'media/fitur/2-dark.png',
      icon: ChartBar,
    },
    {
      id: 3,
      title: 'Validasi & Edit Manual',
      description:
        'Periksa, validasi, dan edit data agar sesuai dengan kondisi nyata.',
      image: 'media/fitur/3.png',
      imagedark: 'media/fitur/3-dark.png',
      icon: Edit,
    },
    {
      id: 4,
      title: 'Simpan & Ekspor Hasil',
      description:
        'Simpan analisis, ekspor ke Excel, atau ubah menjadi desain siap bagikan.',
      image: 'media/fitur/4.png',
      imagedark: 'media/fitur/4-dark.png',
      icon: Download,
    },
  ];

  const stepDuration = 6500; // 8 secon

  // Auto-advance steps with progress animation
  useEffect(() => {
    if (isPaused) return;

    setProgress(0);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 100;
        return prev + 100 / (stepDuration / 50);
      });
    }, 50);

    const stepTimeout = setTimeout(() => {
      setActiveStep((prevStep) => {
        const next = (prevStep + 1) % steps.length;
        manuallyTriggered.current = false; // reset the manual flag here
        return next;
      });
    }, stepDuration);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(stepTimeout);
    };
  }, [activeStep, isPaused, steps.length]);

  const handleStepClick = (index: number) => {
    setActiveStep(index);
    manuallyTriggered.current = true; // Flag as manual
    setTimeout(() => setIsPaused(false), 4000); // Resume auto
  };

  return (
    <section
      id="fitur"
      className="py-21 border-b border-border/50 bg-gray-100/50 rounded-3xl dark:bg-background"
    >
      <div className="container mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="flex items-center justify-center flex-col text-center gap-5 mb-16"
        >
          <CustomBadge>Cara Kerja</CustomBadge>

          <CustomTitle>
            Bagaimana Cara Kerja <span className="text-primary">AI-nya</span>?
          </CustomTitle>

          <CustomSubtitle>
            Mulai dari upload foto menu, AI menganalisis gizi, lalu hasilnya
            bisa divalidasi, disimpan, dan dibagikan secara transparan.
          </CustomSubtitle>
        </motion.div>

        {/* Main Content Grid */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="flex flex-col gap-12 max-w-6xl mx-auto"
        >
          {/* Left Side - Step Navigation */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={cn(
                  'flex flex-col items-center cursor-pointer transition-all duration-300 overflow-hidden',
                )}
                onClick={() => handleStepClick(index)}
              >
                <div className="size-12 bg-primary/30 rounded-full flex items-center justify-center">
                  <step.icon className="size-5 text-primary" />
                </div>

                <h3
                  className={cn(
                    'p-5 pb-3 text-xl font-semibold mb-0 transition-colors duration-300',
                    index === activeStep
                      ? 'text-foreground'
                      : 'text-muted-foreground',
                  )}
                >
                  {step.title}
                </h3>

                <div className="w-full h-0.5 bg-border/60">
                  <AnimatePresence>
                    {index === activeStep && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="h-0.5 w-full overflow-hidden"
                      >
                        {/* Progress Bar - moved to bottom */}
                        <motion.div
                          className="h-0.5 bg-gradient-to-r from-primary to-amber-300"
                          style={{ width: `${progress}%` }}
                          transition={{ duration: 0.05, ease: 'linear' }}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            ))}
          </div>

          {/* Right Side - Fading Images */}
          <div className="relative w-full rounded-xl overflow-hidden border border-border shadow-xs shadow-black/5 bg-background">
            <div className="max-h-[100vh] overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeStep}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5, ease: 'easeInOut' }}
                  className="relative w-full h-full"
                >
                  {/* versi light */}
                  <img
                    src={steps[activeStep].image}
                    alt={`${steps[activeStep].title} visualization`}
                    className="w-full h-full object-cover block dark:hidden"
                  />

                  {/* versi dark */}
                  <img
                    src={steps[activeStep].imagedark}
                    alt={`${steps[activeStep].title} visualization`}
                    className="w-full h-full object-cover hidden dark:block"
                  />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorks;
