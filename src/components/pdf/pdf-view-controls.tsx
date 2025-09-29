import { Button } from '@/components/ui/button'

type PdfViewControlsProps = {
  onClickPrev: () => void
  onClickNext: () => void
  disabledPrev: boolean
  disabledNext: boolean
  text: string
  className?: string
}

const PdfViewControls = (props: PdfViewControlsProps) => {
  const {
    disabledPrev,
    disabledNext,
    onClickPrev,
    onClickNext,
    text,
    className,
  } = props

  return (
    <div
      className={`flex items-center justify-between gap-4 bg-white ${className}`}>
      <Button onClick={onClickPrev} disabled={disabledPrev}>
        Prev
      </Button>
      <Button onClick={onClickNext} disabled={disabledNext}>
        Next
      </Button>
      <span>{text}</span>
    </div>
  )
}

export default PdfViewControls
