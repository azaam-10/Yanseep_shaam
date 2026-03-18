import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, ChevronLeft, X, Sparkles, Trophy, Wallet, ShoppingCart, Ticket, Users, Gift, Info } from 'lucide-react';

interface TourStep {
  targetId: string;
  title: string;
  content: string;
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: () => void;
}

interface OnboardingTourProps {
  onComplete: () => void;
  activeTab: string;
  setActiveTab: (tab: any) => void;
  setShowRecharge: (show: boolean) => void;
  setShowWithdraw: (show: boolean) => void;
  setShowRedeem: (show: boolean) => void;
}

export const OnboardingTour: React.FC<OnboardingTourProps> = ({ 
  onComplete, 
  activeTab, 
  setActiveTab,
  setShowRecharge,
  setShowWithdraw,
  setShowRedeem
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0, height: 0 });

  const steps: TourStep[] = useMemo(() => [
    {
      targetId: 'root',
      title: 'مرحباً بك! 🌟',
      content: 'استثمر 10 ليرات واربح جوائز مالية قيمة كل أسبوع.',
      position: 'center'
    },
    {
      targetId: 'tour-deposit',
      title: 'شحن الرصيد 💳',
      content: 'اشحن رصيدك عبر محفظة شام كاش لتبدأ اللعب.',
      position: 'bottom',
      action: () => {
        setActiveTab('home');
        setShowRecharge(false);
        setShowWithdraw(false);
      }
    },
    {
      targetId: 'tour-copy-address',
      title: 'نسخ العنوان 📝',
      content: 'انسخ هذا العنوان وقم بالتحويل من تطبيق شام كاش.',
      position: 'bottom',
      action: () => {
        setShowRecharge(true);
      }
    },
    {
      targetId: 'tour-upload-receipt',
      title: 'تأكيد التحويل 📸',
      content: 'ارفع لقطة شاشة للإشعار ليتم إضافة الرصيد.',
      position: 'top'
    },
    {
      targetId: 'tour-withdraw',
      title: 'سحب الأرباح 💰',
      content: 'اسحب أرباحك بسهولة إلى محفظتك.',
      position: 'bottom',
      action: () => {
        setShowRecharge(false);
        setShowWithdraw(false);
      }
    },
    {
      targetId: 'tour-withdraw-modal-content',
      title: 'خطوات السحب 📤',
      content: 'أدخل عنوان محفظتك والمبلغ المطلوب للسحب.',
      position: 'center',
      action: () => {
        setShowWithdraw(true);
      }
    },
    {
      targetId: 'tour-daily-reward',
      title: 'المكافأة اليومية 🎁',
      content: 'جرب حظك كل 24 ساعة واربح رصيداً مجانياً.',
      position: 'left',
      action: () => {
        setShowWithdraw(false);
      }
    },
    {
      targetId: 'tour-draw-room',
      title: 'غرفة السحب 🎰',
      content: 'شاهد سحب الكروت الفائزة مباشرة كل أسبوع.',
      position: 'top'
    },
    {
      targetId: 'tour-level-info',
      title: 'المستويات 🏆',
      content: 'كلما زاد مستواك، زادت قيمة الجوائز المتاحة.',
      position: 'top'
    },
    {
      targetId: 'nav-shop',
      title: 'المتجر 🛒',
      content: 'اشترِ كروتك المفضلة أو اختر عشوائياً.',
      position: 'top',
      action: () => {
        setActiveTab('shop');
      }
    },
    {
      targetId: 'nav-tickets',
      title: 'كروتي 🎫',
      content: 'تابع كروتك النشطة، الرابحة، والمنتهية هنا.',
      position: 'top',
      action: () => {
        setActiveTab('tickets');
      }
    },
    {
      targetId: 'nav-winners',
      title: 'النتائج 🏅',
      content: 'قائمة المحظوظين الفائزين في السحوبات الماضية.',
      position: 'top',
      action: () => {
        setActiveTab('winners');
      }
    },
    {
      targetId: 'nav-referral',
      title: 'فريقي 👥',
      content: 'شارك التطبيق واربح نقاطاً مقابل كل صديق.',
      position: 'top',
      action: () => {
        setActiveTab('referral');
      }
    },
    {
      targetId: 'root',
      title: 'جاهز للانطلاق! 🎉',
      content: 'نتمنى لك رحلة مليئة بالأرباح في نصيب كاش.',
      position: 'center',
      action: () => {
        setActiveTab('home');
      }
    }
  ], [setActiveTab, setShowRecharge, setShowWithdraw]);

  useEffect(() => {
    const step = steps[currentStep];
    if (step.action) step.action();

    const updateCoords = () => {
      if (step.targetId === 'root') {
        setCoords({ top: 0, left: 0, width: 0, height: 0 });
        return;
      }

      const el = document.getElementById(step.targetId);
      if (el) {
        const rect = el.getBoundingClientRect();
        setCoords({
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height
        });
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        console.warn(`Tour target element not found: ${step.targetId}`);
        // Fallback to center if element not found
        setCoords({ top: 0, left: 0, width: 0, height: 0 });
      }
    };

    const timer = setTimeout(updateCoords, 300);
    window.addEventListener('resize', updateCoords);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateCoords);
    };
  }, [currentStep, steps]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const step = steps[currentStep];

  const getTooltipPosition = () => {
    if (step.targetId === 'root' || step.position === 'center') {
      return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
    }

    let top = coords.top;
    let left: string | number = '50%';
    let transform = 'translateX(-50%)';

    if (step.position === 'bottom') {
      top = coords.top + coords.height + 12;
      // Safety check: if tooltip would be off-screen at bottom, show it above instead
      if (top > window.innerHeight - 180) {
        top = coords.top - 12;
        transform = 'translate(-50%, -100%)';
      }
    } else if (step.position === 'top') {
      top = coords.top - 12;
      // Safety check: if tooltip would be off-screen at top, show it below instead
      if (top < 180) {
        top = coords.top + coords.height + 12;
        transform = 'translateX(-50%)';
      } else {
        transform = 'translate(-50%, -100%)';
      }
    } else if (step.position === 'left') {
      left = coords.left - 12;
      transform = 'translate(-100%, -50%)';
      top = coords.top + (coords.height / 2);
    } else if (step.position === 'right') {
      left = coords.left + coords.width + 12;
      transform = 'translate(0, -50%)';
      top = coords.top + (coords.height / 2);
    }

    return { top, left, transform };
  };

  console.log('Rendering OnboardingTour step:', currentStep, 'coords:', coords);

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none overflow-hidden">
      {/* Overlay with hole */}
      <svg className="absolute inset-0 w-full h-full pointer-events-auto">
        <defs>
          <mask id="tour-mask">
            <rect width="100%" height="100%" fill="white" />
            {step.targetId !== 'root' && (
              <rect 
                x={`${coords.left - 6}`} 
                y={`${coords.top - 6}`} 
                width={`${coords.width + 12}`} 
                height={`${coords.height + 12}`} 
                rx="12" 
                fill="black" 
              />
            )}
          </mask>
        </defs>
        <rect 
          width="100%" 
          height="100%" 
          fill="rgba(0,0,0,0.8)" 
          mask="url(#tour-mask)" 
          className="backdrop-blur-[1px]"
        />
      </svg>

      {/* Tooltip */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 10, scale: 0.98 }}
          animate={{ 
            opacity: 1, 
            y: 0, 
            scale: 1,
            ...getTooltipPosition()
          }}
          exit={{ opacity: 0, scale: 0.98 }}
          style={{ position: 'absolute' }}
          className="w-[85%] max-w-[260px] bg-[#1a1c20]/95 backdrop-blur-xl border border-white/10 rounded-[2rem] p-3 shadow-2xl pointer-events-auto z-[10000]"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 blur-3xl rounded-full -mr-12 -mt-12" />
          
          <div className="relative z-10 space-y-2">
            <div className="flex justify-between items-center">
              <div className="w-7 h-7 bg-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
                {currentStep === 0 ? <Sparkles size={14} className="text-black" /> : 
                 currentStep === steps.length - 1 ? <Trophy size={14} className="text-black" /> :
                 <Info size={14} className="text-black" />}
              </div>
              <button 
                onClick={onComplete}
                className="p-1 hover:bg-white/5 rounded-full text-gray-500 transition-colors"
              >
                <X size={14} />
              </button>
            </div>

            <div className="space-y-0.5">
              <h3 className="text-sm font-black text-white leading-tight break-words">{step.title}</h3>
              <p className="text-[10px] text-gray-400 leading-relaxed font-medium break-words whitespace-normal">{step.content}</p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/5">
              <div className="flex gap-1">
                {steps.map((_, i) => (
                  <div 
                    key={i} 
                    className={`h-0.5 rounded-full transition-all ${i === currentStep ? 'w-3 bg-cyan-500' : 'w-0.5 bg-white/10'}`} 
                  />
                ))}
              </div>
              <div className="flex gap-1.5">
                {currentStep > 0 && (
                  <button 
                    onClick={handlePrev}
                    className="p-1 bg-white/5 hover:bg-white/10 rounded-lg text-white transition-all"
                  >
                    <ChevronRight size={14} />
                  </button>
                )}
                <button 
                  onClick={handleNext}
                  className="px-3 py-1 bg-cyan-500 text-black font-black text-[10px] rounded-lg shadow-lg shadow-cyan-500/20 active:scale-95 transition-all flex items-center gap-1"
                >
                  <span>{currentStep === steps.length - 1 ? 'ابدأ' : 'التالي'}</span>
                  {currentStep < steps.length - 1 && <ChevronLeft size={10} />}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
