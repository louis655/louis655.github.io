import FadeIn from '../components/FadeIn'

// 自我介绍（突出产品能力 + 专业背景；无句号）
const INTRO_TEXT =
  '27届硕士，具备腾讯、得物、美团、携程互联网产品实习经历，聚焦 AI 应用、数据驱动产品与复杂业务系统建设；熟悉从用户洞察、需求抽象到产品设计、实验验证和平台落地的完整流程'

// 教育经历
const EDUCATION = [
  {
    school: '上海理工大学',
    tag: '硕士',
    major: '系统科学',
    period: '2024.09 — 2027.06',
    lines: [
      ['专业成绩', '3.9 / 4.0'],
      ['研究方向', '企业系统架构设计、企业业务需求流程设计'],
    ],
  },
  {
    school: '云南财经大学',
    tag: '本科',
    major: '物流工程',
    period: '2019.09 — 2023.06',
    lines: [
      ['专业成绩', '3.5 / 4.0（专业第一）'],
      [
        '所获荣誉',
        '省级"优秀学生干部"、全国数学建模竞赛国家三等奖、大学生创新创业大赛立项、一等奖学金（2 次）',
        'nowrap',
      ],
    ],
  },
]

// 能力证书
const CERTIFICATES = [
  '雅思 7.0',
  'CET-6',
  '第十一届全国大学生统计建模大赛一等奖',
]

export default function AboutSection() {
  return (
    <section
      id="about"
      className="relative z-10 min-h-screen flex items-center px-5 sm:px-8 md:px-12 lg:px-16 py-24 bg-[#F4F5F7] overflow-hidden rounded-t-[40px] sm:rounded-t-[50px] md:rounded-t-[60px]"
    >
      <div className="relative z-10 w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-[minmax(280px,380px)_1fr] gap-10 md:gap-14 lg:gap-20 items-center">
        {/* 左侧：证件照 */}
        <FadeIn delay={0.1} x={-40} duration={0.8} className="justify-self-center md:justify-self-start">
          <div className="relative">
            <div
              className="overflow-hidden rounded-[24px] bg-white"
              style={{ boxShadow: '0 20px 60px rgba(10,47,158,0.14), 0 4px 16px rgba(10,47,158,0.08)' }}
            >
              <img
                src="/images/profile.jpg"
                alt="蒋璐熠 证件照"
                className="w-[260px] sm:w-[300px] md:w-full h-auto object-cover"
              />
            </div>
          </div>
        </FadeIn>

        {/* 右侧：标题 + 自我介绍 + 教育经历 + 证书（列宽收缩到最宽的荣誉行） */}
        <div className="flex flex-col w-fit max-w-full">
          {/* 关于我（小号标题） */}
          <FadeIn delay={0.15} y={24}>
            <div style={{ transform: 'translateY(-10vh)' }}>
              <h2
                className="section-title-gradient font-black leading-none mb-5 sm:mb-6 max-md:!text-[3.5rem]"
                style={{
                  fontSize: 'clamp(5.625rem, 6.3vw, 6.1875rem)',
                  fontWeight: 900,
                  letterSpacing: '-0.02em',
                }}
              >
                关于我
              </h2>
            </div>
          </FadeIn>

          {/* 自我介绍（宽度对齐"所获荣誉"行、左对齐） */}
          <FadeIn delay={0.22} y={20} className="w-full">
            <p
              className="text-[#3A4256] font-medium leading-relaxed mb-9 sm:mb-11 w-full"
              style={{ fontSize: 'clamp(0.95rem, 1.4vw, 1.15rem)', textAlign: 'left' }}
            >
              {INTRO_TEXT}
            </p>
          </FadeIn>

          {/* 教育经历 */}
          <FadeIn delay={0.3} y={20}>
            <div className="flex flex-col gap-6 sm:gap-7">
              {EDUCATION.map((edu) => (
                <div key={edu.school} className="flex flex-col">
                  {/* 学校 + 学历 + 时间 */}
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-2">
                    <span className="text-[#0A2F9E] font-bold text-[1.05rem] sm:text-[1.15rem]">
                      {edu.school}
                    </span>
                    <span className="text-[#3A4256] font-semibold text-[0.9rem] sm:text-[0.95rem]">
                      {edu.major}
                      <span className="text-[#9AA3B5] mx-1.5">|</span>
                      {edu.tag}
                    </span>
                    <span className="ml-auto text-[#9AA3B5] font-medium tracking-wider text-[0.8rem] sm:text-[0.85rem] tabular-nums">
                      {edu.period}
                    </span>
                  </div>
                  {/* 详情行 */}
                  <div className="flex flex-col gap-1 pl-0.5">
                    {edu.lines.map(([label, value, nowrap]) => (
                      <p
                        key={label}
                        className={`text-[#5A6376] leading-relaxed text-[0.85rem] sm:text-[0.92rem] ${
                          // 窄屏允许折行，否则长行会撑破容器并被 section 的 overflow-hidden 裁掉
                          nowrap === 'nowrap' ? 'whitespace-normal md:whitespace-nowrap' : ''
                        }`}
                      >
                        <span className="text-[#8A93A6]">{label}：</span>
                        {value}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </FadeIn>

          {/* 能力证书 */}
          <FadeIn delay={0.4} y={20}>
            <div className="mt-9 sm:mt-11 pt-6 border-t border-[#0A2F9E]/10">
              <p className="text-[#8A93A6] text-[0.78rem] tracking-widest uppercase mb-3">
                能力证书
              </p>
              <div className="flex flex-wrap gap-2.5">
                {CERTIFICATES.map((cert) => (
                  <span
                    key={cert}
                    className="rounded-full bg-white border border-[#0A2F9E]/12 text-[#3A4256] text-[0.82rem] sm:text-[0.88rem] font-medium px-3.5 py-1.5"
                    style={{ boxShadow: '0 2px 8px rgba(10,47,158,0.05)' }}
                  >
                    {cert}
                  </span>
                ))}
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  )
}
