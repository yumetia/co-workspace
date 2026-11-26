import {
  ActionManager,
  ArcRotateCamera,
  Color3,
  Color4,
  DirectionalLight,
  Engine,
  ExecuteCodeAction,
  GlowLayer,
  HemisphericLight,
  Mesh,
  MeshBuilder,
  Scene,
  ShadowGenerator,
  StandardMaterial,
  Vector3,
} from '@babylonjs/core'
import { useEffect, useRef, useState } from 'react'

type SpaceStatus = 'libre' | 'occupe' | 'reserve'

type Room = {
  nom: string
  places: number
  x: number
  z: number
  w: number
  d: number
  statut: SpaceStatus
  equip: string
}

type SelectedSpace = {
  titre: string
  statut: SpaceStatus
  details: string
}

const STATUS_CONFIG: Record<SpaceStatus, { label: string; hex: string; color: Color3 }> = {
  libre: { label: 'Libre', hex: '#248a5a', color: new Color3(0.25, 0.68, 0.46) },
  occupe: { label: 'Occupé', hex: '#c4453d', color: new Color3(0.78, 0.3, 0.27) },
  reserve: { label: 'Bientôt', hex: '#b7791f', color: new Color3(0.78, 0.54, 0.22) },
}

const ROOMS: Room[] = [
  {
    nom: 'Salle A',
    places: 10,
    x: -9.5,
    z: 8.2,
    w: 7.5,
    d: 8.5,
    statut: 'libre',
    equip: 'Vidéoprojecteur, Écran 75", Whiteboard',
  },
  {
    nom: 'Salle B',
    places: 6,
    x: -2.2,
    z: 8.2,
    w: 6.5,
    d: 8.5,
    statut: 'occupe',
    equip: 'Écran TV 65", Visio HD',
  },
  {
    nom: 'Salle C',
    places: 6,
    x: 4.8,
    z: 8.2,
    w: 6.5,
    d: 8.5,
    statut: 'reserve',
    equip: 'Whiteboard, Écran 55"',
  },
  {
    nom: 'Salle D',
    places: 4,
    x: 13.5,
    z: 6.8,
    w: 6.5,
    d: 6.5,
    statut: 'libre',
    equip: 'Whiteboard, Visio',
  },
]

export function SpacePlan() {
  const [isMobile, setIsMobile] = useState<boolean | null>(null)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 767px)')
    const updateViewport = () => setIsMobile(mediaQuery.matches)

    updateViewport()
    mediaQuery.addEventListener('change', updateViewport)
    return () => mediaQuery.removeEventListener('change', updateViewport)
  }, [])

  if (isMobile === null) {
    return <div className="min-h-48" aria-busy="true" />
  }

  return isMobile ? <MobileRoomList /> : <DesktopSpacePlan />
}

