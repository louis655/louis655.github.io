import { useEffect, useRef } from 'react'

/**
 * CursorGlow — 鼠标蓝色柔光拖尾（克莱因蓝）
 * - 跟随鼠标的柔和发光晕，带惯性拖尾（参考视频里鼠标滑动的蓝色光效）
 * - 点击时光晕瞬间放大（点击反馈）
 * - 全屏固定 canvas，pointer-events:none 不挡交互
 * - 尊重 prefers-reduced-motion：关闭拖尾，仅保留静态微光
 * - 触摸设备（无精确指针）自动禁用
 */
export default function CursorGlow({
  color = '64, 106, 240', // 克莱因蓝 rgb（偏亮，发光更明显）
}: {
  color?: string
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // 触摸设备 / 无精确指针 → 不启用
    const finePointer = window.matchMedia('(pointer: fine)').matches
    if (!finePointer) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let dpr = Math.min(window.devicePixelRatio || 1, 2)
    let w = 0
    let h = 0

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = window.innerWidth
      h = window.innerHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = w + 'px'
      canvas.style.height = h + 'px'
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    // 拖尾采用一串「跟随点」，每个点以不同速度追赶鼠标 → 形成流动拖尾
    const target = { x: w / 2, y: h / 2 }
    const TRAIL = reduced ? 1 : 14
    const points = Array.from({ length: TRAIL }, () => ({ x: target.x, y: target.y }))
    let clickPulse = 0

    const onMove = (e: MouseEvent) => {
      target.x = e.clientX
      target.y = e.clientY
      wake()
    }
    const onDown = () => {
      clickPulse = 1
      wake()
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mousedown', onDown)

    let raf = 0
    let running = false

    // 是否还需要继续动（跟随点未收敛 或 还有点击脉冲）
    const needsAnimate = () => {
      if (clickPulse > 0.01) return true
      for (const p of points) {
        if (Math.abs(p.x - target.x) > 0.5 || Math.abs(p.y - target.y) > 0.5) return true
      }
      return false
    }

    const wake = () => {
      if (!running) {
        running = true
        raf = requestAnimationFrame(render)
      }
    }

    const render = () => {
      ctx.clearRect(0, 0, w, h)
      ctx.globalCompositeOperation = 'lighter' // 加色发光

      // 追赶：第一个点追鼠标，后续点追前一个点
      const ease = 0.28
      points[0].x += (target.x - points[0].x) * ease
      points[0].y += (target.y - points[0].y) * ease
      for (let i = 1; i < points.length; i++) {
        points[i].x += (points[i - 1].x - points[i].x) * ease
        points[i].y += (points[i - 1].y - points[i].y) * ease
      }

      clickPulse *= 0.9 // 点击脉冲衰减

      for (let i = 0; i < points.length; i++) {
        const p = points[i]
        // 头部最亮最大，尾部渐隐渐小
        const t = 1 - i / points.length
        const baseR = 26 + t * 34 + clickPulse * 40
        const alpha = (0.045 + t * 0.11) * (1 + clickPulse * 0.8)
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, baseR)
        grad.addColorStop(0, `rgba(${color}, ${alpha})`)
        grad.addColorStop(1, `rgba(${color}, 0)`)
        ctx.fillStyle = grad
        ctx.beginPath()
        ctx.arc(p.x, p.y, baseR, 0, Math.PI * 2)
        ctx.fill()
      }

      ctx.globalCompositeOperation = 'source-over'

      // 收敛后休眠，节省 CPU/GPU（鼠标再动时 wake 唤醒）
      if (needsAnimate()) {
        raf = requestAnimationFrame(render)
      } else {
        running = false
      }
    }
    wake()

    return () => {
      cancelAnimationFrame(raf)
      running = false
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mousedown', onDown)
    }
  }, [color])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 9999,
      }}
    />
  )
}
