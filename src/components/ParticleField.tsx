import { useEffect, useRef } from 'react'

type Particle = {
  x: number
  y: number
  vx: number
  vy: number
  r: number
  color: string
  alpha: number
}

// 薄荷绿 / 深青配色，与全站 #0A2F9E / #2D5BE3 / #F4F5F7 主题一致
const PALETTE = ['#0A2F9E', '#2D5BE3', '#5B7FFF', '#A9BEFF']

/**
 * 轻量粒子星座动效（纯 Canvas，零依赖）
 * - 光点缓慢上浮 + 轻微飘移
 * - 邻近粒子自动连线，形成"星座网络"
 * - 鼠标视差：靠近光标的粒子被轻微推开
 * - 尊重 prefers-reduced-motion（静态渲染一帧）
 * - 性能：DPR 上限 2、粒子数随面积自适应、标签页隐藏时暂停、容器尺寸变化自动重建
 */
export default function ParticleField({ className }: { className?: string }) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const wrap = wrapRef.current
    const canvas = canvasRef.current
    if (!wrap || !canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let width = 0
    let height = 0
    let particles: Particle[] = []
    let raf = 0
    const mouse = { x: -9999, y: -9999 }

    const rand = (min: number, max: number) => Math.random() * (max - min) + min

    const makeParticle = (): Particle => {
      const big = Math.random() < 0.12
      return {
        x: rand(0, width),
        y: rand(0, height),
        vx: rand(-0.15, 0.15),
        vy: rand(-0.35, -0.05),
        r: big ? rand(2.4, 4.2) : rand(0.8, 1.9),
        color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
        alpha: rand(0.35, 0.85),
      }
    }

    const setup = () => {
      const rect = wrap.getBoundingClientRect()
      width = rect.width
      height = rect.height
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.max(1, Math.floor(width * dpr))
      canvas.height = Math.max(1, Math.floor(height * dpr))
      canvas.style.width = width + 'px'
      canvas.style.height = height + 'px'
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const count = Math.min(110, Math.max(28, Math.floor((width * height) / 5000)))
      particles = Array.from({ length: count }, makeParticle)
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height)
      const linkDist = Math.max(80, Math.min(width, height) * 0.2)

      for (const p of particles) {
        p.x += p.vx
        p.y += p.vy
        p.x += Math.sin((p.y + p.x) * 0.01) * 0.08

        const dxm = p.x - mouse.x
        const dym = p.y - mouse.y
        const dm = Math.hypot(dxm, dym)
        if (dm < 130) {
          const f = (130 - dm) / 130
          p.x += (dxm / (dm || 1)) * f * 0.7
          p.y += (dym / (dm || 1)) * f * 0.7
        }

        if (p.y < -12) {
          p.y = height + 12
          p.x = rand(0, width)
        }
        if (p.x < -12) p.x = width + 12
        if (p.x > width + 12) p.x = -12

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.globalAlpha = p.alpha
        ctx.fillStyle = p.color
        if (p.r > 2) {
          ctx.shadowColor = p.color
          ctx.shadowBlur = p.r * 4
        } else {
          ctx.shadowBlur = 0
        }
        ctx.fill()
      }
      ctx.shadowBlur = 0
      ctx.globalAlpha = 1

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i]
          const b = particles[j]
          const d = Math.hypot(a.x - b.x, a.y - b.y)
          if (d < linkDist) {
            ctx.strokeStyle = '#2D5BE3'
            ctx.globalAlpha = (1 - d / linkDist) * 0.2
            ctx.lineWidth = 0.6
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.stroke()
          }
        }
      }
      ctx.globalAlpha = 1
    }

    const loop = () => {
      draw()
      raf = requestAnimationFrame(loop)
    }

    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouse.x = e.clientX - rect.left
      mouse.y = e.clientY - rect.top
    }
    const onLeave = () => {
      mouse.x = -9999
      mouse.y = -9999
    }
    const onVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf)
      } else if (!reduceMotion) {
        raf = requestAnimationFrame(loop)
      }
    }

    setup()
    if (reduceMotion) {
      draw()
    } else {
      raf = requestAnimationFrame(loop)
    }

    window.addEventListener('mousemove', onMove)
    document.addEventListener('mouseleave', onLeave)
    document.addEventListener('visibilitychange', onVisibility)

    const ro = new ResizeObserver(() => {
      setup()
      if (reduceMotion) draw()
    })
    ro.observe(wrap)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseleave', onLeave)
      document.removeEventListener('visibilitychange', onVisibility)
      ro.disconnect()
    }
  }, [])

  return (
    <div ref={wrapRef} className={className} style={{ position: 'relative' }}>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
    </div>
  )
}
