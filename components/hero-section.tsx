"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { motion } from "framer-motion"

export function HeroSection() {
  return (
    <div className="relative overflow-hidden min-h-screen flex items-center">
      {/* Light/dark mode responsive background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-indigo-50/30 to-pink-50/40 dark:from-indigo-950/90 dark:via-purple-900/80 dark:to-pink-800/70" />

      {/* Animated particles/stars effect */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-indigo-400/30 dark:bg-white/20"
            animate={{
              opacity: [0.2, 0.8, 0.2],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              repeatType: "reverse",
              delay: Math.random() * 5,
            }}
          />
        ))}
      </div>

      {/* Animated gradient blobs */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-indigo-300/20 dark:bg-indigo-500/20 blur-3xl"
          animate={{
            x: [0, 30, -30, 0],
            y: [0, -30, 30, 0],
            scale: [1, 1.2, 0.8, 1],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        />
        <motion.div
          className="absolute bottom-1/3 right-1/3 w-[30rem] h-[30rem] rounded-full bg-pink-200/20 dark:bg-pink-400/20 blur-3xl"
          animate={{
            x: [0, -40, 40, 0],
            y: [0, 40, -40, 0],
            scale: [1, 0.8, 1.2, 1],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        />
        <motion.div
          className="absolute top-2/3 right-1/4 w-80 h-80 rounded-full bg-purple-300/15 dark:bg-purple-600/15 blur-3xl"
          animate={{
            x: [0, 50, -20, 0],
            y: [0, -20, 50, 0],
            scale: [1, 1.1, 0.9, 1],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        />
      </div>

      {/* Content with enhanced animations */}
      <div className="container mx-auto px-4 py-24 md:py-32 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="mb-6 inline-block"
          >
            <motion.div
              className="h-1 w-20 bg-gradient-to-r from-indigo-400 to-pink-400 mx-auto rounded-full mb-6"
              initial={{ width: 0 }}
              animate={{ width: 80 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            />
          </motion.div>

          <motion.h1
            className="flex flex-col items-center text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.8,
              type: "spring",
              stiffness: 100
            }}
          >
            <span className="text-foreground mb-3">Newsletter Name</span>
            <span 
              className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 dark:from-indigo-300 dark:via-purple-300 dark:to-pink-300 drop-shadow-lg"
              style={{ 
                backgroundSize: "200% auto",
                animation: "gradient 8s linear infinite alternate"
              }}
            >
              Ideas
            </span>
          </motion.h1>

          <motion.p
            className="text-xl text-muted-foreground dark:text-white mb-10 max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            Generate captivating newsletter names powered by AI. Stand out in the inbox with unique, memorable titles.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-5 justify-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <Button
              asChild
              size="lg"
              className="relative overflow-hidden bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-indigo-500/25 transition-all duration-300 border-0 px-8 py-6 text-lg font-medium rounded-xl"
              style={{ 
                backgroundSize: "200% auto",
                animation: "gradient 3s linear infinite alternate"
              }}
            >
              <Link href="/newsletter-name-generator">
                Generate Names
              </Link>
            </Button>
            <Button 
              asChild 
              variant="outline" 
              size="lg" 
              className="border-2 border-indigo-400/50 text-foreground hover:bg-indigo-500/10 hover:border-indigo-400 px-8 py-6 text-lg font-medium rounded-xl backdrop-blur-sm"
            >
              <Link href="/examples">View Examples</Link>
            </Button>
          </motion.div>
          
          {/* Added subtle floating elements */}
          <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 w-full opacity-30">
            <motion.div
              className="w-full h-20 bg-gradient-to-r from-transparent via-indigo-400/20 to-transparent blur-xl"
              animate={{
                opacity: [0.2, 0.5, 0.2],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                repeatType: "reverse",
              }}
            />
          </div>
        </div>
      </div>

      {/* Add CSS animation for gradients */}
      <style jsx global>{`
        @keyframes gradient {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
      `}</style>
    </div>
  )
}
