import { Button } from '@/components/ui/button'

type PdfViewControlsProps = {
  onClickPrev: () => void
  onClickNext: () => void
  disabledPrev: boolean
  disabledNext: boolean
  text: string
}

const PdfViewControls = (props: PdfViewControlsProps) => {
  const { disabledPrev, disabledNext, onClickPrev, onClickNext, text } =
    props

  return (
    <div className="flex items-center justify-between p-4 bg-white border-b">
      <Button onClick={onClickPrev} disabled={disabledPrev}>
        Prev
      </Button>
      <span>{text}</span>
      <Button onClick={onClickNext} disabled={disabledNext}>
        Next
      </Button>
    </div>
  )
}

export default PdfViewControls
