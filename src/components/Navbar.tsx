import { useEffect, useState } from 'react'

const NAV_LINKS = [
  { label: '关于我', href: '#about' },
  { label: '实习经历', href: '#price' },
  { label: '项目', href: '#projects' },
  { label: '专业技能', href: '#skills' },
  { label: '联系我', href: '#contact' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)

  // 滚动后增强玻璃质感（更实的底 + 更清晰的边框/投影）
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className="fixed inset-x-0 top-0 z-[100] flex justify-center px-4 pt-3 sm:pt-4 pointer-events-none">
      <nav
        className={[
          'pointer-events-auto flex items-center justify-center gap-2 sm:gap-4',
          'rounded-full px-6 sm:px-10 py-2 sm:py-2.5',
          'transition-all duration-300 ease-out',
          'border border-white/55 backdrop-blur-xl backdrop-saturate-150',
          scrolled
            ? 'bg-white/70 shadow-[0_8px_32px_rgba(10,47,158,0.16)]'
            : 'bg-white/60 shadow-[0_4px_24px_rgba(10,47,158,0.10)]',
        ].join(' ')}
      >
        {NAV_LINKS.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className={[
              'relative rounded-full px-4 sm:px-6 py-1.5 sm:py-2',
              'text-[0.82rem] sm:text-[0.95rem] font-medium tracking-[0.02em]',
              'text-[#0A2F9E]/85 hover:text-[#0A2F9E]',
              'transition-all duration-200 ease-out',
              'hover:bg-white/50 active:scale-[0.97]',
            ].join(' ')}
          >
            {link.label}
          </a>
        ))}
      </nav>
    </header>
  )
}
