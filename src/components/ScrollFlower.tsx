import { useRef, useEffect, useState } from 'react'

/**
 * ScrollFlower — 全屏固定花朵背景（v7：canvas 抽帧，变化绝对连贯）
 *
 * 图层：z-0 星空 → z-1 本组件 → z-10 文字 → z-20 3D模型
 *
 * v7 核心改进（解决"变化不连贯"）：
 *   · 弃用 video.currentTime seek（解码延迟 → 跳帧/卡顿）
 *   · 改用 canvas 抽帧：进入 section 时把视频抽成 60 张 bitmap 预解码缓存
 *   · 滚动时直接 drawImage 到 canvas —— 零解码延迟，变化绝对连贯
 *   · 抽帧期间用 video fallback 兜底（轻微不连贯），抽完瞬间切换
 *   · cover + scale(1.45) + 偏移，花朵偏右上、占满右半屏
 */
const BLOOM_START = 0
const FRAME_COUNT = 120

export default function ScrollFlower({
  targetRef,
  src = '/videos/flower.mp4',
}: {
  targetRef: React.RefObject<HTMLElement | null>
  src?: string
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const videoFallbackRef = useRef<HTMLVideoElement>(null)
  const framesRef = useRef<ImageBitmap[]>([])
  const rafRef = useRef<number | null>(null)
  const lastFrameIndex = useRef(-1)
  const smoothIdx = useRef(-1) // 平滑跟随的浮点帧索引，避免滚轮跳动导致花突变
  const [ready, setReady] = useState(false)
  // active：section 接近视口 → 提前抽帧 + 跑渲染循环（不代表花已可见）
  const [active, setActive] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // ── 预激活：section 进入视口前后各 1 屏就开始抽帧、跑渲染循环 ──
  // 真正的"显示/隐藏"由渲染循环里的 covers-viewport 判断硬切（见 tick）。
  // 提前激活是为了让 120 帧在花出现前就抽好，出现时直接高清连贯、不先糊一段 fallback。
  useEffect(() => {
    const el = targetRef.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => setActive(entry.isIntersecting),
      { rootMargin: '100% 0px 100% 0px', threshold: 0 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [targetRef])

  // ── 抽帧（section 接近视口且未抽过时执行一次）──
  useEffect(() => {
    if (!active || ready) return
    let cancelled = false
    const video = document.createElement('video')
    video.muted = true
    video.playsInline = true
    video.preload = 'auto'
    video.src = src

    video.onloadedmetadata = async () => {
      const dur = video.duration || 0
      if (dur <= 0) return
      const scale = Math.min(1, 1024 / video.videoWidth)
      const sw = Math.max(2, Math.round(video.videoWidth * scale))
      const sh = Math.max(2, Math.round(video.videoHeight * scale))
      const frames: ImageBitmap[] = []
      for (let i = 0; i < FRAME_COUNT; i++) {
        if (cancelled) return
        const time = (i / (FRAME_COUNT - 1)) * (dur - 0.05)
        await new Promise<void>((resolve) => {
          let done = false
          const onSeeked = () => {
            if (done) return
            done = true
            video.removeEventListener('seeked', onSeeked)
            resolve()
          }
          video.addEventListener('seeked', onSeeked)
          try {
            video.currentTime = time
          } catch {
            resolve()
          }
        })
        if (cancelled) return
        try {
          const bmp = await createImageBitmap(video, {
            resizeWidth: sw,
            resizeHeight: sh,
          })
          frames.push(bmp)
        } catch {
          /* 个别帧失败跳过 */
        }
        // 错峰：每抽一帧让出主线程，避免 120 帧连续解码撞上滚动造成卡顿
        await new Promise<void>((r) => setTimeout(r, 0))
      }
      if (!cancelled && frames.length > 0) {
        framesRef.current = frames
        setReady(true)
      }
    }
    video.onerror = () => {}

    return () => {
      cancelled = true
    }
  }, [active, ready, src])

  // ── 渲染循环：ready 前用 video fallback，ready 后用 canvas（连贯）──
  useEffect(() => {
    if (!active) return
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d') ?? null
    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    // 容器是 fixed inset:0，canvas 永远等于视口大小 → 直接用窗口尺寸，
    // 避免容器 display:none 时 getBoundingClientRect()=0 导致 canvas 量成 0×0。
    const resize = () => {
      if (!canvas) return
      canvas.width = Math.max(2, Math.round(window.innerWidth * dpr))
      canvas.height = Math.max(2, Math.round(window.innerHeight * dpr))
      lastFrameIndex.current = -1
    }
    resize()
    window.addEventListener('resize', resize)

    // ── 位置缓存：rect/offsetHeight 只在滚动/resize 时读取（被动监听里读 layout 便宜），
    //    rAF 循环里直接用缓存值，避免每帧 getBoundingClientRect 强制同步 layout ──
    let secTop = 0
    let secBottom = 0
    let secHeight = 1
    const updateMetrics = () => {
      const sec = targetRef.current
      if (!sec) return
      const rect = sec.getBoundingClientRect()
      secTop = rect.top
      secBottom = rect.bottom
      secHeight = sec.offsetHeight
    }
    updateMetrics()
    const onScroll = () => updateMetrics()
    window.addEventListener('scroll', onScroll, { passive: true })

    const getProgress = () => {
      const vh = window.innerHeight
      // 花随 section 进入视口就被 clip 揭示出来（见 tick，此时静止在第 0 帧盛开态）。
      // 「开/合/旋转动效」从 section 全屏（顶到达视口顶，-secTop = 0）开始，
      // 并随整个 section 的滚动持续变化，直到 section 底部到达视口底部。
      const start = 0
      const denom = Math.max(vh * 0.3, secHeight - vh)
      if (denom <= 0) return 0
      const p = (-secTop + start) / denom
      return Math.max(0, Math.min(1, p))
    }

    const tick = () => {
      // ── 显示/隐藏（硬切）：仅当 section 完整铺满视口时才显示花 ──
      // 花层是 fixed 全屏，只有 section 铺满整屏时它才只会盖在本 section 上，
      // 绝不污染上一屏(关于我)或下一屏。section 高 ≥200vh > 视口，必有铺满窗口。
      const container = containerRef.current
      if (!container) {
        rafRef.current = requestAnimationFrame(tick)
        return
      }
      const vh = window.innerHeight

      // ── 显隐 + 裁剪：只要 section 有任何部分进入视口就显示花 ──
      // 但用 clip-path 把花精确裁进 section 的可见区域：
      //   · 进入时（section 从底部升起）花随之从下往上揭示 → 一进入实习经历就能看到花
      //   · 完全铺满时无裁剪、完整显示
      //   · 裁剪保证花只会落在本 section 范围 → 绝不污染上一屏(关于我)/下一屏
      const inView = secTop < vh && secBottom > 0
      const disp = inView ? 'block' : 'none'
      if (container.style.display !== disp) container.style.display = disp
      if (!inView) {
        rafRef.current = requestAnimationFrame(tick)
        return
      }
      const clipTop = Math.max(0, Math.min(vh, secTop))
      const clipBottom = Math.max(0, Math.min(vh, vh - secBottom))
      const clip = `inset(${clipTop}px 0px ${clipBottom}px 0px)`
      if (container.style.clipPath !== clip) {
        container.style.clipPath = clip
        container.style.setProperty('-webkit-clip-path', clip)
      }

      const frames = framesRef.current
      const p = getProgress()
      const bloomP = BLOOM_START + (1 - BLOOM_START) * p

      if (!ctx || !canvas) {
        rafRef.current = requestAnimationFrame(tick)
        return
      }

      // ── 统一锚点：抽帧 bitmap 与兜底 video 共用同一套定位 ──
      // 花本体位于视频画面中心。把「画面中心」对齐到 canvas 固定锚点
      // （水平 78%、垂直 50%），只依赖 canvas 相对比例 → 两条渲染路径位置完全一致，
      // 刷新后无论抽帧是否完成，花都钉死在右侧，绝不出现在中间。
      const cw = canvas.width
      const ch = canvas.height
      const anchorX = cw * 0.78 // 花中心锁在画布水平 78% 处（靠右）
      const anchorY = ch * 0.5 // 垂直居中
      const drawCover = (
        source: CanvasImageSource,
        fw: number,
        fh: number,
        alpha: number
      ) => {
        const s = Math.max(cw / fw, ch / fh)
        const zdw = fw * s
        const zdh = fh * s
        ctx.globalAlpha = alpha
        ctx.drawImage(source, anchorX - zdw / 2, anchorY - zdh / 2, zdw, zdh)
      }

      if (ready && frames.length > 0) {
        // ── 目标帧（滚动进度映射）──
        const targetIdx = bloomP * (frames.length - 1)
        // ── 平滑跟随：每帧向目标缓动。系数调大(0.12→0.3)让花更紧跟滚动、
        //    滚一点就立刻看到变化；帧间 crossfade 仍保证过渡顺滑不顿挫 ──
        if (smoothIdx.current < 0) smoothIdx.current = targetIdx
        else smoothIdx.current += (targetIdx - smoothIdx.current) * 0.3

        const cur = smoothIdx.current
        // 仅当浮点帧位置有足够变化才重绘（含帧间小数部分，保证 crossfade 连续）
        if (Math.abs(cur - lastFrameIndex.current) > 0.001) {
          lastFrameIndex.current = cur
          const i0 = Math.floor(cur)
          const i1 = Math.min(frames.length - 1, i0 + 1)
          const frac = cur - i0 // 0~1，相邻两帧的混合比例
          const f0 = frames[i0]
          const f1 = frames[i1]
          if (f0) {
            ctx.clearRect(0, 0, cw, ch)
            // ── 帧间交叉淡化：底层前一帧 + 上层后一帧按 frac 混合，消除硬切顿挫 ──
            drawCover(f0, f0.width, f0.height, 1)
            if (f1 && f1 !== f0 && frac > 0.001) drawCover(f1, f1.width, f1.height, frac)
            ctx.globalAlpha = 1
          }
        }
      } else if (videoFallbackRef.current) {
        // ── fallback：seek 到目标时间，并把 video 当前帧画到 canvas（同一锚点）──
        // 不再用 <video> 的 object-fit/object-position 定位（那个在 16:9 屏幕上几乎
        // 不裁剪、会把花显示在中间），而是统一走 canvas drawCover → 位置锁死右侧。
        const video = videoFallbackRef.current
        if (video.readyState >= 2 && video.videoWidth > 0) {
          if (video.duration && isFinite(video.duration)) {
            const targetTime = Math.max(
              0,
              Math.min(video.duration - 0.1, bloomP * video.duration)
            )
            if (Math.abs(video.currentTime - targetTime) > 0.04) {
              try {
                video.currentTime = targetTime
              } catch {}
            }
          }
          ctx.clearRect(0, 0, cw, ch)
          drawCover(video, video.videoWidth, video.videoHeight, 1)
          ctx.globalAlpha = 1
        }
      }

      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)

    return () => {
      window.removeEventListener('resize', resize)
      window.removeEventListener('scroll', onScroll)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [ready, active, targetRef])

  if (!active) return null

  return (
    <div
      ref={containerRef}
      className="pointer-events-none"
      aria-hidden="true"
      style={{
        // ── 固定钉死视口：位置绝对不动，花只随滚动变形态、绝不左右/上下跳 ──
        // 显示/隐藏由渲染循环里的「section 是否铺满整屏」硬切（display none/block），
        // 初始 none → 绝不污染上一屏(关于我)或下一屏。
        position: 'fixed',
        inset: 0,
        zIndex: 1,
        overflow: 'hidden',
        display: 'none',
      }}
    >
      {/* 隐藏的 video 仅作数据源（抽帧前的兜底帧也由它画到 canvas，同一锚点） */}
      <video
        ref={videoFallbackRef}
        src={src}
        muted
        playsInline
        preload="auto"
        style={{ display: 'none' }}
      />
      {/* 唯一渲染出口：抽帧 bitmap 与兜底 video 帧都画到这里 → 位置始终锁死右侧 */}
      <canvas ref={canvasRef} className="w-full h-full" style={{ display: 'block' }} />
      {/* veldara 同款薄暗色遮罩 */}
      <div
        className="absolute inset-0"
        style={{ background: 'rgba(0,0,0,0.2)' }}
      />
    </div>
  )
}
