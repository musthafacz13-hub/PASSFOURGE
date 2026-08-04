'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  MoreVertical, 
  Eye, 
  EyeOff, 
  Copy, 
  Check, 
  Sparkles, 
  Sliders, 
  ExternalLink, 
  X,
  Sun,
  Moon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// ==========================================
// PASSWORD CRYPTOGRAPHIC ENGINE & ANALYSIS
// ==========================================

interface GeneratorOptions {
  length: number;
  useUpper: boolean;
  useLower: boolean;
  useNumbers: boolean;
  useSymbols: boolean;
}

interface SecurityAnalysis {
  strength: 'Weak' | 'Moderate' | 'Strong' | 'Very Strong';
  crackTime: string;
  entropyBits: number;
}

function generateSecurePassword(options: GeneratorOptions): string {
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lower = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';

  let charPool = '';
  if (options.useUpper) charPool += upper;
  if (options.useLower) charPool += lower;
  if (options.useNumbers) charPool += numbers;
  if (options.useSymbols) charPool += symbols;

  if (!charPool) charPool = lower + numbers; // fallback

  // Ensure at least one character from each selected set
  const requiredChars: string[] = [];
  if (options.useUpper) requiredChars.push(upper[Math.floor(Math.random() * upper.length)]);
  if (options.useLower) requiredChars.push(lower[Math.floor(Math.random() * lower.length)]);
  if (options.useNumbers) requiredChars.push(numbers[Math.floor(Math.random() * numbers.length)]);
  if (options.useSymbols) requiredChars.push(symbols[Math.floor(Math.random() * symbols.length)]);

  const result: string[] = [...requiredChars];

  // Fill remaining length
  while (result.length < options.length) {
    const randomIndex = Math.floor(Math.random() * charPool.length);
    result.push(charPool[randomIndex]);
  }

  // Shuffle array using Fisher-Yates
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result.slice(0, options.length).join('');
}

function analyzePasswordSecurity(password: string): SecurityAnalysis {
  if (!password) {
    return {
      strength: 'Weak',
      crackTime: 'Instant',
      entropyBits: 0,
    };
  }

  let poolSize = 0;
  if (/[a-z]/.test(password)) poolSize += 26;
  if (/[A-Z]/.test(password)) poolSize += 26;
  if (/[0-9]/.test(password)) poolSize += 10;
  if (/[^a-zA-Z0-9]/.test(password)) poolSize += 32;

  if (poolSize === 0) poolSize = 26;

  const entropy = password.length * Math.log2(poolSize);
  const guessesPerSecond = 1e11; // 100 billion guesses/sec
  const combinations = Math.pow(2, entropy);
  const secondsToCrack = combinations / guessesPerSecond;

  let crackTime = '';
  if (secondsToCrack < 1) {
    crackTime = 'Instant';
  } else if (secondsToCrack < 60) {
    crackTime = `${Math.round(secondsToCrack)} Seconds`;
  } else if (secondsToCrack < 3600) {
    crackTime = `${Math.round(secondsToCrack / 60)} Minutes`;
  } else if (secondsToCrack < 86400) {
    crackTime = `${Math.round(secondsToCrack / 3600)} Hours`;
  } else if (secondsToCrack < 31536000) {
    crackTime = `${Math.round(secondsToCrack / 86400)} Days`;
  } else if (secondsToCrack < 31536000000) {
    crackTime = `${Math.round(secondsToCrack / 31536000)} Years`;
  } else if (secondsToCrack < 3153600000000) {
    crackTime = `${Math.round(secondsToCrack / 31536000000)} Centuries`;
  } else {
    crackTime = 'Millions of Years';
  }

  let strength: 'Weak' | 'Moderate' | 'Strong' | 'Very Strong' = 'Weak';
  if (entropy >= 80) {
    strength = 'Very Strong';
  } else if (entropy >= 55) {
    strength = 'Strong';
  } else if (entropy >= 35) {
    strength = 'Moderate';
  }

  return {
    strength,
    crackTime,
    entropyBits: Math.round(entropy),
  };
}

const ALL_CHARS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';

