import { makeValueGuard, makeKeyGuard } from '~/utils/enumGuards'

import { Color, Face, CornerPosition, EdgePosition } from './constants'

export const isColor = makeValueGuard(Color)
export const isFace = makeValueGuard(Face)
export const isCornerPosition = makeKeyGuard(CornerPosition)
export const isEdgePosition = makeKeyGuard(EdgePosition)
