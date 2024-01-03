import { useState } from "react"
import Plans from "./Plans"
import { IPlanMainProps } from "./ViewApplicationContainer"

export interface IPlanProps {
  loading: boolean
  application: IPlanMainProps
  planColumns: any
}

const planColumns = [{ title: "Name", dataIndex: "name", key: "name" }]

const PlansContainer = (props: IPlanMainProps) => {
  const [loading, setLoading] = useState(false)

  const planProps: IPlanProps = {
    loading,
    application: props,
    planColumns,
  }
  return <Plans {...planProps} />
}

export default PlansContainer
