import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Edit2 as EditSquare,
  BarChart2 as Insights,
  Lightbulb,
  ArrowRight,
  FileEdit as EditNote,
  Lightbulb as EmojiObjects,
  Moon as DarkMode
} from "lucide-react";
import SplashScreen from './SplashScreen';
import { isOfflineMode } from '@/lib/offline-mode';

// Check if running in SEB
const isSEB = navigator.userAgent.includes('SEB') ||
             window.location.search.includes('seb=true') ||
             window.name.includes('SEB');

const WelcomeScreen = () => {
  const navigate = useNavigate();
  const [isMounted, setIsMounted] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [appVersion, setAppVersion] = useState<string>('1.0.0');

  useEffect(() => {
    console.log('WelcomeScreen mounted');
    const timer = setTimeout(() => {
      console.log('Hiding splash screen');
      setShowSplash(false);
      setIsMounted(true);
    }, 3000);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (!showSplash && !isSEB && !isOfflineMode()) {
      const fetchVersion = async () => {
        try {
          const { getAppVersion } = await import('@/lib/supabase');
          const version = await getAppVersion();
          setAppVersion(version);
        } catch (error) {
          console.error('Error fetching app version:', error);
        }
      };
      fetchVersion();
    }
  }, [showSplash]);

  const features = [
    { 
      icon: <EditSquare className="w-5 h-5" />, 
      title: "Mock Tests",
      description: "Practice with our comprehensive test bank"
    },
    { 
      icon: <Insights className="w-5 h-5" />, 
      title: "Analytics",
      description: "Track your progress and performance"
    },
    { 
      icon: <Lightbulb className="w-5 h-5" />, 
      title: "Insights",
      description: "Get personalized study recommendations"
    }
  ];

  return (
    <div className="relative min-h-screen bg-white text-slate-900 antialiased overflow-hidden">
      {/* Splash Screen - disabled in SEB for faster loading */}
      {!isSEB && showSplash && <SplashScreen isLoading={true} />}

      {/* Main Content */}
      <div className={`relative h-screen max-w-md mx-auto flex flex-col px-6 pt-6 pb-10 ${!isSEB && showSplash ? 'opacity-0' : 'opacity-100'} ${!isSEB ? 'transition-opacity duration-500' : ''}`}>
        {/* Header */}
        <div className="h-14 mb-4"></div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col items-center justify-center space-y-8 relative">
          {/* Logo */}
          <div className="relative w-64 h-64 flex items-center justify-center">
            <div className="absolute inset-0 bg-primary/10 dark:bg-primary/5 rounded-full blur-3xl scale-125"></div>
            <div className="absolute inset-0 border-2 border-dashed border-primary/20 rounded-full animate-[spin_20s_linear_infinite]"></div>
            <div className="relative z-10 w-48 h-48 flex items-center justify-center">
              <img
                alt="Zionian Examination Logo"
                className="w-full h-full object-contain drop-shadow-[0_10px_30px_rgba(76,175,80,0.4)] dark:drop-shadow-[0_10px_30px_rgba(46,125,50,0.6)]"
                src="/logo2.png"
              />
            </div>
          </div>
          
          {/* Title and Description */}
          <div className="text-center space-y-4 px-4 relative z-10">
            <motion.h1 
              className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              Welcome to <span className="text-primary">Zionians</span>
            </motion.h1>
            <p className="text-lg text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs mx-auto">
              Your all-in-one platform for academic excellence and exam preparation.
            </p>
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="mt-auto pt-8 flex flex-col space-y-10">
          {/* Next Button */}
          <div className="flex justify-center w-full">
            <Button 
              className="bg-primary hover:bg-primary-dark active:scale-95 transition-all duration-200 text-white px-16 py-4 rounded-full font-semibold flex items-center gap-2 shadow-lg shadow-primary/25 w-full max-w-xs mx-auto"
              onClick={() => navigate('/login')}
            >
              Proceed
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-3 gap-3 pb-4 px-2">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="flex flex-col items-center p-4 rounded-2xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-100 dark:border-slate-700/50 hover:bg-white/70 dark:hover:bg-slate-800/70 transition-all duration-200"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/90 flex items-center justify-center text-white mb-2">
                  {feature.icon}
                </div>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 text-center">
                  {feature.title}
                </span>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 text-center mt-1">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Indicator */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            VERSION {appVersion}
          </p>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;