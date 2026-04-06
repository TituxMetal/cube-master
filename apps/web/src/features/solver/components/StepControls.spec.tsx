import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, mock } from 'bun:test'

import { StepControls } from '~/features/solver/components/StepControls'

afterEach(() => {
  cleanup()
})

const defaultProps = {
  currentStep: 5,
  totalSteps: 20,
  onPrevious: () => {},
  onNext: () => {}
}

describe('StepControls', () => {
  it('should render step counter', () => {
    render(<StepControls {...defaultProps} />)

    expect(screen.getByText('Step 5/20')).toBeDefined()
  })

  it('should disable previous button at step 0', () => {
    render(<StepControls {...defaultProps} currentStep={0} />)

    const prev = screen.getByLabelText('Previous step') as HTMLButtonElement
    expect(prev.disabled).toBe(true)
  })

  it('should disable next button at last step', () => {
    render(<StepControls {...defaultProps} currentStep={20} />)

    const next = screen.getByLabelText('Next step') as HTMLButtonElement
    expect(next.disabled).toBe(true)
  })

  it('should call onPrevious on click', async () => {
    const user = userEvent.setup()
    const onPrev = mock(() => {})

    render(<StepControls {...defaultProps} onPrevious={onPrev} />)

    await user.click(screen.getByLabelText('Previous step'))
    expect(onPrev).toHaveBeenCalledTimes(1)
  })

  it('should call onNext on click', async () => {
    const user = userEvent.setup()
    const onNext = mock(() => {})

    render(<StepControls {...defaultProps} onNext={onNext} />)

    await user.click(screen.getByLabelText('Next step'))
    expect(onNext).toHaveBeenCalledTimes(1)
  })
})
