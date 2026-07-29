'use client';

import React from 'react';
import { Eye, EyeOff, Copy, RefreshCw, Check } from 'lucide-react';

// ==========================================
// COMPACT DYNAMIC CRYPTOGRAPHIC ENGINES
// ==========================================

interface AnalysisResult {
  strength: 'Very Weak' | 'Weak' | 'Medium' | 'Strong' | 'Very Strong';
  crackTime: string;
  explanation: string;
}

/**
 * Calculates local Shannon-inspired password entropy and brute-force resistance.
 */
function analyzePassword(password: string): AnalysisResult {
  if (!password) {
    return {
      strength: 'Very Weak',
      crackTime: 'Instantly',
      explanation: 'Type your current password to begin the security analysis.',
    };
  }

  const len = password.length;
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSymbol = /[^a-zA-Z0-9]/.test(password);

  // Pool size calculation
  let poolSize = 0;
  if (hasLower) poolSize += 26;
  if (hasUpper) poolSize += 26;
  if (hasNumber) poolSize += 10;
  if (hasSymbol) poolSize += 32;

  // Standard pool-based entropy
  const log2Pool = poolSize > 0 ? Math.log(poolSize) / Math.log(2) : 0;
  const baseEntropy = len * log2Pool;

  // Uniqueness discount to prevent repetitions
  const uniqueChars = new Set(password).size;
  const uniquenessRatio = len > 0 ? uniqueChars / len : 0;

  // Consecutive identical character penalty
  let consecutives = 0;
  for (let i = 0; i < len - 1; i++) {
    if (password[i] === password[i + 1]) {
      consecutives++;
    }
  }

  // Adjust entropy based on characteristics
  let entropy = baseEntropy;
  if (len > 1) {
    const uniqueFactor = 0.35 + 0.65 * uniquenessRatio;
    const consecPenalty = Math.max(0.6, 1.0 - (consecutives / len) * 0.5);
    entropy = baseEntropy * uniqueFactor * consecPenalty;
  }

  entropy = Math.max(0, entropy);

  // Check for common vulnerable credentials
  const commonPasswords = [
    'password', 'qwerty', '123456', '12345678', '123456789', '12345', 
    '1234567', 'welcome', 'letmein', 'monkey', 'dragon', 'admin'
  ];
  const lowerPwd = password.toLowerCase();
  const isCommon = commonPasswords.some(common => lowerPwd.includes(common));
  if (isCommon) {
    entropy = Math.min(entropy, 15);
  }

  // Categories & Scores mapping
  let strength: 'Very Weak' | 'Weak' | 'Medium' | 'Strong' | 'Very Strong' = 'Very Weak';

  if (entropy >= 75 && len >= 12) {
    strength = 'Very Strong';
  } else if (entropy >= 50 && len >= 9) {
    strength = 'Strong';
  } else if (entropy >= 30 && len >= 7) {
    strength = 'Medium';
  } else if (entropy >= 12 && len >= 5) {
    strength = 'Weak';
  } else {
    strength = 'Very Weak';
  }

  // Attacker guesses-per-second capability profile (consumer/advanced GPU rig)
  const guessesPerSecond = 1e10; 
  const searchSpace = Math.pow(2, entropy);
  const secondsToCrack = searchSpace / guessesPerSecond;

  let crackTime = '';

  const SEC_MINUTE = 60;
  const SEC_HOUR = 3600;
  const SEC_DAY = 86400;
  const SEC_MONTH = 86400 * 30;
  const SEC_YEAR = 86400 * 365;

  if (secondsToCrack < 1) {
    crackTime = 'Instantly';
  } else if (secondsToCrack < SEC_MINUTE) {
    crackTime = 'Instantly';
  } else if (secondsToCrack < SEC_HOUR) {
    crackTime = 'Minutes';
  } else if (secondsToCrack < SEC_DAY) {
    crackTime = 'Hours';
  } else if (secondsToCrack < SEC_MONTH) {
    crackTime = 'Days';
  } else if (secondsToCrack < SEC_YEAR) {
    crackTime = 'Months';
  } else if (secondsToCrack < 1000 * SEC_YEAR) {
    crackTime = 'Years';
  } else if (secondsToCrack < 1000000 * SEC_YEAR) {
    crackTime = 'Thousands of years';
  } else {
    crackTime = 'Millions of years';
  }

  // Premium short non-technical explanations
  let explanation = '';
  if (isCommon) {
    explanation = 'This is a widely recognized password easily guessed by standard automated scripts.';
  } else if (len < 6) {
    explanation = 'Your password is short and lacks variety of character sets.';
  } else if (uniquenessRatio < 0.45) {
    explanation = 'Character repetition makes this password predictable for targeted brute-forcing.';
  } else if (poolSize <= 26) {
    explanation = 'Using only a single character set makes this easy to calculate.';
  } else if (strength === 'Medium') {
    explanation = 'Fair strength, but vulnerable to advanced dictionary matching algorithms.';
  } else if (strength === 'Strong') {
    explanation = 'Excellent length and character diversity provide robust security.';
  } else if (strength === 'Very Strong') {
    explanation = 'Outstanding password length and high randomness guarantee ultimate protection.';
  } else {
    explanation = 'A short length and lack of unique character types reduce overall safety.';
  }

  return { strength, crackTime, explanation };
}

