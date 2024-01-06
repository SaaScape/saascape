import { useEffect, useState } from "react"
import Plans from "./Plans"
import { Button } from "antd"
import CreatePlanModal, {
  ICreatePlanModalProps,
} from "../../../components/Applications/CreatePlanModal"
import { useSelector } from "react-redux"
import { IStore } from "../../../store/store"
import { apiAxios } from "../../../helpers/axios"
import { toast } from "react-toastify"
import {
  queryParamBuilder,
  retrieveAndSetApplications,
} from "../../../helpers/utils"
import constants from "../../../helpers/constants/constants"
import { IApplication } from "../../../store/slices/applicationSlice"
import { useParams } from "react-router-dom"
import useSetBreadcrumbs from "../../../middleware/useSetBreadcrumbs"
import breadcrumbs from "../../../helpers/constants/breadcrumbs"

export interface IPlan {
  _id: string
  plan_name: string
  billing_interval: string
  billing_interval_count: number
  currency: string
  status: string
  application_id: string
  price: number
  created_at: Date
  updated_at: Date
}

export type PaginatedPlans = { [page: number]: IPlan[] }
export interface IPlanProps {
  loading: boolean
  application: IApplication | null
  planColumns: any
  plans?: PaginatedPlans
  functions?: {
    [functionName: string]: (...args: any[]) => any
  }
}

const PlansContainer = () => {
  const [loading, setLoading] = useState(false)
  const [plans, setPlans] = useState<{ [page: number]: IPlan[] }>({})
  const { id } = useParams()
  const { applications, selectedApplication } = useSelector(
    (state: IStore) => state.applications
  )

  const [showCreatePlanModal, setShowCreatePlanModal] = useState(false)
  const configData = useSelector((state: IStore) => state.configData)
  const [planQueryConfig, setPlanQueryConfig] = useState({
    limit: "20",
    page: "1",
  })

  const { currencies } = configData

  const planColumns = [
    { title: "Plan", dataIndex: "plan_name", key: "plan_name" },
    {
      title: "Billing Frequency",
      dataIndex: "billing_interval",
      key: "billing_interval",
      render: (text: any, record: IPlan) => {
        const { billing_interval_count } = record
        const values = {
          [constants.BILLING_INTERVAL.DAY]: "Day",
          [constants.BILLING_INTERVAL.WEEK]: "Week",
          [constants.BILLING_INTERVAL.MONTH]: "Month",
          [constants.BILLING_INTERVAL.ANNUAL]: "Year",
        }
        return `${billing_interval_count} ${values[text]}${
          billing_interval_count > 1 ? "s" : ""
        }`
      },
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      align: "right",
      render: (text: any, record: IPlan) => {
        const { symbol } = currencies?.[record?.currency] || {}
        return `${symbol} ${(+text)?.toFixed(2)}`
      },
    },
  ]
  const setBreadcrumbs = useSetBreadcrumbs()
  useEffect(() => {
    if (!id) return
    setBreadcrumbs(
      breadcrumbs.VIEW_APPLICATION_PLANS(
        selectedApplication?.application_name || id,
        id
      )
    )
  }, [selectedApplication])

  // Firstly get application from param
  useEffect(() => {
    if (!id) return
    retrieveAndSetApplications(id)
  }, [id])

  useEffect(() => {
    const planButtons = (
      <div>
        <Button type='primary' onClick={() => setCreateModalVisible(true)}>
          Create Plan
        </Button>
      </div>
    )
    // props.setTopBar("Plans", "View Plans", planButtons)
  }, [])

  useEffect(() => {
    getPlans()
  }, [selectedApplication])

  const setCreateModalVisible = (open: boolean) => {
    setShowCreatePlanModal(open)
  }

  const getPlans = async () => {
    setLoading(true)
    if (!selectedApplication?._id) return
    const {
      data: { data, success },
    } = await apiAxios.get(
      `/plans${queryParamBuilder({
        ...planQueryConfig,
        applicationId: selectedApplication?._id,
      })}`
    )
    if (success) {
      const { page, records, totalDocuments } = data?.plans?.paginatedData || {}
      setPlans((curr) => ({ ...curr, [+page]: records }))
    }
    setLoading(false)
  }

  // TODO, util function that retrieves applications and sets state for that application

  const onPlanCreate = async (values: any) => {
    const {
      data: { success },
    } = await apiAxios.post(
      `/plans?applicationId=${selectedApplication?._id}`,
      values
    )
    if (success) {
      toast.success("Plan created successfully")
      await getPlans()
      setCreateModalVisible(false)
    }
  }

  const planProps: IPlanProps = {
    loading,
    application: selectedApplication,
    planColumns,
    plans,
  }

  const createPlanModalProps: ICreatePlanModalProps = {
    open: showCreatePlanModal,
    onCancel: () => setCreateModalVisible(false),
    currencies,
    onPlanCreate,
  }

  return (
    <>
      <Plans {...planProps} />
      <CreatePlanModal {...createPlanModalProps} />
    </>
  )
}

export default PlansContainer
