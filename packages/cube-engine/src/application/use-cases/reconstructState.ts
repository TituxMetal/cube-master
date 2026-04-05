import type {
  ColorCode,
  CornerOrientation,
  CornerPositionId,
  CubeState,
  EdgeOrientation,
  EdgePositionId,
  FaceCode,
  StickerIndex
} from '~/domain'
import { Color, CornerPosition, EdgePosition } from '~/domain/constants'
import { cornerColorIndex, stickerMapping } from '~/domain/geometry'
import { makeCornerPiece, makeEdgePiece } from '~/domain/pieces'
import type { StickersByFace } from '~/infrastructure/render/toStickers'

export type ReconstructResult = { ok: true; state: CubeState } | { ok: false; errors: string[] }

// --- Color name mapping for error messages ---

const colorName: Record<ColorCode, string> = {
  Wt: 'white',
  Yl: 'yellow',
  Rd: 'red',
  Og: 'orange',
  Bl: 'blue',
  Gn: 'green'
}

// --- Piece definitions (matching createSolvedState) ---

const CORNER_DEFS: readonly {
  id: CornerPositionId
  colors: [ColorCode, ColorCode, ColorCode]
}[] = [
  { id: 'UFR', colors: [Color.White, Color.Green, Color.Red] },
  { id: 'URB', colors: [Color.White, Color.Red, Color.Blue] },
  { id: 'UBL', colors: [Color.White, Color.Blue, Color.Orange] },
  { id: 'ULF', colors: [Color.White, Color.Orange, Color.Green] },
  { id: 'DFR', colors: [Color.Yellow, Color.Green, Color.Red] },
  { id: 'DRB', colors: [Color.Yellow, Color.Red, Color.Blue] },
  { id: 'DBL', colors: [Color.Yellow, Color.Blue, Color.Orange] },
  { id: 'DLF', colors: [Color.Yellow, Color.Orange, Color.Green] }
]

const EDGE_DEFS: readonly {
  id: EdgePositionId
  colors: [ColorCode, ColorCode]
}[] = [
  { id: 'UF', colors: [Color.White, Color.Green] },
  { id: 'UR', colors: [Color.White, Color.Red] },
  { id: 'UB', colors: [Color.White, Color.Blue] },
  { id: 'UL', colors: [Color.White, Color.Orange] },
  { id: 'DF', colors: [Color.Yellow, Color.Green] },
  { id: 'DR', colors: [Color.Yellow, Color.Red] },
  { id: 'DB', colors: [Color.Yellow, Color.Blue] },
  { id: 'DL', colors: [Color.Yellow, Color.Orange] },
  { id: 'FR', colors: [Color.Green, Color.Red] },
  { id: 'FL', colors: [Color.Green, Color.Orange] },
  { id: 'BR', colors: [Color.Blue, Color.Red] },
  { id: 'BL', colors: [Color.Blue, Color.Orange] }
]

// --- Sticker position lookup tables ---

type StickerPos = { face: FaceCode; index: StickerIndex }

const buildStickerPositionMaps = () => {
  const cornerMap: Record<string, StickerPos[]> = {}
  const edgeMap: Record<string, StickerPos[]> = {}
  const faces: FaceCode[] = ['U', 'D', 'F', 'B', 'L', 'R']
  const indices: StickerIndex[] = [0, 1, 2, 3, 4, 5, 6, 7, 8]

  for (const face of faces) {
    for (const idx of indices) {
      const info = stickerMapping[face][idx]
      if (info.type === 'corner') {
        if (!cornerMap[info.cornerId]) cornerMap[info.cornerId] = []
        cornerMap[info.cornerId].push({ face, index: idx })
      } else if (info.type === 'edge') {
        if (!edgeMap[info.edgeId]) edgeMap[info.edgeId] = []
        edgeMap[info.edgeId].push({ face, index: idx })
      }
    }
  }

  for (const [posId, positions] of Object.entries(cornerMap)) {
    positions.sort((a, b) => posId.indexOf(a.face) - posId.indexOf(b.face))
  }
  for (const [posId, positions] of Object.entries(edgeMap)) {
    positions.sort((a, b) => posId.indexOf(a.face) - posId.indexOf(b.face))
  }

  return {
    corners: cornerMap as Record<CornerPositionId, [StickerPos, StickerPos, StickerPos]>,
    edges: edgeMap as Record<EdgePositionId, [StickerPos, StickerPos]>
  }
}

const STICKER_POSITIONS = buildStickerPositionMaps()

// --- Piece lookup by sorted color key ---

const sortedColorKey = (colors: readonly ColorCode[]): string => [...colors].sort().join(',')

const CORNER_BY_COLORS = new Map(CORNER_DEFS.map(def => [sortedColorKey(def.colors), def]))

const EDGE_BY_COLORS = new Map(EDGE_DEFS.map(def => [sortedColorKey(def.colors), def]))

// --- Permutation parity ---

const computeParity = <T extends string>(
  positions: readonly T[],
  pieces: Record<string, { id: T }>
): number => {
  const visited = new Set<T>()
  let cycles = 0

  for (const pos of positions) {
    if (visited.has(pos)) continue
    cycles++
    let current = pos
    while (!visited.has(current)) {
      visited.add(current)
      current = pieces[current].id
    }
  }

  return (positions.length - cycles) % 2
}

// --- Main reconstruction ---

