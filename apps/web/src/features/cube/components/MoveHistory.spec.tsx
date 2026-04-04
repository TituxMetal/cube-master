import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'bun:test'

import { MoveHistory } from '~/features/cube/components/MoveHistory'

afterEach(() => {
  cleanup()
})

describe('MoveHistory', () => {
  it('should show placeholder when empty', () => {
    render(<MoveHistory moves={[]} />)

    expect(screen.getByText('No moves yet')).toBeDefined()
  })

  it('should render move tokens', () => {
    render(<MoveHistory moves={['R', "U'", 'F2']} />)

    expect(screen.getAllByRole('listitem')).toHaveLength(3)
    expect(screen.getByText('R')).toBeDefined()
    expect(screen.getByText("U'")).toBeDefined()
    expect(screen.getByText('F2')).toBeDefined()
  })

  it('should hide placeholder when moves exist', () => {
    render(<MoveHistory moves={['R']} />)

    expect(screen.queryByText('No moves yet')).toBeNull()
  })
})