/**
 * Supercharges user's password, generating a much stronger version inspired by the original base.
 */
function generateStrongFromOriginal(original: string): string {
  if (!original) {
    // Generate a clean random 16 character strong password
    const lower = 'abcdefghijklmnopqrstuvwxyz';
    const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const nums = '0123456789';
    const syms = '!@#$%^&*()';
    const all = lower + upper + nums + syms;

    let pwd = '';
    // Seed with guaranteed character groups
    pwd += lower[Math.floor(Math.random() * lower.length)];
    pwd += upper[Math.floor(Math.random() * upper.length)];
    pwd += nums[Math.floor(Math.random() * nums.length)];
    pwd += syms[Math.floor(Math.random() * syms.length)];

    for (let i = 4; i < 16; i++) {
      pwd += all[Math.floor(Math.random() * all.length)];
    }
    return pwd.split('').sort(() => Math.random() - 0.5).join('');
  }

  const clean = original.trim().replace(/\s+/g, '');
  
  // Extract seed prefix
  const baseLength = Math.min(6, Math.max(3, Math.floor(clean.length / 2)));
  let prefix = clean.substring(0, baseLength);

  // Apply subtle predictable character transformations
  let stylized = '';
  const substitutions: Record<string, string> = {
    'a': '@', 'A': '@',
    'e': '3', 'E': '3',
    'i': '1', 'I': '1',
    'o': '0', 'O': '0',
    's': '$', 'S': '$',
    't': '7', 'T': '7'
  };

  for (let i = 0; i < prefix.length; i++) {
    const char = prefix[i];
    if (substitutions[char] && Math.random() < 0.6) {
      stylized += substitutions[char];
    } else {
      stylized += char;
    }
  }

  // Generate strong secondary entropy blocks
  const lower = 'abcdefghijklmnopqrstuvwxyz';
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const nums = '0123456789';
  const syms = '!@#$%^&*()';
  const all = lower + upper + nums + syms;

  let suffix = '';
  suffix += upper[Math.floor(Math.random() * upper.length)];
  suffix += nums[Math.floor(Math.random() * nums.length)];
  suffix += syms[Math.floor(Math.random() * syms.length)];

  const paddingLength = Math.max(8, 16 - stylized.length - 1);
  for (let i = 3; i < paddingLength; i++) {
    suffix += all[Math.floor(Math.random() * all.length)];
  }

  // Shuffle suffix block
  const shuffledSuffix = suffix.split('').sort(() => Math.random() - 0.5).join('');

  // Separator
  const separators = ['.', '_', '-', '#', '$'];
  const separator = separators[Math.floor(Math.random() * separators.length)];

  return `${stylized}${separator}${shuffledSuffix}`;
}

// ==========================================
// MAIN COMPONENT
// ==========================================

