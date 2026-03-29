'use client';
import { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform, useSpring, MotionValue, useAnimation } from 'framer-motion';
import DealDostLogo from './DealDostLogo';

const TOTAL_FRAMES = 240; 
const FRAME_PATH = '/frames'; 

function AnimatedChar({ 
  char, 
  globalIdx, 
  smoothProgress, 
  colorClass 
}: { 
  char: string, 
  globalIdx: number, 
  smoothProgress: MotionValue<number>,
  colorClass: string 
}) {
  const dirX = Math.sin(globalIdx * 13) * 120 + 50; 
  const dirY = -Math.abs(Math.cos(globalIdx * 7) * 200) - 80; 
  
  const charX = useTransform(smoothProgress, [0.15, 0.35], [0, dirX]);
  const charY = useTransform(smoothProgress, [0.15, 0.35], [0, dirY]);
  const charScale = useTransform(smoothProgress, [0.15, 0.35], [1, 0.1]);
  const charOpacity = useTransform(smoothProgress, [0.15, 0.32], [1, 0]); 
  const charBlur = useTransform(smoothProgress, [0.15, 0.35], ["0px", "10px"]);

  return (
    <motion.span 
      style={{ 
        x: charX, 
        y: charY, 
        scale: charScale, 
        opacity: charOpacity,
        filter: useTransform(charBlur, (blur) => `blur(${blur}) drop-shadow(0 0 4px rgba(212,175,55,0.15))`),
        display: 'inline-block'
      }}
      className={colorClass}
    >
      {char === " " ? "\u00A0" : char}
    </motion.span>
  );
}

