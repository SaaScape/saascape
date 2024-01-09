/*
Copyright (c) 2024 Keir Davie <keir@keirdavie.me>
Author: Keir Davie <keir@keirdavie.me>

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import { useEffect, useState } from "react"
import Plans from "./Plans"
import ManagePlanModal, {
  IManagePlanModalProps,
} from "../../../components/Applications/ManagePlanModal"
import { useSelector } from "react-redux"
import { IStore } from "../../../store/store"
import { apiAxios } from "../../../helpers/axios"
import { toast } from "react-toastify"
import { planTermConverter, queryParamBuilder } from "../../../helpers/utils"
import { IApplication } from "../../../store/slices/applicationSlice"
import { useNavigate, useParams } from "react-router-dom"
import useSetBreadcrumbs from "../../../middleware/useSetBreadcrumbs"
import breadcrumbs from "../../../helpers/constants/breadcrumbs"
import { IApplicationProps } from "../ApplicationRouteHandler"
import { ILinkedIdEnabledDocument } from "../../../interfaces/interfaces"

export interface IPlan extends ILinkedIdEnabledDocument {
  _id: string
  plan_name: string
  billing_interval: string
  billing_interval_count: number
  currency: string
  status: string
  application_id: string
  price: number
  addon_plans?: IPlan[]
  additional_configuration?: { property: string; value: string }[]
  created_at: Date
  updated_at: Date
}

export type PaginatedPlans = { [page: number]: IPlan[] }
export interface IProps {
  loading: boolean
  application: IApplication | null
  planColumns: any
  plans?: PaginatedPlans
  setCreateModalVisible: (open: boolean) => void
  functions?: {
    [functionName: string]: (...args: any[]) => any
  }
}

const PlansContainer = (props: IApplicationProps) => {
  const [loading, setLoading] = useState(false)
  const [plans, setPlans] = useState<{ [page: number]: IPlan[] }>({})
  const { id } = useParams()
  const { selectedApplication } = useSelector(
    (state: IStore) => state.applications
  )

  const [showManagePlanModal, setShowManagePlanModal] = useState(false)
  const configData = useSelector((state: IStore) => state.configData)
  const [planQueryConfig] = useState({
    limit: "20",
    page: "1",
  })

  const navigate = useNavigate()

  useEffect(() => {
    props?.setId(id)
  }, [id])

  const { currencies } = configData

  const planColumns = [
    { title: "Plan", dataIndex: "plan_name", key: "plan_name" },
    {
      title: "Billing Frequency",
      dataIndex: "billing_interval",
      key: "billing_interval",
      render: (text: any, record: IPlan) => {
        const { billing_interval_count } = record
        const value = planTermConverter(text)
        return `${billing_interval_count} ${value}${
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

  useEffect(() => {
    getPlans()
  }, [selectedApplication])

  const setCreateModalVisible = (open: boolean) => {
    setShowManagePlanModal(open)
  }

  const onPlanClick = (planId: string) => {
    navigate(`/applications/${id}/plans/${planId}`)
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
      const { page, records } = data?.plans?.paginatedData || {}
      setPlans((curr) => ({ ...curr, [+page]: records }))
    }
    setLoading(false)
  }

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

  const planProps: IProps = {
    loading,
    application: selectedApplication,
    planColumns,
    plans,
    setCreateModalVisible,
    functions: {
      onRow: (record) => {
        return {
          onClick: () => {
            onPlanClick(record?._id)
          },
        }
      },
    },
  }

  const managePlanModalProps: IManagePlanModalProps = {
    open: showManagePlanModal,
    onCancel: () => setCreateModalVisible(false),
    currencies,
    onPlanCreate,
  }

  return (
    <>
      <Plans {...planProps} />
      <ManagePlanModal {...managePlanModalProps} />
    </>
  )
}

export default PlansContainer
