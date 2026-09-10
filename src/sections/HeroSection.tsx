import { useState } from 'react'
import FadeIn from '../components/FadeIn'
import ContactButton from '../components/ContactButton'
import ContactModal from '../components/ContactModal'
import TextType from '../components/TextType'
import Model3DViewer from '../components/Model3DViewer'
import HeroVideoBackground from '../components/HeroVideoBackground'

// 正文两行（第 3 行需保持在同一行）
const BODY_TEXT =
  '我是蒋璐熠，27届研究生\n拥有腾讯、得物、美团、携程四段互联网产品实习经历'

export default function HeroSection() {
  const [contactOpen, setContactOpen] = useState(false)

  return (
    <section
      className="relative h-screen flex flex-col bg-white"
      style={{ overflow: 'hidden' }}
    >
      {/* 背景层：视频（垂直翻转 + object-cover）+ 白色渐变融合（z-0） */}
      <HeroVideoBackground />

      {/* Hero heading — 打字机文案，字号分级（参考图效果） */}
      <div className="relative z-20 overflow-hidden px-6 md:px-10 flex-1 flex flex-col justify-center pointer-events-none">
        {/* 第一行：大号问候语 */}
        <FadeIn delay={0.15} y={30}>
          <h1
            className="hero-heading font-black tracking-tight leading-none mb-4 sm:mb-5 md:mb-6"
            style={{ fontSize: 'clamp(3rem, 9vw, 9rem)' }}
          >
            <TextType
              text="你好"
              typingSpeed={110}
              showCursor={false}
              loop={false}
              initialDelay={300}
            />
          </h1>
        </FadeIn>

        {/* 正文：较小字号，两行打字机 */}
        <FadeIn delay={0.2} y={20}>
          <p
            // 窄屏按 \n 断行并允许折行；md 以上保持原单行不换行
            className="text-[#3A4256] font-medium tracking-wide leading-snug whitespace-pre-line md:whitespace-nowrap"
            style={{ fontSize: 'clamp(1rem, 2.4vw, 2.15rem)' }}
          >
            <TextType
              text={BODY_TEXT}
              typingSpeed={55}
              showCursor
              cursorCharacter="|"
              cursorClassName="body-cursor"
              loop={false}
              initialDelay={900}
            />
          </p>
        </FadeIn>
      </div>

      {/* Bottom bar */}
      <div className="relative z-20 flex justify-between items-end px-6 md:px-10 pb-7 sm:pb-8 md:pb-10 pointer-events-none">
        <div className="pointer-events-auto">
          <FadeIn delay={2.6} y={20}>
            <div style={{ transform: 'translateY(-10vh)' }}>
              <ContactButton onClick={() => setContactOpen(true)} />
            </div>
          </FadeIn>
        </div>
      </div>

      {/* 右侧区域：3D 模型（粒子动效已移除） */}
      <div
        className="absolute right-0 sm:right-[1%] md:right-[2%] z-10 top-[6%] sm:top-[12%] md:top-[20%] lg:top-[28%] w-[380px] h-[500px] sm:w-[480px] sm:h-[620px] md:w-[640px] md:h-[800px] lg:w-[820px] lg:h-[960px]"
        style={{ transform: 'translateX(7.6923vw)' }}
      >
        {/* 3D 全身模型，播放 GLB 原生旋转动画 */}
        <FadeIn delay={0.8} y={20} className="absolute inset-0 z-20">
          <Model3DViewer modelPath="/models/intern.glb" lightBoost={1.8} dpr={[1, 2]} />
        </FadeIn>
      </div>

      {/* 联系弹窗 */}
      <ContactModal open={contactOpen} onClose={() => setContactOpen(false)} />
    </section>
  )
}
