import { useLayoutEffect, useRef, useState, useEffect, Fragment } from 'react'
import { createPortal } from 'react-dom'
import { motion, useScroll, useTransform, useMotionValue } from 'framer-motion'
import FadeIn from '../components/FadeIn'
import LiveProjectButton from '../components/LiveProjectButton'
import Model3DViewer from '../components/Model3DViewer'

// 左图右文的静态分析布局（参考作品集排版：图小、文右）
interface AnalysisLayout {
  image: string
  title: string
  intro: string
  points: { prefix?: string; text: string; highlights?: string[] }[]
  /** 卡片右侧独立块：数据洞察结论文案 */
  sideNote?: string
  /** 右侧块配图（图左文右、2×2 网格） */
  sideImages?: string[]
  /** 竞品总览组：文案 + 5 张竞品截图（上排 2 张居中、下排 3 张） */
  compNote?: string
  compImages?: string[]
  /** 可扩展能力组：文案 + 2 张图（竖排两行、轻微错开） */
  priorityNote?: string
  priorityImages?: string[]
}

interface Project {
  number: string
  category?: string
  name: string
  cta?: string
  href?: string
  images: string[]
  analysis?: AnalysisLayout
  /** 普通图片带卡片的文案块（存在时：文案在左，图片按 560px 固定宽展示，同 01 卡报告图规格） */
  note?: string
}

const PROJECTS: Project[] = [
  {
    number: '01',
    name: '腾讯暑期实习看板',
    cta: '查看项目',
    href: 'https://louis-board-production.up.railway.app/',
    images: [
      '/images/board-1.jpg',
      '/images/board-2.jpg',
      '/images/board-3.jpg',
      '/images/board-4.jpg',
    ],
    note: '为解决实习记录分散、周报整理耗时的痛点，制作个人成长看板\n日报/周报结构化沉淀，AI 基于日报自动生成 50 字摘要与周汇总，进度环与工作日倒计时可视化追踪实习节奏，打通从记录到复盘的全流程',
  },
  {
    number: '02',
    name: '装扮竞品分析',
    cta: '点击查看完整报告',
    href: 'https://louis655.github.io/tencent-report/tencent-report-copy/',
    images: [],
    analysis: {
      image: '/images/zhuangban-report.jpg',
      title: '分析角度',
      intro:
        '新人视角下的个性装扮调研，希望通过体验与玩法优化，为装扮带来更可观的收入增长，并提升用户使用活跃度',
      points: [
        {
          prefix: '先',
          text: '系统梳理五大竞品 App（爱奇艺、芒果、Bilibili、QQ音乐、QQ）的装扮能力现状，建立行业基线认知',
        },
        {
          prefix: '再',
          text: '沿「装扮商城、我的装扮、装扮点位、装扮推广」四个核心维度逐条盘点',
        },
        {
          text: '区分其中腾讯视频的已有能力与可借鉴方向',
          highlights: ['已有能力', '可借鉴方向'],
        },
      ],
      sideNote:
        '根据腾讯视频装扮收入、装扮购买用户人群画像、佩戴使用统计数据进行分析，装扮呈“免费引流、中低价变现”结构，收入靠头部IP拉动，复购薄弱，“已佩戴未购”人群是最大增量池',
      sideImages: [
        '/images/zh-data-1.jpg',
        '/images/zh-data-2.jpg',
        '/images/zh-data-3.jpg',
        '/images/zh-data-4.jpg',
      ],
      compNote:
        '系统梳理五大竞品 App（爱奇艺、芒果、Bilibili、QQ音乐、QQ）在装扮商城、我的装扮、装扮点位、装扮推广四个核心维度的现状，建立行业基线认知',
      compImages: [
        '/images/comp-1.jpg',
        '/images/comp-2.jpg',
        '/images/comp-3.jpg',
        '/images/comp-4.jpg',
        '/images/comp-5.jpg',
      ],
      priorityNote:
        '对标竞品能力，聚焦装扮后台打通、商城体验升级、APP 内权益绑定、装扮资产管理、点位丰富、装扮入口优化、推广玩法七大方向，提出16条可扩展能力',
      priorityImages: ['/images/prior-1.jpg', '/images/prior-2.jpg'],
    },
  },
]

const TOTAL = PROJECTS.length

