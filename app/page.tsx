'use client';

import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Sparkles, Zap, Users } from 'lucide-react';

export default function Home() {
  const router = useRouter();

  const createNewRoom = useCallback(() => {
    const roomId = Math.random().toString(36).substring(2, 15);
    router.push(`/${roomId}`);
  }, [router]);

  useEffect(() => {
    // Auto-create room after a brief moment to show landing
    const timeout = setTimeout(() => {
      createNewRoom();
    }, 100);
    
    return () => clearTimeout(timeout);
  }, [createNewRoom]);

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-200/30 dark:bg-blue-500/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [90, 0, 90],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-200/30 dark:bg-purple-500/10 rounded-full blur-3xl"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-8 max-w-4xl"
        >
          {/* Logo/Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 20,
              delay: 0.1,
            }}
            className="inline-block"
          >
            <div className="glass-elevated w-24 h-24 rounded-3xl flex items-center justify-center mx-auto">
              <Sparkles className="w-12 h-12 text-blue-500" />
            </div>
          </motion.div>

          {/* Title */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-6xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              MindFlow
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300">
              Collaborative mindmaps & flowcharts
            </p>
          </motion.div>

          {/* Features */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12"
          >
            <div className="glass rounded-3xl p-6 space-y-3">
              <Zap className="w-8 h-8 text-blue-500 mx-auto" />
              <h3 className="font-semibold text-lg">Lightning Fast</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Start creating instantly, no sign-up required
              </p>
            </div>

            <div className="glass rounded-3xl p-6 space-y-3">
              <Users className="w-8 h-8 text-purple-500 mx-auto" />
              <h3 className="font-semibold text-lg">Real-time Collaboration</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Share a link and edit together seamlessly
              </p>
            </div>

            <div className="glass rounded-3xl p-6 space-y-3">
              <Sparkles className="w-8 h-8 text-pink-500 mx-auto" />
              <h3 className="font-semibold text-lg">Beautiful Design</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Apple-inspired glass UI that feels premium
              </p>
            </div>
          </motion.div>

          {/* CTA Button */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={createNewRoom}
              className="glass-elevated px-8 py-4 rounded-2xl font-medium text-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 transition-all"
            >
              Create New MindMap →
            </motion.button>
          </motion.div>

          {/* Loading Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-sm text-gray-500 dark:text-gray-500"
          >
            Creating your workspace...
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
