import { useRef, useEffect, useState } from 'react'
import { motion, type Variants } from 'framer-motion'
import ScrollFlower from '../components/ScrollFlower'
import Model3DViewer from '../components/Model3DViewer'

// ── 数据模型：{ company, logo, logoBg, logoFg, role, period, bullets } ──
// logo: 图片 URL（如 /logos/tencent.png）；若留空则 fallback 显示公司名首字
interface Experience {
  company: string
  logo?: string
  logoBg: string
  logoFg: string
  role: string
  period: string
  bullets: string[] // 每条格式 "前缀：描述"，前缀部分会加粗显示
}

// 4 段实习经历
const EXPERIENCES: Experience[] = [
  {
    company: '腾讯',
    logo: '/logos/tencent.png',
    logoBg: '#1F8AFF',
    logoFg: '#ffffff',
    role: '腾讯视频产品策划',
    period: '2026.05 ～ 2026.09',
    bullets: [
      '需求洞察：针对装扮推广场景单一的问题，围绕 4 个维度调研 5 款核心竞品，识别 IP 内容与装扮权益的联动机会，主导设计并落地激励广告装扮试用券玩法，新增视频播放场景下的装扮推广入口',
      '数据分析：重构装扮数据分析口径，解决收入与佩戴表现难以细分的问题，统一收入来源、获得方式、支付手段、售卖表现、佩戴表现 5 类指标，实现 IP 内容、明星、角色、展示位、礼包 5 个维度分析，支撑选品与推广决策',
      '产品迭代：主导 1353 套装扮适配，梳理 APP 改版前后的展示规则，完成迁移、兼容与灰度验证，保障 675 万月活佩戴用户平稳过渡，实验期仅产生 8 条相关客诉',
      '平台建设：重构商城订单模型，梳理 19 种订单类型与 10 种交易状态，归并为 5 类业务场景，统一需付款、应付款、实付款 3 类价格语义及多件订单状态规则，实现商城订单在资产中心统一展示',
    ],
  },
  {
    company: '得物',
    logo: '/logos/dewu.png',
    logoBg: '#16181D',
    logoFg: '#ffffff',
    role: '产品经理',
    period: '2026.01 ～ 2026.04',
    bullets: [
      '参数治理：重构商品参数管理与审批流程，统一参数变更规则与审批机制，提升商品信息维护效率，保障APP端商品页参数展示的准确性与一致性',
      '平台建设：搭建内嵌AI Agent的商品通用洗数据平台，落地自然语言意图解析、任务自动编排与 Human-in-the-loop 人工复核机制，提升商品信息生效时效 30%+，高频任务实现“秒级下发”',
      '搜索优化：升级内容管理后台搜索筛选能力，优化多选筛选、批量查询、精准匹配、推荐位筛选等 5 项核心能力，内容排查耗时下降 40%+、批量检索效率提升 2倍+',
    ],
  },
  {
    company: '美团',
    logo: '/logos/meituan.png',
    logoBg: '#FFD000',
    logoFg: '#1A1A1A',
    role: '评价消费产品经理',
    period: '2025.09 ～ 2025.11',
    bullets: [
      '需求洞察：系统调研 3 个核心竞品平台在 5 类生活服务场景中的看评机制，抽象用户看评决策中的通用需求与行业差异，构建“通用能力底座+行业特色字段”产品模型',
      '产品迭代：主导“评价筛选通用能力搭建”需求设计与落地，产出PRD、筛选规则、交互方案与埋点口径，完成医美、宠物类目行业特色筛选能力上线，行业特色标签筛选点击率提升 0.265pp',
      'AB实验：发起并设计“看评图集”AB 实验，搭建标签层与图片层两级埋点，验证“图片聚合+分类筛选”对看图效率的优化效果，图片点击率相对提升6.3%',
    ],
  },
  {
    company: '携程',
    logo: '/logos/ctrip.png',
    logoBg: '#2C8EFC',
    logoFg: '#ffffff',
    role: '入境游产品经理',
    period: '2025.05 ～ 2025.09',
    bullets: [
      '竞品分析：拆解 Viator、Klook、永安、EU 4 个 OTA 平台 200+ SKU 的商品结构与竞争力，构建商品力评估模型，提炼差异化供给策略，为选品与产品设计提供依据',
      '用户洞察：基于门票、日游订单与库存数据识别首批入境游目的地，完成 600+ 商品在新站点上架，Q3 累计订单达 400+',
      '产品设计：0-1搭建“沪/京热门POI + 四/五钻酒店”线路PRD，定义行程、酒店、班期及服务规则，最终落地13条入境游线路',
      '实验验证：发起并设计价格倍数区间AB实验，覆盖10个目的地，验证合理价格区间可带动转化率提升 8%+，并建立价格监控机制',
    ],
  },
]

