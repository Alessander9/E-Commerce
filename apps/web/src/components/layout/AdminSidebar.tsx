import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  LucideIcon,
  Store,
  LogOut,
  X,
  ExternalLink,
  PanelLeftClose,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '../ui/tooltip';

export interface AdminNavItem {
  label: string;
  description?: string;
  path: string;
  icon: LucideIcon;
  badge?: string | number;
  minLevel?: number;
}

export interface AdminSidebarRoleBadge {
  label: string;
  shortLabel: string;
  color?: string;
  darkColor?: string;
}

export interface AdminSidebarProps {
  brandTitle: string;
  brandSubtitle?: string;
  brandLogo?: React.ReactNode;
  brandHomePath?: string;
  roleBadge?: AdminSidebarRoleBadge;
  navItems: AdminNavItem[];
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  showStorefrontLink?: boolean;
  storefrontPath?: string;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  brandTitle,
  brandSubtitle,
  brandLogo,
  brandHomePath = '/admin',
  roleBadge,
  navItems,
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
  showStorefrontLink = true,
  storefrontPath = '/',
}) => {
  const { user, logout, currentRole } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-navy/80 backdrop-blur-md lg:hidden transition-opacity duration-300 animate-in fade-in"
          aria-hidden="true"
        />
      )}

      {/* Deep Navy Glassmorphism Collapsible Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 lg:z-40 h-screen bg-gradient-to-b from-[#0A1128] via-[#0F1B3B] to-[#070D1E] text-white flex flex-col justify-between border-r border-white/10 shadow-2xl transition-[width,transform] duration-300 ease-in-out select-none ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${
          isCollapsed ? 'lg:w-[76px]' : 'lg:w-[270px]'
        } w-72 sm:w-80 max-w-[85vw] flex-shrink-0`}
      >
        {/* Top Section: Brand Header & Navigation */}
        <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden no-scrollbar">
          
          {/* Header: Logo, Brand & Toggle Button */}
          <div
            className={`h-18 border-b border-white/10 flex items-center transition-all flex-shrink-0 ${
              isCollapsed ? 'lg:justify-center px-2' : 'justify-between px-5'
            }`}
          >
            {/* Desktop Collapsed Brand Logo */}
            {isCollapsed ? (
              <div className="hidden lg:flex items-center justify-center w-full">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      to={brandHomePath}
                      className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-primary via-secondary to-accent flex items-center justify-center text-white font-black text-xl shadow-glow-primary hover:scale-105 transition-transform"
                    >
                      {brandLogo || '🐾'}
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right" sideOffset={12}>
                    <div>
                      <p className="font-bold text-white text-xs">{brandTitle}</p>
                      {roleBadge && (
                        <p className="text-[10px] text-accent font-semibold">{roleBadge.label}</p>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </div>
            ) : null}

            {/* Expanded / Mobile Header Content */}
            <div className={`flex items-center justify-between w-full ${isCollapsed ? 'lg:hidden' : ''}`}>
              <Link
                to={brandHomePath}
                onClick={onCloseMobile}
                className="flex items-center gap-3 group overflow-hidden focus:outline-none"
              >
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-primary via-secondary to-accent flex items-center justify-center text-white font-black text-xl shadow-glow-primary group-hover:scale-105 transition-transform flex-shrink-0">
                  {brandLogo || '🐾'}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="font-black text-sm text-white tracking-tight truncate">
                      {brandTitle}
                    </h2>
                  </div>
                  {roleBadge ? (
                    <span
                      className={`inline-block text-[10px] font-black px-2 py-0.5 rounded-full border mt-0.5 tracking-wider ${
                        roleBadge.darkColor || 'bg-primary/25 text-primary-light border-primary/40'
                      }`}
                    >
                      {roleBadge.shortLabel}
                    </span>
                  ) : (
                    brandSubtitle && (
                      <p className="text-[11px] text-slate-400 truncate">{brandSubtitle}</p>
                    )
                  )}
                </div>
              </Link>

              <div className="flex items-center gap-1">
                {/* Desktop Collapse Button */}
                {!isCollapsed && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={onToggleCollapse}
                        className="hidden lg:flex p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 border border-transparent hover:border-white/10 transition-all duration-200"
                        aria-label="Colapsar menú lateral"
                      >
                        <PanelLeftClose className="w-4 h-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="right" sideOffset={12}>
                      <p className="font-medium">
                        Colapsar menú <kbd className="ml-1 px-1.5 py-0.5 bg-white/10 rounded text-[10px] font-mono text-slate-300">Ctrl+B</kbd>
                      </p>
                    </TooltipContent>
                  </Tooltip>
                )}

                {/* Mobile Close Button */}
                <button
                  onClick={onCloseMobile}
                  className="lg:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                  aria-label="Cerrar menú"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Navigation Menu */}
          <div className="py-5">
            {/* Category title for expanded / mobile */}
            <div className={`px-5 mb-2.5 ${isCollapsed ? 'lg:hidden' : ''}`}>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Panel de Control
              </span>
            </div>

            <nav className="space-y-1.5 px-3">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  item.path === brandHomePath
                    ? location.pathname === brandHomePath
                    : location.pathname.startsWith(item.path);

                return (
                  <React.Fragment key={item.path}>
                    {/* Desktop Collapsed Item */}
                    {isCollapsed ? (
                      <div className="hidden lg:block">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Link
                              to={item.path}
                              className={`relative w-12 h-12 mx-auto rounded-2xl flex items-center justify-center transition-all duration-200 group ${
                                isActive
                                  ? 'bg-gradient-to-tr from-primary to-secondary text-white shadow-glow-primary'
                                  : 'text-slate-400 hover:text-white hover:bg-white/[0.08]'
                              }`}
                            >
                              {isActive && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-accent rounded-r-full shadow-sm" />
                              )}
                              <Icon className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
                            </Link>
                          </TooltipTrigger>
                          <TooltipContent side="right" sideOffset={12}>
                            <div>
                              <p className="font-bold text-white text-xs">{item.label}</p>
                              {item.description && (
                                <p className="text-[10px] text-slate-300 font-normal">{item.description}</p>
                              )}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    ) : null}

                    {/* Desktop Expanded & Mobile Drawer Item */}
                    <div className={isCollapsed ? 'lg:hidden' : ''}>
                      <Link
                        to={item.path}
                        onClick={onCloseMobile}
                        className={`group relative flex items-center gap-3.5 px-3.5 py-3 rounded-2xl text-xs font-bold transition-all duration-200 ${
                          isActive
                            ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg shadow-primary/25 border border-white/10'
                            : 'text-slate-300 hover:text-white hover:bg-white/[0.07]'
                        }`}
                      >
                        {isActive && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-accent rounded-r-full shadow-sm" />
                        )}

                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                            isActive
                              ? 'bg-white/20 text-white'
                              : 'bg-white/[0.04] text-slate-400 group-hover:text-accent group-hover:bg-white/[0.08]'
                          }`}
                        >
                          <Icon className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate tracking-wide">{item.label}</p>
                          {item.description && (
                            <p className="text-[10px] text-slate-400 group-hover:text-slate-300 font-normal truncate">
                              {item.description}
                            </p>
                          )}
                        </div>

                        {item.badge !== undefined && (
                          <span className="ml-auto text-[10px] font-black px-2 py-0.5 rounded-full bg-white/15 text-white shadow-xs">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    </div>
                  </React.Fragment>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Bottom Sidebar: Storefront Link, Profile & Logout */}
        <div
          className={`border-t border-white/10 bg-[#050A19]/90 backdrop-blur-md flex-shrink-0 ${
            isCollapsed ? 'p-2 lg:p-2.5' : 'p-4'
          }`}
        >
          {/* View Storefront Button */}
          {showStorefrontLink && (
            <div className="mb-3">
              {/* Desktop Collapsed Storefront */}
              {isCollapsed ? (
                <div className="hidden lg:block">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link
                        to={storefrontPath}
                        target="_blank"
                        rel="noreferrer"
                        className="w-12 h-12 mx-auto rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-accent hover:text-white flex items-center justify-center transition-all group shadow-sm"
                        aria-label="Ver Storefront"
                      >
                        <Store className="w-5 h-5 group-hover:scale-110 transition-transform" />
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right" sideOffset={12}>
                      <p className="font-bold text-white text-xs">Abrir Tienda Oficial</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              ) : null}

              {/* Desktop Expanded & Mobile Drawer Storefront */}
              <div className={isCollapsed ? 'lg:hidden' : ''}>
                <Link
                  to={storefrontPath}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 px-3.5 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-slate-200 hover:text-white text-xs font-bold flex items-center justify-between transition-all group shadow-sm"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-accent/20 text-accent flex items-center justify-center">
                      <Store className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    </div>
                    <span>Ver Tienda Online</span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-white" />
                </Link>
              </div>
            </div>
          )}

          {/* User Profile & Logout */}
          {/* Desktop Collapsed Profile */}
          {isCollapsed ? (
            <div className="hidden lg:flex flex-col items-center gap-2 pt-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-accent to-secondary text-navy font-black text-sm flex items-center justify-center shadow-md cursor-pointer hover:scale-105 transition-transform">
                    {user?.firstName?.charAt(0) || 'A'}
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={12}>
                  <div>
                    <p className="font-bold text-white text-xs">{user?.firstName} {user?.lastName}</p>
                    <p className="text-[10px] text-accent font-semibold">{currentRole}</p>
                  </div>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => {
                      logout();
                      navigate('/login');
                    }}
                    className="w-11 h-11 rounded-2xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/15 border border-transparent hover:border-rose-500/20 flex items-center justify-center transition-all duration-200"
                    aria-label="Cerrar sesión"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={12}>
                  <p className="font-medium text-rose-400 text-xs">Cerrar Sesión</p>
                </TooltipContent>
              </Tooltip>
            </div>
          ) : null}

          {/* Desktop Expanded & Mobile Drawer Profile */}
          <div className={`pt-2 border-t border-white/10 ${isCollapsed ? 'lg:hidden' : ''}`}>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-accent to-secondary text-navy font-black text-xs flex items-center justify-center flex-shrink-0 shadow-md">
                  {user?.firstName?.charAt(0) || 'A'}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-extrabold text-white truncate">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <p className="text-[10px] text-slate-300 font-semibold truncate tracking-wide">
                      {currentRole}
                    </p>
                  </div>
                </div>
              </div>

              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => {
                      logout();
                      navigate('/login');
                    }}
                    className="p-2.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/15 border border-transparent hover:border-rose-500/20 transition-all duration-200 flex-shrink-0"
                    aria-label="Cerrar sesión"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p className="font-medium text-rose-400 text-xs">Cerrar Sesión</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
