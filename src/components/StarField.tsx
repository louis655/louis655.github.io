import { useEffect, useRef } from 'react'

/**
 * StarField — 深色底上的"星星点点"粒子（复刻参考站花朵页氛围）
 * - 三层星点：微尘(dust) / 星(star) / 闪光(sparkle)
 * - 白色为主，少量冷调(蓝/紫/粉)点缀，呼应花朵蓝粉渐变
 * - 缓慢飘移 + 呼吸式闪烁(twinkle)，闪光星带柔光晕
 * - 局部于容器内（非全屏），随容器尺寸自适应
 * - 尊重 prefers-reduced-motion（静态一帧）；标签页隐藏时暂停
 */
export default function StarField({ className }: { className?: string }) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const wrap = wrapRef.current
    const canvas = canvasRef.current
    if (!wrap || !canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let dpr = Math.min(window.devicePixelRatio || 1, 2)
    let w = 0, h = 0

    // 多数白星，少量冷调点缀
    const palette = [null, null, null, null, null, '#8FB0FF', '#C9A7FF', '#F0B5C8']

    type Star = {
      x: number; y: number; vx: number; vy: number
      r: number; a: number; tw: number; speed: number; phase: number
      color: string | null; kind: 'dust' | 'star' | 'sparkle'
    }
    let stars: Star[] = []

    const build = () => {
      const rect = wrap.getBoundingClientRect()
      w = rect.width; h = rect.height
      canvas.width = w * dpr; canvas.height = h * dpr
      canvas.style.width = w + 'px'; canvas.style.height = h + 'px'
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const count = Math.min(460, Math.floor((w * h) / 4200))
      stars = Array.from({ length: count }, () => {
        const roll = Math.random()
        const kind: Star['kind'] = roll > 0.93 ? 'sparkle' : roll > 0.62 ? 'star' : 'dust'
        const r =
          kind === 'sparkle' ? Math.random() * 1.5 + 1.7
          : kind === 'star' ? Math.random() * 0.9 + 0.8
          : Math.random() * 0.6 + 0.3
        return {
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.14,
          vy: (Math.random() - 0.5) * 0.14,
          r,
          a: Math.random() * 0.5 + 0.3,
          tw: Math.random() * 0.55 + 0.18,
          speed: Math.random() * 0.9 + 0.35,
          phase: Math.random() * Math.PI * 2,
          color: palette[Math.floor(Math.random() * palette.length)] ?? null,
          kind,
        }
      })
    }

    const t0 = performance.now()
    const draw = (now: number) => {
      const t = (now - t0) / 1000
      ctx.clearRect(0, 0, w, h)
      for (const s of stars) {
        const a = reduced ? s.a : s.a + s.tw * Math.sin(t * s.speed + s.phase)
        const alpha = Math.max(0, Math.min(1, a))
        ctx.globalAlpha = alpha
        ctx.fillStyle = s.color ?? '#ffffff'
        if (s.kind === 'sparkle') {
          ctx.shadowColor = s.color ?? '#ffffff'
          ctx.shadowBlur = 7
        } else {
          ctx.shadowBlur = 0
        }
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1
      ctx.shadowBlur = 0
    }

    let raf = 0
    const tick = (now: number) => {
      for (const s of stars) {
        s.x += s.vx; s.y += s.vy
        if (s.x < -3) s.x = w + 3; if (s.x > w + 3) s.x = -3
        if (s.y < -3) s.y = h + 3; if (s.y > h + 3) s.y = -3
      }
      draw(now)
      raf = requestAnimationFrame(tick)
    }

    build()
    if (reduced) {
      draw(performance.now())
    } else {
      raf = requestAnimationFrame(tick)
    }

    const onResize = () => { dpr = Math.min(window.devicePixelRatio || 1, 2); build() }
    window.addEventListener('resize', onResize)
    const onVis = () => {
      if (document.hidden) { if (raf) cancelAnimationFrame(raf) }
      else if (!reduced) raf = requestAnimationFrame(tick)
    }
    document.addEventListener('visibilitychange', onVis)

    return () => {
      if (raf) cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [])

  return (
    <div ref={wrapRef} className={className} style={{ position: 'absolute', inset: 0 }}>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} aria-hidden="true" />
    </div>
  )
}