export default function Page() {
  const [currentPassword, setCurrentPassword] = React.useState<string>('');
  const [showPassword, setShowPassword] = React.useState<boolean>(false);
  const [suggestedPassword, setSuggestedPassword] = React.useState<string>('pK7_zR9q$Y2mNx5a');
  const [copiedCurrent, setCopiedCurrent] = React.useState<boolean>(false);
  const [copiedSuggested, setCopiedSuggested] = React.useState<boolean>(false);
  const [srAnnouncement, setSrAnnouncement] = React.useState<string>('');

  // Initialize unique suggested password on mount securely
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setSuggestedPassword(generateStrongFromOriginal(''));
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // Update suggested password automatically when current changes
  const handleCurrentPasswordChange = (val: string) => {
    setCurrentPassword(val);
    setSuggestedPassword(generateStrongFromOriginal(val));
    setCopiedCurrent(false);
  };

  // Handle generation of brand new suggested password
  const handleGenerateNew = () => {
    setSuggestedPassword(generateStrongFromOriginal(currentPassword));
    setCopiedSuggested(false);
    setSrAnnouncement('New suggested password generated');
    setTimeout(() => setSrAnnouncement(''), 3000);
  };

  // Perform calculations
  const analysis = React.useMemo(() => analyzePassword(currentPassword), [currentPassword]);
  const suggestedAnalysis = React.useMemo(() => {
    const res = analyzePassword(suggestedPassword);
    return {
      ...res,
      explanation: 'Longer length and a wider variety of characters make this password significantly stronger.'
    };
  }, [suggestedPassword]);

  // Copy password helper
  const handleCopyText = (text: string, isSuggested: boolean) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    if (isSuggested) {
      setCopiedSuggested(true);
      setSrAnnouncement('Suggested password copied to clipboard');
      setTimeout(() => {
        setCopiedSuggested(false);
        setSrAnnouncement('');
      }, 2000);
    } else {
      setCopiedCurrent(true);
      setSrAnnouncement('Current password copied to clipboard');
      setTimeout(() => {
        setCopiedCurrent(false);
        setSrAnnouncement('');
      }, 2000);
    }
  };

  // Modern subtle gray strength badges
  const getBadgeClass = (strength: string) => {
    switch (strength) {
      case 'Very Strong':
        return 'text-zinc-900 bg-zinc-50 border-zinc-300';
      case 'Strong':
        return 'text-zinc-800 bg-zinc-50 border-zinc-200';
      case 'Medium':
        return 'text-zinc-700 bg-zinc-50 border-zinc-200';
      case 'Weak':
        return 'text-zinc-600 bg-zinc-50/80 border-zinc-200/60';
      case 'Very Weak':
      default:
        return 'text-zinc-500 bg-zinc-50/60 border-zinc-200/40';
    }
  };

  return (
    <main className="min-h-screen bg-white text-zinc-900 flex flex-col items-center justify-center py-16 px-6 font-sans antialiased">
      {/* Screen Reader Live Announcement Area */}
      <div className="sr-only" aria-live="polite">
        {srAnnouncement}
      </div>

      <div className="max-w-[760px] w-full flex flex-col gap-12">
        
        {/* ==========================================
            PLATFORM HEADER
           ========================================== */}
        <header className="flex flex-col gap-2">
          <h1 className="text-xl font-medium tracking-tight text-zinc-900">
            PassForge
          </h1>
          <p className="text-sm text-zinc-500 leading-relaxed font-normal">
            A premium tool for password strength analysis and high-entropy key recommendations.
          </p>
        </header>

        {/* ==========================================
            MAIN CONTENT WORKSPACE (2-Column Grid)
           ========================================== */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          
          {/* LEFT SIDE: Current Password & Analysis */}
          <div className="flex flex-col gap-6">
            
            {/* SECTION 1: Current Password */}
            <div className="bg-white border border-[#ECECEC] rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
              <div className="flex justify-between items-center mb-4">
                <label htmlFor="input-pwd" className="text-[11px] font-medium text-zinc-500 uppercase tracking-widest">
                  Current Password
                </label>
              </div>

              <div className="relative flex items-center">
                <input
                  id="input-pwd"
                  type={showPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => handleCurrentPasswordChange(e.target.value)}
                  placeholder="Type your current password"
                  className="w-full bg-white border border-[#ECECEC] text-zinc-900 text-sm placeholder-zinc-400 font-mono rounded-lg pl-3 pr-20 py-2.5 focus:outline-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-900 focus-visible:border-zinc-900 transition-all duration-150"
                />
                
                <div className="absolute right-2 flex items-center gap-1">
                  {currentPassword && (
                    <button
                      type="button"
                      onClick={() => handleCopyText(currentPassword, false)}
                      className="text-[10px] font-medium text-zinc-500 hover:text-zinc-900 px-2 py-1 rounded hover:bg-zinc-50 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-900"
                    >
                      {copiedCurrent ? 'Copied' : 'Copy'}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowPassword(prev => !prev)}
                    className="text-zinc-400 hover:text-zinc-600 p-1.5 rounded-md hover:bg-zinc-50 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-900"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="w-3.5 h-3.5" />
                    ) : (
                      <Eye className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* SECTION 2: Password Analysis */}
            <div className="bg-white border border-[#ECECEC] rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.01)] flex flex-col gap-4">
              <h2 className="text-[11px] font-medium text-zinc-500 uppercase tracking-widest">
                Password Analysis
              </h2>
              
              <div className="grid grid-cols-2 gap-4 border-b border-zinc-100 pb-4">
                <div className="space-y-1">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">Strength</span>
                  <span className={`inline-flex items-center text-xs font-normal px-2.5 py-0.5 rounded-md border ${getBadgeClass(analysis.strength)}`}>
                    {analysis.strength}
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">Crack Time</span>
                  <span className="text-xs font-mono font-normal text-zinc-900">
                    {analysis.crackTime}
                  </span>
                </div>
              </div>

              <div className="text-xs text-zinc-500 leading-relaxed font-normal">
                {analysis.explanation}
              </div>
            </div>

          </div>

          {/* RIGHT SIDE: Suggested Password & Analysis */}
          <div className="flex flex-col gap-6">
            
            {/* SECTION 3: Suggested Password */}
            <div className="bg-white border border-[#ECECEC] rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-[11px] font-medium text-zinc-500 uppercase tracking-widest">
                  Suggested Password
                </h2>
              </div>

              <div className="flex flex-col gap-3">
                <div className="relative flex items-center bg-zinc-50/40 border border-[#ECECEC] rounded-lg p-3 min-h-[46px]">
                  <div className="font-mono text-sm text-zinc-800 tracking-wide break-all select-all pr-4">
                    {suggestedPassword}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={handleGenerateNew}
                    className="bg-white border border-[#ECECEC] hover:border-zinc-300 text-zinc-800 text-xs font-medium py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-900 focus-visible:border-zinc-900"
                  >
                    <RefreshCw className="w-3 h-3 text-zinc-400" />
                    <span>Generate New</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCopyText(suggestedPassword, true)}
                    className="bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2"
                  >
                    {copiedSuggested ? (
                      <>
                        <Check className="w-3 h-3 text-white" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 text-white/70" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* SECTION 4: Suggested Password Analysis */}
            <div className="bg-white border border-[#ECECEC] rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.01)] flex flex-col gap-4">
              <h2 className="text-[11px] font-medium text-zinc-500 uppercase tracking-widest">
                Suggested Password Analysis
              </h2>
              
              <div className="grid grid-cols-2 gap-4 border-b border-zinc-100 pb-4">
                <div className="space-y-1">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">Strength</span>
                  <span className={`inline-flex items-center text-xs font-normal px-2.5 py-0.5 rounded-md border ${getBadgeClass(suggestedAnalysis.strength)}`}>
                    {suggestedAnalysis.strength}
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">Crack Time</span>
                  <span className="text-xs font-mono font-normal text-zinc-900">
                    {suggestedAnalysis.crackTime}
                  </span>
                </div>
              </div>

              <div className="text-xs text-zinc-500 leading-relaxed font-normal">
                {suggestedAnalysis.explanation}
              </div>
            </div>

          </div>

        </div>

        {/* ==========================================
            PLATFORM FOOTER
           ========================================== */}
        <footer className="text-center text-[10px] text-zinc-400 font-mono tracking-wider pt-4 border-t border-zinc-100">
          SECURE CLIENT-SIDE OPERATIONS • POWERED BY PASSFORGE
        </footer>

      </div>
    </main>
  );
}
