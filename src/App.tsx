import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { ProductCatalog } from './components/ProductCatalog';
import { CustomConfiguratorSection } from './components/CustomConfiguratorSection';
import { SizingPrepGuide } from './components/SizingPrepGuide';
import { TestimonialsSection } from './components/TestimonialsSection';
import { FaqSection } from './components/FaqSection';
import { LocationContactSection } from './components/LocationContactSection';
import { Footer } from './components/Footer';
import { FloatingWhatsAppButton } from './components/FloatingWhatsAppButton';
import { ProductDetailModal } from './components/ProductDetailModal';
import { AppointmentBookingModal } from './components/AppointmentBookingModal';
import { AuthModal } from './components/AuthModal';
import { UserPanelModal } from './components/UserPanelModal';
import { AdminPanelModal } from './components/AdminPanelModal';
import { NailProduct, UserProfile } from './types';
import { api } from './services/api';
import { ShieldAlert, ArrowLeft, Loader2 } from 'lucide-react';

export default function App() {
  const [selectedProduct, setSelectedProduct] = useState<NailProduct | null>(null);
  const [isSizingModalOpen, setIsSizingModalOpen] = useState<boolean>(false);
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState<boolean>(false);

  // Refresh key
  const [refreshKey, setRefreshKey] = useState<number>(0);

  // Auth and Route state
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [authChecking, setAuthChecking] = useState<boolean>(true);
  const [currentPath, setCurrentPath] = useState<string>(window.location.pathname);

  const [authModalMode, setAuthModalMode] = useState<'client' | 'admin'>('client');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isUserPanelOpen, setIsUserPanelOpen] = useState<boolean>(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState<boolean>(false);

  // Sync window path state
  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
  };

  useEffect(() => {
    const handlePopState = () => setCurrentPath(window.location.pathname);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Fetch initial user session from backend HTTP-only cookie
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await api.getMe();
        if (res.success && res.user) {
          setCurrentUser(res.user);
        }
      } catch (err) {
        setCurrentUser(null);
      } finally {
        setAuthChecking(false);
      }
    }
    checkAuth();
  }, []);

  // Handle route based modals & access control
  useEffect(() => {
    if (authChecking) return;

    if (currentPath === '/admin/login') {
      if (currentUser?.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        setAuthModalMode('admin');
        setIsAuthModalOpen(true);
      }
    } else if (currentPath === '/admin/dashboard') {
      if (!currentUser) {
        navigate('/admin/login');
      } else if (currentUser.role === 'admin') {
        setIsAdminPanelOpen(true);
      }
    } else if (currentPath === '/client/login') {
      if (currentUser) {
        navigate('/client/dashboard');
      } else {
        setAuthModalMode('client');
        setIsAuthModalOpen(true);
      }
    } else if (currentPath === '/client/dashboard') {
      if (!currentUser) {
        navigate('/client/login');
      } else {
        setIsUserPanelOpen(true);
      }
    }
  }, [currentPath, currentUser, authChecking]);

  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    setIsAuthModalOpen(false);

    if (user.role === 'admin') {
      navigate('/admin/dashboard');
      setIsAdminPanelOpen(true);
    } else {
      navigate('/client/dashboard');
      setIsUserPanelOpen(true);
    }
  };

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch (e) {
      console.error('Logout failed:', e);
    }
    setCurrentUser(null);
    setIsUserPanelOpen(false);
    setIsAdminPanelOpen(false);
    navigate('/');
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (authChecking) {
    return (
      <div className="min-h-screen bg-[#2D040E] flex flex-col items-center justify-center text-white">
        <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin mb-3" />
        <p className="font-serif text-sm tracking-widest text-[#D4AF37] uppercase">Pearl & Polishh Atelier Loading...</p>
      </div>
    );
  }

  // 403 Forbidden Screen if client tries to open /admin/dashboard
  if (currentPath === '/admin/dashboard' && currentUser && currentUser.role !== 'admin') {
    return (
      <div className="min-h-screen bg-[#2D040E] flex items-center justify-center p-6 text-white">
        <div className="max-w-md w-full bg-[#3D0513] border border-red-500/30 rounded-3xl p-8 text-center shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-red-200 mb-2">403 Unauthorized</h2>
          <p className="text-xs text-white/70 mb-6">
            Access Denied: Your logged-in account ({currentUser.email}) does not hold administrative privileges for the Pearl & Polishh Studio Portal.
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => navigate('/')}
              className="py-2.5 px-4 bg-[#D4AF37] text-[#2D040E] rounded-xl font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" /> Return to Client Atelier
            </button>
            <button
              onClick={handleLogout}
              className="py-2 px-4 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs transition-colors"
            >
              Sign Out & Switch Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div key={refreshKey} className="min-h-screen bg-[#FFF3F6] text-[#420614] font-sans selection:bg-[#E91E63]/20 selection:text-[#420614]">
      {/* Navigation Bar */}
      <Navbar
        currentUser={currentUser}
        onOpenCustomBuilder={() => scrollToSection('custom-builder')}
        onOpenSizingGuide={() => setIsSizingModalOpen(true)}
        onOpenAppointmentModal={() => setIsAppointmentModalOpen(true)}
        onOpenAuthModal={() => {
          setAuthModalMode('client');
          navigate('/client/login');
        }}
        onOpenUserPanel={() => {
          navigate('/client/dashboard');
          setIsUserPanelOpen(true);
        }}
        onOpenAdminPanel={() => {
          if (currentUser?.role === 'admin') {
            navigate('/admin/dashboard');
            setIsAdminPanelOpen(true);
          } else {
            navigate('/admin/login');
          }
        }}
      />

      {/* Main Content */}
      <main>
        <HeroSection
          onOpenCustomBuilder={() => scrollToSection('custom-builder')}
          onOpenSizingGuide={() => setIsSizingModalOpen(true)}
        />

        <ProductCatalog
          key={`catalog-${refreshKey}`}
          onSelectProduct={(product) => setSelectedProduct(product)}
          onOpenCustomBuilder={() => scrollToSection('custom-builder')}
        />

        <CustomConfiguratorSection
          onOpenSizingGuide={() => setIsSizingModalOpen(true)}
        />

        <SizingPrepGuide />

        <TestimonialsSection key={`reviews-${refreshKey}`} />

        <FaqSection />

        <LocationContactSection
          key={`location-${refreshKey}`}
          onOpenAppointmentModal={() => setIsAppointmentModalOpen(true)}
        />
      </main>

      <Footer
        onOpenCustomBuilder={() => scrollToSection('custom-builder')}
        onOpenSizingGuide={() => setIsSizingModalOpen(true)}
        onOpenAppointmentModal={() => setIsAppointmentModalOpen(true)}
      />

      <FloatingWhatsAppButton />

      {/* Modals */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onOpenSizingGuide={() => setIsSizingModalOpen(true)}
      />

      <AppointmentBookingModal
        isOpen={isAppointmentModalOpen}
        onClose={() => setIsAppointmentModalOpen(false)}
      />

      <SizingPrepGuide
        isModal={true}
        isOpen={isSizingModalOpen}
        onClose={() => setIsSizingModalOpen(false)}
      />

      {/* Auth Modal (Client or Admin mode) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        initialMode={authModalMode}
        onClose={() => {
          setIsAuthModalOpen(false);
          if (currentPath === '/client/login' || currentPath === '/admin/login') {
            navigate('/');
          }
        }}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* User Dashboard Panel */}
      {currentUser && (currentUser.role === 'client' || currentUser.role === 'user') && (
        <UserPanelModal
          isOpen={isUserPanelOpen}
          onClose={() => {
            setIsUserPanelOpen(false);
            if (currentPath === '/client/dashboard') navigate('/');
          }}
          user={currentUser}
          onLogout={handleLogout}
          onOpenAppointmentModal={() => setIsAppointmentModalOpen(true)}
        />
      )}

      {/* Admin Dashboard Panel */}
      {currentUser && currentUser.role === 'admin' && (
        <AdminPanelModal
          isOpen={isAdminPanelOpen}
          adminUser={currentUser}
          onClose={() => {
            setIsAdminPanelOpen(false);
            if (currentPath === '/admin/dashboard') navigate('/');
          }}
          onLogout={handleLogout}
          onCatalogUpdated={() => setRefreshKey((prev) => prev + 1)}
        />
      )}
    </div>
  );
}
