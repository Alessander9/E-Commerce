import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Facebook,
  Instagram,
  Linkedin,
  Moon,
  Send,
  Sun,
  Twitter,
  Mail,
  Phone,
  MapPin,
  CheckCircle2,
  Truck,
  ShieldCheck,
} from 'lucide-react';

export interface FooterProps {
  showNewsletter?: boolean;
  showSocial?: boolean;
  showLegal?: boolean;
  className?: string;
}

export const Footer: React.FC<FooterProps> = ({
  showNewsletter = true,
  showSocial = true,
  showLegal = true,
  className = '',
}) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="relative border-t border-navy-light/40 bg-navy text-white transition-colors duration-300 overflow-hidden">
      {/* Subtle Ambient Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16 relative z-10">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          
          {/* Column 1: Brand & Newsletter */}
          <div className="relative space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-grad-primary flex items-center justify-center text-white font-black text-xl shadow-glow-primary">
                🐾
              </div>
              <span className="font-black text-2xl text-white">PeruCat</span>
            </div>
            
            <p className="text-xs text-gray-300 leading-relaxed font-normal">
              Marca especializada en arena sanitaria para gatos. Aglomeración instantánea en 3s, 99.5% libre de polvo y máximo control de olores.
            </p>

            <div className="pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-accent mb-2">
                Únete a la Comunidad Felina
              </h4>
              <p className="text-[11px] text-gray-400 mb-3">
                Recibe promociones exclusivas, cupones y consejos de cuidado para tu michi.
              </p>

              {subscribed ? (
                <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>¡Gracias por suscribirte! Revisa tu correo.</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="relative">
                  <Input
                    type="email"
                    placeholder="Tu correo electrónico..."
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pr-12 bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-accent text-xs rounded-xl backdrop-blur-sm"
                  />
                  <Button
                    type="submit"
                    size="icon"
                    className="absolute right-1 top-1 h-8 w-8 rounded-lg bg-grad-primary text-white transition-transform hover:scale-105"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span className="sr-only">Suscribirme</span>
                  </Button>
                </form>
              )}
            </div>
          </div>

          {/* Column 2: Quick Navigation Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-accent">
              Navegación Rápida
            </h3>
            <nav className="space-y-2 text-xs text-gray-300">
              <Link to="/" className="block transition-colors hover:text-accent">
                Inicio
              </Link>
              <Link to="/productos" className="block transition-colors hover:text-accent">
                Todo el Catálogo de Arenas
              </Link>
              <Link to="/productos?search=clasica" className="block transition-colors hover:text-accent">
                PeruCat Clásica (Bestseller)
              </Link>
              <Link to="/productos?search=carbon" className="block transition-colors hover:text-accent">
                Carbón Activo Anti-Olor
              </Link>
              <Link to="/productos?search=lavanda" className="block transition-colors hover:text-accent">
                Aroma Lavanda Relajante
              </Link>
              <Link to="/#descubre-perucat" className="block transition-colors hover:text-accent">
                ¿Por qué Elegir PeruCat?
              </Link>
              <Link to="/favoritos" className="block transition-colors hover:text-accent">
                Mis Favoritos
              </Link>
            </nav>
          </div>

          {/* Column 3: Contact Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-accent">
              Atención al Cliente
            </h3>
            <address className="space-y-2.5 text-xs text-gray-300 not-italic">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                <span>Lima, Perú (Despachos a Nivel Nacional)</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-accent flex-shrink-0" />
                <a
                  href="https://wa.me/51987654321"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-accent transition-colors"
                >
                  WhatsApp: +51 987 654 321
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-accent flex-shrink-0" />
                <a
                  href="mailto:contacto@perucat.pe"
                  className="hover:text-accent transition-colors"
                >
                  contacto@perucat.pe
                </a>
              </div>
              <div className="pt-2 text-[11px] text-gray-400">
                Horario: Lunes a Sábado de 08:00 a 19:00 hrs.
              </div>
            </address>

            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-2">
              <Truck className="w-4 h-4 text-accent flex-shrink-0" />
              <span className="text-[11px] text-gray-300 font-medium">
                Envíos rápidos a Lima y todas las provincias del Perú.
              </span>
            </div>
          </div>

          {/* Column 4: Social Media & Theme Toggle */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-accent">
              Síguenos en Redes
            </h3>
            <div className="flex space-x-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <a
                      href="https://facebook.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white transition-all transform hover:scale-105"
                      aria-label="Facebook"
                    >
                      <Facebook className="h-4 w-4" />
                    </a>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Síguenos en Facebook</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <a
                      href="https://instagram.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white transition-all transform hover:scale-105"
                      aria-label="Instagram"
                    >
                      <Instagram className="h-4 w-4" />
                    </a>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Síguenos en Instagram</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <a
                      href="https://twitter.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white transition-all transform hover:scale-105"
                      aria-label="Twitter / X"
                    >
                      <Twitter className="h-4 w-4" />
                    </a>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Síguenos en X (Twitter)</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <a
                      href="https://linkedin.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white transition-all transform hover:scale-105"
                      aria-label="LinkedIn"
                    >
                      <Linkedin className="h-4 w-4" />
                    </a>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Conéctate en LinkedIn</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {/* Dark Mode Switcher */}
            <div className="pt-2 flex items-center space-x-2">
              <Sun className="h-4 w-4 text-amber-400" />
              <Switch
                id="dark-mode"
                checked={isDarkMode}
                onCheckedChange={setIsDarkMode}
              />
              <Moon className="h-4 w-4 text-indigo-300" />
              <Label htmlFor="dark-mode" className="text-xs text-gray-300 font-medium cursor-pointer">
                Modo Oscuro
              </Label>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Legal */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-center md:flex-row text-xs text-gray-400">
          <p>
            © {new Date().getFullYear()} PeruCat (Cleo Platform). Todos los derechos reservados.
          </p>
          <nav className="flex flex-wrap items-center justify-center gap-4">
            <Link to="/#politicas" className="transition-colors hover:text-accent">
              Políticas de Privacidad
            </Link>
            <Link to="/#terminos" className="transition-colors hover:text-accent">
              Términos del Servicio
            </Link>
            <Link to="/#envios" className="transition-colors hover:text-accent">
              Políticas de Envío
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
};
