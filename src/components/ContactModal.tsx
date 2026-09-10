import { useEffect, useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { Phone, Mail, X, Sparkles, Heart, Copy, Check } from 'lucide-react'

interface ContactModalProps {
  open: boolean
  onClose: () => void
}

export default function ContactModal({ open, onClose }: ContactModalProps) {
  const shouldReduceMotion = useReducedMotion()

  // ESC 关闭
  useEffect(() => {
    if (!open) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  const springTransition = shouldReduceMotion
    ? { duration: 0 }
    : { type: 'spring' as const, stiffness: 400, damping: 22 }

  const rowContainerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.07,
      },
    },
    exit: {},
  }

  const rowItemVariants = {
    hidden: { opacity: 0, y: 14, scale: 0.96 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: 'spring' as const, stiffness: 380, damping: 24 },
    },
    exit: { opacity: 0, y: 10, scale: 0.98 },
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
          className="fixed inset-0 z-[10000] flex items-center justify-center px-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.35)', backdropFilter: 'blur(6px)' }}
          onClick={onClose}
          aria-hidden={!open}
        >
          <motion.div
            initial={{ scale: 0.7, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0, y: 20 }}
            transition={springTransition}
            className="relative w-full max-w-xl overflow-hidden rounded-[32px] bg-white p-7 sm:p-8 shadow-2xl"
            style={{
              border: '1px solid rgba(10, 47, 158, 0.1)',
              boxShadow: '0 24px 60px rgba(10, 47, 158, 0.18), 0 8px 24px rgba(0, 0, 0, 0.08)',
            }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="contact-title"
          >
            {/* 顶部装饰 */}
            <div
              className="absolute left-0 right-0 top-0 h-2"
              style={{
                background: 'linear-gradient(90deg, #0A2F9E 0%, #4A6EF0 50%, #A8C0FF 100%)',
              }}
            />

            {/* 关闭按钮 */}
            <motion.button
              type="button"
              onClick={onClose}
              whileTap={{ scale: 0.85 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              className="absolute right-4 top-4 rounded-full p-2 text-[#9AA3B5] transition-colors hover:bg-[#F4F5F7] hover:text-[#3A4256]"
              aria-label="关闭"
            >
              <X size={20} strokeWidth={2} />
            </motion.button>

            {/* 标题 */}
            <h3
              id="contact-title"
              className="mb-6 flex items-center justify-center gap-2 text-center text-2xl font-black sm:text-3xl"
              style={{
                fontFamily: "'PingFang SC','SF Pro','Microsoft YaHei','Noto Sans SC',sans-serif",
                color: '#0A2F9E',
                letterSpacing: '-0.02em',
              }}
            >
              欢迎联系luyi
              <Sparkles size={22} className="text-[#4A6EF0]" />
            </h3>

            {/* 联系方式 */}
            <motion.div
              className="flex flex-col gap-4"
              variants={rowContainerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <motion.div variants={rowItemVariants}>
                <ContactRow
                  icon={<Phone size={22} className="text-[#0A2F9E]" />}
                  label="电话 / 微信"
                  value="15870903564"
                />
              </motion.div>
              <motion.div variants={rowItemVariants}>
                <ContactRow
                  icon={<Mail size={22} className="text-[#0A2F9E]" />}
                  label="邮箱"
                  value="jiangluyi06052001@163.com"
                />
              </motion.div>
            </motion.div>

            {/* 底部小字 */}
            <p className="mt-6 flex items-center justify-center gap-1 text-center text-xs text-[#9AA3B5]">
              期待和你一起做出好产品
              <Heart size={12} className="fill-[#4A6EF0] text-[#4A6EF0]" />
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function ContactRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div
      className="flex items-center gap-3 rounded-2xl bg-[#F4F5F7] p-4 transition-transform hover:scale-[1.02]"
      style={{ border: '1px solid rgba(10, 47, 158, 0.06)' }}
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white shadow-sm">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="mb-0.5 text-xs font-medium text-[#9AA3B5]">{label}</p>
        <p
          className="break-all text-base font-semibold text-[#3A4256] sm:text-lg"
          style={{ fontFamily: "'SF Pro','PingFang SC',ui-monospace,monospace" }}
        >
          {value}
        </p>
      </div>
      <CopyButton value={value} />
    </div>
  )
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false)
  const shouldReduceMotion = useReducedMotion()

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      // 复制失败时静默处理，保持界面稳定
    }
  }

  const iconTransition = shouldReduceMotion
    ? { duration: 0 }
    : { type: 'spring' as const, stiffness: 500, damping: 25 }

  return (
    <motion.button
      type="button"
      onClick={handleCopy}
      whileTap={{ scale: 0.9 }}
      animate={shouldReduceMotion ? {} : copied ? { scale: [1, 1.12, 1] } : { scale: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      className="flex shrink-0 items-center justify-center rounded-xl px-3 py-2 text-sm font-medium transition-colors min-w-[72px]"
      style={{
        backgroundColor: copied ? 'rgba(16, 185, 129, 0.12)' : 'rgba(10, 47, 158, 0.08)',
        color: copied ? '#059669' : '#0A2F9E',
      }}
      aria-label={copied ? '已复制' : '复制'}
    >
      <AnimatePresence mode="wait" initial={false}>
        {copied ? (
          <motion.span
            key="copied"
            className="flex items-center justify-center gap-1"
            initial={shouldReduceMotion ? {} : { opacity: 0, scale: 0.6, rotate: -45 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={shouldReduceMotion ? {} : { opacity: 0, scale: 0.6, rotate: 45 }}
            transition={iconTransition}
          >
            <Check size={16} />
            <span>已复制</span>
          </motion.span>
        ) : (
          <motion.span
            key="copy"
            className="flex items-center justify-center gap-1"
            initial={shouldReduceMotion ? {} : { opacity: 0, scale: 0.6, rotate: 45 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={shouldReduceMotion ? {} : { opacity: 0, scale: 0.6, rotate: -45 }}
            transition={iconTransition}
          >
            <Copy size={16} />
            <span>复制</span>
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  )
}
