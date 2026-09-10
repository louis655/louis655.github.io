import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react'

interface TextTypeProps {
  /** 要循环打字的文案数组（或单条字符串） */
  text: string[] | string
  /** 每个字符的打字间隔（毫秒） */
  typingSpeed?: number
  /** 一句打完后停顿的时间（毫秒） */
  pauseDuration?: number
  /** 删除时每个字符的间隔（毫秒） */
  deletingSpeed?: number
  /** 是否显示光标 */
  showCursor?: boolean
  /** 光标字符 */
  cursorCharacter?: string
  /** 打完最后一句后是否停止（不循环） */
  loop?: boolean
  className?: string
  style?: CSSProperties
  /** 光标额外类名 */
  cursorClassName?: string
  /** 打字开始前的延迟（毫秒） */
  initialDelay?: number
  children?: ReactNode
}

export default function TextType({
  text,
  typingSpeed = 75,
  pauseDuration = 1500,
  deletingSpeed = 40,
  showCursor = true,
  cursorCharacter = '|',
  loop = true,
  className = '',
  style,
  cursorClassName = '',
  initialDelay = 0,
}: TextTypeProps) {
  const sentences = Array.isArray(text) ? text : [text]
  const [displayed, setDisplayed] = useState('')
  const [sentenceIndex, setSentenceIndex] = useState(0)
  const [phase, setPhase] = useState<'typing' | 'pausing' | 'deleting'>(
    'typing',
  )
  const [started, setStarted] = useState(initialDelay === 0)
  // 离屏暂停：滚出视口后不再跑打字计时器（离屏每 40-75ms 的 setState 是纯浪费）
  const [inView, setInView] = useState(true)
  const rootRef = useRef<HTMLSpanElement>(null)
  const timer = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    const el = rootRef.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  // 初始延迟
  useEffect(() => {
    if (started) return
    const t = setTimeout(() => setStarted(true), initialDelay)
    return () => clearTimeout(t)
  }, [initialDelay, started])

  useEffect(() => {
    if (!started || !inView) return
    const current = sentences[sentenceIndex] ?? ''
    const isLast = sentenceIndex === sentences.length - 1

    if (phase === 'typing') {
      if (displayed.length < current.length) {
        timer.current = setTimeout(() => {
          setDisplayed(current.slice(0, displayed.length + 1))
        }, typingSpeed)
      } else {
        // 打完一句
        if (isLast && !loop) return // 停在最后一句
        timer.current = setTimeout(() => setPhase('pausing'), pauseDuration)
      }
    } else if (phase === 'pausing') {
      timer.current = setTimeout(() => setPhase('deleting'), 0)
    } else if (phase === 'deleting') {
      if (displayed.length > 0) {
        timer.current = setTimeout(() => {
          setDisplayed(current.slice(0, displayed.length - 1))
        }, deletingSpeed)
      } else {
        setSentenceIndex((prev) => (prev + 1) % sentences.length)
        setPhase('typing')
      }
    }

    return () => clearTimeout(timer.current)
  }, [
    started,
    inView,
    displayed,
    phase,
    sentenceIndex,
    sentences,
    typingSpeed,
    deletingSpeed,
    pauseDuration,
    loop,
  ])

  return (
    <span ref={rootRef} className={className} style={style}>
      {displayed.split('\n').map((line, i, arr) => (
        <span key={i}>
          {line}
          {i < arr.length - 1 && <br />}
        </span>
      ))}
      {showCursor && (
        <span
          className={`type-cursor ${cursorClassName}`}
          aria-hidden
          style={{ marginLeft: '0.05em' }}
        >
          {cursorCharacter}
        </span>
      )}
    </span>
  )
}
