import { useParams } from "react-router-dom"
import { IApplicationProps } from "../ApplicationRouteHandler"
import ViewPlan from "./ViewPlan"
import { useSelector } from "react-redux"
import { IStore } from "../../../store/store"
import { useEffect, useState } from "react"
import useSetBreadcrumbs from "../../../middleware/useSetBreadcrumbs"
import breadcrumbs from "../../../helpers/constants/breadcrumbs"
import { IPlan } from "../ViewApplication/PlansContainer"
import { apiAxios } from "../../../helpers/axios"
import { ICurrency } from "../../../store/slices/configData"
import { getCurrency } from "../../../helpers/utils"

export interface IViewProps {
  planId: string
  plan: IPlan | null
  currency: ICurrency | null
  loading: boolean
}

const ViewPlanContainer = (props: IApplicationProps) => {
  const { id, planId } = useParams()
  const { selectedApplication } = useSelector(
    (state: IStore) => state.applications
  )
  const [plan, setPlan] = useState<IPlan | null>(null)
  const [loading, setLoading] = useState(false)
  const [currency, setCurrency] = useState<ICurrency | null>(null)

  useEffect(() => {
    props?.setId(id)
  }, [id])

  const setBreadcrumbs = useSetBreadcrumbs()
  useEffect(() => {
    if (!id || !planId) return
    setBreadcrumbs(
      breadcrumbs.VIEW_APPLICATION_PLAN(
        selectedApplication?.application_name || id,
        id,
        planId,
        plan?.plan_name || planId
      )
    )
  }, [selectedApplication, plan])

  useEffect(() => {
    setPlan(null)
    getPlan()
  }, [selectedApplication, planId])

  useEffect(() => {
    if (!plan) return
    setCurrency(getCurrency(plan?.currency)?.currency)
  }, [plan])

  const getPlan = async () => {
    setLoading(true)
    if (!selectedApplication?._id || !planId) return
    const {
      data: { data, success },
    } = await apiAxios.get(
      `/plans/${planId}?applicationId=${selectedApplication?._id}`
    )
    if (success) {
      setPlan(data?.plan)
    }
    setLoading(false)
  }

  const viewProps: IViewProps = {
    planId: planId || "",
    plan,
    currency,
    loading,
  }
  return <ViewPlan {...viewProps} />
}

export default ViewPlanContainer