function MobileRoomList() {
  return (
    <section className="space-y-7">
      <header className="space-y-2">
        <p className="text-xs font-semibold tracking-[0.16em] text-slate-400 uppercase">
          CoWork'Space · Espaces
        </p>
        <h1 className="text-3xl font-semibold tracking-[-0.04em] text-slate-950">
          Salles de réunion.
        </h1>
        <p className="text-base leading-relaxed text-slate-500">
          Consultez les capacités, équipements et disponibilités des salles.
        </p>
      </header>

      <ul className="divide-y divide-slate-100 overflow-hidden rounded-3xl border border-slate-200/80 bg-white">
        {ROOMS.map((room) => (
          <li key={room.nom} className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-semibold tracking-tight text-slate-950">{room.nom}</h2>
                <p className="mt-1 text-sm text-slate-500">{room.places} places</p>
              </div>
              <span
                className={`inline-flex shrink-0 items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${
                  room.statut === 'libre'
                    ? 'bg-emerald-50 text-emerald-700'
                    : room.statut === 'occupe'
                      ? 'bg-rose-50 text-rose-700'
                      : 'bg-amber-50 text-amber-700'
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`h-1.5 w-1.5 rounded-full ${
                    room.statut === 'libre'
                      ? 'bg-emerald-500'
                      : room.statut === 'occupe'
                        ? 'bg-rose-500'
                        : 'bg-amber-500'
                  }`}
                />
                {STATUS_CONFIG[room.statut].label}
              </span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-slate-500">
              <span className="font-medium text-slate-700">Équipements : </span>
              {room.equip}
            </p>
          </li>
        ))}
      </ul>
    </section>
  )
}

function DesktopSpacePlan() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [selectedSpace, setSelectedSpace] = useState<SelectedSpace | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const engine = new Engine(canvas, true)
    const scene = new Scene(engine)
    scene.clearColor = new Color4(0.96, 0.96, 0.97, 1)

    const camera = new ArcRotateCamera(
      'Camera',
      -Math.PI / 4,
      Math.PI / 3.1,
      44,
      new Vector3(0, 0, 0),
      scene,
    )
    camera.attachControl(canvas, true)
    camera.lowerRadiusLimit = 18
    camera.upperRadiusLimit = 65
    camera.upperBetaLimit = Math.PI / 2.25

    const hemiLight = new HemisphericLight('hemi', new Vector3(0, 1, 0), scene)
    hemiLight.intensity = 0.85
    hemiLight.groundColor = new Color3(0.75, 0.72, 0.68)

    const dirLight = new DirectionalLight('dir', new Vector3(-1, -2.2, -1.2), scene)
    dirLight.position = new Vector3(25, 45, 25)
    dirLight.intensity = 0.6

    const shadowGen = new ShadowGenerator(2048, dirLight)
    shadowGen.useBlurExponentialShadowMap = true
    shadowGen.blurKernel = 16

    const glow = new GlowLayer('glow', scene)
    glow.intensity = 0.38

    const matFloor = new StandardMaterial('matFloor', scene)
    matFloor.diffuseColor = new Color3(0.9, 0.86, 0.78)
    matFloor.specularColor = new Color3(0.08, 0.08, 0.08)

    const matWoodDesk = new StandardMaterial('matWoodDesk', scene)
    matWoodDesk.diffuseColor = new Color3(0.82, 0.7, 0.56)

    const matWall = new StandardMaterial('matWall', scene)
    matWall.diffuseColor = new Color3(0.97, 0.97, 0.97)
    matWall.specularColor = new Color3(0.05, 0.05, 0.05)

    const matFrame = new StandardMaterial('matFrame', scene)
    matFrame.diffuseColor = new Color3(0.28, 0.3, 0.32)

    const matChair = new StandardMaterial('matChair', scene)
    matChair.diffuseColor = new Color3(0.32, 0.34, 0.36)

    const matPlant = new StandardMaterial('matPlant', scene)
    matPlant.diffuseColor = new Color3(0.34, 0.56, 0.36)

    function getGlowMaterial(status: SpaceStatus) {
      const material = new StandardMaterial(`glow_${status}`, scene)
      material.diffuseColor = STATUS_CONFIG[status].color
      material.emissiveColor = STATUS_CONFIG[status].color.scale(0.75)
      material.alpha = 0.78
      return material
    }

    function getGlassRoomMaterial(status: SpaceStatus) {
      const material = new StandardMaterial(`glass_${status}`, scene)
      material.diffuseColor = STATUS_CONFIG[status].color
      material.emissiveColor = STATUS_CONFIG[status].color.scale(0.22)
      material.alpha = 0.22
      return material
    }

    const floor = MeshBuilder.CreateBox('floor', { width: 38, height: 0.4, depth: 26 }, scene)
    floor.position.y = -0.2
    floor.material = matFloor
    floor.receiveShadows = true

    function createWall(
      x: number,
      z: number,
      width: number,
      depth: number,
      height = 2.4,
      material = matWall,
    ) {
      const wall = MeshBuilder.CreateBox('wall', { width, height, depth }, scene)
      wall.position = new Vector3(x, height / 2, z)
      wall.material = material
      wall.receiveShadows = true
      shadowGen.addShadowCaster(wall)
      return wall
    }

    createWall(0, 13, 38.4, 0.45)
    createWall(0, -13, 38.4, 0.45)
    createWall(-19, 0, 0.45, 26)
    createWall(19, 0, 0.45, 26)
    createWall(-1.5, 2.2, 23, 0.35, 2.1)

    const reception = MeshBuilder.CreateBox(
      'reception',
      { width: 1.2, height: 1.05, depth: 3.2 },
      scene,
    )
    reception.position = new Vector3(-16.2, 0.525, 7.5)
    reception.material = matWall
    shadowGen.addShadowCaster(reception)

    const sofa = MeshBuilder.CreateBox('sofa', { width: 2.2, height: 0.65, depth: 1 }, scene)
    sofa.position = new Vector3(-15.5, 0.325, 3.5)
    sofa.material = matWoodDesk

    function createChair(x: number, z: number) {
      const seat = MeshBuilder.CreateCylinder('chair', { diameter: 0.52, height: 0.45 }, scene)
      seat.position = new Vector3(x, 0.225, z)
      seat.material = matChair
      shadowGen.addShadowCaster(seat)
    }

    function createPlant(x: number, z: number) {
      const pot = MeshBuilder.CreateCylinder('pot', { diameter: 0.45, height: 0.4 }, scene)
      pot.position = new Vector3(x, 0.2, z)
      pot.material = matWall

      const foliage = MeshBuilder.CreateSphere('foliage', { diameter: 0.7 }, scene)
      foliage.position = new Vector3(x, 0.55, z)
      foliage.material = matPlant
      shadowGen.addShadowCaster(foliage)
    }

    function registerClick(mesh: Mesh, data: SelectedSpace) {
      mesh.actionManager = new ActionManager(scene)
      mesh.actionManager.registerAction(
        new ExecuteCodeAction(ActionManager.OnPickTrigger, () => setSelectedSpace(data)),
      )
    }

    ROOMS.forEach((room) => {
      const glassMat = getGlassRoomMaterial(room.statut)
      const glowMat = getGlowMaterial(room.statut)

      createWall(room.x, room.z - room.d / 2, room.w, 0.08, 2.3, glassMat)
      createWall(room.x - room.w / 2, room.z, 0.08, room.d, 2.3, glassMat)
      createWall(room.x + room.w / 2, room.z, 0.08, room.d, 2.3, glassMat)

      createWall(room.x, room.z - room.d / 2, room.w, 0.12, 0.08, matFrame).position.y = 2.3
      createWall(room.x - room.w / 2, room.z, 0.12, room.d, 0.08, matFrame).position.y = 2.3
      createWall(room.x + room.w / 2, room.z, 0.12, room.d, 0.08, matFrame).position.y = 2.3

      const border = MeshBuilder.CreateBox(
        'led',
        { width: room.w - 0.4, height: 0.06, depth: 0.12 },
        scene,
      )
      border.position = new Vector3(room.x, 0.03, room.z - room.d / 2 + 0.25)
      border.material = glowMat

      const table = MeshBuilder.CreateBox(
        room.nom,
        { width: room.w * 0.42, height: 0.75, depth: room.d * 0.52 },
        scene,
      )
      table.position = new Vector3(room.x, 0.375, room.z)
      table.material = matWall
      shadowGen.addShadowCaster(table)

      const chairsPerSide = Math.floor(room.places / 2)
      for (let index = 0; index < chairsPerSide; index++) {
        const offsetZ = -((chairsPerSide - 1) * 0.85) / 2 + index * 0.85
        createChair(room.x - room.w * 0.26, room.z + offsetZ)
        createChair(room.x + room.w * 0.26, room.z + offsetZ)
      }

      createPlant(room.x + room.w / 2 - 0.55, room.z + room.d / 2 - 0.55)
      registerClick(table, {
        titre: `${room.nom} (${room.places} places)`,
        statut: room.statut,
        details: `Équipements : ${room.equip}`,
      })
    })

    const islands = [
      { x: -10.5, z: -2.2 },
      { x: 0.5, z: -2.2 },
      { x: 11.5, z: -2.2 },
      { x: -5, z: -8.2 },
      { x: 6.5, z: -8.2 },
    ]
    const pattern: SpaceStatus[] = [
      'libre',
      'libre',
      'occupe',
      'libre',
      'reserve',
      'libre',
      'occupe',
      'libre',
      'libre',
      'reserve',
    ]
    let deskIndex = 1

    islands.forEach((island, islandIndex) => {
      const deskGroup = MeshBuilder.CreateBox(
        `island_${islandIndex}`,
        { width: 8.6, height: 0.1, depth: 2.2 },
        scene,
      )
      deskGroup.position = new Vector3(island.x, 0.72, island.z)
      deskGroup.material = matWoodDesk
      shadowGen.addShadowCaster(deskGroup)

      for (const legOffset of [-3.9, 3.9]) {
        const leg = MeshBuilder.CreateBox('leg', { width: 0.15, height: 0.72, depth: 2 }, scene)
        leg.position = new Vector3(island.x + legOffset, 0.36, island.z)
        leg.material = matFrame
      }

      for (let row = 0; row < 2; row++) {
        for (let col = 0; col < 5; col++) {
          const x = island.x - 3.3 + col * 1.65
          const z = island.z + (row === 0 ? 0.55 : -0.55)
          const status = pattern[(deskIndex + islandIndex) % pattern.length]
          const glowMat = getGlowMaterial(status)

          const divider = MeshBuilder.CreateBox(
            `Poste_${deskIndex}`,
            { width: 1.5, height: 0.36, depth: 0.08 },
            scene,
          )
          divider.position = new Vector3(x, 0.94, island.z + (row === 0 ? 0.06 : -0.06))
          divider.material = glowMat

          const screen = MeshBuilder.CreateBox(
            'screen',
            { width: 0.55, height: 0.34, depth: 0.04 },
            scene,
          )
          screen.position = new Vector3(x, 0.95, z + (row === 0 ? -0.22 : 0.22))
          screen.material = matFrame

          createChair(x, z + (row === 0 ? 0.65 : -0.65))
          registerClick(divider, {
            titre: `Poste Open Space #${deskIndex}`,
            statut: status,
            details: 'Écran 24", Prise RJ45, Alimentation USB-C',
          })

          deskIndex++
        }
      }
    })

    engine.runRenderLoop(() => scene.render())
    const handleResize = () => engine.resize()
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      engine.stopRenderLoop()
      scene.dispose()
      engine.dispose()
    }
  }, [])

  return (
    <section className="space-y-7">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl space-y-2">
          <p className="text-xs font-semibold tracking-[0.16em] text-slate-400 uppercase">
            CoWork'Space · Espaces
          </p>
          <h1 className="text-3xl font-semibold tracking-[-0.04em] text-slate-950 md:text-4xl">
            Un lieu pour mieux travailler.
          </h1>
          <p className="text-base leading-relaxed text-slate-500">
            Explorez le plan et sélectionnez un espace pour en découvrir les détails.
          </p>
        </div>

        <div className="flex flex-wrap gap-x-5 gap-y-2 pb-1 text-sm text-slate-500">
          {Object.entries(STATUS_CONFIG).map(([status, config]) => (
            <span key={status} className="inline-flex items-center gap-2">
              <span
                aria-hidden="true"
                className={`h-2 w-2 rounded-full ${
                  status === 'libre'
                    ? 'bg-emerald-500'
                    : status === 'occupe'
                      ? 'bg-rose-500'
                      : 'bg-amber-500'
                }`}
              />
              {config.label}
            </span>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 md:px-7">
          <p className="text-sm font-medium text-slate-700">Maquette interactive</p>
          <p className="text-xs text-slate-400">50 postes · 4 salles</p>
        </div>
        <div className="relative h-[70vh] max-h-[720px] min-h-[420px] w-full bg-[#f5f5f7]">
          <canvas
            ref={canvasRef}
            aria-label="Maquette 3D des postes et salles de CoWork'Space"
            className="focus-visible:outline-brand-600 absolute inset-0 h-full w-full touch-none outline-none focus-visible:outline-2 focus-visible:outline-offset-[-4px]"
            tabIndex={0}
          />

          {selectedSpace && (
            <aside className="absolute right-5 bottom-5 left-5 z-10 max-w-sm rounded-2xl border border-white/80 bg-white/90 p-5 shadow-[0_12px_36px_rgba(15,23,42,0.12)] backdrop-blur-xl">
              <button
                type="button"
                aria-label="Fermer les informations"
                className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full text-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                onClick={() => setSelectedSpace(null)}
              >
                ×
              </button>
              <h2 className="mb-2 pr-8 text-base font-semibold tracking-tight text-slate-950">
                {selectedSpace.titre}
              </h2>
              <span
                className={`inline-flex items-center gap-2 text-xs font-medium ${
                  selectedSpace.statut === 'libre'
                    ? 'text-emerald-700'
                    : selectedSpace.statut === 'occupe'
                      ? 'text-rose-700'
                      : 'text-amber-700'
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`h-2 w-2 rounded-full ${
                    selectedSpace.statut === 'libre'
                      ? 'bg-emerald-500'
                      : selectedSpace.statut === 'occupe'
                        ? 'bg-rose-500'
                        : 'bg-amber-500'
                  }`}
                />
                {STATUS_CONFIG[selectedSpace.statut].label}
              </span>
              <p className="mt-3 text-sm leading-relaxed text-slate-500">{selectedSpace.details}</p>
            </aside>
          )}
        </div>
      </div>
    </section>
  )
}
