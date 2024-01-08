import { Card } from "antd"
import LoadingElem from "./LoadingElem"

interface IProps {
  loading: boolean
  children?: React.ReactNode[]
  childWrapperClassName?: string
  className?: string
}
const StatisticBanner = (props: IProps) => {
  const generateGridChildElem = (child: React.ReactNode, i: number) => {
    return (
      <div
        key={i}
        className={`grid-child ${props?.childWrapperClassName || ""}`}
      >
        {child}
      </div>
    )
  }

  const columnCount = props?.children?.length
  return (
    <Card
      className={`custom-component statistic-banner data-card ${
        props?.className || ""
      }`}
    >
      <div className='content'>
        {props.loading ? (
          <LoadingElem />
        ) : (
          <div
            className={`grid-container`}
            style={{ gridTemplateColumns: `repeat(${columnCount}, 1fr)` }}
          >
            {props?.children?.map((child, i) =>
              generateGridChildElem(child, i)
            )}
          </div>
        )}
      </div>
    </Card>
  )
}

export default StatisticBanner
