import { useRef, useState, useLayoutEffect, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useGLTF, useAnimations } from '@react-three/drei'
import * as THREE from 'three'

/**
 * 3D 模型查看器 — 叠加在粒子效果之上
 * - 自动居中模型（包围盒归零），旋转中心落在人物中心
 * - 正前方水平视角（x=0, y=0 看向原点）→ 正面平视，不俯视
 * - 播放 GLB 原生的旋转动画（Tripo 内置 ~3s 左右摆头，未删减）
 * - 叠加细微上下浮动（增强呼吸感）
 * - 整体可上移（BASE_Y）使头部对齐"你好"一行
 * - 禁止拖拽/缩放/平移
 * - 哑光材质、暖色布光、无反光
 */
export default function Model3DViewer({
  modelPath = '/models/initial.glb',
  className = '',
  baseY = 0.18,
  frameMargin = 1.15,
  dpr = [1, 1.5],
  lightBoost = 1,
  scale = 0.55,
}: {
  modelPath?: string
  className?: string
  /** 整体上移量（世界单位）。Hero 默认 0.18；标题旁小模型传 0 保持垂直居中 */
  baseY?: number
  /** 取景边距：越大模型在框内越小。Hero 默认 1.15；想模型更饱满可传 <1 */
  frameMargin?: number
  /** 渲染分辨率倍数。Hero 默认 [1,1.5]；大模型可传 [1,2] 让边缘更锐利 */
  dpr?: [number, number]
  /** 光照亮度倍率，默认 1 不动；偏暗的模型可传 1.5~2 整体提亮 */
  lightBoost?: number
  /** 模型整体缩放倍率，默认 0.55；专业技能区传 0.77 实现 140% */
  scale?: number
}) {
  // 视口暂停：模型滚出屏幕时停止 WebGL 渲染，避免持续吃 GPU 导致滚动卡顿
  const wrapRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(true)
  // 按需加载：只有滚动到附近（提前 300px）才挂载 Canvas 下载模型，
  // 否则 5 个模型会在首屏并发拉取约 27M，手机端直接卡在白屏
  const [shouldLoad, setShouldLoad] = useState(false)

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        setVisible(entry.isIntersecting)
        if (entry.isIntersecting) setShouldLoad(true) // 首次进入后保持，不回滚
      },
      { threshold: 0.01, rootMargin: '300px' }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div ref={wrapRef} className={className} style={{ position: 'relative', width: '100%', height: '100%' }}>
      {shouldLoad && (
        <Canvas
          // 初始相机：正前方、水平、看向原点（后续由 Model 自动框定距离）
          camera={{ position: [0, 0, 3], fov: 45 }}
          gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
          style={{ background: 'transparent', pointerEvents: 'none' } as React.CSSProperties}
          dpr={dpr}
          frameloop={visible ? 'always' : 'never'}
        >
          {/* 哑光布光（lightBoost 仅放大强度，色温/方向不变） */}
          <ambientLight intensity={0.85 * lightBoost} color="#ffffff" />
          <directionalLight position={[1, 2, 1.5]} intensity={1.1 * lightBoost} color="#ffffff" />
          <directionalLight position={[-1.5, 1, -1]} intensity={0.4 * lightBoost} color="#ffe6d5" />
          <directionalLight position={[0, -1, -2]} intensity={0.25 * lightBoost} color="#ffcda0" />

          {/* 居中 + 缩小 + 原生旋转动画 + 浮动 */}
          <Model url={modelPath} scale={scale} baseY={baseY} frameMargin={frameMargin} />
        </Canvas>
      )}
    </div>
  )
}

/**
 * 模型加载 + 居中 + 缩小 + 播放原生动画
 *
 * 动画来源：GLB 内置的 Tripo 旋转剪辑（rotation 通道，~3s，左右摆头 ≈ ±45°）。
 * 用 useAnimations 播放模型自带剪辑，不再手写覆盖 rotation，保证与源文件一致。
 * 另叠加一个很轻微的整体上下浮动（呼吸感）。
 */
function Model({ url, scale = 0.55, baseY = 0.18, frameMargin = 1.15 }: { url: string; scale?: number; baseY?: number; frameMargin?: number }) {
  const groupRef = useRef<THREE.Group>(null)
  const { scene, animations } = useGLTF(url)
  const camera = useThree((s) => s.camera)

  // 播放 GLB 原生动画（作用于 scene 内部节点）
  const { actions, names } = useAnimations(animations, scene)

  // 模型中心偏移（包围盒归零），默认原点
  const [center, setCenter] = useState<THREE.Vector3>(new THREE.Vector3())

  // 启动内置动画：循环播放全部剪辑（通常仅 1 个 Tripo 旋转剪辑）
  useEffect(() => {
    names.forEach((name) => {
      const action = actions[name]
      if (!action) return
      action.reset()
      action.setLoop(THREE.LoopRepeat, Infinity)
      action.clampWhenFinished = false
      action.play()
    })
    return () => {
      names.forEach((name) => actions[name]?.stop())
    }
  }, [actions, names])

  // 居中 + 水平正前方自动框定相机距离
  useLayoutEffect(() => {
    const box = new THREE.Box3().setFromObject(scene)
    const c = box.getCenter(new THREE.Vector3())
    const size = box.getSize(new THREE.Vector3())
    setCenter(c)

    // 缩放后的包围球半径 → 反推相机距离，保证整体入镜且水平
    const radius = (size.length() / 2) * scale
    const fov = (camera as THREE.PerspectiveCamera).fov * (Math.PI / 180)
    const dist = (radius / Math.sin(fov / 2)) * frameMargin
    // 正前方、水平、看向原点 → 正面平视，模型居中（位置上下偏移交给 BASE_Y 控制）
    camera.position.set(0, 0, dist)
    camera.lookAt(0, 0, 0)
    camera.updateProjectionMatrix()
  }, [scene, scale, camera])

  // 设置哑光材质
  scene.traverse((child: any) => {
    if (child.isMesh && child.material) {
      child.material.envMapIntensity = 0.3
      child.castShadow = true
      child.receiveShadow = true
    }
  })

  // ── 叠加动画：细微上下浮动（原生旋转由 useAnimations 驱动，此处不动 rotation）──
  const FLOAT_PERIOD = 4    // 秒
  const FLOAT_AMP = 0.05    // 振幅（世界单位，很轻微）

  useFrame(({ clock }) => {
    if (!groupRef.current) return
    const t = clock.getElapsedTime()
    // 仅叠加上下浮动；左右旋转完全交给 GLB 原生动画。baseY 控制整体垂直位置。
    groupRef.current.position.y =
      baseY + Math.sin(t * ((Math.PI * 2) / FLOAT_PERIOD)) * FLOAT_AMP
  })

  return (
    // 外层 group：缩小 + 整体上移浮动（原生旋转在内部节点上）
    <group ref={groupRef} scale={scale}>
      {/* 内层 group：把模型中心平移到原点，使原生旋转中心落在人物中心 */}
      <group position={[-center.x, -center.y, -center.z]}>
        <primitive object={scene} />
      </group>
    </group>
  )
}

// 预缓存（首屏 Hero 现展示 intern.glb，优先预加载）
useGLTF.preload('/models/intern.glb')
