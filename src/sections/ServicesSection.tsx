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
  summary?: string // 概述段落：纯白色正文，无蓝色标签、无 ◆ 符号
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
    summary:
      '围绕腾讯视频IP衍生品商城及IP装扮业务，聚焦交易体验优化与IP商业化增长，建设搜索推荐、订单体系、AI客服售后服务、商业化玩法及数据归因体系，实现商城用户体验优化与装扮业务收入提升',
    bullets: [
      '商城搜索与智能推荐建设：面对IP衍生品商城搜索相关性不足、个性化分发能力弱的问题，主导“搜索引导—联想召回—结果排序”全链路产品设计。融合热播内容、用户偏好及全站热词设计千人千面搜索策略，基于“明星-IP-角色”知识图谱构建多路联想召回机制，落地“相关性分层+内容/商品/质量三因子融合”两阶段排序策略，完善营销Banner与无结果页导购机制，推动搜索渗透率提升20%、搜索跳出率降低35%、搜索转化率相对提升15%+',
      '商城交易底座建设：针对 IP衍生品商城商品类型多、交易玩法复杂导致订单状态及金额展示口径不统一的问题，重构商城订单体系，梳理 19 类订单类型与 10 类交易状态，归并 5 类核心业务场景，建立统一订单状态体系及 3 种金额展示规则，打通订单、资产与客服服务链路，实现商城订单统一展示并提升售后场景处理效率',
      'AI售后服务体验优化：面向IP衍生品商城售后服务场景，针对传统机器人客服依赖关键词匹配、用户售后咨询处理效率低的问题，构建基于订单状态的售后问题识别体系，设计多轮对话、卡片化信息展示及异常拦截机制，实现咨询问题当日解决率≥85%、7日解决率≥95%，提升用户售后体验',
      'IP商业化玩法设计：围绕IP装扮商业化增长目标，针对装扮推广入口有限、内容消费与装扮商品转化链路割裂的问题，拆解 5 款核心竞品商业化模式，设计并落地“观看激励广告领取装扮券”增长玩法，新增视频播放场景推广入口，打通内容消费、权益获取与装扮转化链路，实验期推动装扮点击率提升 12.8%，推广入口贡献收入 8%',
      '数据能力建设：伴随腾讯视频APP改版升级，针对 675万 装扮佩戴用户权益迁移及改版后业务数据口径缺失问题，建立用户权益保护及数据分析闭环，制定用户保护、实验隔离、版本回退及客服承接方案，增加装扮来源、获取方式、支付及使用链路数据口径，保障存量用户权益平稳迁移、支持后续装扮运营分析与收入归因',
    ],
  },
  {
    company: '得物',
    logo: '/logos/dewu.png',
    logoBg: '#16181D',
    logoFg: '#ffffff',
    role: '产品经理',
    period: '2026.01 ～ 2026.04',
    summary:
      '围绕商品信息治理业务，建设 AI 驱动的商品治理能力底座，重构商品洗数、审核及参数维护流程，提升商品信息处理效率与运营治理能力',
    bullets: [
      'AI数据治理平台建设：针对商品信息清洗依赖人工提交脚本需求，存在处理周期长、沟通成本高的问题，0—1建设商品智能洗数能力平台，将运营需求转化为自然语言任务，设计任务意图识别、任务自动编排及 Human-in-the-loop风控机制，实现高频治理任务自动化处理，提升商品信息生效时效 30%+，高频任务实现“秒级下发”',
      '商品参数治理流程重构：面向商品审核任务流转效率低、参数维护链路复杂的问题，联合AI洗数平台重构商品治理流程，建立自动任务流转、超时提醒及参数变更审批机制，优化审核任务分配与参数维护链路，提升审核处理效率 23%，提高商品信息治理规范性',
    ],
  },
  {
    company: '美团',
    logo: '/logos/meituan.png',
    logoBg: '#FFD000',
    logoFg: '#1A1A1A',
    role: '评价消费产品经理',
    period: '2025.09 ～ 2025.11',
    summary:
      '围绕本地生活用户消费决策链路，建设评价信息获取与决策辅助能力，完善通用评价筛选、行业特色标签及图片内容展示体系，提升用户决策效率并促进交易转化',
    bullets: [
      '评价产品策略分析：基于本地生活评价消费决策链路，拆解抖音、小红书、高德 3 个平台在美业、宠物等 5 类本地生活场景下的评价产品设计，分析不同场景下用户信息获取方式与决策因素差异，沉淀通用评价筛选能力与行业特色标签建设策略，为评价产品迭代提供策略依据',
      '评价筛选能力建设：本地生活垂类行业用户关注信息存在差异，通用评价标签难以满足用户快速获取有效信息需求，搭建通用评价筛选与行业特色标签体系，设计评价标签、筛选规则、交互方案及埋点口径，灰度上线后评价筛选点击率提升 0.265pp，带动交易转化提升约 5%',
      '评价内容体验优化：针对美甲强视觉行业用户依赖图片辅助决策，但评价图片分散、用户难以快速获取有效参考内容问题，设计评价图集聚合方案，搭建标签层、图片层多层级埋点体系，优化图片浏览体验，上线后图片点击率提升 6.3%',
    ],
  },
  {
    company: '携程',
    logo: '/logos/ctrip.png',
    logoBg: '#2C8EFC',
    logoFg: '#ffffff',
    role: '入境游产品经理',
    period: '2025.05 ～ 2025.09',
    summary:
      '围绕入境游业务增长目标，建设从商品筛选、线路设计到价格验证的供给增长体系，完善旅游产品供给能力与交易转化链路，推动新站点商品上线、实现业务增长',
    bullets: [
      '供给策略与竞品分析：入境游商品同质化、选品缺少统一判断标准，拆解 Viator、Klook、永安等 OTA 平台 200+ SKU商品特征，从行程深度、导游语言、酒店星级、价格等 8 个维度建立商品力评估体系，沉淀商品筛选标准，识别“热门 POI+四/五星酒店”等高潜供给组合，为新站点商品规划提供策略依据',
      '数据驱动选品体系建设：入境游需求存在明显季节性波动，传统选品缺少数据依据，基于门票、日游订单与库存数据分析目的地需求趋势，建立数据驱动选品方法，筛选首批 10 个重点入境游目的地，支撑 600+ 商品上线新站点，Q3累计订单 400+',
      '线路产品0-1设计：新站点缺少差异化旅游线路供给，结合目的地资源、竞品线路及用户需求分析，设计线路产品结构与组合规则，制定行程安排、拼团及履约标准，打造“热门POI+四/五星酒店”线路方案，推动供应商完成 13 条线路上线，完善新站点旅游产品供给',
      '线路定价策略验证：旅游线路价格差异影响用户购买决策，设计价格倍数AB实验，基于目的地、天数、酒店等级进行分层抽样验证验证不同价格策略效果，实验组下单转化率提升 8%+ 、退款率无明显增加，沉淀价格监控机制支持后续线路定价优化',
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

      {/* 概述段落：纯白色正文，无蓝色标签、无 ◆ 符号 */}
      {exp.summary && (
        <p
          style={{
            fontFamily: "'PingFang SC','SF Pro','Microsoft YaHei',sans-serif",
            fontSize: 'clamp(0.9375rem, 1.05vw, 1rem)',
            fontWeight: 400,
            lineHeight: 1.72,
            color: '#E8E8E8',
            textAlign: 'justify',
            marginTop: '0.875rem',
          }}
        >
          {exp.summary}
        </p>
      )}

      {/* L2 正文：实习内容，15-16px / 400 / #E8E8E8，标题使用蓝色标签强化层级 */}
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
            width: 'min(89.25%, 1260px)',
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