export default function HeroCanvasAnimation({ onOpenAuth }: { onOpenAuth?: (mode: 'login'|'signup') => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [images, setImages] = useState<HTMLImageElement[]>([]);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);
  
  const { scrollYProgress, scrollY } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end']
  });

  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  const [hasScrolled, setHasScrolled] = useState(false);

  useEffect(() => {
    const unsub = scrollY.on("change", (y) => {
      if (y > 50 && !hasScrolled) {
        setHasScrolled(true);
      } else if (y <= 50 && hasScrolled) {
        setHasScrolled(false);
      }
    });
    return () => unsub();
  }, [scrollY, hasScrolled]);

  const text1Y = useTransform(smoothProgress, [0, 0.15, 0.35], [0, 0, -30]);
  
  // Phase 2 Panel Animations
  // Phase 2 Panel Animations synced with CTA trigger (0.50)
  const panelOpacity = useTransform(smoothProgress, [0.48, 0.55], [0, 1]);
  const panelY = useTransform(smoothProgress, [0.48, 0.55], [40, 0]);
  const panelBlur = useTransform(smoothProgress, [0.7, 0.78], ["0px", "12px"]);
  const panelFilter = useTransform(panelBlur, (blur) => `blur(${blur}) drop-shadow(0 15px 35px rgba(0,0,0,0.6))`);
  
  const ctaControls = useAnimation();
  const [ctaTriggered, setCtaTriggered] = useState(false);

  useEffect(() => {
    const unsub = smoothProgress.on("change", (latest) => {
      if (latest >= 0.50 && !ctaTriggered) {
        setCtaTriggered(true);
        ctaControls.start("visible");
      } else if (latest < 0.45 && ctaTriggered) {
        setCtaTriggered(false);
        ctaControls.start("hidden");
      }
    });
    return () => unsub();
  }, [smoothProgress, ctaTriggered, ctaControls]);

  const frameIndex = useTransform(smoothProgress, [0, 0.8], [0, TOTAL_FRAMES - 1]);

  useEffect(() => {
    const loadImages = async () => {
      const loadedArray: HTMLImageElement[] = new Array(TOTAL_FRAMES);
      let loadedCount = 0;
      
      const imagePromises = Array.from({ length: TOTAL_FRAMES }, (_, i) => {
        return new Promise<void>((resolve) => {
          const img = new Image();
          img.src = `${FRAME_PATH}/frame_${i}.webp`;
          img.onload = () => {
            loadedArray[i] = img;
            loadedCount++;
            setLoadProgress((loadedCount / TOTAL_FRAMES) * 100);
            resolve();
          };
          img.onerror = () => {
            resolve(); 
          };
        });
      });
      await Promise.all(imagePromises);
      setImages(loadedArray.filter(Boolean));
      setImagesLoaded(true);
    };
    loadImages();
  }, []);

  useEffect(() => {
    if (!imagesLoaded || images.length === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      renderFrame(); 
    };

    const renderFrame = () => {
      const currentFrame = Math.round(frameIndex.get());
      const clampedFrame = Math.max(0, Math.min(currentFrame, images.length - 1));
      const img = images[clampedFrame];
      if (img) {
        const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
        const x = (canvas.width / 2) - (img.width / 2) * scale;
        const y = (canvas.height / 2) - (img.height / 2) * scale;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); 

    const unsub = frameIndex.on('change', renderFrame);
    return () => {
      window.removeEventListener('resize', handleResize);
      unsub();
    };
  }, [imagesLoaded, images, frameIndex]);

  if (!imagesLoaded) {
    return (
      <div className="fixed inset-0 bg-[#0D0D0D] flex flex-col items-center justify-center z-50">
        <div className="w-64 h-1 bg-white/10 rounded-full overflow-hidden mb-4">
          <motion.div className="h-full bg-[#D4AF37]" initial={{ width: '0%' }} animate={{ width: `${loadProgress}%` }} />
        </div>
        <p className="text-[#D4AF37]/70 text-sm font-mono tracking-widest uppercase">Initializing Legal Core... {Math.round(loadProgress)}%</p>
      </div>
    );
  }

  const words1 = "Handshakes".split('');
  const words2 = "Don't".split('');
  const words3 = "Hold Up....".split('');

  const entryVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.96 },
    visible: (custom: number) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.7, ease: "easeOut", delay: custom * 0.1 }
    })
  };

  const floatAnimation = {
    y: [0, -5, 0],
    transition: { duration: 3, repeat: Infinity, ease: "easeInOut" }
  };

  return (
    <div ref={containerRef} id="home" className="relative h-[1000vh] bg-[#0D0D0D]">
      <div className="sticky top-0 h-screen w-full overflow-hidden" style={{ perspective: '1000px' }}>
        
        {/* THE BACKGROUND ENGINE */}
        <div className="absolute inset-0 w-full h-full pointer-events-none">
          <canvas ref={canvasRef} className="block w-full h-full" />
        </div>

        {/* Scroll Indicator */}
        <motion.div
          animate={{ opacity: hasScrolled ? 0 : 0.6 }}
          transition={{ duration: 0.3 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center pointer-events-none"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="flex flex-col items-center gap-1.5 text-[#D4AF37]"
          >
            <span className="text-[10px] md:text-xs font-inter uppercase tracking-[0.2em] font-medium drop-shadow-[0_0_8px_rgba(212,175,55,0.3)]">Scroll</span>
            <span className="text-sm font-light drop-shadow-[0_0_8px_rgba(212,175,55,0.3)]">↓</span>
          </motion.div>
        </motion.div>

        {/* Phase 1: Clean Focal Headline */}
        <motion.div 
          className="absolute top-[8vh] left-[4%] md:left-[5%] z-50 pointer-events-none text-left mb-8"
          animate={{ 
            opacity: hasScrolled ? 0 : 1,
            y: hasScrolled ? -20 : 0,
            filter: hasScrolled ? 'blur(8px)' : 'blur(0px)',
            scale: hasScrolled ? 0.95 : 1
          }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Subtle fade gradient behind left text side */}
          <div className="absolute -inset-16 bg-gradient-to-r from-black/80 via-black/40 to-transparent blur-3xl -z-10" />

          <motion.div 
            initial={{ opacity: 0, y: 30, scale: 0.98, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <h1 className="font-['Playfair_Display'] font-bold text-4xl md:text-5xl leading-[1.25] tracking-[-0.5px] drop-shadow-[0_4px_12px_rgba(0,0,0,0.35)]">
              <span className="text-[#D4AF37]">Trust</span>
              <span className="text-[#F5F5F4]"> Needs </span>
              <span className="text-[#D4AF37]">Proof...</span>
            </h1>
          </motion.div>
        </motion.div>

        {/* Phase 2: Assistant Chat UI (Left Side) */}
        <motion.div 
          style={{ 
            opacity: panelOpacity,
            y: panelY,
            filter: panelFilter,
            transform: 'translateZ(30px)'
          }}
          className="absolute bottom-[5%] left-[8%] md:left-[12%] z-40 pointer-events-none w-[92vw] sm:max-w-[420px]"
        >
          <motion.div 
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="flex flex-col bg-[#050505]/95 backdrop-blur-3xl border border-[#D4AF37]/15 shadow-[0_30px_60px_rgba(0,0,0,0.95)] rounded-2xl overflow-hidden pointer-events-auto"
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-white/5 bg-[#161616]/80">
              <div className="w-9 h-9 shrink-0 rounded-[10px] border border-[#D4AF37]/20 flex items-center justify-center bg-[#111111] shadow-[0_0_12px_rgba(212,175,55,0.15)] p-[6px]">
                <svg className="w-full h-full text-[#D4AF37] drop-shadow-[0_0_4px_rgba(212,175,55,0.4)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3V21" />
                  <path d="M9 21H15" />
                  <path d="M5 6H19" />
                  <path d="M5 6L2 14H8L5 6Z" />
                  <path d="M19 6L16 14H22L19 6Z" />
                </svg>
              </div>
              <div className="flex flex-col">
                <h4 className="text-[#F5F5F4] font-inter font-semibold text-[15px] tracking-tight leading-tight">DealDost Assistant</h4>
                <div className="flex items-center gap-1.5 mt-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#22c55e] shadow-[0_0_6px_#22c55e]" />
                  <span className="text-[#A3A3A3] text-[10px] font-inter uppercase tracking-widest font-medium">Online</span>
                </div>
              </div>
            </div>

            {/* Chat Body */}
            <div className="p-5 flex flex-col gap-6">
              
              {/* User Message (Right) */}
              <div className="flex justify-end">
                 <div className="bg-[#222222] border border-white/10 rounded-2xl rounded-tr-sm px-4 py-3.5 max-w-[85%] shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
                   <p className="text-[#FFFFFF] text-[13px] sm:text-sm font-inter leading-relaxed font-medium">
                     Bhai 20k mein website bana do, 10 din mein, 50% advance.
                   </p>
                   <div className="text-right mt-2 opacity-40">
                     <span className="text-[#A3A3A3] text-[9px] uppercase tracking-wider font-semibold">02:43 PM</span>
                   </div>
                 </div>
              </div>

              {/* AI Response (Left) */}
              <div className="flex justify-start">
                 <div className="flex gap-3 max-w-[90%]">
                   <div className="w-7 h-7 shrink-0 rounded-[8px] border border-[#D4AF37]/20 flex items-center justify-center bg-[#111111] mt-1 shadow-[0_0_10px_rgba(212,175,55,0.15)] p-[4px]">
                     <svg className="w-full h-full text-[#D4AF37]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                       <path d="M12 3V21" />
                       <path d="M9 21H15" />
                       <path d="M5 6H19" />
                       <path d="M5 6L2 14H8L5 6Z" />
                       <path d="M19 6L16 14H22L19 6Z" />
                     </svg>
                   </div>
                   <div className="bg-[#151515] border border-[#D4AF37]/30 rounded-2xl rounded-tl-sm px-4 py-3.5 shadow-[0_0_20px_rgba(212,175,55,0.15)] relative overflow-hidden">
                     {/* Subtle Glow */}
                     <div className="absolute top-0 left-0 w-32 h-32 bg-[#D4AF37]/15 blur-3xl rounded-full pointer-events-none" />
                     <p className="text-[#FFFFFF] text-[13px] sm:text-sm font-inter leading-relaxed relative z-10 font-medium tracking-wide">
                       Got it. Extracting terms: ₹20,000 total, 10 days timeline, 50% upfront.
                     </p>
                     <div className="text-right mt-2 opacity-40 relative z-10">
                       <span className="text-[#A3A3A3] text-[9px] uppercase tracking-wider font-semibold">02:43 PM</span>
                     </div>
                   </div>
                 </div>
              </div>

              {/* Process Message */}
              <div className="flex justify-start pl-10 mt-1">
                 <div className="inline-flex items-center gap-2.5 opacity-60">
                   <div className="flex gap-1">
                     <div className="w-1 h-1 bg-[#D4AF37] rounded-full animate-bounce [animation-delay:-0.3s]" />
                     <div className="w-1 h-1 bg-[#D4AF37] rounded-full animate-bounce [animation-delay:-0.15s]" />
                     <div className="w-1 h-1 bg-[#D4AF37] rounded-full animate-bounce" />
                   </div>
                   <p className="text-[#A3A3A3] text-xs font-inter italic tracking-wide">Drafting your legally-binding contract...</p>
                 </div>
              </div>

            </div>

            {/* Input Section */}
            <div className="px-5 pb-5 pt-4 mt-2 border-t border-white/5 relative z-10 bg-[#0D0D0D]/80">
              <div className="w-full bg-[#111111] border border-white/10 rounded-xl py-3 px-4 mb-4 shadow-inner">
                <span className="text-[#555] text-[13px] font-inter tracking-wide">Type your deal...</span>
              </div>
              
              <div className="flex justify-end">
                <motion.button 
                  whileHover={{ scale: 1.05, filter: 'drop-shadow(0 0 20px rgba(212,175,55,0.5))' }}
                  className="bg-[#D4AF37] hover:bg-[#E5C048] text-black font-inter font-extrabold text-[11px] tracking-[0.15em] uppercase px-7 py-3 rounded-full shadow-[0_0_15px_rgba(212,175,55,0.3)] hover:shadow-[0_0_25px_rgba(212,175,55,0.5)] transition-all duration-300 border border-[#D4AF37]/50"
                >
                  Generate Contract
                </motion.button>
              </div>
            </div>

          </motion.div>
        </motion.div>

        {/* Phase 3: Bottom-Right (Time-based Event Structure with Hover Floats) */}
        <div className="absolute bottom-[8%] right-[5%] z-50 pointer-events-none text-right flex flex-col items-end w-full max-w-2xl px-6">
          
          {/* Brand Name / Logo */}
          <motion.div custom={0} initial="hidden" animate={ctaControls} variants={entryVariants} className="pointer-events-auto cursor-default">
            <motion.div animate={floatAnimation} className="flex items-center justify-end mb-6">
              <motion.div
                whileHover={{ filter: 'drop-shadow(0 0 25px rgba(212,175,55,0.7))', scale: 1.02 }}
                transition={{ duration: 0.3 }}
                className="flex items-center gap-3.5 bg-black/40 px-6 py-3 rounded-2xl border border-white/10 backdrop-blur-md drop-shadow-[0_0_15px_rgba(212,175,55,0.2)]"
              >
                <DealDostLogo className="w-8 h-8" />
                <h4 className="text-3xl md:text-5xl font-inter tracking-tight flex items-baseline leading-none">
                  <span className="font-extrabold text-[#F5F5F4]">DealDost</span>
                  <span className="font-light text-[#D4AF37] ml-2 tracking-widest">AI</span>
                </h4>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Headline */}
          <motion.div custom={1} initial="hidden" animate={ctaControls} variants={entryVariants}>
            <motion.h2 animate={floatAnimation} className="text-5xl md:text-6xl font-garet font-extrabold leading-tight tracking-tighter text-[#F5F5F4] drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)]">
              Turn Deals into <br /> <span className="text-[#D4AF37]">Binding Contracts</span>
            </motion.h2>
          </motion.div>
          
          {/* Subtext */}
          <motion.div custom={2} initial="hidden" animate={ctaControls} variants={entryVariants}>
            <motion.p animate={floatAnimation} className="text-[#F5F5F4]/80 text-xl font-inter mt-6 mb-2 drop-shadow-md text-right leading-relaxed">
              Secure your agreements instantly with AI-powered legal protection.
            </motion.p>
          </motion.div>

          {/* Action Call & Button */}
          <motion.div custom={3} initial="hidden" animate={ctaControls} variants={entryVariants} className="pointer-events-auto mt-4">
            <motion.div animate={floatAnimation} className="flex flex-col items-center">
              <p className="text-[#F5F5F4] font-inter text-sm mb-4 tracking-widest uppercase opacity-80">
                Try for FREE
              </p>

              <motion.div 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onOpenAuth?.('signup')}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                className="relative inline-block w-full sm:w-max cursor-pointer group"
              >
                <motion.div 
                  initial="hidden"
                  animate={ctaControls}
                  variants={{
                    hidden: { opacity: 0, scale: 0.8 },
                    visible: { 
                      opacity: [0, 0.6, 0.2], 
                      scale: [0.8, 1.3, 1], 
                      transition: { duration: 1.2, ease: "easeOut", delay: 0.6 } // Delayed relative to custom=3 array stagger
                    }
                  }}
                  className="absolute inset-0 bg-[#D4AF37] blur-[30px] rounded-full -z-10" 
                />
                
                {/* Outline ring mimicking the referenced photo */}
                <div className="absolute inset-[-6px] border border-[#D4AF37]/50 rounded-[28px] pointer-events-none" />
                
                <button className="px-14 py-4 bg-[#D4AF37] hover:bg-[#E5C048] text-black font-bold uppercase tracking-widest transition-colors duration-300 rounded-[22px] shadow-[0_4px_15px_rgba(212,175,55,0.4)] hover:shadow-[0_8px_30px_rgba(212,175,55,0.6)] font-inter text-[15px] block w-full relative z-10 pointer-events-none">
                  Sign Up
                </button>
              </motion.div>

            </motion.div>
          </motion.div>

        </div>

      </div>
    </div>
  );
}
