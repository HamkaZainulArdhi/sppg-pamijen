'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { LogIn, Menu, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { toAbsoluteUrl } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';

const Header = () => {
  const navItems = ['Home', 'Menu', 'Fitur'];
  const { resolvedTheme, setTheme } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [mounted, setMounted] = useState(false);

  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Track scroll untuk highlight menu aktif (hanya di halaman utama)
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);

      // Bagian ini cuma dijalankan di halaman home
      if (pathname === '/') {
        if (window.scrollY < 50) {
          setActiveSection('home');
          return;
        }

        const sections = ['fitur', 'menu'];
        const scrollPosition = window.scrollY + 200;
        for (const section of sections) {
          const element = document.getElementById(section);
          if (element) {
            const { offsetTop, offsetHeight } = element;
            if (
              scrollPosition >= offsetTop &&
              scrollPosition < offsetTop + offsetHeight
            ) {
              if (activeSection !== section) setActiveSection(section);
              return;
            }
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [pathname, activeSection]);

  const handleNavClick = (item: string) => {
    setIsOpen(false);
    const targetId = item.toLowerCase().replace(' ', '-');

    // Menu Rekap
    if (item === 'Menu Rekap') {
      router.push('/menu-rekap');
      return;
    }

    // kalau lagi bukan di halaman utama → redirect ke home + hash
    if (pathname !== '/') {
      if (item === 'Home') {
        router.push('/'); // ke atas halaman home
      } else {
        router.push(`/#${targetId}`); // ke section tertentu
      }
      return;
    }

    // kalau lagi di halaman utama → scroll langsung
    if (item === 'Home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const isActiveItem = (item: string) => {
    const sectionMap: { [key: string]: string } = {
      Home: 'home',
      Menu: 'menu',
      Fitur: 'fitur',
    };

    // Check if Menu Rekap is active
    if (item === 'Menu Rekap') {
      return pathname === '/menu-rekap';
    }

    if (pathname !== '/') {
      return item === 'home';
    }
    return activeSection === sectionMap[item];
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={cn(
        'fixed top-0 left-0 right-0 md:top-5 md:left-1/2 md:-translate-x-1/2 z-40 transition-all duration-300',
        isScrolled
          ? 'bg-background/60  backdrop-blur-sm shadow-xs border border-border rounded-3xl'
          : 'bg-transparent',
      )}
    >
      <div className="container mx-auto px-6 py-4 flex items-center justify-between md:justify-center md:gap-20">
        <Link href="/" aria-label="Home">
          <img
            className="h-[45px] max-w-none"
            src={toAbsoluteUrl('/media/logo/logo1.png')}
            alt="logo"
          />
        </Link>

        <div className="flex items-center gap-2.5 ">
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-5">
            {navItems.map((item, index) => (
              <motion.button
                key={item}
                onClick={() => handleNavClick(item)}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: (index + 2) * 0.1 }}
                className={cn(
                  'cursor-pointer transition-colors relative group',
                  isActiveItem(item)
                    ? 'text-primary'
                    : 'text-accent-foreground hover:text-primary',
                )}
              >
                {item}
                <span
                  className={`absolute -bottom-1 left-0 h-0.5 bg-primary transition-all ${
                    isActiveItem(item) ? 'w-full' : 'w-0 group-hover:w-full'
                  }`}
                ></span>
              </motion.button>
            ))}

            <motion.button
              onClick={() => handleNavClick('Menu Rekap')}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className={cn(
                'cursor-pointer transition-colors relative group',
                isActiveItem('Menu Rekap')
                  ? 'text-primary'
                  : 'text-accent-foreground hover:text-primary',
              )}
            >
              Menu Rekap
              <span
                className={`absolute -bottom-1 left-0 h-0.5 bg-primary transition-all ${
                  isActiveItem('Menu Rekap')
                    ? 'w-full'
                    : 'w-0 group-hover:w-full'
                }`}
              ></span>
            </motion.button>

            {/* <Link href="/signin">
              <Button variant="primary">
                <LogIn />
                Masuk SPPG
              </Button>
            </Link> */}
          </nav>

          {/* Mobile Navigation */}
          <div className="md:hidden flex items-center space-x-4">
            <Drawer open={isOpen} onOpenChange={setIsOpen}>
              <DrawerTrigger asChild>
                <Button
                  className="cursor-pointer text-muted-foreground hover:bg-transparent hover:text-foreground"
                  variant="ghost"
                  size="icon"
                >
                  <Menu className="size-4" />
                </Button>
              </DrawerTrigger>
              <DrawerContent className="px-6 pb-8">
                <DrawerTitle></DrawerTitle>
                <DrawerDescription></DrawerDescription>

                <nav className="flex flex-col space-y-4 mt-6">
                  {navItems.map((item) => (
                    <Button
                      key={item}
                      onClick={() => handleNavClick(item)}
                      variant="ghost"
                      className={cn(
                        'w-full justify-start hover:text-primary',
                        isActiveItem(item) && 'text-primary font-medium',
                      )}
                    >
                      {item}
                    </Button>
                  ))}
                  <Button
                    onClick={() => handleNavClick('Menu Rekap')}
                    variant="ghost"
                    className="w-full justify-start hover:text-primary"
                  >
                    Menu Rekap
                  </Button>
                  {/* <div className="pt-4">
                    <Link href="/signin">
                      <Button
                        className="w-full"
                        variant="primary"
                        onClick={() => setIsOpen(false)}
                      >
                        Masuk SPPG
                      </Button>
                    </Link>
                  </div> */}
                </nav>
              </DrawerContent>
            </Drawer>
          </div>

          {/* Theme Toggle */}
          {mounted && (
            <Button
              className="cursor-pointer text-muted-foreground hover:bg-transparent hover:text-foreground"
              variant="ghost"
              size="icon"
              onClick={() =>
                setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
              }
            >
              {resolvedTheme === 'dark' ? (
                <Sun className="size-4" />
              ) : (
                <Moon className="size-4" />
              )}
            </Button>
          )}
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
