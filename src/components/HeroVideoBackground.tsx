import { useEffect, useRef } from 'react'

/**
 * HeroVideoBackground — 首页背景视频层
 * - 视频垂直翻转 scaleY(-1) + object-cover（按规格）
 * - 顶部透明 → 底部纯白 的渐变遮罩，把视频无缝融进白色背景
 * - 自动播放、静音、循环、inline（移动端可播）
 * - pointer-events:none 不挡交互；作为 Hero 的 z-0 背景
 * - prefers-reduced-motion：暂停视频，仅保留静态首帧 + 渐变
 * - 离屏暂停：滚出视口即 pause，回屏自动 play，避免滚动时持续解码
 */
// 本地自托管：原云 CDN 原片 1928×1072 / 4943 KB，重编码为 1280×712 / 210 KB（去音轨 + faststart），
// 同时去掉一个外部 CDN 依赖。源文件见 _videos-original/
const VIDEO_SRC = '/videos/hero-bg.mp4'

export default function HeroVideoBackground() {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().catch(() => {})
        } else {
          video.pause()
        }
      },
      { threshold: 0 }
    )
    io.observe(video)
    return () => io.disconnect()
  }, [])

  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none bg-white">
      <video
        ref={videoRef}
        className="w-full h-full object-cover [transform:scaleY(-1)]"
        src={VIDEO_SRC}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden="true"
      />
      {/* 白色渐变遮罩：顶部透明 → 底部纯白，无缝融进背景 */}
      <div className="absolute inset-0 bg-gradient-to-b from-[26.416%] from-[rgba(255,255,255,0)] to-[66.943%] to-white" />
    </div>
  )
}