// ── 滚动入场动画 ──
const cardVariants: Variants = {
  hidden: { opacity: 0, y: 24, filter: 'blur(6px)' },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: i * 0.08 },
  }),
}

// ══════════════════════════════════════
//  白色飘动粒子（veldara 同款：纯白、缓慢游动、无连线）
//  仅覆盖本 section，随 section 一起滚动
// ══════════════════════════════════════
function WhiteParticles({ targetRef }: { targetRef: React.RefObject<HTMLElement | null> }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const host = targetRef.current
    if (!canvas || !host) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let raf = 0
    let running = false
    let particles: { x: number; y: number; vx: number; vy: number; size: number; opacity: number }[] = []
    // dpr 限 1.25：画布高 200vh，retina 全分辨率填充量≈4 倍，1px 白点降档后视觉无差
    const dpr = Math.min(window.devicePixelRatio || 1, 1.25)

    const setup = () => {
      const rect = host.getBoundingClientRect()
      const w = rect.width
      const h = host.offsetHeight
      canvas.width = Math.max(1, Math.floor(w * dpr))
      canvas.height = Math.max(1, Math.floor(h * dpr))
      canvas.style.width = w + 'px'
      canvas.style.height = h + 'px'
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const count = Math.floor((w * h) / 14000)
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.28,
        vy: (Math.random() - 0.5) * 0.28,
        size: Math.random() * 1.4 + 0.4,
        opacity: Math.random() * 0.55 + 0.15,
      }))
    }

    const draw = () => {
      if (!running) return
      const w = canvas.width / dpr
      const h = canvas.height / dpr
      ctx.clearRect(0, 0, w, h)
      for (const p of particles) {
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0) p.x = w
        if (p.x > w) p.x = 0
        if (p.y < 0) p.y = h
        if (p.y > h) p.y = 0
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255,255,255,${p.opacity})`
        ctx.fill()
      }
      raf = requestAnimationFrame(draw)
    }

    // 离屏即停：section 滚出视口后不再每帧重绘，回屏自动恢复
    const start = () => {
      if (running) return
      running = true
      raf = requestAnimationFrame(draw)
    }
    const stop = () => {
      running = false
      cancelAnimationFrame(raf)
    }
    const io = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? start() : stop()),
      { threshold: 0 }
    )
    io.observe(host)

    setup()
    const ro = new ResizeObserver(setup)
    ro.observe(host)
    window.addEventListener('resize', setup)
    return () => {
      stop()
      io.disconnect()
      ro.disconnect()
      window.removeEventListener('resize', setup)
    }
  }, [targetRef])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 2 }}
    />
  )
}

// ── 公司 Logo：优先图片，加载失败 fallback 到首字 ──
function Logo({ exp }: { exp: Experience }) {
  const [error, setError] = useState(false)
  if (!exp.logo || error) {
    return (
      <span
        className="font-black leading-none select-none"
        style={{ color: exp.logoFg, fontSize: '1.1rem' }}
      >
        {exp.company[0]}
      </span>
    )
  }
  return (
    <img
      src={exp.logo}
      alt={exp.company}
      onError={() => setError(true)}
      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
    />
  )
}

// ── 单段实习经历 ──
function ExperienceCard({ exp, index }: { exp: Experience; index: number }) {
  return (
    <motion.div
      variants={cardVariants}
      custom={index}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      // 每段自然高度、内容垂直居中 → 段间距由父级 gap 控制，随内容自动延伸
      style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
    >
      {/* 头部：Logo + 公司名/角色 ｜ 右侧日期药丸 */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <div
            className="shrink-0 flex items-center justify-center rounded-2xl overflow-hidden"
            style={{
              width: 56,
              height: 56,
              background: 'transparent',
              boxShadow: '0 4px 14px rgba(0,0,0,0.35)',
            }}
          >
            <Logo exp={exp} />
          </div>
          <div className="min-w-0">
            {/* L1 锚点：公司名，20-22px / 600 / #F0F0F0 */}
            <h3
              className="leading-tight"
              style={{
                fontFamily: "'PingFang SC','SF Pro','Microsoft YaHei',sans-serif",
                fontSize: 'clamp(1.25rem, 1.4vw, 1.375rem)',
                fontWeight: 600,
                letterSpacing: '0.01em',
                color: '#F0F0F0',
              }}
            >
              {exp.company}
            </h3>
            {/* L3 次要：部门职位，15-16px / 500 / #E5E7EB，黑色背景更高可读性 */}
            <p
              className="mt-1.5"
              style={{ fontFamily: "'PingFang SC','SF Pro','Microsoft YaHei',sans-serif", fontSize: 'clamp(0.9375rem, 1vw, 1rem)', color: '#E5E7EB', fontWeight: 500, letterSpacing: '0.03em' }}
            >
              {exp.role}
            </p>
          </div>
        </div>
        {/* L4 辅助：实习时间，13-14px / 400 / #D1D5DB，胶囊底 #1A1A1A + 描边 #444 */}
        <span
          className="shrink-0 rounded-full tracking-wider tabular-nums px-4 py-1.5"
          style={{
            fontFamily: "'SF Pro','PingFang SC',ui-monospace,monospace",
            fontSize: 'clamp(0.8125rem, 0.9vw, 0.875rem)',
            fontWeight: 400,
            color: '#D1D5DB',
            background: '#1A1A1A',
            border: '1px solid #444444',
          }}
        >
          {exp.period}
        </span>
      </div>

      {/* L2 正文：实习内容，15-16px / 400 / #E8E8E8，四字标题使用蓝色标签强化层级 */}
      {exp.bullets.length > 0 && (
        // 段内间距 0.6rem < 段间间距 4~6.5rem：用接近性把每条归组到所属公司，弱化长短差异
        <ul className="flex flex-col list-none p-0" style={{ gap: '0.6rem', marginTop: '0.875rem' }}>
          {exp.bullets.map((text, bi) => {
            const ci = text.indexOf('：')
            const label = ci > 0 ? text.slice(0, ci) : '' // 标签不含冒号
            const rest = ci > 0 ? text.slice(ci + 1) : text
            return (
              <li
                key={bi}
                className="flex gap-3"
                style={{
                  fontFamily: "'PingFang SC','SF Pro','Microsoft YaHei',sans-serif",
                  fontSize: 'clamp(0.9375rem, 1.05vw, 1rem)',
                  fontWeight: 400,
                  lineHeight: 1.72,
                  color: '#E8E8E8',
                  // 中文两端对齐：各行右边缘齐平，整段视觉更规整
                  textAlign: 'justify',
                }}
              >
                <span className="shrink-0" style={{ fontSize: '0.5rem', marginTop: '0.6rem', color: '#F5F5F5' }}>◆</span>
                <span>
                  {label && (
                    <strong
                      style={{
                        display: 'inline-block',
                        marginRight: '0.5rem',
                        padding: '0.1rem 0.5rem',
                        border: '1px solid rgba(103, 174, 255, 0.55)',
                        borderRadius: '0.4rem',
                        background: 'rgba(31, 138, 255, 0.18)',
                        color: '#B9D8FF',
                        fontWeight: 700,
                        lineHeight: 1.4,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {label}
                    </strong>
                  )}
                  {rest}
                </span>
              </li>
            )
          })}
        </ul>
      )}

    </motion.div>
  )
}

// ══════════════════════════════════════
//  主 Section：居中标题 + 左侧 4 段实习（等间距、根据内容自动延伸）+ 右侧滚动花朵
// ══════════════════════════════════════
export default function ServicesSection() {
  const sectionRef = useRef<HTMLElement>(null)

  return (
    <section
      ref={sectionRef}
      id="price"
      className="relative overflow-hidden rounded-t-none"
      style={{
        background: '#010101',
        minHeight: '200vh',
      }}
    >
      {/* 图层1：滚动驱动的花朵（右侧中间，全屏后随滚动开/合/旋转） */}
      <ScrollFlower targetRef={sectionRef} />

      {/* 图层2：白色飘动粒子（覆盖本 section，随之滚动） */}
      <WhiteParticles targetRef={sectionRef} />

      {/* 图层3：实习经历内容（整体占 ≥2 屏，4 段等间距）。文字靠左、行更长。 */}
      <div
        className="relative z-10 w-full"
        style={{
          padding: '2vh 4vw 18vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* 标题：L0 焦点，顶部居中，银色渐变 + 内发光，缩小 1/4 / 900 */}
        <div style={{ textAlign: 'center', marginTop: 'clamp(5.625rem, 6.3vw, 6.1875rem)' }}>
          <h2
            // 窄屏单独降级字号：原 clamp 在 1428px 以下恒取 90px，4 字=360px 会贴满 390 宽屏
            className="font-black leading-none tracking-tight max-md:!text-[3.5rem]"
            style={{
              fontFamily: "'PingFang SC','SF Pro','Microsoft YaHei','Noto Sans SC',sans-serif",
              fontSize: 'clamp(5.625rem, 6.3vw, 6.1875rem)',
              fontWeight: 900,
              letterSpacing: '-0.02em',
              background: 'linear-gradient(180deg, #FFFFFF 0%, #808080 100%)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              color: 'transparent',
              textShadow: '0 0 40px rgba(255,255,255,0.28), 0 0 80px rgba(255,255,255,0.14)',
            }}
          >
            实习经历
          </h2>
        </div>

        {/* 3D 模型：左上，z-20 保证处于实习经历页最顶层，不被正文遮挡；容器放大并上移 */}
        <div className="relative z-20" style={{ height: 'min(38vw, 620px)', marginTop: 'calc(2vh - clamp(2.8125rem, 3.15vw, 3.09375rem) - 10vh)' }}>
          <div
            style={{ position: 'absolute', top: 0, left: 0, width: 'min(46vw, 820px)', height: '100%' }}
            aria-hidden="true"
          >
            <div style={{ width: '100%', height: '100%', transform: 'translateY(-6.6667vh)' }}>
              <Model3DViewer modelPath="/models/pa.glb" baseY={0.22} frameMargin={1.36} dpr={[1, 2]} />
            </div>
          </div>
        </div>

        {/* 4 段实习：整体上移 2/10 屏幕高度 */}
        <div
          className="relative z-10 max-md:!w-full"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'clamp(4rem, 10.5vh, 6.5rem)',
            width: 'min(85%, 1200px)',
            marginTop: 'calc(2vh + clamp(2.8125rem, 3.15vw, 3.09375rem) - 43.3334vh)',
          }}
        >
          {EXPERIENCES.map((exp, i) => (
            <ExperienceCard key={exp.company} exp={exp} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
