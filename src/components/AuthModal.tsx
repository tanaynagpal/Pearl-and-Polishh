import React, { useState, useEffect, useRef } from 'react';
import { UserProfile } from '../types';
import { api } from '../services/api';
import logoImg from '../assets/pearl-polishh-logo.jpeg';
import { X, User, ShieldCheck, Lock, Mail, Phone, Crown, ArrowRight, Loader2, AlertCircle } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserProfile) => void;
  initialMode?: 'client' | 'admin';
}

declare global {
  interface Window {
    google?: any;
  }
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  initialMode = 'client',
}) => {
  if (!isOpen) return null;

  const [portalType, setPortalType] = useState<'client' | 'admin'>(initialMode);
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const googleBtnContainerRef = useRef<HTMLDivElement>(null);

  const getGoogleClientId = () => {
    return import.meta.env.VITE_GOOGLE_CLIENT_ID || import.meta.env.GOOGLE_CLIENT_ID || '';
  };

  const handleGoogleCredentialResponse = async (response: any, currentPortal: 'client' | 'admin') => {
    if (!response || !response.credential) {
      setErrorMsg('Google Sign-In failed: Credential token was not received from Google.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const res =
        currentPortal === 'admin'
          ? await api.adminGoogleLogin(response.credential)
          : await api.googleLogin(response.credential);

      if (res.success && res.user) {
        if (currentPortal === 'admin' && res.user.role !== 'admin') {
          setErrorMsg('Access Denied: Account does not have administrator permissions.');
          setLoading(false);
          return;
        }
        onLoginSuccess(res.user);
        onClose();
      } else {
        setErrorMsg('Google authentication failed on server. Please try again.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to authenticate with Google.');
    } finally {
      setLoading(false);
    }
  };

  // Initialize and Render Google Identity Services Button
  useEffect(() => {
    if (!isOpen) return;

    const clientId = getGoogleClientId();

    const renderGoogleButton = () => {
      if (window.google?.accounts?.id && googleBtnContainerRef.current) {
        try {
          googleBtnContainerRef.current.innerHTML = '';
          window.google.accounts.id.initialize({
            client_id: clientId || '104820491823-fake-placeholder.apps.googleusercontent.com',
            callback: (response: any) => handleGoogleCredentialResponse(response, portalType),
            auto_select: false,
          });

          window.google.accounts.id.renderButton(googleBtnContainerRef.current, {
            type: 'standard',
            theme: 'outline',
            size: 'large',
            text: portalType === 'admin' ? 'continue_with' : 'signin_with',
            shape: 'rectangular',
            width: 280,
          });
        } catch (err) {
          console.error('Failed to initialize Google Sign-In button:', err);
        }
      }
    };

    if (window.google?.accounts?.id) {
      renderGoogleButton();
    } else {
      const existingScript = document.getElementById('google-gsi-script');
      if (!existingScript) {
        const script = document.createElement('script');
        script.id = 'google-gsi-script';
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = renderGoogleButton;
        script.onerror = () => {
          console.error('Failed to load Google Identity Services library.');
        };
        document.body.appendChild(script);
      } else {
        existingScript.addEventListener('load', renderGoogleButton);
      }
    }
  }, [isOpen, portalType]);

  const handleManualGoogleClick = () => {
    setErrorMsg('');
    const clientId = getGoogleClientId();

    if (!clientId) {
      setErrorMsg('Google OAuth Client ID is not configured in environment variables.');
      return;
    }

    if (window.google?.accounts?.id) {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (response: any) => handleGoogleCredentialResponse(response, portalType),
      });

      window.google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed()) {
          const reason = notification.getNotDisplayedReason();
          if (reason === 'opt_out_or_bypassed' || reason === 'suppressed_by_user') {
            setErrorMsg('Google One Tap prompt was closed or suppressed by browser settings. Please click the Google Sign-In button above.');
          } else {
            setErrorMsg(`Google prompt unavailable (${reason || 'popup blocked'}). Please use the Google button or email/password.`);
          }
        } else if (notification.isSkippedMoment()) {
          setErrorMsg('Google authentication prompt was dismissed. Please click the button to try again.');
        }
      });
    } else {
      setErrorMsg('Google authentication library is loading or blocked by browser extensions.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    const cleanEmail = email.trim().toLowerCase();

    try {
      if (portalType === 'admin') {
        if (!cleanEmail || !password) {
          setErrorMsg('Admin email and password are required.');
          setLoading(false);
          return;
        }

        const res = await api.login(cleanEmail, password, 'admin');
        if (res.success && res.user) {
          if (res.user.role !== 'admin') {
            setErrorMsg('Access Denied: You do not have administrator permissions.');
            setLoading(false);
            return;
          }
          onLoginSuccess(res.user);
          onClose();
        }
      } else {
        // Client Portal
        if (isRegisterMode) {
          if (!name.trim() || !cleanEmail || !password) {
            setErrorMsg('Please complete all required registration fields.');
            setLoading(false);
            return;
          }
          if (password.length < 6) {
            setErrorMsg('Password must be at least 6 characters.');
            setLoading(false);
            return;
          }

          const res = await api.register(name.trim(), cleanEmail, password, phone.trim());
          if (res.success && res.user) {
            onLoginSuccess(res.user);
            onClose();
          }
        } else {
          if (!cleanEmail || !password) {
            setErrorMsg('Please enter your email and password.');
            setLoading(false);
            return;
          }

          const res = await api.login(cleanEmail, password, 'client');
          if (res.success && res.user) {
            onLoginSuccess(res.user);
            onClose();
          }
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication error. Please check your details and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-gradient-to-b from-[#2D040E] to-[#420614] rounded-3xl border border-[#D4AF37]/30 shadow-2xl p-6 sm:p-8 text-white overflow-hidden">
        {/* Decorative Gold Glow Accent */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#D4AF37]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-[#E91E63]/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Title */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-tr from-[#B8860B] via-[#F3E5AB] to-[#D4AF37] p-[2px] mb-3 shadow-lg">
            <div className="w-full h-full rounded-full overflow-hidden bg-[#2D040E] flex items-center justify-center border border-white/20">
              <img src={logoImg} alt="Pearl & Polishh Atelier Logo" className="w-full h-full object-cover" />
            </div>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-wide">
            {portalType === 'admin' ? 'Studio Management Portal' : isRegisterMode ? 'Join Pearl & Polishh' : 'Client Atelier Login'}
          </h2>
          <p className="text-xs text-[#FFF3F6]/80 mt-1">
            {portalType === 'admin'
              ? 'Secure, role-verified administrative access'
              : isRegisterMode
              ? 'Create your account for bespoke orders & appointment tracking'
              : 'Sign in to access your custom orders & saved nail sizes'}
          </p>
        </div>

        {/* Portal Switcher Tabs */}
        <div className="flex bg-[#200209] p-1 rounded-xl border border-white/10 mb-6">
          <button
            type="button"
            onClick={() => {
              setPortalType('client');
              setErrorMsg('');
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
              portalType === 'client' ? 'bg-[#E91E63] text-white shadow-md' : 'text-white/60 hover:text-white'
            }`}
          >
            <User className="w-3.5 h-3.5" /> Client Access
          </button>
          <button
            type="button"
            onClick={() => {
              setPortalType('admin');
              setErrorMsg('');
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
              portalType === 'admin' ? 'bg-[#D4AF37] text-[#2D040E] shadow-md' : 'text-white/60 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" /> Admin Portal
          </button>
        </div>

        {/* Error Message */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-200 text-xs flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {portalType === 'client' && isRegisterMode && (
            <>
              <div>
                <label className="block text-xs font-medium text-[#D4AF37] mb-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 w-4 h-4 text-white/40" />
                  <input
                    type="text"
                    required
                    placeholder="Ananya Sharma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-white/10 border border-white/20 rounded-xl text-xs text-white placeholder-white/40 focus:ring-2 focus:ring-[#E91E63] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#D4AF37] mb-1">Phone Number (WhatsApp)</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 w-4 h-4 text-white/40" />
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-white/10 border border-white/20 rounded-xl text-xs text-white placeholder-white/40 focus:ring-2 focus:ring-[#E91E63] outline-none"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-medium text-[#D4AF37] mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 w-4 h-4 text-white/40" />
              <input
                type="email"
                required
                placeholder={portalType === 'admin' ? 'admin@studio.com' : 'client@example.com'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white/10 border border-white/20 rounded-xl text-xs text-white placeholder-white/40 focus:ring-2 focus:ring-[#E91E63] outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#D4AF37] mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 w-4 h-4 text-white/40" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white/10 border border-white/20 rounded-xl text-xs text-white placeholder-white/40 focus:ring-2 focus:ring-[#E91E63] outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-2 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#B8860B] text-[#2D040E] font-bold text-xs uppercase tracking-wider hover:opacity-95 transition-opacity flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin text-[#2D040E]" />
            ) : (
              <>
                {portalType === 'admin'
                  ? 'Verify & Enter Admin Portal'
                  : isRegisterMode
                  ? 'Create Atelier Account'
                  : 'Sign In'}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>


        {/* Toggle Mode for Clients */}
        {portalType === 'client' && (
          <div className="mt-6 text-center text-xs text-white/60">
            {isRegisterMode ? (
              <p>
                Already have an account?{' '}
                <button
                  onClick={() => {
                    setIsRegisterMode(false);
                    setErrorMsg('');
                  }}
                  className="text-[#D4AF37] font-bold underline hover:text-white"
                >
                  Sign In
                </button>
              </p>
            ) : (
              <p>
                New to Pearl & Polishh?{' '}
                <button
                  onClick={() => {
                    setIsRegisterMode(true);
                    setErrorMsg('');
                  }}
                  className="text-[#D4AF37] font-bold underline hover:text-white"
                >
                  Register Account
                </button>
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