export const reconstructState = (stickers: StickersByFace): ReconstructResult => {
  const errors: string[] = []
  const faces = ['U', 'D', 'F', 'B', 'L', 'R'] as const

  // 0. Validate input shape (all 6 faces present with 9 stickers each)
  for (const face of faces) {
    if (!Array.isArray(stickers[face]) || stickers[face].length !== 9) {
      return { ok: false, errors: [`Missing or invalid sticker array for face ${face}`] }
    }
  }

  // 1. Validate color counts (exactly 9 of each)
  const allStickers = faces.flatMap(f => stickers[f])
  const colorCounts = new Map<ColorCode, number>()
  for (const color of allStickers) {
    colorCounts.set(color, (colorCounts.get(color) ?? 0) + 1)
  }

  for (const code of Object.values(Color) as ColorCode[]) {
    const count = colorCounts.get(code) ?? 0
    if (count !== 9) {
      errors.push(`Expected 9 ${colorName[code]} stickers, found ${count}`)
    }
  }
  if (errors.length > 0) return { ok: false, errors }

  // 2. Validate centers (each color exactly once)
  const centers = {} as Record<FaceCode, ColorCode>
  const centerColors = new Set<ColorCode>()
  for (const face of faces) {
    centers[face] = stickers[face][4]
    centerColors.add(stickers[face][4])
  }
  if (centerColors.size !== 6) {
    errors.push('Centers must have 6 different colors')
    return { ok: false, errors }
  }

  // 3-5. Identify corner/edge pieces, check for duplicates, determine orientations
  const cornerPositions = Object.keys(CornerPosition) as CornerPositionId[]
  const reconstructedCorners = {} as Record<CornerPositionId, ReturnType<typeof makeCornerPiece>>
  const cornerFirstPos = new Map<CornerPositionId, CornerPositionId>()

  for (const pos of cornerPositions) {
    const [sp0, sp1, sp2] = STICKER_POSITIONS.corners[pos]
    const observed: [ColorCode, ColorCode, ColorCode] = [
      stickers[sp0.face][sp0.index],
      stickers[sp1.face][sp1.index],
      stickers[sp2.face][sp2.index]
    ]

    const pieceDef = CORNER_BY_COLORS.get(sortedColorKey(observed))
    if (!pieceDef) {
      const names = observed.map(c => colorName[c]).join('-')
      errors.push(`Invalid corner at ${pos}: ${names} is not a valid corner`)
      continue
    }

    const prevPos = cornerFirstPos.get(pieceDef.id)
    if (prevPos) {
      const names = observed.map(c => colorName[c]).join('-')
      errors.push(`Duplicate corner: ${names} appears at ${prevPos} and ${pos}`)
      continue
    }
    cornerFirstPos.set(pieceDef.id, pos)

    let orientation: CornerOrientation | null = null
    for (const o of [0, 1, 2] as CornerOrientation[]) {
      const matches = [0, 1, 2].every(
        i => observed[i] === pieceDef.colors[cornerColorIndex(pieceDef.id, pos, i, o)]
      )
      if (matches) {
        orientation = o
        break
      }
    }

    if (orientation === null) {
      errors.push(`Cannot determine orientation for corner at ${pos}`)
      continue
    }

    reconstructedCorners[pos] = makeCornerPiece(pieceDef.id, pos, pieceDef.colors, orientation)
  }

  // (continued) Identify edge pieces, check for duplicates, determine orientations
  const edgePositions = Object.keys(EdgePosition) as EdgePositionId[]
  const reconstructedEdges = {} as Record<EdgePositionId, ReturnType<typeof makeEdgePiece>>
  const edgeFirstPos = new Map<EdgePositionId, EdgePositionId>()

  for (const pos of edgePositions) {
    const [sp0, sp1] = STICKER_POSITIONS.edges[pos]
    const observed: [ColorCode, ColorCode] = [
      stickers[sp0.face][sp0.index],
      stickers[sp1.face][sp1.index]
    ]

    const pieceDef = EDGE_BY_COLORS.get(sortedColorKey(observed))
    if (!pieceDef) {
      const names = observed.map(c => colorName[c]).join('-')
      errors.push(`Invalid edge at ${pos}: ${names} is not a valid edge`)
      continue
    }

    const prevPos = edgeFirstPos.get(pieceDef.id)
    if (prevPos) {
      const names = observed.map(c => colorName[c]).join('-')
      errors.push(`Duplicate edge: ${names} appears at ${prevPos} and ${pos}`)
      continue
    }
    edgeFirstPos.set(pieceDef.id, pos)

    // On face[0] of position, baseIndex=0, colorIndex=(0+o)%2=o → sticker = colors[o]
    const orientation: EdgeOrientation = observed[0] === pieceDef.colors[0] ? 0 : 1

    reconstructedEdges[pos] = makeEdgePiece(pieceDef.id, pos, pieceDef.colors, orientation)
  }

  if (errors.length > 0) return { ok: false, errors }

  // 6. Corner orientation sum must be divisible by 3
  const cornerOrientationSum = cornerPositions.reduce(
    (sum, pos) => sum + reconstructedCorners[pos].orientation,
    0
  )
  if (cornerOrientationSum % 3 !== 0) {
    errors.push("Impossible state: corner orientations don't add up")
  }

  // 7. Edge orientation sum must be divisible by 2
  const edgeOrientationSum = edgePositions.reduce(
    (sum, pos) => sum + reconstructedEdges[pos].orientation,
    0
  )
  if (edgeOrientationSum % 2 !== 0) {
    errors.push("Impossible state: edge orientations don't add up")
  }

  // 8. Permutation parity must match
  const cornerParity = computeParity(cornerPositions, reconstructedCorners)
  const edgeParity = computeParity(edgePositions, reconstructedEdges)
  if (cornerParity !== edgeParity) {
    errors.push('Impossible state: edge/corner parity mismatch')
  }

  if (errors.length > 0) return { ok: false, errors }

  return {
    ok: true,
    state: {
      corners: reconstructedCorners,
      edges: reconstructedEdges,
      centers
    }
  }
}
