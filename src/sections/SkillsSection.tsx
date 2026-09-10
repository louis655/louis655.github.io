import FadeIn from '../components/FadeIn'
import Model3DViewer from '../components/Model3DViewer'

// ── 工具图标统一从网络获取官方 logo，白色圆角方块承托，尺寸一致、美观整齐 ──

type Tool = { name: string; iconUrl: string }

const SKILL_GROUPS: { label: string; tools: Tool[] }[] = [
  {
    label: 'VIBE CODING',
    tools: [
      { name: 'Codex', iconUrl: '/icons/chatgpt.svg' },
      { name: 'Claude Code', iconUrl: '/icons/claude.svg' },
      { name: 'Workbuddy', iconUrl: '/icons/codebuddy.svg' },
    ],
  },
  {
    label: '设计',
    tools: [
      { name: 'Figma', iconUrl: '/icons/figma.svg' },
      { name: 'Axure', iconUrl: '/icons/axure.ico' },
      { name: '墨刀', iconUrl: '/icons/modao.ico' },
    ],
  },
  {
    label: '数据',
    tools: [
      { name: 'MySQL', iconUrl: '/icons/mysql.svg' },
      { name: 'Python', iconUrl: '/icons/python.svg' },
      { name: 'Tableau', iconUrl: '/icons/tableau.ico' },
    ],
  },
]

export default function SkillsSection() {
  return (
    <section
      id="skills"
      className="relative z-10 bg-white rounded-t-[40px] sm:rounded-t-[50px] md:rounded-t-[60px] px-5 sm:px-8 md:px-12 lg:px-16 py-8 sm:py-10 md:py-11"
    >
      <FadeIn delay={0} y={40}>
        {/* 标题与模型左右并排，模型位于“专业技能”右侧 */}
        <div className="relative flex items-center justify-center gap-2 sm:gap-3 md:gap-4 mb-6 sm:mb-7 md:mb-8">
          <h2
            className="section-title-gradient font-black leading-none text-center"
            style={{
              fontSize: 'clamp(5.625rem, 6.3vw, 6.1875rem)',
              fontWeight: 900,
              letterSpacing: '-0.02em',
            }}
          >
            专业技能
          </h2>
          {/* 专业技能 glb 再放大到 2 倍：scale 0.77 → 1.54，容器同步 2 倍 */}
          <div className="w-[200px] sm:w-[260px] md:w-[320px] h-[200px] sm:h-[260px] md:h-[320px]">
            <Model3DViewer
              modelPath="/models/qingzhu.glb"
              baseY={0}
              frameMargin={1.05}
              scale={1.54}
              dpr={[1, 2]}
            />
          </div>
        </div>
      </FadeIn>

      <div className="w-[94.5455%] mx-auto max-w-6xl">
        {SKILL_GROUPS.map((group, gi) => (
          <FadeIn key={group.label} delay={0.1 + gi * 0.12} y={30}>
            <div
              className={`grid grid-cols-1 md:grid-cols-[150px_1fr] gap-6 md:gap-10 py-8 md:py-10 items-center ${
                gi < SKILL_GROUPS.length - 1 ? 'border-b border-gray-200' : ''
              }`}
            >
              {/* 左侧：渐变竖条 + 类别名 */}
              <div className="flex items-center gap-3 md:pl-1">
                <span className="block w-1.5 h-6 sm:h-7 rounded-full skill-bar-gradient" />
                <span className="skill-label-gradient font-black text-lg sm:text-xl md:text-[1.35rem] tracking-wider uppercase">
                  {group.label}
                </span>
              </div>

              {/* 右侧：工具卡片网格（每组 3 个，3 列整齐排布） */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                {group.tools.map((tool) => (
                  <div
                    key={tool.name}
                    className="flex items-center gap-3 bg-[#F4F5F7] rounded-2xl px-3 sm:px-4 py-3 sm:py-4 hover:shadow-md transition-shadow duration-200"
                  >
                    {/* 统一 40×40 白色圆角方块 + 22×22 object-contain 图标，大小一致 */}
                    <span className="flex items-center justify-center w-10 h-10 shrink-0 rounded-[10px] bg-white shadow-sm">
                      <img
                        src={tool.iconUrl}
                        alt={`${tool.name} logo`}
                        loading="lazy"
                        draggable={false}
                        className="w-[22px] h-[22px] object-contain"
                      />
                    </span>
                    <span className="text-[#3A4256] font-medium text-[0.9rem] sm:text-[0.95rem]">
                      {tool.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
        ))}
      </div>

    </section>
  )
}
