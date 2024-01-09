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

import { useNavigate, useParams } from "react-router-dom"
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
import ManagePlanModal, {
  IManagePlanModalProps,
} from "../../../components/Applications/ManagePlanModal"
import { toast } from "react-toastify"

export interface IViewProps {
  planId: string
  plan: IPlan | null
  currency: ICurrency | null
  loading: boolean
  onAddonDelete: () => void
  onManagePlanClick: (
    state: boolean,
    isAddon: boolean,
    addonId?: string
  ) => void
  functions?: {
    [functionName: string]: (...args: any[]) => any
  }
}

const ViewPlanContainer = (props: IApplicationProps) => {
  const { id, planId } = useParams()
  const { selectedApplication } = useSelector(
    (state: IStore) => state.applications
  )
  const [plan, setPlan] = useState<IPlan | null>(null)
  const [loading, setLoading] = useState(false)
  const [currency, setCurrency] = useState<ICurrency | null>(null)
  const [showManagePlanModal, setShowManagePlanModal] = useState(false)
  const [isAddon, setIsAddon] = useState(false)
  const [selectedAddon, setSelectedAddon] = useState<string | null>(null)

  const configData = useSelector((state: IStore) => state.configData)
  const { currencies } = configData
  const navigate = useNavigate()

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

  // useEffect(() => {
  //   if (!showManagePlanModal) {
  //     setSelectedAddon(null)
  //     setIsAddon(false)
  //   }
  // }, [showManagePlanModal])

  const getPlan = async () => {
    console.log("gett")
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

  const onManagePlanClick = (
    state: boolean,
    isAddon: boolean,
    addonId?: string
  ) => {
    setIsAddon(isAddon)
    setSelectedAddon(addonId || null)
    setShowManagePlanModal(state)
  }

  const onPlanSave = async (values: any) => {
    setLoading(true)
    console.log("updating plan", values)
    const {
      data: { success },
    } = await apiAxios.put(
      `/plans/${planId}?applicationId=${selectedApplication?._id}`,
      values
    )
    if (success) {
      toast.success("Plan updated successfully")
      await getPlan()
      setShowManagePlanModal(false)
    }
    setLoading(false)
  }

  const onPlanDelete = async () => {
    setLoading(true)
    const {
      data: { success },
    } = await apiAxios.delete(
      `/plans/${planId}?applicationId=${selectedApplication?._id}`
    )
    if (success) {
      toast.success("Plan deleted successfully")
      navigate(`/applications/${id}/plans`)
    }
    setLoading(false)
  }

  const onAddonDelete = async () => {
    setLoading(true)
    const {
      data: { success },
    } = await apiAxios.delete(
      `/plans/addon-plan/${planId}?applicationId=${selectedApplication?._id}`,
      { data: { addonPlanId: selectedAddon } }
    )
    if (success) {
      toast.success("Plan deleted successfully")
      await getPlan()
      setShowManagePlanModal(false)
    }
    setLoading(false)
  }

  const viewProps: IViewProps = {
    planId: planId || "",
    plan,
    currency,
    loading,
    onManagePlanClick,
    onAddonDelete,
  }

  const managePlanProps: IManagePlanModalProps = {
    open: showManagePlanModal,
    currencies,
    onCancel: () => setShowManagePlanModal(false),
    onPlanUpdate: onPlanSave,
    plan,
    onPlanDelete,
    isAddon,
    addonId: selectedAddon,
    onAddonCreate: onPlanSave,
    onAddonUpdate: onPlanSave,
    onAddonDelete,
  }
  return (
    <>
      <ViewPlan {...viewProps} />
      <ManagePlanModal {...managePlanProps} />
    </>
  )
}

export default ViewPlanContainer