export default function PassForgeApp() {
  // Options state
  const [options, setOptions] = useState<GeneratorOptions>({
    length: 16,
    useUpper: true,
    useLower: true,
    useNumbers: true,
    useSymbols: true,
  });

  // Password states
  const [actualPassword, setActualPassword] = useState<string>('');
  const [displayedPassword, setDisplayedPassword] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(true);
  const [showCustomize, setShowCustomize] = useState<boolean>(false);

  // Copy toast state
  const [showToast, setShowToast] = useState<boolean>(false);

  // Navigation menu & modal states
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [activeModal, setActiveModal] = useState<'about' | 'why' | 'privacy' | 'developer' | null>(null);

  // Theme state
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Animation timer ref
  const animIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Screen reader announcement
  const [srAnnouncement, setSrAnnouncement] = useState<string>('');

  // Initial Theme Setup & Hydration-safe initial generation
  useEffect(() => {
    const savedTheme = localStorage.getItem('passforge_theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme === 'dark' || (!savedTheme && prefersDark) ? 'dark' : 'light';
    
    if (initialTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    const timer = setTimeout(() => {
      setTheme(initialTheme);
      const initPwd = generateSecurePassword({
        length: 16,
        useUpper: true,
        useLower: true,
        useNumbers: true,
        useSymbols: true,
      });
      setActualPassword(initPwd);
      setDisplayedPassword(initPwd);
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  const toggleTheme = () => {
    setTheme((prevTheme) => {
      const nextTheme = prevTheme === 'light' ? 'dark' : 'light';
      localStorage.setItem('passforge_theme', nextTheme);
      if (nextTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return nextTheme;
    });
  };

  // Close overflow menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard navigation for escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMenuOpen(false);
        setActiveModal(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Premium 1.5s Rolling / Shuffle Password Generation Animation
  const handleGeneratePassword = (customOptions?: GeneratorOptions) => {
    if (isGenerating) return;

    const opts = customOptions || options;
    const targetPwd = generateSecurePassword(opts);
    setIsGenerating(true);

    if (animIntervalRef.current) {
      clearInterval(animIntervalRef.current);
    }

    const durationMs = 1600;
    const intervalMs = 40;
    const totalSteps = Math.floor(durationMs / intervalMs);
    let currentStep = 0;

    animIntervalRef.current = setInterval(() => {
      currentStep++;
      const progress = currentStep / totalSteps; // 0 to 1
      const settledCount = Math.floor(progress * targetPwd.length);

      let animString = '';
      for (let i = 0; i < targetPwd.length; i++) {
        if (i < settledCount) {
          animString += targetPwd[i];
        } else {
          // Random character from pool
          const randChar = ALL_CHARS[Math.floor(Math.random() * ALL_CHARS.length)];
          animString += randChar;
        }
      }

      setDisplayedPassword(animString);

      if (currentStep >= totalSteps) {
        if (animIntervalRef.current) clearInterval(animIntervalRef.current);
        setActualPassword(targetPwd);
        setDisplayedPassword(targetPwd);
        setIsGenerating(false);
        setSrAnnouncement('New password generated');
        setTimeout(() => setSrAnnouncement(''), 2000);
      }
    }, intervalMs);
  };

  const handleOptionChange = (key: keyof GeneratorOptions, value: number | boolean) => {
    const newOpts = { ...options, [key]: value };
    // Ensure at least one set is checked
    if (!newOpts.useUpper && !newOpts.useLower && !newOpts.useNumbers && !newOpts.useSymbols) {
      return;
    }
    setOptions(newOpts);
    handleGeneratePassword(newOpts);
  };

  const handleCopyPassword = () => {
    if (!actualPassword) return;
    navigator.clipboard.writeText(actualPassword);
    setShowToast(true);
    setSrAnnouncement('Password copied to clipboard');
    setTimeout(() => {
      setShowToast(false);
      setSrAnnouncement('');
    }, 2000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setActualPassword(val);
    setDisplayedPassword(val);
  };

  const securityAnalysis = analyzePasswordSecurity(actualPassword);

  return (
    <main className="min-h-screen bg-[#FFFFFF] dark:bg-[#0B0B0C] text-[#111111] dark:text-[#F3F3F4] font-sans antialiased transition-colors duration-200 selection:bg-zinc-200 dark:selection:bg-zinc-800 flex flex-col justify-between">
      
      {/* Accessibility Announcement */}
      <div className="sr-only" aria-live="polite">
        {srAnnouncement}
      </div>

      {/* Main Container */}
      <div className="max-w-[620px] w-full mx-auto px-5 py-10 sm:py-16 flex flex-col gap-10">
        
        {/* ==========================================
            TOP NAVIGATION
           ========================================== */}
        <header className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-xl font-semibold tracking-tight text-[#111111] dark:text-[#FFFFFF]">
              PassForge
            </h1>
            <p className="text-xs sm:text-sm text-[#6B7280] dark:text-[#9CA3AF] font-normal">
              Generate secure passwords instantly.
            </p>
          </div>

          <div className="flex items-center gap-1.5 pt-0.5">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-[#6B7280] hover:text-[#111111] dark:text-[#9CA3AF] dark:hover:text-[#FFFFFF] hover:bg-[#F7F7F8] dark:hover:bg-[#18181B] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-100"
              aria-label="Toggle dark and light theme"
              title="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </button>

            {/* Overflow Menu */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setIsMenuOpen(prev => !prev)}
                aria-expanded={isMenuOpen}
                aria-haspopup="true"
                aria-label="Options menu"
                className="p-2 rounded-xl text-[#6B7280] hover:text-[#111111] dark:text-[#9CA3AF] dark:hover:text-[#FFFFFF] hover:bg-[#F7F7F8] dark:hover:bg-[#18181B] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-100"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              <AnimatePresence>
                {isMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.96, y: -6 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96, y: -6 }}
                    transition={{ duration: 0.15, ease: 'easeOut' }}
                    className="absolute right-0 mt-2 w-44 bg-[#FFFFFF] dark:bg-[#141416] border border-[#E5E7EB] dark:border-[#27272A] rounded-[18px] shadow-lg p-1.5 z-50 flex flex-col gap-0.5"
                  >
                    <button
                      onClick={() => { setActiveModal('about'); setIsMenuOpen(false); }}
                      className="w-full text-left px-3 py-2 text-xs font-medium text-[#111111] dark:text-[#E4E4E7] hover:bg-[#F7F7F8] dark:hover:bg-[#202023] rounded-xl transition-colors focus-visible:outline-none"
                    >
                      About
                    </button>
                    <button
                      onClick={() => { setActiveModal('why'); setIsMenuOpen(false); }}
                      className="w-full text-left px-3 py-2 text-xs font-medium text-[#111111] dark:text-[#E4E4E7] hover:bg-[#F7F7F8] dark:hover:bg-[#202023] rounded-xl transition-colors focus-visible:outline-none"
                    >
                      Why this App
                    </button>
                    <button
                      onClick={() => { setActiveModal('privacy'); setIsMenuOpen(false); }}
                      className="w-full text-left px-3 py-2 text-xs font-medium text-[#111111] dark:text-[#E4E4E7] hover:bg-[#F7F7F8] dark:hover:bg-[#202023] rounded-xl transition-colors focus-visible:outline-none"
                    >
                      Privacy
                    </button>
                    <button
                      onClick={() => { setActiveModal('developer'); setIsMenuOpen(false); }}
                      className="w-full text-left px-3 py-2 text-xs font-medium text-[#111111] dark:text-[#E4E4E7] hover:bg-[#F7F7F8] dark:hover:bg-[#202023] rounded-xl transition-colors focus-visible:outline-none"
                    >
                      Developer
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* ==========================================
            SECTION 1: PASSWORD FIELD & GENERATOR
           ========================================== */}
        <section className="flex flex-col gap-4">
          <div className="bg-[#F7F7F8] dark:bg-[#141416] border border-[#E5E7EB] dark:border-[#27272A] rounded-[18px] p-5 sm:p-6 flex flex-col gap-4 transition-colors">
            
            <div className="flex items-center justify-between">
              <label htmlFor="password-input" className="text-xs font-medium text-[#6B7280] dark:text-[#9CA3AF] uppercase tracking-wider">
                Password
              </label>

              <button
                type="button"
                onClick={() => setShowCustomize(prev => !prev)}
                className="text-xs text-[#6B7280] hover:text-[#111111] dark:text-[#9CA3AF] dark:hover:text-[#FFFFFF] flex items-center gap-1.5 transition-colors focus-visible:outline-none"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>{showCustomize ? 'Hide Settings' : 'Customize'}</span>
              </button>
            </div>

            {/* Input display field */}
            <div className="relative flex items-center">
              <input
                id="password-input"
                type={showPassword ? 'text' : 'password'}
                value={displayedPassword}
                onChange={handleInputChange}
                disabled={isGenerating}
                placeholder="Click generate to create password..."
                className={`w-full bg-[#FFFFFF] dark:bg-[#0B0B0C] border border-[#E5E7EB] dark:border-[#27272A] text-[#111111] dark:text-[#FFFFFF] text-base font-mono rounded-xl pl-4 pr-24 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#111111] dark:focus:ring-[#FFFFFF] transition-all duration-150 ${
                  isGenerating ? 'blur-[0.5px] opacity-90 selection:bg-transparent' : ''
                }`}
                autoComplete="off"
                suppressHydrationWarning
              />

              <div className="absolute right-2 flex items-center gap-1">
                {/* Toggle Eye */}
                <button
                  type="button"
                  onClick={() => setShowPassword(prev => !prev)}
                  className="p-2 text-[#6B7280] hover:text-[#111111] dark:text-[#9CA3AF] dark:hover:text-[#FFFFFF] rounded-lg hover:bg-[#F7F7F8] dark:hover:bg-[#18181B] transition-colors focus-visible:outline-none"
                  aria-label={showPassword ? 'Hide password text' : 'Show password text'}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>

                {/* Copy Button */}
                <button
                  type="button"
                  onClick={handleCopyPassword}
                  className="p-2 text-[#6B7280] hover:text-[#111111] dark:text-[#9CA3AF] dark:hover:text-[#FFFFFF] rounded-lg hover:bg-[#F7F7F8] dark:hover:bg-[#18181B] transition-colors focus-visible:outline-none"
                  aria-label="Copy password to clipboard"
                  title="Copy password"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Customizable Settings Panel */}
            <AnimatePresence>
              {showCustomize && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2, ease: 'easeInOut' }}
                  className="overflow-hidden border-t border-[#E5E7EB] dark:border-[#27272A] pt-4 flex flex-col gap-4"
                >
                  {/* Length slider */}
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between text-xs text-[#6B7280] dark:text-[#9CA3AF]">
                      <span>Length</span>
                      <span className="font-mono text-[#111111] dark:text-[#FFFFFF] font-medium">{options.length} characters</span>
                    </div>
                    <input
                      type="range"
                      min={8}
                      max={64}
                      value={options.length}
                      onChange={(e) => handleOptionChange('length', parseInt(e.target.value))}
                      className="w-full accent-[#111111] dark:accent-[#FFFFFF] h-1.5 bg-[#E5E7EB] dark:bg-[#27272A] rounded-lg cursor-pointer"
                    />
                  </div>

                  {/* Character Sets Toggles */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <label className="flex items-center gap-2 text-[#111111] dark:text-[#E4E4E7] cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={options.useUpper}
                        onChange={(e) => handleOptionChange('useUpper', e.target.checked)}
                        className="rounded border-[#E5E7EB] dark:border-[#27272A] accent-[#111111] dark:accent-[#FFFFFF] w-4 h-4"
                      />
                      <span>Uppercase (A-Z)</span>
                    </label>

                    <label className="flex items-center gap-2 text-[#111111] dark:text-[#E4E4E7] cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={options.useLower}
                        onChange={(e) => handleOptionChange('useLower', e.target.checked)}
                        className="rounded border-[#E5E7EB] dark:border-[#27272A] accent-[#111111] dark:accent-[#FFFFFF] w-4 h-4"
                      />
                      <span>Lowercase (a-z)</span>
                    </label>

                    <label className="flex items-center gap-2 text-[#111111] dark:text-[#E4E4E7] cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={options.useNumbers}
                        onChange={(e) => handleOptionChange('useNumbers', e.target.checked)}
                        className="rounded border-[#E5E7EB] dark:border-[#27272A] accent-[#111111] dark:accent-[#FFFFFF] w-4 h-4"
                      />
                      <span>Numbers (0-9)</span>
                    </label>

                    <label className="flex items-center gap-2 text-[#111111] dark:text-[#E4E4E7] cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={options.useSymbols}
                        onChange={(e) => handleOptionChange('useSymbols', e.target.checked)}
                        className="rounded border-[#E5E7EB] dark:border-[#27272A] accent-[#111111] dark:accent-[#FFFFFF] w-4 h-4"
                      />
                      <span>Symbols (!@#$)</span>
                    </label>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Large Primary Generate Button */}
            <motion.button
              type="button"
              whileTap={{ scale: 0.985 }}
              onClick={() => handleGeneratePassword()}
              disabled={isGenerating}
              className="w-full bg-[#111111] hover:bg-[#222222] dark:bg-[#FFFFFF] dark:hover:bg-[#E4E4E7] text-[#FFFFFF] dark:text-[#111111] font-medium text-sm py-3.5 rounded-xl transition-all duration-150 flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111111] dark:focus-visible:ring-[#FFFFFF] shadow-sm disabled:opacity-80"
            >
              <Sparkles className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
              <span>{isGenerating ? 'Generating Password...' : 'Generate Password'}</span>
            </motion.button>

          </div>
        </section>

        {/* ==========================================
            SECTION 2: PASSWORD SECURITY
           ========================================== */}
        <section className="bg-[#F7F7F8] dark:bg-[#141416] border border-[#E5E7EB] dark:border-[#27272A] rounded-[18px] p-5 sm:p-6 flex flex-col gap-4 transition-colors">
          <h2 className="text-xs font-medium text-[#6B7280] dark:text-[#9CA3AF] uppercase tracking-wider">
            Password Security
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div className="flex flex-col gap-1 border-b sm:border-b-0 sm:border-r border-[#E5E7EB] dark:border-[#27272A] pb-3 sm:pb-0 sm:pr-4">
              <span className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">Strength</span>
              <span className="text-lg font-medium text-[#111111] dark:text-[#FFFFFF] tracking-tight">
                {securityAnalysis.strength}
              </span>
            </div>

            <div className="flex flex-col gap-1 sm:pl-2">
              <span className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">Estimated Crack Time</span>
              <span className="text-lg font-medium text-[#111111] dark:text-[#FFFFFF] tracking-tight font-mono">
                {securityAnalysis.crackTime}
              </span>
            </div>
          </div>
        </section>

        {/* ==========================================
            SECTION 3: SECURITY INSIGHTS
           ========================================== */}
        <section className="bg-[#F7F7F8] dark:bg-[#141416] border border-[#E5E7EB] dark:border-[#27272A] rounded-[18px] p-5 sm:p-6 flex flex-col gap-4 transition-colors">
          <h2 className="text-xs font-medium text-[#6B7280] dark:text-[#9CA3AF] uppercase tracking-wider">
            Security Insights
          </h2>

          <div className="flex flex-col gap-2.5 text-xs text-[#6B7280] dark:text-[#9CA3AF] leading-relaxed pt-1">
            <div className="flex items-start gap-2.5">
              <span className="text-[#111111] dark:text-[#FFFFFF] shrink-0 font-medium">✓</span>
              <span>Longer passwords dramatically increase security.</span>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="text-[#111111] dark:text-[#FFFFFF] shrink-0 font-medium">✓</span>
              <span>Symbols and numbers improve password entropy.</span>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="text-[#111111] dark:text-[#FFFFFF] shrink-0 font-medium">✓</span>
              <span>Avoid using personal information.</span>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="text-[#111111] dark:text-[#FFFFFF] shrink-0 font-medium">✓</span>
              <span>Every generated password is unique.</span>
            </div>
          </div>
        </section>

        {/* Subtle Product Branding Footer */}
        <footer className="text-center text-[11px] uppercase tracking-[0.2em] text-[#6B7280] dark:text-[#6B7280] py-12 sm:py-16">
          DEVELOPED BY{' '}
          <a
            href="https://muhammad-musthafa-web-dev-portfolio.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#111111] dark:hover:text-[#FFFFFF] transition-colors focus-visible:outline-none focus-visible:underline"
          >
            MUSTHAFA
          </a>
        </footer>

      </div>

      {/* ==========================================
          FLOATING COPY TOAST
         ========================================== */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-[#111111] dark:bg-[#FFFFFF] text-[#FFFFFF] dark:text-[#111111] px-4 py-2.5 rounded-full text-xs font-medium shadow-xl flex items-center gap-2"
          >
            <Check className="w-3.5 h-3.5" />
            <span>✓ Password Copied</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ==========================================
          MODALS / DIALOGS
         ========================================== */}
      <AnimatePresence>
        {activeModal && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 dark:bg-black/60 backdrop-blur-sm"
            onClick={() => setActiveModal(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              className="w-full max-w-md bg-[#FFFFFF] dark:bg-[#141416] border border-[#E5E7EB] dark:border-[#27272A] rounded-[24px] p-6 sm:p-7 shadow-2xl flex flex-col gap-5 relative"
            >
              {/* Close Button */}
              <button
                onClick={() => setActiveModal(null)}
                aria-label="Close dialog"
                className="absolute top-5 right-5 text-[#6B7280] hover:text-[#111111] dark:text-[#9CA3AF] dark:hover:text-[#FFFFFF] p-1.5 rounded-full hover:bg-[#F7F7F8] dark:hover:bg-[#18181B] transition-colors focus-visible:outline-none"
              >
                <X className="w-4 h-4" />
              </button>

              {/* ABOUT MODAL */}
              {activeModal === 'about' && (
                <div className="flex flex-col gap-3">
                  <h2 className="text-base font-semibold text-[#111111] dark:text-[#FFFFFF]">
                    About PassForge
                  </h2>
                  <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] leading-relaxed">
                    PassForge is a modern password generator that creates strong, unique, and secure passwords in seconds. Everything is designed to be simple, fast, and privacy-friendly.
                  </p>
                </div>
              )}

              {/* WHY THIS APP MODAL */}
              {activeModal === 'why' && (
                <div className="flex flex-col gap-3">
                  <h2 className="text-base font-semibold text-[#111111] dark:text-[#FFFFFF]">
                    Why this App
                  </h2>
                  <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] leading-relaxed">
                    Weak passwords are one of the most common reasons accounts become compromised.
                  </p>
                  <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] leading-relaxed">
                    PassForge helps users instantly generate strong passwords that are significantly harder to crack while keeping the experience clean, fast, and effortless.
                  </p>
                  <div className="bg-[#F7F7F8] dark:bg-[#1C1C1F] border border-[#E5E7EB] dark:border-[#27272A] p-3.5 rounded-xl text-xs text-[#111111] dark:text-[#FFFFFF] font-medium leading-relaxed mt-1">
                    &quot;Passwords are generated entirely on your device and are never stored or transmitted.&quot;
                  </div>
                </div>
              )}

              {/* PRIVACY MODAL */}
              {activeModal === 'privacy' && (
                <div className="flex flex-col gap-3">
                  <h2 className="text-base font-semibold text-[#111111] dark:text-[#FFFFFF]">
                    Privacy First
                  </h2>
                  <div className="flex flex-col gap-2 text-xs text-[#6B7280] dark:text-[#9CA3AF] pt-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[#111111] dark:text-[#FFFFFF] font-semibold">•</span>
                      <span>No account required.</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[#111111] dark:text-[#FFFFFF] font-semibold">•</span>
                      <span>No password storage.</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[#111111] dark:text-[#FFFFFF] font-semibold">•</span>
                      <span>No tracking of generated passwords.</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[#111111] dark:text-[#FFFFFF] font-semibold">•</span>
                      <span>Password generation happens locally.</span>
                    </div>
                    <div className="flex items-center gap-2 font-medium text-[#111111] dark:text-[#FFFFFF] pt-1">
                      <span className="text-[#111111] dark:text-[#FFFFFF] font-semibold">•</span>
                      <span>Your privacy comes first.</span>
                    </div>
                  </div>
                </div>
              )}

              {/* DEVELOPER MODAL */}
              {activeModal === 'developer' && (
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-[11px] uppercase tracking-wider text-[#6B7280] dark:text-[#9CA3AF]">
                      Designed & Developed by
                    </span>
                    <h2 className="text-lg font-semibold text-[#111111] dark:text-[#FFFFFF]">
                      Muhammad Musthafa
                    </h2>
                    <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] pt-0.5">
                      UI/UX Designer • Frontend Developer • Cybersecurity Learner
                    </p>
                  </div>

                  <a
                    href="https://muhammad-musthafa-web-dev-portfolio.vercel.app/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-[#111111] hover:bg-[#222222] dark:bg-[#FFFFFF] dark:hover:bg-[#E4E4E7] text-[#FFFFFF] dark:text-[#111111] text-xs font-medium py-3 rounded-xl transition-colors flex items-center justify-center gap-2 focus-visible:outline-none"
                  >
                    <span>View Portfolio</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] text-center pt-1">
                    Thank you for using PassForge.
                  </p>
                </div>
              )}

              {/* Close Action Button */}
              <button
                onClick={() => setActiveModal(null)}
                className="w-full bg-[#F7F7F8] dark:bg-[#1C1C1F] hover:bg-[#E5E7EB] dark:hover:bg-[#27272A] text-[#111111] dark:text-[#FFFFFF] text-xs font-medium py-2.5 rounded-xl transition-colors focus-visible:outline-none mt-1"
              >
                Close
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </main>
  );
}