// ── 图片点击放大层（Portal 挂 body，避免被卡片 scale 变换困住）──
function ImageLightbox({ src, onClose }: { src: string; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return createPortal(
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center bg-black/60 backdrop-blur-sm cursor-zoom-out"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="图片放大预览"
    >
      <img
        src={src}
        alt="放大预览"
        className="max-w-[92vw] max-h-[88vh] w-auto h-auto rounded-[16px] shadow-2xl"
        draggable={false}
      />
    </div>,
    document.body
  )
}

function ProjectCard({
  project,
  index,
  onZoomImage,
}: {
  project: Project
  index: number
  onZoomImage?: (src: string) => void
}) {
  const runwayRef = useRef<HTMLDivElement>(null)
  const viewportRef = useRef<HTMLDivElement>(null)
  const stripRef = useRef<HTMLDivElement>(null)
  const [overflow, setOverflow] = useState(0)
  const [measureTick, setMeasureTick] = useState(0)

  // 测量横向内容溢出量（strip 总宽 - 可视区宽）
  useLayoutEffect(() => {
    const measure = () => {
      const vp = viewportRef.current
      const st = stripRef.current
      if (!vp || !st) return
      setOverflow(Math.max(0, st.scrollWidth - vp.clientWidth))
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [measureTick])

  // 横向位移进度（原生计算，精确对齐“卡片居中吸住”区间）
  // 卡片吸住时顶部固定在 7.5vh（垂直居中），吸住区间 = runway 高 - 85vh = overflow
  // 滚轮在吸住区间内 1:1 驱动横向滑动，滑完才解除吸附继续下滚
  const xProgress = useMotionValue(0)
  useEffect(() => {
    const el = runwayRef.current
    if (!el) return
    let raf = 0
    const update = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const vh = window.innerHeight
        const stickyTop = vh * 0.075 // 居中锚点（(100vh - 85vh)/2）
        const start = stickyTop // 吸住开始：runway 顶部距视口顶 = 7.5vh
        const end = stickyTop - overflow // 吸住结束：再滚 overflow 像素后解吸
        if (start <= end) return xProgress.set(0)
        const raw = (start - el.getBoundingClientRect().top) / (start - end)
        xProgress.set(Math.min(1, Math.max(0, raw)))
      })
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [overflow, xProgress])

  const x = useTransform(xProgress, [0, 1], [0, -overflow])

  // 叠卡缩放效果（analysis 卡片固定不缩放，避免内容多时忽大忽小）
  const { scrollYProgress: enterProgress } = useScroll({
    target: runwayRef,
    offset: ['start end', 'start start'],
  })
  const targetScale = project.analysis ? 1 : 1 - (TOTAL - 1 - index) * 0.03
  const scale = useTransform(enterProgress, [0, 1], [1, targetScale])

  // 跑道长度 = 卡片高(85vh) + 溢出宽度 + 缓冲，保证吸住区间 1:1 驱动横向浏览
  const runway = Math.ceil(overflow)

  return (
    <div
      ref={runwayRef}
      style={{ height: `calc(85vh + ${runway + 160}px)` }}
    >
      <div className="sticky" style={{ top: '7.5vh' }}>
        <motion.div
          style={{ scale }}
          className="relative w-full h-[85vh] flex flex-col rounded-[40px] sm:rounded-[50px] md:rounded-[60px] border-2 border-[#34B39A] bg-white p-4 sm:p-6 md:p-8 overflow-hidden"
        >
          {/* Top row */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6 md:mb-8 shrink-0">
            <div className="flex items-center gap-4 sm:gap-6 md:gap-8">
              <span
                className="text-[#0A2F9E] font-black font-display leading-none"
                style={{ fontSize: 'clamp(3rem, 10vw, 140px)' }}
              >
                {project.number}
              </span>
              {/* 标题块相对定位，给实习看板模型做锚点 */}
              <div className="relative flex flex-col gap-1 sm:gap-2">
                {project.category && (
                  <span className="text-[#3A4256]/60 font-light uppercase tracking-widest text-xs sm:text-sm md:text-base">
                    {project.category}
                  </span>
                )}
                <h3
                  className="text-[#0A2F9E] font-medium uppercase leading-tight"
                  style={{ fontSize: 'clamp(1.1rem, 2.4vw, 2.4rem)' }}
                >
                  {project.name}
                </h3>
                {/* 实习看板：风筝模型放在标题右侧（向上 1/3 屏、向右 1/5 屏） */}
                {project.number === '01' && (
                  <div
                    className="absolute z-10 h-[120px] w-[120px] sm:h-[150px] sm:w-[150px] md:h-[180px] md:w-[180px] lg:h-[220px] lg:w-[220px] pointer-events-none"
                    style={{ top: '-4vh', left: '105%' }}
                  >
                    <Model3DViewer
                      modelPath="/models/kite.glb"
                      baseY={0}
                      frameMargin={0.95}
                      lightBoost={1.8}
                      dpr={[1, 2]}
                    />
                  </div>
                )}
              </div>
            </div>
            <LiveProjectButton label={project.cta} href={project.href} />
          </div>

          {/* 内容区：统一走横向跑道（竖向滚动驱动横向浏览，滚完本卡内容才进下一张） */}
          <div ref={viewportRef} className="flex-1 min-h-0 overflow-hidden">
            <motion.div
              ref={stripRef}
              style={{ x }}
              className="flex h-full w-max items-center gap-4 sm:gap-5 md:gap-6"
            >
              {project.analysis ? (
                <>
                  {/* 左组：报告图 + 模型/分析角度文案（固定宽度；跑道内不做负边距横移，避免被 overflow 裁掉） */}
                  <div className="flex items-center gap-6 md:gap-10 lg:gap-14 shrink-0">
                    <img
                      src={project.analysis.image}
                      alt={`${project.name} 报告预览`}
                      loading="lazy"
                      draggable={false}
                      onClick={() => onZoomImage?.(project.analysis!.image)}
                      onLoad={() => setMeasureTick((t) => t + 1)}
                      title="点击放大"
                      className="w-[86vw] md:w-[560px] shrink-0 h-auto rounded-[16px] sm:rounded-[20px] border border-[#0A2F9E]/10 cursor-zoom-in transition-transform duration-300 hover:scale-[1.015]"
                      style={{ boxShadow: '0 16px 40px rgba(10,47,158,0.10)' }}
                    />
                    <div className="w-[86vw] md:w-[576px] shrink-0 flex flex-col gap-3 md:gap-4">
                      <div
                        className="relative z-10 h-[320px] w-[320px] sm:h-[400px] sm:w-[400px] lg:h-[440px] lg:w-[440px] shrink-0"
                        style={{ transform: 'translateY(-9.0909vh)' }}
                      >
                        {/* baseY 0.18 + frameMargin 1.1：浮动顶点 0.23 < 0.3 裁头线，上浮全程头顶/悬浮面板不出取景框不被裁 */}
                        <Model3DViewer modelPath="/models/zhuangban.glb" baseY={0.18} frameMargin={1.1} lightBoost={1.8} />
                      </div>
                      <div className="flex flex-col gap-3 md:gap-4 -mt-[25vh]">
                        <h4 className="flex items-center gap-2.5 text-[#0A2F9E] font-black text-[1.25rem] sm:text-[1.45rem]">
                          <span className="inline-block w-1.5 h-6 rounded-full bg-[#0A2F9E]" />
                          {project.analysis.title}
                        </h4>
                        <div className="flex flex-col gap-2">
                          <p className="text-[#1E293B] font-medium leading-[1.75] text-[1.02rem] sm:text-[1.08rem]">
                            {project.analysis.intro}
                          </p>
                          {project.analysis.points.map((point, i) => (
                            <p
                              key={i}
                              className="text-[#374151] font-normal leading-[1.75] text-[0.98rem] sm:text-[1.05rem]"
                            >
                              {point.prefix && (
                                <span className="text-[#0A2F9E] font-bold mr-1">{point.prefix}</span>
                              )}
                              {point.text}
                            </p>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 右组：2×2 数据截图网格 + 数据洞察宽文案（横向滚动后可见） */}
                  <div className="flex items-center gap-6 lg:gap-8 shrink-0 pr-6">
                    <div className="grid grid-cols-2 gap-3 w-[420px] shrink-0 items-start">
                      {project.analysis.sideImages?.map((src, i) => (
                        <img
                          key={i}
                          src={src}
                          alt={`数据洞察 ${i + 1}`}
                          loading="lazy"
                          draggable={false}
                          onClick={() => onZoomImage?.(src)}
                          title="点击放大"
                          className="w-full h-auto rounded-[12px] border border-[#0A2F9E]/10 shadow-sm cursor-zoom-in transition-transform duration-300 hover:scale-[1.03]"
                          style={i === 2 ? { marginTop: '-10vh' } : undefined}
                        />
                      ))}
                    </div>
                    <p
                      className="w-[400px] shrink-0 text-[#1E293B] font-normal leading-[1.75] text-[0.98rem] sm:text-[1.05rem] text-left"
                    >
                      {project.analysis.sideNote}
                    </p>
                  </div>

                  {/* 竞品总览组：5 张竞品截图在左（上排 2 张居中对齐下排，下排 3 张），文案在右，跑道最末 */}
                  <div className="flex items-center gap-6 lg:gap-8 shrink-0 pr-8">
                    <div className="flex flex-col items-center gap-3 shrink-0">
                      <div className="flex gap-3">
                        {project.analysis.compImages?.slice(0, 2).map((src, i) => (
                          <img
                            key={i}
                            src={src}
                            alt={`竞品总览 ${i + 1}`}
                            loading="lazy"
                            draggable={false}
                            onClick={() => onZoomImage?.(src)}
                            title="点击放大"
                            className="w-[253px] h-auto rounded-[12px] border border-[#0A2F9E]/10 shadow-sm cursor-zoom-in transition-transform duration-300 hover:scale-[1.03]"
                          />
                        ))}
                      </div>
                      <div className="flex gap-3">
                        {project.analysis.compImages?.slice(2, 5).map((src, i) => (
                          <img
                            key={i}
                            src={src}
                            alt={`竞品总览 ${i + 3}`}
                            loading="lazy"
                            draggable={false}
                            onClick={() => onZoomImage?.(src)}
                            title="点击放大"
                            className="w-[253px] h-auto rounded-[12px] border border-[#0A2F9E]/10 shadow-sm cursor-zoom-in transition-transform duration-300 hover:scale-[1.03]"
                          />
                        ))}
                      </div>
                    </div>
                    <p
                      className="w-[520px] shrink-0 text-[#1E293B] font-normal leading-[1.75] text-[0.98rem] sm:text-[1.05rem] text-left"
                    >
                      {project.analysis.compNote}
                    </p>
                  </div>

                  {/* 可扩展能力组：2 张图竖排两行（下行右移 24px 轻微错开），文案在右，跑道最末 */}
                  <div className="flex items-center gap-6 lg:gap-8 shrink-0 pr-10">
                    <div className="flex flex-col gap-3 shrink-0">
                      {project.analysis.priorityImages?.map((src, i) => (
                        <img
                          key={i}
                          src={src}
                          alt={`可扩展能力 ${i + 1}`}
                          loading="lazy"
                          draggable={false}
                          onClick={() => onZoomImage?.(src)}
                          title="点击放大"
                          className={`w-[420px] h-auto rounded-[12px] border border-[#0A2F9E]/10 shadow-sm cursor-zoom-in transition-transform duration-300 hover:scale-[1.03] ${i === 1 ? 'ml-6' : ''}`}
                        />
                      ))}
                    </div>
                    <p
                      className="w-[400px] shrink-0 text-[#1E293B] font-normal leading-[1.75] text-[0.98rem] sm:text-[1.05rem] text-left"
                    >
                      {project.analysis.priorityNote}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  {/* 文案块（如有）：在左，样式同 01 卡分析角度正文 */}
                  {project.note && (
                    <p className="w-[540px] md:w-[580px] shrink-0 self-center whitespace-pre-line text-[#1E293B] font-normal leading-[1.75] text-[1rem] sm:text-[1.05rem] text-left">
                      {project.note}
                    </p>
                  )}
                  {project.images.map((src, i) => (
                    <img
                      key={`${project.number}-${i}`}
                      src={src}
                      alt={`${project.name} 预览 ${i + 1}`}
                      loading="lazy"
                      draggable={false}
                      onLoad={() => setMeasureTick((t) => t + 1)}
                      onClick={project.note ? () => onZoomImage?.(src) : undefined}
                      title={project.note ? '点击放大' : undefined}
                      className={
                        project.note
                          ? `w-[86vw] md:w-[373px] shrink-0 h-auto self-center rounded-[16px] sm:rounded-[20px] border border-[#0A2F9E]/10 cursor-zoom-in transition-transform duration-300 hover:scale-[1.015] ${i % 2 === 0 ? '-translate-y-10' : 'translate-y-10'}`
                          : 'h-full w-auto object-cover rounded-[28px] sm:rounded-[36px] md:rounded-[44px]'
                      }
                      style={
                        project.note
                          ? { boxShadow: '0 16px 40px rgba(10,47,158,0.10)' }
                          : { aspectRatio: '16 / 10' }
                      }
                    />
                  ))}
                </>
              )}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default function ProjectsSection() {
  const [zoomSrc, setZoomSrc] = useState<string | null>(null)

  return (
    <section
      id="projects"
      className="relative z-10 bg-[#F4F5F7] rounded-t-[40px] sm:rounded-t-[50px] md:rounded-t-[60px] -mt-10 sm:-mt-12 md:-mt-14 px-5 sm:px-8 md:px-10 pt-20 sm:pt-24 md:pt-32 pb-20"
    >
      <FadeIn delay={0} y={40}>
        <h2
          className="section-title-gradient font-black leading-none text-center mb-16 sm:mb-20 md:mb-24"
          style={{
            fontSize: 'clamp(5.625rem, 6.3vw, 6.1875rem)',
            fontWeight: 900,
            letterSpacing: '-0.02em',
          }}
        >
          项目作品
        </h2>
      </FadeIn>

      <div className="w-[94.5455%] mx-auto">
        {PROJECTS.map((project, i) => (
          <Fragment key={project.number}>
            <ProjectCard
              project={project}
              index={i}
              onZoomImage={setZoomSrc}
            />
            {i < PROJECTS.length - 1 && <div style={{ height: '10vw' }} aria-hidden />}
          </Fragment>
        ))}
      </div>

      {zoomSrc && <ImageLightbox src={zoomSrc} onClose={() => setZoomSrc(null)} />}
    </section>
  )
}
