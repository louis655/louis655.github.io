import { useState } from 'react'
import FadeIn from '../components/FadeIn'
import Ballpit from '../components/Ballpit'
import { Copy, Check } from 'lucide-react'

// ── 复制按钮：点击后显示“已复制”，2 秒后恢复 ──
function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value)
    } catch {
      // fallback：降级方案静默失败
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`group flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-200 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 ${
        copied
          ? 'bg-[#059669]/20 text-[#34D399]'
          : 'bg-white/10 text-[#CBD5E1] hover:bg-white/15 hover:text-white'
      }`}
      aria-label={copied ? `${label} 已复制` : `复制${label}`}
    >
      {copied ? <Check size={14} strokeWidth={2} /> : <Copy size={14} strokeWidth={2} />}
      <span>{copied ? '已复制' : '复制'}</span>
    </button>
  )
}

export default function ContactSection() {
  return (
    <section
      id="contact"
      className="relative z-10 min-h-screen w-full overflow-hidden rounded-t-[40px] sm:rounded-t-[50px] md:rounded-t-[60px]"
      style={{ background: '#010101' }}
    >
      {/* Ballpit 背景：全屏物理球体 */}
      <div className="absolute inset-0 z-0">
        <Ballpit
          count={90}
          gravity={0.01}
          friction={0.9975}
          wallBounce={0.95}
          followCursor={true}
          colors={[0x0A2F9E, 0x2D5BE3, 0x34B39A, 0xFFFFFF, 0x1E293B]}
          ambientColor={0xFFFFFF}
          ambientIntensity={0.6}
          lightIntensity={180}
          minSize={0.35}
          maxSize={0.85}
          size0={0.6}
          maxVelocity={0.12}
        />
      </div>

      {/* 前景内容 */}
      <div className="relative z-10 flex min-h-screen items-center justify-center px-5 sm:px-8 md:px-12 lg:px-16 py-20">
        <FadeIn delay={0.1} y={40}>
          <div
            className="w-full max-w-3xl mx-auto rounded-[28px] sm:rounded-[36px] border border-white/10 p-8 sm:p-12 md:p-14"
            style={{
              background: 'rgba(15, 23, 42, 0.55)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              boxShadow: '0 24px 80px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
            }}
          >
            {/* 文案 */}
            <div className="flex flex-col gap-3 text-center mb-10 sm:mb-12">
              <span
                className="text-[#94A3B8] text-sm sm:text-base tracking-[0.18em] uppercase"
                style={{ fontFamily: "'Archivo','PingFang SC','SF Pro',sans-serif" }}
              >
                非常感谢能看到 luyi ～
              </span>
              <h2
                className="font-semibold text-white leading-snug"
                style={{
                  fontFamily: "'PingFang SC','SF Pro','Microsoft YaHei','Noto Sans SC',sans-serif",
                  fontSize: 'clamp(1.75rem, 3.5vw, 3rem)',
                  letterSpacing: '-0.01em',
                }}
              >
                期待与你联系<br className="hidden sm:block" />
                碰撞更多可能
              </h2>
            </div>

            {/* 联系方式 */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between gap-4 py-4 border-b border-white/10">
                <div className="flex flex-col gap-1 min-w-0">
                  <span
                    className="text-[#94A3B8] text-[0.7rem] sm:text-xs uppercase tracking-wider"
                    style={{ fontFamily: "'Archivo','PingFang SC','SF Pro',sans-serif" }}
                  >
                    电话 / 微信
                  </span>
                  <span
                    className="text-white font-medium text-base sm:text-lg truncate tabular-nums"
                    style={{ fontFamily: "'SF Pro','PingFang SC',ui-monospace,monospace" }}
                  >
                    15870903564
                  </span>
                </div>
                <CopyButton value="15870903564" label="电话/微信" />
              </div>

              <div className="flex items-center justify-between gap-4 py-4 border-b border-white/10">
                <div className="flex flex-col gap-1 min-w-0">
                  <span
                    className="text-[#94A3B8] text-[0.7rem] sm:text-xs uppercase tracking-wider"
                    style={{ fontFamily: "'Archivo','PingFang SC','SF Pro',sans-serif" }}
                  >
                    邮箱
                  </span>
                  <span
                    className="text-white font-medium text-base sm:text-lg truncate"
                    style={{ fontFamily: "'PingFang SC','SF Pro','Microsoft YaHei',sans-serif" }}
                  >
                    jiangluyi06052001@163.com
                  </span>
                </div>
                <CopyButton value="jiangluyi06052001@163.com" label="邮箱" />
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
