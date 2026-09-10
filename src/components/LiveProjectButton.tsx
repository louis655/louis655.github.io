import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

interface LiveProjectButtonProps {
  className?: string
  label?: string
  href?: string
}

export default function LiveProjectButton({
  className = '',
  label = '查看项目',
  href,
}: LiveProjectButtonProps) {
  const reduce = useReducedMotion()

  const inner = (
    <>
      {/* 扫光 */}
      {!reduce && (
        <motion.span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 w-1/3"
          style={{
            background:
              'linear-gradient(100deg, transparent 0%, rgba(255,255,255,0.55) 50%, transparent 100%)',
          }}
          initial={{ x: '-160%' }}
          animate={{ x: '320%' }}
          transition={{ duration: 1.6, repeat: Infinity, repeatDelay: 1.6, ease: 'easeInOut' }}
        />
      )}
      <span className="relative z-10 flex items-center gap-2">
        {label}
        <ArrowRight
          size={18}
          strokeWidth={2.2}
          className="transition-transform duration-200 group-hover:translate-x-1"
        />
      </span>
    </>
  )

  const sharedClass = `group relative inline-flex items-center justify-center overflow-hidden rounded-full bg-[#0A2F9E] text-white font-medium tracking-widest px-8 py-3 sm:px-10 sm:py-3.5 text-sm sm:text-base shadow-[0_10px_30px_rgba(10,47,158,0.35)] ${className}`

  const gestureProps = reduce
    ? {}
    : {
        whileHover: { scale: 1.06 },
        whileTap: { scale: 0.94 },
        transition: { type: 'spring' as const, stiffness: 400, damping: 17 },
      }

  return (
    <motion.span
      className="relative inline-block"
      animate={reduce ? undefined : { scale: [1, 1.035, 1] }}
      transition={
        reduce ? undefined : { duration: 2.4, repeat: Infinity, ease: 'easeInOut' }
      }
    >
      {/* 呼吸光晕 */}
      {!reduce && (
        <motion.span
          aria-hidden="true"
          className="absolute -inset-1.5 rounded-full bg-[#4A6EF0]/40 blur-lg"
          animate={{ opacity: [0.35, 0.75, 0.35] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      {href ? (
        <motion.a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={sharedClass}
          {...gestureProps}
        >
          {inner}
        </motion.a>
      ) : (
        <motion.button type="button" className={sharedClass} {...gestureProps}>
          {inner}
        </motion.button>
      )}
    </motion.span>
  )
}
