import { motion } from 'framer-motion'

interface ContactButtonProps {
  className?: string
  onClick?: () => void
}

export default function ContactButton({ className = '', onClick }: ContactButtonProps) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.92 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      className={`rounded-full font-medium uppercase tracking-widest text-white px-8 py-3 sm:px-10 sm:py-3.5 md:px-12 md:py-4 text-xs sm:text-sm md:text-base ${className}`}
      style={{
        background:
          'linear-gradient(123deg, #0A2F9E 7%, #2D5BE3 45%, #4A6EF0 78%, #6E8CFF 100%)',
        boxShadow:
          '0px 4px 4px rgba(10, 47, 158, 0.25), 4px 4px 12px #0A2F9E inset',
        outline: '2px solid #FFFFFF',
        outlineOffset: '-3px',
      }}
    >
      联系我
    </motion.button>
  )
}
