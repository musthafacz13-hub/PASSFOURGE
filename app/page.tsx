'use client';

import * as React from 'react';
import { 
  Terminal as TerminalIcon, 
  KeyRound, 
  FileText, 
  Cpu, 
  Settings as SettingsIcon, 
  Lock, 
  Unlock,
  Bell, 
  Wifi, 
  Copy, 
  Check, 
  Eye, 
  EyeOff, 
  RefreshCw, 
  Sliders, 
  BookOpen, 
  AlertTriangle, 
  HelpCircle,
  Play,
  RotateCcw,
  User,
  Shield,
  Layers,
  ChevronRight,
  Database
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Pre-defined secure tokens mimicking passwords (as requested, no password generation logic implemented)
interface PasswordPreset {
  sequence: string;
  entropy: number;
  strength: string;
  type: string;
}

const PASSWORD_PRESETS: PasswordPreset[] = [
  { sequence: '5+eV-V)Qu-U+_r-)Ym0', entropy: 98.4, strength: 'EXCELLENT', type: 'High Entropy Alphanumeric' },
  { sequence: '7x#D!k9_Lp&m_vS*2Wq@9z', entropy: 112.2, strength: 'MILITARY_GRADE', type: 'Complex Symbol Matrix' },
  { sequence: 'pf_8f3d2a!9Z_kl$0#Pq2m*1v9-Lp0Qx-Y9', entropy: 156.8, strength: 'CRYPTOGRAPHIC_KEY', type: 'Full-Entropy Node Key' },
  { sequence: 'k0_39c7b2_8d!e9a_2c4f', entropy: 84.1, strength: 'OPTIMAL', type: 'Hexadecimal Hash' },
  { sequence: 'A9_r7!uE-Vw3_xM8_bZ4-Pq', entropy: 104.5, strength: 'EXCELLENT', type: 'Alphanumeric Secure Token' },
  { sequence: '8f-3d-2a!9Z_kl$0#Pq2m*', entropy: 118.0, strength: 'MILITARY_GRADE', type: 'Complex Symbol Token' },
  { sequence: 'ADMIN_ROOT_TOKEN_SECURE_NODE_9821', entropy: 78.3, strength: 'SECURE_PHRASE', type: 'Passphrase String' }
];

interface LogEntry {
  id: string;
  timestamp: string;
  sequence: string;
  revealed: boolean;
  strength: string;
}

export default function PassForgeApp() {
  // Theme configuration state: 'red' (Obsidian), 'blue' (Cobalt), 'green' (Toxic)
  const [activeTheme, setActiveTheme] = React.useState<'red' | 'blue' | 'green'>('red');
  
  // Navigation states: 'home' | 'generator' | 'documentation' | 'about' | 'settings'
  const [activeTab, setActiveTab] = React.useState<string>('home');
  
  // Loading screen state
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [bootProgress, setBootProgress] = React.useState<number>(0);
  const [bootLogs, setBootLogs] = React.useState<string[]>([]);
  const [bootIndex, setBootIndex] = React.useState<number>(0);

  // App-level preferences
  const [animationsEnabled, setAnimationsEnabled] = React.useState<boolean>(true);
  const [autoCopyToClipboard, setAutoCopyToClipboard] = React.useState<boolean>(true);
  const [entropyLength, setEntropyLength] = React.useState<number>(32);
  const [encryptionLevel, setEncryptionLevel] = React.useState<string>('AES-256-GCM');
  const [sessionTimeout, setSessionTimeout] = React.useState<number>(3600);
  
  // Interactive password display state
  const [currentPresetIndex, setCurrentPresetIndex] = React.useState<number>(0);
  const [copiedNotification, setCopiedNotification] = React.useState<boolean>(false);
  const [customPassword, setCustomPassword] = React.useState<string>('');
  
  // Recent password logs (simulated, fully visual)
  const [recentLogs, setRecentLogs] = React.useState<LogEntry[]>([
    { id: '1', timestamp: '2026.07.28 05:28:09', sequence: '5+eV-V)Qu-U+_r-)Ym0', revealed: false, strength: 'EXCELLENT' },
    { id: '2', timestamp: '2026.07.28 05:21:44', sequence: '7x#D!k9_Lp&m_vS*2Wq@9z', revealed: false, strength: 'MILITARY_GRADE' },
    { id: '3', timestamp: '2026.07.28 05:15:30', sequence: 'k0_39c7b2_8d!e9a_2c4f', revealed: false, strength: 'OPTIMAL' },
    { id: '4', timestamp: '2026.07.28 04:58:12', sequence: 'ADMIN_ROOT_TOKEN_SEC_98', revealed: false, strength: 'SECURE_PHRASE' },
    { id: '5', timestamp: '2026.07.28 04:42:01', sequence: 'A9_r7!uE-Vw3_xM8_bZ4-Pq', revealed: false, strength: 'EXCELLENT' }
  ]);

  // Console output log list inside the debugger widget
  const [consoleLogs, setConsoleLogs] = React.useState<string[]>([
    '[14:32:05] SYS: AUTHENTICATING_ROOT_USER... SUCCESS',
    '[14:32:08] SEC: RSA_KEY_GENERATED // LENGTH: 4096',
    '[14:33:12] SYS: CACHE_PURGED // SECTOR_09',
    '[14:34:45] SYS: HEARTBEAT_PULSE_DETECTED',
    '[14:35:01] LOG: NEW_PASSWORD_REQUEST_RECEIVED',
    '[05:28:09] EVT: PASSWORD_GENERATED // ENTROPY_OPTIMIZED'
  ]);

  // Generator screen customized toggle checkboxes
  const [genOpts, setGenOpts] = React.useState({
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
    excludeAmbiguous: false,
    pronounceable: false,
  });

  // Modal / Confirm overlay states
  const [showWipeConfirm, setShowWipeConfirm] = React.useState<boolean>(false);
  const [wipeInProcess, setWipeInProcess] = React.useState<boolean>(false);
  const [wipeStatus, setWipeStatus] = React.useState<string>('');

  // Setup local styling accent classes dynamically
  const themeColors = {
    red: {
      accent: '#FF2D2D',
      hoverAccent: '#D00000',
      text: 'text-[#FF2D2D]',
      bg: 'bg-[#FF2D2D]',
      bgOpacity: 'bg-[#FF2D2D]/10',
      bgHover: 'hover:bg-[#FF2D2D]/20',
      border: 'border-[#FF2D2D]/30',
      borderFocus: 'focus:border-[#FF2D2D]',
      outline: 'border-[#FF2D2D] text-[#FF2D2D]',
      glow: 'shadow-[0_0_15px_rgba(255,45,45,0.15)]',
      borderPulse: 'border-[#FF2D2D]/50',
    },
    blue: {
      accent: '#2D8EFF',
      hoverAccent: '#0066D0',
      text: 'text-[#2D8EFF]',
      bg: 'bg-[#2D8EFF]',
      bgOpacity: 'bg-[#2D8EFF]/10',
      bgHover: 'hover:bg-[#2D8EFF]/20',
      border: 'border-[#2D8EFF]/30',
      borderFocus: 'focus:border-[#2D8EFF]',
      outline: 'border-[#2D8EFF] text-[#2D8EFF]',
      glow: 'shadow-[0_0_15px_rgba(45,142,255,0.15)]',
      borderPulse: 'border-[#2D8EFF]/50',
    },
    green: {
      accent: '#3FB950',
      hoverAccent: '#2EA043',
      text: 'text-[#3FB950]',
      bg: 'bg-[#3FB950]',
      bgOpacity: 'bg-[#3FB950]/10',
      bgHover: 'hover:bg-[#3FB950]/20',
      border: 'border-[#3FB950]/30',
      borderFocus: 'focus:border-[#3FB950]',
      outline: 'border-[#3FB950] text-[#3FB950]',
      glow: 'shadow-[0_0_15px_rgba(63,185,80,0.15)]',
      borderPulse: 'border-[#3FB950]/50',
    }
  };

  const colors = themeColors[activeTheme];

  // Simple log writer helper (declared at top so it can be referenced safely)
  const addConsoleLog = React.useCallback((text: string) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    setConsoleLogs((prev) => [...prev, `[${timeStr}] EVT: ${text}`]);
  }, []);

  // Trigger sequence change simulating generator
  const triggerGenerateSequence = React.useCallback(() => {
    const nextIndex = (currentPresetIndex + 1) % PASSWORD_PRESETS.length;
    setCurrentPresetIndex(nextIndex);
    
    // Add beautiful debug audit trail
    addConsoleLog(`GENERATED PASSWORD PRESET // LENGTH: ${PASSWORD_PRESETS[nextIndex].sequence.length} // TYPE: ${PASSWORD_PRESETS[nextIndex].type}`);

    // If auto copy enabled
    if (autoCopyToClipboard) {
      navigator.clipboard.writeText(PASSWORD_PRESETS[nextIndex].sequence);
      setCopiedNotification(true);
      setTimeout(() => setCopiedNotification(false), 2000);
      addConsoleLog('AUTO-COPIED GENERATED PRESET TO CLIPBOARD');
    }
  }, [currentPresetIndex, autoCopyToClipboard, addConsoleLog]);

  // Reveal logged sequences toggle
  const toggleLogReveal = React.useCallback((id: string) => {
    setRecentLogs((prev) => 
      prev.map((log) => {
        if (log.id === id) {
          const nextState = !log.revealed;
          addConsoleLog(`${nextState ? 'REVEALED' : 'MASKED'} PASSWORD TRANSACTION RETRIEVAL`);
          return { ...log, revealed: nextState };
        }
        return log;
      })
    );
  }, [addConsoleLog]);

  // Custom visual copy action
  const handleCopyValue = React.useCallback((val: string) => {
    navigator.clipboard.writeText(val);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2000);
    addConsoleLog(`MANUALLY COPIED SELECTED ENCRYPTED STREAM`);
  }, [addConsoleLog]);

  // Wipe simulated data function
  const executeVolatileWipe = React.useCallback(() => {
    setWipeInProcess(true);
    setWipeStatus('LOCKING VAULT FILESYSTEM...');
    
    setTimeout(() => {
      setWipeStatus('OVERWRITING VOLATILE BUFFER ENTROPY WITH RANDOM BYTES...');
    }, 1000);

    setTimeout(() => {
      setWipeStatus('PURGING MEMORY HEAPS AND FLUSHING CACHES...');
    }, 2200);

    setTimeout(() => {
      setRecentLogs([]);
      setConsoleLogs([
        '[00:00:00] CRIT: SYSTEM DATA MASS PURGE EXECUTED BY ADMIN_ROOT',
        '[00:00:01] SYS: SECURITY CONTEXT RESET COMPLETED'
      ]);
      setWipeInProcess(false);
      setShowWipeConfirm(false);
      setActiveTab('home');
      addConsoleLog('VOLATILE CACHED VAULT WIPED COMPLETELY');
    }, 3500);
  }, [addConsoleLog]);

  // Replay Boot Animation
  const handleReplayBoot = React.useCallback(() => {
    setBootLogs([]);
    setBootIndex(0);
    setBootProgress(0);
    setIsLoading(true);
  }, []);

  // Real-time custom password entropy calculation functions
  const calculateCustomEntropy = React.useCallback((pwd: string): number => {
    if (!pwd) return 0;
    let poolSize = 0;
    if (/[a-z]/.test(pwd)) poolSize += 26;
    if (/[A-Z]/.test(pwd)) poolSize += 26;
    if (/[0-9]/.test(pwd)) poolSize += 10;
    // Common symbols pool
    if (/[~`!@#\$%\^&\*\(\)\-_\+=\{\}\[\]\|\\:;"'<>\?,\.\/]/.test(pwd)) poolSize += 33;
    else if (/[^a-zA-Z0-9]/.test(pwd)) poolSize += 15; // fallback symbol characters

    if (poolSize === 0) return 0;
    const entropy = pwd.length * Math.log2(poolSize);
    return Math.round(entropy * 10) / 10;
  }, []);

  const getCustomStrength = React.useCallback((entropy: number): { text: string; color: string; desc: string; blocks: number } => {
    if (entropy === 0) return { text: 'NONE', color: 'text-zinc-500', desc: 'AWAITING SEED INPUT', blocks: 0 };
    if (entropy < 45) return { text: 'WEAK', color: 'text-red-500', desc: 'CRITICAL VULNERABILITY', blocks: 2 };
    if (entropy < 65) return { text: 'MODERATE', color: 'text-yellow-500', desc: 'MEDIUM RISK OF INTERCEPT', blocks: 4 };
    if (entropy < 85) return { text: 'OPTIMAL', color: 'text-blue-400', desc: 'STANDARD COMPLIANT ENVELOPE', blocks: 6 };
    if (entropy < 110) return { text: 'EXCELLENT', color: 'text-emerald-400', desc: 'SECURITY BOUNDS MET', blocks: 7 };
    return { text: 'MILITARY_GRADE', color: 'text-emerald-500 font-extrabold', desc: 'MAXIMUM ENTROPY SHIELD', blocks: 8 };
  }, []);

  const estimateCrackTime = React.useCallback((entropy: number): string => {
    if (entropy === 0) return 'INSTANT';
    if (entropy < 24) return 'INSTANT (< 1 MILLISECOND)';
    if (entropy < 35) return '< 1 SECOND';
    if (entropy < 45) return 'FEW SECONDS';
    if (entropy < 55) return 'FEW MINUTES TO HOURS';
    if (entropy < 70) return 'SEVERAL DAYS TO MONTHS';
    if (entropy < 85) return 'SEVERAL YEARS';
    if (entropy < 105) return 'MILLIONS OF YEARS';
    return 'BILLIONS OF YEARS';
  }, []);

  // Simulated Terminal Booting Process
  const BOOT_MESSAGES = React.useMemo(() => [
    'Connecting to remote node (HK_77)...',
    'Handshaking TLS v1.3 with client host...',
    'Establishing secure sandbox channel [ID: 0x82FA]...',
    'Verifying Root SHA-512 authentication signatures...',
    'Loading custom cryptographic seed tables...',
    'Mounting PassForge physical hardware vault...',
    'Performing hardware entropy collection...',
    'Starting secure hardware random seed engines...',
    'Ready. PassForge system interface operational.',
  ], []);

  React.useEffect(() => {
    if (!isLoading) return;

    let progressTimer: NodeJS.Timeout;
    let logTimer: NodeJS.Timeout;

    // Fast loading logs simulation
    const runBootLogs = () => {
      if (bootIndex < BOOT_MESSAGES.length) {
        setBootLogs((prev) => [...prev, `> ${BOOT_MESSAGES[bootIndex]}`]);
        setBootIndex((prev) => prev + 1);
        
        // Progress step matching
        setBootProgress(Math.min(100, Math.floor(((bootIndex + 1) / BOOT_MESSAGES.length) * 100)));
        
        logTimer = setTimeout(runBootLogs, 320);
      } else {
        // Automatically finish booting after a brief pause
        progressTimer = setTimeout(() => {
          setIsLoading(false);
        }, 600);
      }
    };

    runBootLogs();

    return () => {
      clearTimeout(progressTimer);
      clearTimeout(logTimer);
    };
  }, [isLoading, bootIndex, BOOT_MESSAGES]);

  // Dynamic console debug log injector
  React.useEffect(() => {
    if (isLoading) return;
    const interval = setInterval(() => {
      const logTypes = ['SYS', 'SEC', 'EVT', 'LOG'];
      const actions = [
        'INTEGRITY_CHECK // CRITICAL // OK',
        'ENTROPY_RE-SEED_COMPLETED',
        'CLEARED_EXPIRED_SESSION_BUFFERS',
        'SYNCED_METRICS_WITH_SECURE_REMOTE',
        'HEARTBEAT_PULSE_DETECTED',
        'VOLATILE_CACHE_WIPED'
      ];
      const type = logTypes[Math.floor(Math.random() * logTypes.length)];
      const action = actions[Math.floor(Math.random() * actions.length)];
      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
      
      setConsoleLogs((prev) => {
        const nextLogs = [...prev, `[${timeStr}] ${type}: ${action}`];
        if (nextLogs.length > 30) nextLogs.shift();
        return nextLogs;
      });
    }, 15000);

    return () => clearInterval(interval);
  }, [isLoading]);

  // Bind keybind events for high-fidelity interactive simulation
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isLoading) return;

      // ALT + G: Generate new sequence
      if (e.altKey && e.key.toLowerCase() === 'g') {
        e.preventDefault();
        triggerGenerateSequence();
      }
      // CTRL + L: Switch to Logs (Home tab)
      if (e.ctrlKey && e.key.toLowerCase() === 'l') {
        e.preventDefault();
        setActiveTab('home');
        addConsoleLog('UI: Forced active tab to Home Dashboard');
      }
      // ESC: Toggle settings tab
      if (e.key === 'Escape') {
        e.preventDefault();
        setActiveTab((prev) => (prev === 'settings' ? 'home' : 'settings'));
        addConsoleLog('UI: Escape triggered settings viewport toggle');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLoading, triggerGenerateSequence, addConsoleLog]);

  return (
    <div className="relative min-h-screen bg-[#040404] text-[#FFFFFF] font-inter antialiased overflow-x-hidden selection:bg-[#FF2D2D]/30 selection:text-[#FFFFFF] terminal-grid scanlines">
      {/* Soft Red Ambient Top/Bottom Glow Layout */}
      <div className="absolute inset-0 pointer-events-none red-ambient-glow z-0" />
      <div className="absolute inset-0 pointer-events-none red-ambient-glow-bottom z-0" />

      <AnimatePresence mode="wait">
        {isLoading ? (
          /* ==================================================================== */
          /* SCREEN 1: BOOT/LOADING SCREEN                                        */
          /* ==================================================================== */
          <motion.div
            key="booting"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="relative z-50 flex flex-col justify-between min-h-screen p-6 md:p-12 bg-[#040404]"
          >
            {/* Header detail */}
            <div className="flex justify-between items-center text-[10px] font-mono tracking-widest text-[#8B8B8B] border-b border-white/5 pb-3">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                SYSTEM_STATUS: AUTHENTICATING
              </span>
              <span>SECURE PROTOCOL v2.4.0</span>
            </div>

            {/* Centered Boot Sequence Container */}
            <div className="max-w-2xl w-full mx-auto my-auto py-8">
              <div className="text-center mb-8">
                {/* Visual Brand Title */}
                <h1 className="text-4xl md:text-5xl font-orbitron font-extrabold tracking-[0.2em] text-[#FFFFFF] select-none relative inline-block">
                  PASS<span className="text-[#FF2D2D]">FORGE</span>
                  <div className="absolute -inset-x-4 -inset-y-1 bg-red-500/5 blur-xl pointer-events-none" />
                </h1>
                <p className="text-[11px] font-mono tracking-[0.3em] text-[#8B8B8B] uppercase mt-2.5">
                  ESTABLISHING ENCRYPTED TUNNEL...
                </p>
              </div>

              {/* Terminal Logs Simulation Box */}
              <div className="bg-[#0B0B0B] border border-red-500/10 rounded-lg p-5 font-mono text-xs text-[#C7C7C7] shadow-2xl h-64 overflow-y-auto custom-scrollbar flex flex-col gap-2">
                {bootLogs.map((log, idx) => (
                  <div key={idx} className="flex gap-2">
                    <span className="text-[#FF2D2D] select-none">&gt;</span>
                    <span>{log}</span>
                  </div>
                ))}
                {bootLogs.length < BOOT_MESSAGES.length && (
                  <div className="flex items-center gap-1 text-[#FF2D2D]">
                    <span>&gt;</span>
                    <span className="w-1.5 h-3.5 bg-[#FF2D2D] cursor-blink" />
                  </div>
                )}
              </div>

              {/* Progress Slider Display */}
              <div className="mt-6">
                <div className="flex justify-between items-center text-[10px] font-mono tracking-widest text-[#8B8B8B] mb-2">
                  <span>DEPLOY_SYSTEM_STATE</span>
                  <span className="text-[#FF2D2D] font-bold">{bootProgress}%</span>
                </div>
                <div className="w-full h-[3px] bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-[#FF2D2D]"
                    initial={{ width: '0%' }}
                    animate={{ width: `${bootProgress}%` }}
                    transition={{ ease: 'easeOut' }}
                  />
                </div>
              </div>

              {/* Instant bypass action */}
              <div className="mt-8 flex justify-center">
                <button
                  id="btn-skip-boot"
                  onClick={() => setIsLoading(false)}
                  className="px-4 py-1.5 bg-[#111111] hover:bg-[#FF2D2D]/10 border border-white/5 hover:border-red-500/20 rounded text-[10px] font-mono tracking-widest text-[#C7C7C7] hover:text-[#FF2D2D] transition-all"
                >
                  BYPASS_INITIAL_BOOT_CHECKS // ESC
                </button>
              </div>
            </div>

            {/* Footer coordinate strings */}
            <div className="flex justify-between items-center text-[9px] font-mono tracking-widest text-white/20 border-t border-white/5 pt-3">
              <span>ADDR: 0x8F2...E9A</span>
              <span>CPU_LOAD: 14%</span>
              <span>NET_SECURE: TRUE</span>
            </div>
          </motion.div>
        ) : (
          /* ==================================================================== */
          /* MAIN DESKTOP PORTAL SHELL                                            */
          /* ==================================================================== */
          <motion.div
            key="portal-main"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative z-10 min-h-screen flex flex-col md:flex-row border-r border-white/5"
          >
            {/* LEFT NAVIGATION SIDEBAR */}
            <aside id="main-sidebar" className="w-full md:w-64 bg-[#0B0B0B] border-r border-white/5 flex flex-col justify-between shrink-0 md:sticky md:top-0 md:h-screen z-30">
              {/* Upper Section */}
              <div>
                {/* Admin Status Identity */}
                <div className="p-5 border-b border-white/5 bg-[#040404]/50 flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-mono font-bold tracking-widest text-white">ADM_ROOT</h3>
                    <p className="text-[9px] font-mono text-white/40 tracking-wider flex items-center gap-1 mt-0.5">
                      <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                      SESSION: SECURE
                    </p>
                  </div>
                  <div className={`p-1.5 rounded bg-black border ${colors.border} ${colors.text}`}>
                    <Lock className="w-3.5 h-3.5" />
                  </div>
                </div>

                {/* Main Nav Items */}
                <nav className="p-4 space-y-1.5">
                  <div className="text-[10px] font-mono tracking-[0.2em] text-white/30 px-3 py-1.5 uppercase select-none">
                    VIRTUAL_PORTS
                  </div>

                  {/* Navigation Tab: Home */}
                  <button
                    id="nav-home"
                    onClick={() => { setActiveTab('home'); addConsoleLog('UI: Visited Home Dashboard'); }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded text-xs font-mono tracking-widest transition-all text-left ${
                      activeTab === 'home'
                        ? `${colors.bgOpacity} ${colors.text} border-l-2 ${colors.borderPulse} pl-2 bg-gradient-to-r from-red-500/5 to-transparent`
                        : 'text-[#C7C7C7] hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <TerminalIcon className="w-4 h-4 text-inherit" />
                      Home
                    </span>
                    <span className="text-[9px] text-white/20 font-light select-none">CTRL+L</span>
                  </button>

                  {/* Navigation Tab: Generator */}
                  <button
                    id="nav-generator"
                    onClick={() => { setActiveTab('generator'); addConsoleLog('UI: Visited Generator Matrix'); }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded text-xs font-mono tracking-widest transition-all text-left ${
                      activeTab === 'generator'
                        ? `${colors.bgOpacity} ${colors.text} border-l-2 ${colors.borderPulse} pl-2 bg-gradient-to-r from-red-500/5 to-transparent`
                        : 'text-[#C7C7C7] hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <Sliders className="w-4 h-4 text-inherit" />
                      Generator
                    </span>
                    <span className="text-[9px] text-white/20 font-light select-none">ALT+G</span>
                  </button>

                  {/* Navigation Tab: Documentation */}
                  <button
                    id="nav-docs"
                    onClick={() => { setActiveTab('documentation'); addConsoleLog('UI: Visited Cryptographic Docs'); }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded text-xs font-mono tracking-widest transition-all text-left ${
                      activeTab === 'documentation'
                        ? `${colors.bgOpacity} ${colors.text} border-l-2 ${colors.borderPulse} pl-2 bg-gradient-to-r from-red-500/5 to-transparent`
                        : 'text-[#C7C7C7] hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <BookOpen className="w-4 h-4 text-inherit" />
                      Documentation
                    </span>
                    <span className="text-[9px] text-white/20 font-light select-none">DOCS</span>
                  </button>

                  {/* Navigation Tab: About */}
                  <button
                    id="nav-about"
                    onClick={() => { setActiveTab('about'); addConsoleLog('UI: Visited System Philosophy'); }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded text-xs font-mono tracking-widest transition-all text-left ${
                      activeTab === 'about'
                        ? `${colors.bgOpacity} ${colors.text} border-l-2 ${colors.borderPulse} pl-2 bg-gradient-to-r from-red-500/5 to-transparent`
                        : 'text-[#C7C7C7] hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <Cpu className="w-4 h-4 text-inherit" />
                      About
                    </span>
                    <span className="text-[9px] text-white/20 font-light select-none">INFO</span>
                  </button>

                  {/* Navigation Tab: Settings */}
                  <button
                    id="nav-settings"
                    onClick={() => { setActiveTab('settings'); addConsoleLog('UI: Visited Configuration Console'); }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded text-xs font-mono tracking-widest transition-all text-left ${
                      activeTab === 'settings'
                        ? `${colors.bgOpacity} ${colors.text} border-l-2 ${colors.borderPulse} pl-2 bg-gradient-to-r from-red-500/5 to-transparent`
                        : 'text-[#C7C7C7] hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <SettingsIcon className="w-4 h-4 text-inherit" />
                      Settings
                    </span>
                    <span className="text-[9px] text-white/20 font-light select-none">ESC</span>
                  </button>
                </nav>
              </div>

              {/* Lower Section (Profile placeholder + System Info) */}
              <div className="p-4 border-t border-white/5 bg-[#040404]/30">
                <div className="flex items-center gap-3 p-2 bg-[#111111] rounded border border-white/5">
                  {/* Micro Pixelated Avatar Simulated with styling */}
                  <div className="w-8 h-8 rounded bg-gradient-to-br from-zinc-800 to-zinc-900 border border-white/10 flex items-center justify-center text-white font-mono text-xs select-none">
                    <User className="w-4 h-4 text-[#FF2D2D]" />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-mono font-bold tracking-widest text-[#FFFFFF]">ROOT_USR</h4>
                    <p className="text-[9px] font-mono text-[#8B8B8B] tracking-wider uppercase mt-0.5">LEVEL_04_CLEARANCE</p>
                  </div>
                </div>
                <div className="mt-3 flex justify-between items-center text-[9px] font-mono text-white/30 tracking-wider">
                  <span>PASSFORGE_V2.4</span>
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    ST_ENCRYPTED
                  </span>
                </div>
              </div>
            </aside>

            {/* MAIN PORTAL BODY CONTAINER */}
            <main className="flex-1 flex flex-col min-h-screen">
              
              {/* TOP HEADER STATUS PANEL */}
              <header className="p-4 md:px-8 md:py-5 border-b border-white/5 bg-[#0B0B0B]/80 backdrop-blur sticky top-0 z-20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                
                {/* Brand Identity / Section Title */}
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-xl font-orbitron font-extrabold tracking-[0.15em] text-[#FFFFFF] select-none">
                      PASS<span className={colors.text}>FORGE</span>
                    </h1>
                    <div className="h-4 w-[1px] bg-white/15" />
                    <span className="font-mono text-[9px] tracking-[0.2em] text-[#8B8B8B] uppercase">
                      ST_SECURE // V2.4.0-STABLE
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-[#8B8B8B] tracking-widest uppercase mt-1">
                    {activeTab === 'home' && 'PROFESSIONAL PASSPHRASE ENGINE // HOME'}
                    {activeTab === 'generator' && 'CRYPTOGRAPHIC ENTROPY MATRIX // WORKBENCH'}
                    {activeTab === 'documentation' && 'ADMIN SEC_SHELL DOCUMENTATION // LOG_0x2A'}
                    {activeTab === 'about' && 'CIPHER SUITE SPECIFICATIONS // PHILOSOPHY'}
                    {activeTab === 'settings' && 'SYSTEM CONFIGURATION OVERRIDES // SETTINGS'}
                  </div>
                </div>

                {/* Metric Readouts + Status Badges */}
                <div className="flex items-center flex-wrap gap-4 select-none font-mono text-[10px] tracking-wider text-[#C7C7C7]">
                  <div className="bg-[#111111] px-2.5 py-1.5 rounded border border-white/5 flex items-center gap-1.5">
                    <span className="text-[#8B8B8B]">ENCRYPT:</span>
                    <span className={colors.text}>AES-256</span>
                  </div>
                  <div className="bg-[#111111] px-2.5 py-1.5 rounded border border-white/5 flex items-center gap-1.5">
                    <span className="text-[#8B8B8B]">NODE:</span>
                    <span className="text-[#FFFFFF]">HK_77</span>
                  </div>
                  
                  {/* Status lights widget */}
                  <div className="flex items-center gap-2 bg-[#111111] px-2.5 py-1.5 rounded border border-white/5">
                    <div className="flex items-center gap-1" title="Vault encryption status">
                      <Lock className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-[9px] text-emerald-400 hidden lg:inline">SECURE</span>
                    </div>
                    <div className="h-3 w-[1px] bg-white/10" />
                    <div className="relative flex items-center justify-center" title="Alert streams active">
                      <Bell className="w-3.5 h-3.5 text-zinc-400" />
                      <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-red-500" />
                    </div>
                    <div className="h-3 w-[1px] bg-white/10" />
                    <div className="flex items-center" title="Network server sync">
                      <Wifi className="w-3.5 h-3.5 text-red-500 animate-pulse" />
                    </div>
                  </div>
                </div>
              </header>

              {/* DYNAMIC SCENE DISPLAY AREA */}
              <div className="flex-1 p-4 md:p-8 relative">
                
                <AnimatePresence mode="wait">
                  
                  {activeTab === 'home' && (
                    /* ==================================================================== */
                    /* SCREEN 2: HOME VIEW (DASHBOARD)                                      */
                    /* ==================================================================== */
                    <motion.div
                      key="tab-home"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.25 }}
                      className="space-y-6 max-w-7xl mx-auto"
                    >
                      {/* Master Password Widget Display */}
                      <div className="bg-[#0B0B0B] border border-white/5 rounded-lg p-6 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-2 text-[8px] font-mono tracking-widest text-[#8B8B8B] uppercase select-none border-b border-l border-white/5 bg-[#111111]">
                          GENERATOR_INTERFACE_V2.0 // STATUS: READY
                        </div>

                        {/* Top Accent line */}
                        <div className={`absolute top-0 left-0 right-0 h-[2px] ${colors.bg} opacity-70`} />

                        <div className="space-y-4 pt-4">
                          <label className="text-[10px] font-mono tracking-[0.2em] text-[#8B8B8B] uppercase">
                            ACTIVE PASSKEY STREAM
                          </label>

                          {/* Giant display block */}
                          <div className="relative bg-black/60 border border-white/5 hover:border-red-500/20 p-6 md:p-8 rounded-lg flex items-center justify-between gap-4 transition-all">
                            <span className="font-mono text-xl md:text-3xl font-bold tracking-wider text-white break-all pr-12 select-all">
                              {PASSWORD_PRESETS[currentPresetIndex].sequence}
                            </span>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                              {/* Entropy label micro details */}
                              <div className="hidden md:flex flex-col items-end mr-2 font-mono">
                                <span className="text-[9px] text-[#8B8B8B] tracking-widest uppercase">STRENGTH</span>
                                <span className="text-[10px] text-emerald-400 font-bold tracking-wider">{PASSWORD_PRESETS[currentPresetIndex].strength}</span>
                              </div>
                              {/* Copy button */}
                              <button
                                id="btn-copy-home-password"
                                onClick={() => handleCopyValue(PASSWORD_PRESETS[currentPresetIndex].sequence)}
                                className={`p-3 rounded border bg-[#111111] hover:bg-white/5 transition-all relative ${
                                  copiedNotification 
                                    ? 'border-emerald-500/50 text-emerald-400' 
                                    : 'border-white/10 text-white/60 hover:text-white'
                                }`}
                                title="Copy passphrase stream"
                              >
                                {copiedNotification ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>

                          {/* Blocked Entropy level meter */}
                          <div className="space-y-2">
                            <div className="flex justify-between items-center font-mono text-[10px]">
                              <span className="text-[#8B8B8B] tracking-wider">SHANNON ENTROPY DEPTH:</span>
                              <span className="text-white font-bold">{PASSWORD_PRESETS[currentPresetIndex].entropy}% // STABLE</span>
                            </div>
                            
                            {/* Visual block segments, mimicking high-end UI */}
                            <div className="grid grid-cols-8 gap-1 h-3">
                              {Array.from({ length: 8 }).map((_, i) => {
                                const fillPercentage = PASSWORD_PRESETS[currentPresetIndex].entropy;
                                const blockPercentage = ((i + 1) / 8) * 100;
                                const isActive = fillPercentage >= blockPercentage;
                                return (
                                  <div
                                    key={i}
                                    className={`h-full rounded-sm transition-all duration-300 ${
                                      isActive 
                                        ? `${colors.bg} ${colors.glow}` 
                                        : 'bg-white/5 border border-white/5'
                                    }`}
                                  />
                                );
                              })}
                            </div>
                          </div>

                          {/* Quick Actions */}
                          <div className="pt-2 flex flex-wrap gap-3">
                            <button
                              id="btn-generate-sequence"
                              onClick={triggerGenerateSequence}
                              className={`px-5 py-2.5 bg-transparent border border-red-500/30 hover:border-[#FF2D2D] hover:bg-[#FF2D2D] text-white hover:text-white text-xs font-mono font-bold tracking-widest rounded transition-all flex items-center gap-2 cursor-pointer`}
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                              GENERATE NEW SEQUENCE // ALT+G
                            </button>
                            <button
                              id="btn-goto-generator"
                              onClick={() => setActiveTab('generator')}
                              className="px-5 py-2.5 bg-[#111111] border border-white/5 hover:border-white/10 hover:bg-white/5 text-white text-xs font-mono tracking-widest rounded transition-all"
                            >
                              ADVANCED CONFIG
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Three Column Metrics Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 select-none">
                        <div className="bg-[#0B0B0B] border border-white/5 rounded-lg p-4 font-mono">
                          <span className="text-[9px] text-[#8B8B8B] tracking-widest uppercase block mb-1">SYSTEM_UPTIME</span>
                          <div className="text-xl font-bold text-white flex items-center gap-1.5">
                            99.9999%
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                          </div>
                          <span className="text-[9px] text-emerald-400 font-bold tracking-wider block mt-1 uppercase">ACTIVE_NODE_01 // SECURE</span>
                        </div>
                        <div className="bg-[#0B0B0B] border border-white/5 rounded-lg p-4 font-mono">
                          <span className="text-[9px] text-[#8B8B8B] tracking-widest uppercase block mb-1">TOTAL_GENERATED</span>
                          <div className="text-xl font-bold text-white">42,801</div>
                          <span className="text-[9px] text-white/40 block mt-1 uppercase">SYNCED_WITH_CLOUD_MIRROR</span>
                        </div>
                        <div className="bg-[#0B0B0B] border border-white/5 rounded-lg p-4 font-mono">
                          <span className="text-[9px] text-[#8B8B8B] tracking-widest uppercase block mb-1">SECURITY_SCORE</span>
                          <div className="text-xl font-bold text-emerald-400">A+ EXCELLENT</div>
                          <span className="text-[9px] text-white/40 block mt-1 uppercase">ZERO_LEAKS_DETECTED // 0xFA</span>
                        </div>
                      </div>

                      {/* Split Column (Recent Logs & Encryption Module) */}
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        
                        {/* RECENT_LOG VIEW (Left Side of split, 7 cols) */}
                        <div className="lg:col-span-7 bg-[#0B0B0B] border border-white/5 rounded-lg p-5">
                          <div className="flex justify-between items-center border-b border-white/5 pb-3 mb-4">
                            <span className="text-[10px] font-mono tracking-[0.2em] text-[#8B8B8B] uppercase flex items-center gap-1.5">
                              <Database className="w-3.5 h-3.5" />
                              RECENT_PASSWORD_LOG
                            </span>
                            <span className="text-[9px] font-mono text-white/20">LOG_BUFF_STABLE</span>
                          </div>

                          <div className="space-y-2.5 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
                            {recentLogs.length === 0 ? (
                              <div className="text-center py-12 font-mono text-xs text-[#8B8B8B]">
                                NO TRANSACTION RECORD. VAULT PURGED.
                              </div>
                            ) : (
                              recentLogs.map((log) => (
                                <div key={log.id} className="bg-black/40 border border-white/5 hover:border-white/10 rounded p-3 flex justify-between items-center gap-4 transition-all">
                                  <div className="font-mono">
                                    <div className="text-[9px] text-[#8B8B8B]">{log.timestamp}</div>
                                    <div className="text-xs tracking-wider text-white mt-1 font-bold break-all">
                                      {log.revealed ? (
                                        log.sequence
                                      ) : (
                                        <span className="text-[#8B8B8B]/60 select-none">••••••••••••••••••••</span>
                                      )}
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => toggleLogReveal(log.id)}
                                      className="p-1.5 rounded bg-[#111111] border border-white/5 hover:border-white/10 text-[#8B8B8B] hover:text-white transition-all"
                                      title={log.revealed ? "Mask secret" : "Reveal secret"}
                                    >
                                      {log.revealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                    </button>
                                    <button
                                      onClick={() => handleCopyValue(log.sequence)}
                                      className="p-1.5 rounded bg-[#111111] border border-white/5 hover:border-white/10 text-[#8B8B8B] hover:text-white transition-all"
                                      title="Copy string"
                                    >
                                      <Copy className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>

                        {/* HARDWARE MODULE SIM (Right Side of split, 5 cols) */}
                        <div className="lg:col-span-5 bg-[#0B0B0B] border border-white/5 rounded-lg p-5 flex flex-col justify-between relative overflow-hidden">
                          {/* Card background glowing red server details */}
                          <div className="absolute inset-0 bg-gradient-to-t from-red-500/5 via-transparent to-transparent opacity-60 pointer-events-none" />
                          
                          <div>
                            <div className="text-[10px] font-mono tracking-[0.2em] text-[#8B8B8B] uppercase border-b border-white/5 pb-3 mb-4 select-none">
                              ENCRYPTION_MODULE_7X
                            </div>
                            
                            {/* Graphic server rack visual using CSS */}
                            <div className="bg-black border border-white/5 p-4 rounded mb-4 font-mono text-[10px] space-y-3 shadow-inner">
                              <div className="flex justify-between items-center">
                                <span className="text-zinc-500">CHIP_SET:</span>
                                <span className="text-white">HARDWARE ACCELERANT V4</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-zinc-500">CORE_LOCK:</span>
                                <span className="text-[#FF2D2D] font-bold">0x82FA</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-zinc-500">BUS_INTEGRITY:</span>
                                <span className="text-emerald-400">100% SECURE</span>
                              </div>
                              <div className="pt-2 border-t border-white/5 flex gap-1 justify-between select-none">
                                <div className="w-3.5 h-2.5 bg-emerald-500 rounded-sm animate-pulse" />
                                <div className="w-3.5 h-2.5 bg-emerald-500 rounded-sm" />
                                <div className="w-3.5 h-2.5 bg-emerald-500 rounded-sm animate-pulse" />
                                <div className="w-3.5 h-2.5 bg-[#FF2D2D] rounded-sm" />
                                <div className="w-3.5 h-2.5 bg-emerald-500 rounded-sm animate-pulse" />
                                <div className="w-3.5 h-2.5 bg-[#FF2D2D] rounded-sm" />
                                <div className="w-3.5 h-2.5 bg-emerald-500 rounded-sm" />
                              </div>
                            </div>
                          </div>

                          <div className="pt-2 font-mono text-[9px] text-[#8B8B8B] leading-normal uppercase">
                            Warning: Cryptographic operations are optimized on isolated silicon chips. No cloud network buffers are cached locally inside standard RAM allocations.
                          </div>
                        </div>

                      </div>

                      {/* BOTTOM TECHNICAL CONSOLE LOG CONTAINER */}
                      <div className="bg-[#0B0B0B] border border-white/5 rounded-lg p-4 font-mono">
                        <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-3">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                            <span className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                            <span className="text-[10px] text-[#C7C7C7] tracking-widest uppercase ml-1">
                              SYS_LOG :: CORE_DEBUGGER
                            </span>
                          </div>
                          <span className="text-[9px] text-white/30 tracking-widest select-none">LISTENING_ON_PORT_443</span>
                        </div>

                        {/* Monospace Output */}
                        <div className="space-y-1.5 max-h-[140px] overflow-y-auto custom-scrollbar text-[10px] text-zinc-400 pr-1">
                          {consoleLogs.map((line, index) => (
                            <div key={index} className="flex gap-2 font-mono hover:bg-white/5 px-1 py-0.5 rounded">
                              <span className="text-zinc-600">{`[0${index}]`}</span>
                              <span>{line}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                    </motion.div>
                  )}

                  {activeTab === 'generator' && (
                    /* ==================================================================== */
                    /* SCREEN 3: GENERATOR SYSTEM                                           */
                    /* ==================================================================== */
                    <motion.div
                      key="tab-generator"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.25 }}
                      className="space-y-6 max-w-7xl mx-auto"
                    >
                      {/* Active Password Top Screen Display */}
                      <div className="bg-[#0B0B0B] border border-white/5 rounded-lg p-6 relative">
                        <div className="absolute top-0 right-0 p-2 text-[8px] font-mono tracking-widest text-zinc-500 uppercase select-none bg-[#111111] border-b border-l border-white/5">
                          ACTIVE_PASSPHRASE_PREVIEW
                        </div>

                        <div className="space-y-4">
                          <span className="text-[10px] font-mono tracking-[0.2em] text-[#8B8B8B] uppercase">REALTIME SEED OUTPUT</span>
                          
                          {/* Password preview card */}
                          <div className="bg-black/60 border border-white/5 hover:border-red-500/10 p-6 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all relative">
                            <div>
                              <div className="font-mono text-2xl md:text-3xl font-extrabold tracking-wider text-white break-all select-all">
                                {PASSWORD_PRESETS[currentPresetIndex].sequence}
                              </div>
                              <div className="flex gap-4 mt-2 font-mono text-[9px] text-[#C7C7C7]">
                                <span className="uppercase">LENGTH: <b className="text-white">{PASSWORD_PRESETS[currentPresetIndex].sequence.length} chars</b></span>
                                <span>{"//"}</span>
                                <span className="uppercase">TYPE: <b className="text-white">{PASSWORD_PRESETS[currentPresetIndex].type}</b></span>
                              </div>
                            </div>

                            <div className="flex gap-2">
                              <button
                                id="btn-copy-generator-password"
                                onClick={() => handleCopyValue(PASSWORD_PRESETS[currentPresetIndex].sequence)}
                                className={`px-4 py-2.5 rounded border text-xs font-mono tracking-wider flex items-center gap-1.5 transition-all ${
                                  copiedNotification 
                                    ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400' 
                                    : 'bg-[#111111] border-white/10 text-white/80 hover:bg-white/5'
                                }`}
                              >
                                {copiedNotification ? (
                                  <>
                                    <Check className="w-4 h-4 animate-scale" />
                                    COPIED!
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-4 h-4" />
                                    COPY TO SYSTEM
                                  </>
                                )}
                              </button>
                              <button
                                id="btn-refresh-generator-password"
                                onClick={triggerGenerateSequence}
                                className="p-2.5 rounded border border-white/10 bg-[#111111] text-white/80 hover:text-white hover:bg-white/5 transition-all"
                                title="Regenerate seed"
                              >
                                <RefreshCw className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* Entropy Level indicators */}
                          <div className="bg-black p-4 rounded border border-white/5 grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="font-mono space-y-1">
                              <span className="text-[9px] text-[#8B8B8B] tracking-widest uppercase">SHANNON ENTROPY METER</span>
                              <div className={`text-lg font-bold ${colors.text}`}>{PASSWORD_PRESETS[currentPresetIndex].entropy} BITS</div>
                              <div className="text-[9px] text-zinc-500 uppercase">MATHEMATICAL COMPLEXITY SCORE</div>
                            </div>
                            <div className="font-mono space-y-1">
                              <span className="text-[9px] text-[#8B8B8B] tracking-widest uppercase">ESTIMATED CRACK TIME</span>
                              <div className="text-lg font-bold text-white">~4.8 BILLION YEARS</div>
                              <div className="text-[9px] text-zinc-500 uppercase">BRUTE-FORCE RESISTANCE DEPTH</div>
                            </div>
                            <div className="font-mono space-y-1">
                              <span className="text-[9px] text-[#8B8B8B] tracking-widest uppercase">CRYPTOGRAPHIC CLASSIFICATION</span>
                              <div className="text-lg font-bold text-emerald-400">{PASSWORD_PRESETS[currentPresetIndex].strength}</div>
                              <div className="text-[9px] text-zinc-500 uppercase">SECURITY BOUNDS COMPLIANCE</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Real-time Custom Password Strength Analyzer */}
                      <div className="bg-[#0B0B0B] border border-white/5 rounded-lg p-6 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-2 text-[8px] font-mono tracking-widest text-[#8B8B8B] uppercase select-none border-b border-l border-white/5 bg-[#111111]">
                          SEC_PORTAL_TESTER_V1.2 // ANALYZER
                        </div>

                        {/* Top Accent line representing active state */}
                        <div className={`absolute top-0 left-0 right-0 h-[2px] ${colors.bg} opacity-70`} />

                        <div className="space-y-5">
                          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                            <div>
                              <label className="text-[10px] font-mono tracking-[0.2em] text-[#8B8B8B] uppercase block">
                                CUSTOM PASSWORD ENTROPY CHECKER
                              </label>
                              <span className="text-[9px] font-mono text-zinc-500 uppercase mt-1 block">
                                Evaluate your own passphrase against real-time cryptographic bounds
                              </span>
                            </div>
                            {customPassword && (
                              <button
                                onClick={() => {
                                  setCustomPassword('');
                                  addConsoleLog('TESTER: Cleared custom password buffer');
                                }}
                                className="text-[9px] font-mono text-red-400 hover:text-red-500 hover:underline tracking-widest uppercase self-start sm:self-auto"
                              >
                                [ CLEAR BUFFER ]
                              </button>
                            )}
                          </div>

                          <div className="relative">
                            <input
                              type="text"
                              value={customPassword}
                              onChange={(e) => {
                                setCustomPassword(e.target.value);
                                if (e.target.value) {
                                  addConsoleLog(`TESTER: Custom password stream evaluated // Length: ${e.target.value.length}`);
                                }
                              }}
                              placeholder="TYPE OR PASTE CUSTOM PASSPHRASE HERE..."
                              className="w-full bg-black/60 border border-white/5 focus:border-red-500/50 hover:border-white/10 p-4 md:p-5 rounded-lg text-white font-mono text-sm md:text-base tracking-wider placeholder:text-zinc-600 focus:outline-none focus:ring-0 transition-all select-all pr-12"
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600">
                              <Lock className={`w-4 h-4 ${customPassword ? 'text-red-500' : 'text-zinc-600'} transition-colors`} />
                            </div>
                          </div>

                          {/* Output Grid */}
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-1 font-mono">
                            {/* Entropy score block */}
                            <div className="bg-black/40 border border-white/5 p-4 rounded-lg">
                              <span className="text-[8px] text-[#8B8B8B] tracking-widest uppercase block mb-1">SHANNON ENTROPY</span>
                              <div className="text-xl font-bold text-white tracking-wide">
                                {calculateCustomEntropy(customPassword)} <span className="text-xs text-[#8B8B8B]">BITS</span>
                              </div>
                              <span className="text-[8px] text-zinc-500 uppercase block mt-1">LOG2 CHARACTER POOL</span>
                            </div>

                            {/* Strength classification block */}
                            <div className="bg-black/40 border border-white/5 p-4 rounded-lg">
                              <span className="text-[8px] text-[#8B8B8B] tracking-widest uppercase block mb-1">STRENGTH RATING</span>
                              <div className={`text-sm md:text-base font-bold uppercase tracking-wider ${getCustomStrength(calculateCustomEntropy(customPassword)).color}`}>
                                {getCustomStrength(calculateCustomEntropy(customPassword)).text}
                              </div>
                              <span className="text-[8px] text-zinc-500 uppercase block mt-1">
                                {getCustomStrength(calculateCustomEntropy(customPassword)).desc}
                              </span>
                            </div>

                            {/* Brute force estimation block */}
                            <div className="bg-black/40 border border-white/5 p-4 rounded-lg md:col-span-2">
                              <span className="text-[8px] text-[#8B8B8B] tracking-widest uppercase block mb-1">ESTIMATED CRACK TIME</span>
                              <div className="text-xs md:text-sm font-bold text-white uppercase tracking-wider">
                                {estimateCrackTime(calculateCustomEntropy(customPassword))}
                              </div>
                              <span className="text-[8px] text-zinc-500 uppercase block mt-1">
                                ASSUMING SUPERCOMPUTER ARRAY WITH 10G GUESSES/SEC
                              </span>
                            </div>
                          </div>

                          {/* Visual segment bars representing entropy progress */}
                          <div className="space-y-2">
                            <div className="flex justify-between items-center font-mono text-[9px] text-[#8B8B8B] tracking-wider">
                              <span>ENTROPY DENSITY GRAPH:</span>
                              <span className="text-white">
                                {customPassword.length} CHARS // {/[a-z]/.test(customPassword) ? 'L ' : ''}{/[A-Z]/.test(customPassword) ? 'U ' : ''}{/[0-9]/.test(customPassword) ? 'D ' : ''}{/[^a-zA-Z0-9]/.test(customPassword) ? 'S' : ''} POOL
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-8 gap-1 h-2">
                              {Array.from({ length: 8 }).map((_, i) => {
                                const customEntropy = calculateCustomEntropy(customPassword);
                                const blocksToFill = getCustomStrength(customEntropy).blocks;
                                const isActive = i < blocksToFill;
                                return (
                                  <div
                                    key={i}
                                    className={`h-full rounded-sm transition-all duration-300 ${
                                      isActive 
                                        ? `${colors.bg} ${colors.glow}` 
                                        : 'bg-white/5 border border-white/5'
                                    }`}
                                  />
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Advanced Options Matrix Panel */}
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        
                        {/* Interactive Character Selectors */}
                        <div className="lg:col-span-2 bg-[#0B0B0B] border border-white/5 rounded-lg p-5 space-y-5">
                          <div className="text-[10px] font-mono tracking-[0.2em] text-[#8B8B8B] uppercase border-b border-white/5 pb-3">
                            MOD_VISUAL // CRYPTOGRAPHIC CONFIGURATOR
                          </div>

                          {/* Slider for entropy/length override (visual only) */}
                          <div className="space-y-3 font-mono">
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-[#C7C7C7] tracking-wider">DEFAULT SEED LENGTH:</span>
                              <span className={`font-bold ${colors.text}`}>{entropyLength}_CHARS</span>
                            </div>
                            <input 
                              type="range" 
                              min="12" 
                              max="64" 
                              value={entropyLength}
                              onChange={(e) => {
                                setEntropyLength(parseInt(e.target.value));
                                addConsoleLog(`OVERRODE CONFIG: PREFERRED LENGTH -> ${e.target.value}`);
                              }}
                              className="w-full accent-red-500 cursor-ew-resize bg-white/10 rounded h-1" 
                            />
                            <div className="flex justify-between text-[9px] text-white/30">
                              <span>12_CHARS (MIN)</span>
                              <span>32_CHARS (RECOMMENDED)</span>
                              <span>64_CHARS (VAULT_LIMIT)</span>
                            </div>
                          </div>

                          {/* Toggle Grid */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                            
                            <label className="flex items-center justify-between p-3 rounded bg-black/40 border border-white/5 hover:border-white/10 cursor-pointer transition-all">
                              <div className="font-mono">
                                <div className="text-xs text-white tracking-wider">Include Uppercase (A-Z)</div>
                                <div className="text-[9px] text-[#8B8B8B] uppercase">CAPITAL ALPHABET NODES</div>
                              </div>
                              <input 
                                type="checkbox" 
                                checked={genOpts.uppercase} 
                                onChange={(e) => setGenOpts({...genOpts, uppercase: e.target.checked})}
                                className="rounded bg-[#111111] border-white/10 text-red-500 focus:ring-0 cursor-pointer"
                              />
                            </label>

                            <label className="flex items-center justify-between p-3 rounded bg-black/40 border border-white/5 hover:border-white/10 cursor-pointer transition-all">
                              <div className="font-mono">
                                <div className="text-xs text-white tracking-wider">Include Lowercase (a-z)</div>
                                <div className="text-[9px] text-[#8B8B8B] uppercase">LOWER ALPHABET NODES</div>
                              </div>
                              <input 
                                type="checkbox" 
                                checked={genOpts.lowercase} 
                                onChange={(e) => setGenOpts({...genOpts, lowercase: e.target.checked})}
                                className="rounded bg-[#111111] border-white/10 text-red-500 focus:ring-0 cursor-pointer"
                              />
                            </label>

                            <label className="flex items-center justify-between p-3 rounded bg-black/40 border border-white/5 hover:border-white/10 cursor-pointer transition-all">
                              <div className="font-mono">
                                <div className="text-xs text-white tracking-wider">Include Numbers (0-9)</div>
                                <div className="text-[9px] text-[#8B8B8B] uppercase">INTEGERS 0 THROUGH 9</div>
                              </div>
                              <input 
                                type="checkbox" 
                                checked={genOpts.numbers} 
                                onChange={(e) => setGenOpts({...genOpts, numbers: e.target.checked})}
                                className="rounded bg-[#111111] border-white/10 text-red-500 focus:ring-0 cursor-pointer"
                              />
                            </label>

                            <label className="flex items-center justify-between p-3 rounded bg-black/40 border border-white/5 hover:border-white/10 cursor-pointer transition-all">
                              <div className="font-mono">
                                <div className="text-xs text-white tracking-wider">Include Special Symbols (!@#$)</div>
                                <div className="text-[9px] text-[#8B8B8B] uppercase">ASCII CHARACTER CHARTS</div>
                              </div>
                              <input 
                                type="checkbox" 
                                checked={genOpts.symbols} 
                                onChange={(e) => setGenOpts({...genOpts, symbols: e.target.checked})}
                                className="rounded bg-[#111111] border-white/10 text-red-500 focus:ring-0 cursor-pointer"
                              />
                            </label>

                            <label className="flex items-center justify-between p-3 rounded bg-black/40 border border-white/5 hover:border-white/10 cursor-pointer transition-all">
                              <div className="font-mono">
                                <div className="text-xs text-white tracking-wider">Avoid Ambiguous Characters</div>
                                <div className="text-[9px] text-[#8B8B8B] uppercase">EXCLUDES SIMILAR SHAPES (O,0,l,1)</div>
                              </div>
                              <input 
                                type="checkbox" 
                                checked={genOpts.excludeAmbiguous} 
                                onChange={(e) => setGenOpts({...genOpts, excludeAmbiguous: e.target.checked})}
                                className="rounded bg-[#111111] border-white/10 text-red-500 focus:ring-0 cursor-pointer"
                              />
                            </label>

                            <label className="flex items-center justify-between p-3 rounded bg-black/40 border border-white/5 hover:border-white/10 cursor-pointer transition-all">
                              <div className="font-mono">
                                <div className="text-xs text-white tracking-wider">Pronounceable Passphrase</div>
                                <div className="text-[9px] text-[#8B8B8B] uppercase">MEMORABLE ALGORITHMIC CHAINS</div>
                              </div>
                              <input 
                                type="checkbox" 
                                checked={genOpts.pronounceable} 
                                onChange={(e) => setGenOpts({...genOpts, pronounceable: e.target.checked})}
                                className="rounded bg-[#111111] border-white/10 text-red-500 focus:ring-0 cursor-pointer"
                              />
                            </label>

                          </div>
                        </div>

                        {/* Seed entropy context panel */}
                        <div className="bg-[#0B0B0B] border border-white/5 rounded-lg p-5 flex flex-col justify-between font-mono">
                          <div className="space-y-4">
                            <div className="text-[10px] tracking-[0.2em] text-[#8B8B8B] uppercase border-b border-white/5 pb-3">
                              PF_ENT_03 // MATHEMATICAL PROOF
                            </div>

                            <p className="text-xs text-[#C7C7C7] leading-relaxed">
                              PassForge utilizes modern **Shannon Entropy calculations** to map character variations against standard mathematical brute-force matrices.
                            </p>

                            <div className="bg-black/60 p-3.5 border border-white/5 rounded space-y-2">
                              <div className="flex justify-between items-center text-[10px]">
                                <span className="text-zinc-500">POSSIBLE STATES:</span>
                                <span className="text-white text-right font-bold">~9.2 x 10²⁴</span>
                              </div>
                              <div className="flex justify-between items-center text-[10px]">
                                <span className="text-zinc-500">KEY COMPLEXITY:</span>
                                <span className="text-white text-right font-bold">VERY_HIGH</span>
                              </div>
                              <div className="flex justify-between items-center text-[10px]">
                                <span className="text-zinc-500">FIPS_140-2_COMPLIANCE:</span>
                                <span className="text-emerald-400 text-right font-bold">APPROVED</span>
                              </div>
                            </div>
                          </div>

                          <div className="pt-6 border-t border-white/5 mt-6 text-[9px] text-zinc-500 leading-normal uppercase">
                            Warning: Always test key strengths prior to assigning credentials inside automated production systems.
                          </div>
                        </div>

                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'documentation' && (
                    /* ==================================================================== */
                    /* SCREEN 4: DOCUMENTATION VIEW                                         */
                    /* ==================================================================== */
                    <motion.div
                      key="tab-documentation"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.25 }}
                      className="space-y-6 max-w-5xl mx-auto"
                    >
                      {/* Grid structure matching docs design */}
                      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        
                        {/* Sidebar topics navigation */}
                        <div className="bg-[#0B0B0B] border border-white/5 rounded-lg p-4 font-mono space-y-1 self-start select-none">
                          <span className="text-[9px] text-[#8B8B8B] tracking-widest uppercase block px-2.5 py-1.5 border-b border-white/5 mb-2">DOC_SECTIONS</span>
                          <button className="w-full text-left px-2.5 py-1.5 rounded bg-white/5 text-white text-xs tracking-wider flex items-center justify-between">
                            01. Getting Started <ChevronRight className="w-3 h-3 text-red-500" />
                          </button>
                          <button className="w-full text-left px-2.5 py-1.5 rounded text-zinc-400 hover:text-white text-xs tracking-wider transition-all">
                            02. CLI Operations
                          </button>
                          <button className="w-full text-left px-2.5 py-1.5 rounded text-zinc-400 hover:text-white text-xs tracking-wider transition-all">
                            03. Cipher Matrices
                          </button>
                          <button className="w-full text-left px-2.5 py-1.5 rounded text-zinc-400 hover:text-white text-xs tracking-wider transition-all">
                            04. Technical Spec
                          </button>
                        </div>

                        {/* Content viewport */}
                        <div className="lg:col-span-3 space-y-6">
                          
                          {/* Getting Started Block */}
                          <div className="bg-[#0B0B0B] border border-white/5 rounded-lg p-6 space-y-4">
                            <h2 className="text-lg font-orbitron font-bold tracking-wider text-white">
                              01/ GETTING STARTED
                            </h2>
                            <p className="font-mono text-xs text-[#C7C7C7] leading-relaxed">
                              The PassForge cryptosystem provides professional terminal interfaces designed to securely manage local cryptographic variables, establish network bounds, and prevent lateral key leaks.
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="bg-black/40 border border-white/5 p-4 rounded font-mono">
                                <div className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider mb-1">ENVIRONMENT_INIT</div>
                                <p className="text-[11px] text-[#C7C7C7] leading-relaxed">
                                  Define variables inside secure local buffers to establish a zero-leak network frame node on initialization.
                                </p>
                                <span className="inline-block bg-white/5 border border-white/10 text-white text-[8px] px-2 py-0.5 rounded uppercase mt-2 font-bold select-none">REQUIRED</span>
                              </div>
                              <div className="bg-black/40 border border-white/5 p-4 rounded font-mono">
                                <div className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider mb-1">KEY_PAIR_GEN</div>
                                <p className="text-[11px] text-[#C7C7C7] leading-relaxed">
                                  Generate 4096-bit local security tokens to facilitate peer-to-peer handshakes between adjacent systems.
                                </p>
                                <span className="inline-block bg-[#FF2D2D]/10 border border-red-500/20 text-[#FF2D2D] text-[8px] px-2 py-0.5 rounded uppercase mt-2 font-bold select-none">ENCRYPTED</span>
                              </div>
                            </div>
                          </div>

                          {/* CLI Box */}
                          <div className="bg-[#0B0B0B] border border-white/5 rounded-lg p-6 space-y-4">
                            <h2 className="text-lg font-orbitron font-bold tracking-wider text-white">
                              02/ CLI COMMAND INTERFACE
                            </h2>
                            <p className="font-mono text-xs text-[#C7C7C7]">
                              Integrate PassForge variables seamlessly into standard bash/zsh automation scripts:
                            </p>

                            <div className="bg-black/80 rounded-lg p-4 font-mono text-xs text-[#C7C7C7] border border-white/5 relative">
                              <div className="absolute top-2 right-3 text-[9px] text-zinc-600 uppercase select-none">
                                bash - passforge-cli v2.4
                              </div>
                              <div className="flex gap-2 mb-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                                <span className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                              </div>

                              <div className="space-y-4 mt-4 pt-2">
                                <div>
                                  <div className="text-zinc-500"># Authenticate shell context</div>
                                  <div className="text-white mt-1">
                                    <span className="text-red-400">$</span> pf-auth login --node-id &quot;MAIN_FRAME_01&quot;
                                  </div>
                                  <div className="text-emerald-400 mt-0.5">SUCCESS: Token accepted. TTL: 3600s</div>
                                </div>

                                <div>
                                  <div className="text-zinc-500"># Pull next high-entropy credential stream</div>
                                  <div className="text-white mt-1">
                                    <span className="text-red-400">$</span> pf-gen --length 32 --symbols --exclude-unambiguous
                                  </div>
                                  <div className="bg-[#111111] p-2 border border-white/5 rounded mt-1.5 text-white/90">
                                    8f-3d-2a!9Z_kl$0#Pq2m*1v9-Lp0Qx-Y9
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Tactical Keybinds */}
                          <div className="bg-[#0B0B0B] border border-white/5 rounded-lg p-6 space-y-4">
                            <h2 className="text-lg font-orbitron font-bold tracking-wider text-white">
                              03/ TACTICAL KEYBINDS
                            </h2>
                            <p className="font-mono text-xs text-[#C7C7C7]">
                              Configure lightning-fast overrides directly inside your active operational console:
                            </p>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 select-none">
                              <div className="bg-black/50 border border-white/5 p-3 rounded text-center font-mono">
                                <div className="text-zinc-500 text-[9px] uppercase">NAVIGATE HOME</div>
                                <div className="text-white font-bold text-sm mt-1">CTRL + L</div>
                              </div>
                              <div className="bg-black/50 border border-white/5 p-3 rounded text-center font-mono">
                                <div className="text-zinc-500 text-[9px] uppercase">GENERATE PRESET</div>
                                <div className="text-white font-bold text-sm mt-1">ALT + G</div>
                              </div>
                              <div className="bg-black/50 border border-white/5 p-3 rounded text-center font-mono">
                                <div className="text-zinc-500 text-[9px] uppercase">REVEAL HISTORY</div>
                                <div className="text-white font-bold text-sm mt-1">SHIFT + P</div>
                              </div>
                              <div className="bg-black/50 border border-white/5 p-3 rounded text-center font-mono">
                                <div className="text-zinc-500 text-[9px] uppercase">TOGGLE CONFIG</div>
                                <div className="text-white font-bold text-sm mt-1">ESC</div>
                              </div>
                            </div>
                          </div>

                        </div>

                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'about' && (
                    /* ==================================================================== */
                    /* SCREEN 5: ABOUT VIEW                                                 */
                    /* ==================================================================== */
                    <motion.div
                      key="tab-about"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.25 }}
                      className="space-y-6 max-w-7xl mx-auto"
                    >
                      {/* Mission Statement */}
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        
                        <div className="lg:col-span-8 bg-[#0B0B0B] border border-white/5 rounded-lg p-6 space-y-4">
                          <span className="text-[10px] font-mono tracking-[0.2em] text-[#8B8B8B] uppercase">
                            [01] MISSION_STATEMENT
                          </span>
                          <h2 className="text-xl md:text-2xl font-orbitron font-extrabold tracking-wider text-white">
                            DEMOCRATIZING CRYPTOGRAPHICALLY SECURE IDENTITY.
                          </h2>
                          
                          <div className="border-l-2 border-[#FF2D2D] pl-4 py-1.5 font-mono text-xs text-[#C7C7C7] leading-relaxed space-y-3">
                            <p>
                              In an era of total surveillance and centralized data storage, PassForge delivers modular infrastructure necessary to defend local credentials and secure autonomous keys.
                            </p>
                            <p>
                              We believe cryptographic isolation is not an optional premium feature—it is a baseline civil right backed directly by mathematical probability laws.
                            </p>
                          </div>

                          <div className="pt-2 flex gap-3">
                            <button
                              id="btn-manifesto"
                              onClick={() => addConsoleLog('DOWNLOAD: Initiated Cryptographic Manifesto bundle')}
                              className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 rounded text-xs font-mono tracking-wider text-white transition-all"
                            >
                              DOWNLOAD MANIFESTO
                            </button>
                            <button
                              id="btn-audit-logs"
                              onClick={() => addConsoleLog('AUDIT: Triggered system transaction audit history log fetch')}
                              className="px-4 py-2 bg-transparent hover:bg-white/5 border border-white/10 text-white/80 hover:text-white rounded text-xs font-mono tracking-wider transition-all"
                            >
                              VIEW AUDIT LOGS
                            </button>
                          </div>
                        </div>

                        {/* Top sidebar statistics details */}
                        <div className="lg:col-span-4 bg-[#0B0B0B] border border-white/5 rounded-lg p-5 flex flex-col justify-between font-mono space-y-4 select-none">
                          <div className="space-y-1.5 border-b border-white/5 pb-3">
                            <span className="text-[9px] text-[#8B8B8B] tracking-widest uppercase block">SYSTEM_UPTIME</span>
                            <div className="text-sm font-bold text-white">99.9999% // ACTIVE</div>
                          </div>
                          <div className="space-y-1.5 border-b border-white/5 pb-3">
                            <span className="text-[9px] text-[#8B8B8B] tracking-widest uppercase block">DATA_INTEGRITY</span>
                            <div className="text-sm font-bold text-white">AES_256_GCM</div>
                          </div>
                          <div className="space-y-1.5">
                            <span className="text-[9px] text-[#8B8B8B] tracking-widest uppercase block">GEO_REDUNDANCY</span>
                            <div className="text-sm font-bold text-white">12_NODES_GLOBAL</div>
                          </div>
                        </div>

                      </div>

                      {/* Timeline: Project Evolution */}
                      <div className="bg-[#0B0B0B] border border-white/5 rounded-lg p-6 space-y-5">
                        <span className="text-[10px] font-mono tracking-[0.2em] text-[#8B8B8B] uppercase">
                          [02] PROJECT_EVOLUTION_TIMELINE
                        </span>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-2 select-none">
                          <div className="font-mono space-y-2 relative pl-4 border-l border-white/5 hover:border-[#FF2D2D]/30 transition-all">
                            <div className="absolute top-1.5 -left-[5px] w-2.5 h-2.5 rounded-full bg-zinc-800 border border-white/20" />
                            <div className="text-[10px] text-zinc-500">2021.Q3</div>
                            <div className="text-xs text-white font-bold tracking-wider">PROTOCOL_GENESIS</div>
                            <p className="text-[11px] text-[#C7C7C7] leading-relaxed">
                              Initial whitepaper published detailing offline peer-to-peer verification schemas.
                            </p>
                          </div>

                          <div className="font-mono space-y-2 relative pl-4 border-l border-white/5 hover:border-[#FF2D2D]/30 transition-all">
                            <div className="absolute top-1.5 -left-[5px] w-2.5 h-2.5 rounded-full bg-zinc-800 border border-white/20" />
                            <div className="text-[10px] text-zinc-500">2022.Q2</div>
                            <div className="text-xs text-white font-bold tracking-wider">K0_ENCRYPTION</div>
                            <p className="text-[11px] text-[#C7C7C7] leading-relaxed">
                              Rust-based cryptographic libraries built and audited by independent cybersecurity firms.
                            </p>
                          </div>

                          <div className="font-mono space-y-2 relative pl-4 border-l border-white/5 hover:border-[#FF2D2D]/30 transition-all">
                            <div className="absolute top-1.5 -left-[5px] w-2.5 h-2.5 rounded-full bg-zinc-800 border border-white/20" />
                            <div className="text-[10px] text-zinc-500">2023.Q1</div>
                            <div className="text-xs text-white font-bold tracking-wider">MAINNET_ALPHA</div>
                            <p className="text-[11px] text-[#C7C7C7] leading-relaxed">
                              Initial release deployed to active security nodes across four geographic continents.
                            </p>
                          </div>

                          <div className="font-mono space-y-2 relative pl-4 border-l border-white/5 hover:border-[#FF2D2D]/30 transition-all">
                            <div className="absolute top-1.5 -left-[5px] w-2.5 h-2.5 rounded-full bg-[#FF2D2D]/80 border border-red-500/20 animate-pulse" />
                            <div className="text-[10px] text-[#FF2D2D] font-bold">2024.PRESENT</div>
                            <div className="text-xs text-white font-bold tracking-wider">ECOSYSTEM_EXPANSION</div>
                            <p className="text-[11px] text-[#C7C7C7] leading-relaxed">
                              Hardened system interface client built with customizable entropy weights and layouts.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Tech Stack and Red Team developer slots */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 font-mono">
                        
                        {/* Stack cards */}
                        <div className="bg-[#0B0B0B] border border-white/5 rounded-lg p-5 space-y-4">
                          <span className="text-[10px] tracking-[0.2em] text-[#8B8B8B] uppercase">
                            [03] TECH_STACK_SPECIFICATION
                          </span>

                          <div className="space-y-3">
                            <div className="bg-black/40 border border-white/5 p-3 rounded flex items-center justify-between">
                              <div>
                                <h4 className="text-xs text-white font-bold tracking-wider">RUST_CORE</h4>
                                <p className="text-[10px] text-[#8B8B8B] mt-0.5 uppercase">MEMORY_SAFE COMPOSABLE LIBS</p>
                              </div>
                              <span className="text-[9px] bg-red-500/10 border border-red-500/20 text-red-400 px-2 py-0.5 rounded font-bold uppercase select-none">STABLE</span>
                            </div>

                            <div className="bg-black/40 border border-white/5 p-3 rounded flex items-center justify-between">
                              <div>
                                <h4 className="text-xs text-white font-bold tracking-wider">WEB_ASSEMBLY</h4>
                                <p className="text-[10px] text-[#8B8B8B] mt-0.5 uppercase">CLIENT SECURE SANDBOX FLUSH</p>
                              </div>
                              <span className="text-[9px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-bold uppercase select-none">ISOLATED</span>
                            </div>

                            <div className="bg-black/40 border border-white/5 p-3 rounded flex items-center justify-between">
                              <div>
                                <h4 className="text-xs text-white font-bold tracking-wider">AES-256-GCM</h4>
                                <p className="text-[10px] text-[#8B8B8B] mt-0.5 uppercase">MILITARY-GRADE SYMMETRIC SHIELD</p>
                              </div>
                              <span className="text-[9px] bg-blue-500/10 border border-blue-500/20 text-blue-400 px-2 py-0.5 rounded font-bold uppercase select-none">FIPS_COMPLIANT</span>
                            </div>
                          </div>
                        </div>

                        {/* Team cards */}
                        <div className="bg-[#0B0B0B] border border-white/5 rounded-lg p-5 space-y-4">
                          <span className="text-[10px] tracking-[0.2em] text-[#8B8B8B] uppercase">
                            [04] RED_TEAM_DEV_HOLDERS
                          </span>

                          <div className="space-y-3 select-none">
                            <div className="bg-black/40 border border-white/5 p-3 rounded flex items-center gap-3">
                              <div className="w-8 h-8 rounded bg-zinc-900 border border-white/10 flex items-center justify-center font-bold text-xs text-red-500">
                                S_N
                              </div>
                              <div>
                                <h4 className="text-xs text-white font-bold tracking-wider">S_NULL // ARCHITECT</h4>
                                <p className="text-[10px] text-[#8B8B8B] mt-0.5 uppercase">EX-DEFENSE PROTOCOL ARCHITECT</p>
                              </div>
                            </div>

                            <div className="bg-black/40 border border-white/5 p-3 rounded flex items-center gap-3">
                              <div className="w-8 h-8 rounded bg-zinc-900 border border-white/10 flex items-center justify-center font-bold text-xs text-emerald-500">
                                K_V
                              </div>
                              <div>
                                <h4 className="text-xs text-white font-bold tracking-wider">K_VOID // CORE_ENGINEER</h4>
                                <p className="text-[10px] text-[#8B8B8B] mt-0.5 uppercase">SYSTEMS SECURITY VETERAN</p>
                              </div>
                            </div>

                            <div className="bg-black/40 border border-white/5 p-3 rounded flex items-center gap-3">
                              <div className="w-8 h-8 rounded bg-zinc-900 border border-white/10 flex items-center justify-center font-bold text-xs text-blue-500">
                                X_T
                              </div>
                              <div>
                                <h4 className="text-xs text-white font-bold tracking-wider">X_TRACE // SECURITY_AUDIT</h4>
                                <p className="text-[10px] text-[#8B8B8B] mt-0.5 uppercase">PENETRATION AUDIT SPECIALIST</p>
                              </div>
                            </div>
                          </div>
                        </div>

                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'settings' && (
                    /* ==================================================================== */
                    /* SCREEN 6: SETTINGS VIEW                                              */
                    /* ==================================================================== */
                    <motion.div
                      key="tab-settings"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.25 }}
                      className="space-y-6 max-w-4xl mx-auto"
                    >
                      {/* Active theme choices (Obsidian Red, Cobalt Blue, Toxic Green) */}
                      <div className="bg-[#0B0B0B] border border-white/5 rounded-lg p-5 space-y-4">
                        <span className="text-[10px] font-mono tracking-[0.2em] text-[#8B8B8B] uppercase block">
                          MOD_VISUAL // CODESET_THEMING
                        </span>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          
                          {/* Option 1: Obsidian Red */}
                          <div 
                            onClick={() => {
                              setActiveTheme('red');
                              addConsoleLog('UI: Changed system accent theme to Obsidian Red');
                            }}
                            className={`p-4 rounded-lg bg-[#111111] border cursor-pointer transition-all ${
                              activeTheme === 'red' 
                                ? 'border-red-500 shadow-[0_0_12px_rgba(255,45,45,0.15)] bg-red-500/5' 
                                : 'border-white/5 hover:border-white/10'
                            }`}
                          >
                            <div className="flex justify-between items-center mb-3">
                              <span className="w-4 h-4 rounded bg-[#FF2D2D] block" />
                              {activeTheme === 'red' && <span className="text-[9px] font-mono bg-red-500/20 text-[#FF2D2D] px-1.5 py-0.5 rounded uppercase font-bold">ACTIVE</span>}
                            </div>
                            <h4 className="text-xs font-mono font-bold text-white tracking-wider">OBSIDIAN RED</h4>
                            <p className="text-[10px] font-mono text-zinc-500 mt-1 uppercase">TACTICAL WARFARE SUITE</p>
                          </div>

                          {/* Option 2: Cobalt Blue */}
                          <div 
                            onClick={() => {
                              setActiveTheme('blue');
                              addConsoleLog('UI: Changed system accent theme to Cobalt Blue');
                            }}
                            className={`p-4 rounded-lg bg-[#111111] border cursor-pointer transition-all ${
                              activeTheme === 'blue' 
                                ? 'border-[#2D8EFF] shadow-[0_0_12px_rgba(45,142,255,0.15)] bg-blue-500/5' 
                                : 'border-white/5 hover:border-white/10'
                            }`}
                          >
                            <div className="flex justify-between items-center mb-3">
                              <span className="w-4 h-4 rounded bg-[#2D8EFF] block" />
                              {activeTheme === 'blue' && <span className="text-[9px] font-mono bg-blue-500/20 text-[#2D8EFF] px-1.5 py-0.5 rounded uppercase font-bold">ACTIVE</span>}
                            </div>
                            <h4 className="text-xs font-mono font-bold text-white tracking-wider">COBALT BLUE</h4>
                            <p className="text-[10px] font-mono text-zinc-500 mt-1 uppercase">QUANTUM CIPHER FLUID</p>
                          </div>

                          {/* Option 3: Toxic Green */}
                          <div 
                            onClick={() => {
                              setActiveTheme('green');
                              addConsoleLog('UI: Changed system accent theme to Toxic Green');
                            }}
                            className={`p-4 rounded-lg bg-[#111111] border cursor-pointer transition-all ${
                              activeTheme === 'green' 
                                ? 'border-emerald-500 shadow-[0_0_12px_rgba(63,185,80,0.15)] bg-emerald-500/5' 
                                : 'border-white/5 hover:border-white/10'
                            }`}
                          >
                            <div className="flex justify-between items-center mb-3">
                              <span className="w-4 h-4 rounded bg-[#3FB950] block" />
                              {activeTheme === 'green' && <span className="text-[9px] font-mono bg-emerald-500/20 text-[#3FB950] px-1.5 py-0.5 rounded uppercase font-bold">ACTIVE</span>}
                            </div>
                            <h4 className="text-xs font-mono font-bold text-white tracking-wider">TOXIC GREEN</h4>
                            <p className="text-[10px] font-mono text-zinc-500 mt-1 uppercase">HARDENED MAINFRAME TERMINAL</p>
                          </div>

                        </div>
                      </div>

                      {/* User preferences */}
                      <div className="bg-[#0B0B0B] border border-white/5 rounded-lg p-5 space-y-4">
                        <span className="text-[10px] font-mono tracking-[0.2em] text-[#8B8B8B] uppercase block border-b border-white/5 pb-3">
                          MOD_PREF // USER_PREFERENCES
                        </span>

                        <div className="space-y-4 font-mono">
                          
                          {/* Toggle 1: Animations */}
                          <div className="flex items-center justify-between p-3 rounded bg-black/40 border border-white/5">
                            <div>
                              <h4 className="text-xs text-white font-bold tracking-wider">Interface Animations</h4>
                              <p className="text-[10px] text-zinc-500 uppercase mt-0.5">ENABLE SHADER EFFECTS AND SCANLINES</p>
                            </div>
                            <button 
                              onClick={() => {
                                setAnimationsEnabled(!animationsEnabled);
                                addConsoleLog(`TOGGLED ANIMATIONS: ${!animationsEnabled ? 'ON' : 'OFF'}`);
                              }}
                              className={`w-12 h-6 rounded-full p-1 transition-all ${animationsEnabled ? colors.bg : 'bg-zinc-800'}`}
                            >
                              <div className={`w-4 h-4 rounded-full bg-white transition-all ${animationsEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
                            </button>
                          </div>

                          {/* Length override parameter (repeats standard choice) */}
                          <div className="flex items-center justify-between p-3 rounded bg-black/40 border border-white/5">
                            <div>
                              <h4 className="text-xs text-white font-bold tracking-wider">Default Entropy Length</h4>
                              <p className="text-[10px] text-zinc-500 uppercase mt-0.5">CHARACTER SEED LENGTH DEPTH FOR PRIMARY VAULT</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className={`font-bold ${colors.text}`}>{entropyLength}_CHARS</span>
                              <input 
                                type="range" 
                                min="12" 
                                max="64" 
                                value={entropyLength}
                                onChange={(e) => setEntropyLength(parseInt(e.target.value))}
                                className="w-24 accent-red-500 cursor-ew-resize bg-white/10 rounded h-1" 
                              />
                            </div>
                          </div>

                          {/* Toggle 3: Auto Copy */}
                          <div className="flex items-center justify-between p-3 rounded bg-black/40 border border-white/5">
                            <div>
                              <h4 className="text-xs text-white font-bold tracking-wider">Auto-Copy To Clipboard</h4>
                              <p className="text-[10px] text-zinc-500 uppercase mt-0.5">TRANSFER TO OS CLIPBOARD INSTANTLY ON GENERATION</p>
                            </div>
                            <button 
                              onClick={() => {
                                setAutoCopyToClipboard(!autoCopyToClipboard);
                                addConsoleLog(`TOGGLED AUTO-COPY: ${!autoCopyToClipboard ? 'ON' : 'OFF'}`);
                              }}
                              className={`w-12 h-6 rounded-full p-1 transition-all ${autoCopyToClipboard ? colors.bg : 'bg-zinc-800'}`}
                            >
                              <div className={`w-4 h-4 rounded-full bg-white transition-all ${autoCopyToClipboard ? 'translate-x-6' : 'translate-x-0'}`} />
                            </button>
                          </div>

                        </div>
                      </div>

                      {/* Security Parameters Override */}
                      <div className="bg-[#0B0B0B] border border-white/5 rounded-lg p-5 space-y-4">
                        <span className="text-[10px] font-mono tracking-[0.2em] text-[#8B8B8B] uppercase block border-b border-white/5 pb-3">
                          MOD_SEC // VAULT_CIPHER_SUITES
                        </span>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono">
                          <div>
                            <label className="text-[9px] text-[#8B8B8B] tracking-widest uppercase block mb-1.5">SESSION TIMEOUT (SECONDS)</label>
                            <input 
                              type="number" 
                              value={sessionTimeout} 
                              onChange={(e) => {
                                setSessionTimeout(parseInt(e.target.value) || 0);
                                addConsoleLog(`OVERRODE CONFIG: SESSION TIMEOUT -> ${e.target.value}s`);
                              }}
                              className="w-full bg-black border border-white/10 hover:border-white/20 focus:outline-none focus:border-[#FF2D2D] p-3 text-xs text-white tracking-widest rounded" 
                            />
                          </div>

                          <div>
                            <label className="text-[9px] text-[#8B8B8B] tracking-widest uppercase block mb-1.5">ENCRYPTION PROTOCOL SUITE</label>
                            <select 
                              value={encryptionLevel} 
                              onChange={(e) => {
                                setEncryptionLevel(e.target.value);
                                addConsoleLog(`OVERRODE CONFIG: CIPHER PROTOCOL -> ${e.target.value}`);
                              }}
                              className="w-full bg-black border border-white/10 hover:border-white/20 focus:outline-none focus:border-[#FF2D2D] p-3 text-xs text-white tracking-widest rounded cursor-pointer"
                            >
                              <option value="AES-256-GCM">AES-256-GCM (MILITARY_GRADE)</option>
                              <option value="CHACHA20-POLY1305">CHACHA20-POLY1305 (STREAM)</option>
                              <option value="RSA-4096-PSS">RSA-4096-PSS (ASYMMETRIC)</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* DANGER ZONE CARD */}
                      <div className="bg-[#0B0B0B] border border-red-500/20 rounded-lg p-5 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-2 text-[8px] font-mono tracking-widest text-[#FF2D2D] uppercase select-none bg-red-500/5 border-b border-l border-red-500/20 font-bold">
                          CRITICAL_OP
                        </div>

                        <div className="space-y-4 pt-4">
                          <div className="flex items-center gap-3">
                            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
                            <div>
                              <h3 className="text-sm font-orbitron font-extrabold text-white tracking-wider">DANGER ZONE</h3>
                              <p className="text-[10px] font-mono text-[#8B8B8B] uppercase tracking-wider mt-0.5">IRREVERSIBLE SYSTEM PURGE OPERATIONS</p>
                            </div>
                          </div>

                          <div className="p-4 bg-red-500/5 rounded border border-red-500/10 font-mono text-xs text-zinc-300 leading-normal">
                            Warning: Executing this operation will immediately overwrite all active memory ciphers, clear recent password transactions, invalidate authorization variables, and restart the system boot frame. This action cannot be undone.
                          </div>

                          <button
                            id="btn-purge-system"
                            onClick={() => {
                              setShowWipeConfirm(true);
                              addConsoleLog('SYS: Opened danger zone mass purge warning prompt');
                            }}
                            className="w-full md:w-auto px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-mono text-xs font-bold tracking-widest rounded transition-all cursor-pointer shadow-[0_0_15px_rgba(239,68,68,0.15)]"
                          >
                            WIPE ALL LOCAL DATA // FORCE_REBOOT
                          </button>
                        </div>
                      </div>

                      {/* UI Diagnostic controls */}
                      <div className="bg-[#0B0B0B] border border-white/5 rounded-lg p-4 font-mono text-[10px] flex justify-between items-center select-none text-zinc-500">
                        <span>VERSION: v2.4.0-STABLE // BUILD_KEY: COMPILATION_SUCCESSFUL</span>
                        <button 
                          onClick={handleReplayBoot} 
                          className="hover:text-white transition-all uppercase flex items-center gap-1 cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          Replay Boot Checks
                        </button>
                      </div>

                    </motion.div>
                  )}

                </AnimatePresence>

              </div>

              {/* FOOTER AUDIT TRAIL LOG */}
              <footer className="px-6 py-3 border-t border-white/5 bg-[#040404]/80 text-[9px] font-mono tracking-widest text-[#8B8B8B] flex flex-col md:flex-row justify-between items-center gap-2 select-none">
                <span>SYS_LOG: SECURE_CHANNEL_ESTABLISHED // PASSFORGE_V2.4</span>
                <span className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                    ST_ENCRYPTED
                  </span>
                  <span className="text-white/20">|</span>
                  <span className="text-zinc-500">ST_SECURE</span>
                  <span className="text-white/20">|</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    ONLINE
                  </span>
                </span>
              </footer>

            </main>

            {/* WIPE DIALOG / WARNING MODAL OVERLAY */}
            <AnimatePresence>
              {showWipeConfirm && (
                <motion.div 
                  className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <motion.div 
                    className="max-w-md w-full bg-[#0B0B0B] border border-red-500/30 p-6 rounded-lg font-mono text-center space-y-6 shadow-2xl relative"
                    initial={{ scale: 0.95 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0.95 }}
                  >
                    {/* Corner micro borders */}
                    <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-red-500" />
                    <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-red-500" />
                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-red-500" />
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-red-500" />

                    <div className="flex flex-col items-center gap-3">
                      <AlertTriangle className="w-12 h-12 text-red-500 animate-bounce" />
                      <h3 className="text-base font-orbitron font-extrabold text-white tracking-widest uppercase">
                        CRITICAL THREAT ATTEMPT
                      </h3>
                      <p className="text-[10px] text-[#FF2D2D] uppercase tracking-widest font-bold">
                        SYSTEM WIPE THRESHOLD TRIPPED
                      </p>
                    </div>

                    <div className="text-xs text-[#C7C7C7] leading-relaxed bg-black/60 p-4 border border-white/5 rounded text-left space-y-2">
                      <p>You are about to purge all local system buffers. If you continue:</p>
                      <ul className="list-disc list-inside space-y-1 text-red-400">
                        <li>Recent memory keylogs are permanently lost</li>
                        <li>Session auth structures will collapse</li>
                        <li>All logs will be hard overwritten with null bytes</li>
                      </ul>
                    </div>

                    {wipeInProcess ? (
                      <div className="space-y-3 py-2">
                        <div className="text-[10px] text-yellow-500 font-bold uppercase animate-pulse">{wipeStatus}</div>
                        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-red-500 animate-[scanline-anim_2s_linear_infinite] w-2/3 mx-auto" />
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col sm:flex-row gap-3 pt-2">
                        <button
                          id="btn-confirm-wipe"
                          onClick={executeVolatileWipe}
                          className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 border border-transparent text-white font-bold text-xs tracking-wider rounded transition-all cursor-pointer"
                        >
                          PROCEED_MASS_WIPE // YES
                        </button>
                        <button
                          id="btn-cancel-wipe"
                          onClick={() => {
                            setShowWipeConfirm(false);
                            addConsoleLog('SYS: Cancelled danger zone purge action safely');
                          }}
                          className="flex-1 px-4 py-2 bg-[#111111] hover:bg-white/5 border border-white/10 text-[#C7C7C7] hover:text-white font-bold text-xs tracking-wider rounded transition-all cursor-pointer"
                        >
                          ABORT_OP // NO
                        </button>
                      </div>
                    )}
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
