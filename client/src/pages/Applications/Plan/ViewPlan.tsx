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

import { IViewProps } from "./ViewPlanContainer"
import { planTermConverter } from "../../../helpers/utils"
import StatisticBanner from "../../../components/StatisticBanner"
import IntegrationsBar from "../../../components/Applications/IntegrationsBar"
import constants from "../../../helpers/constants/constants"
import { Button, Card, Popconfirm } from "antd"
import Icon from "../../../components/Icon"

const ViewPlan = (props: IViewProps) => {
  return (
    <section className='sub-section view-plan'>
      <div className='top-bar-container'>
        <div className='top-bar d-flex justify-between align-center'>
          <div className='d-flex align-center'>
            <div>
              <h1>{props?.plan?.plan_name || "Loading..."}</h1>
              <p>View and managed plan</p>
            </div>
            <div>
              <IntegrationsBar
                linkedIds={props?.plan?.linked_ids || []}
                supportedIntegrations={[constants.INTEGRATIONS.STRIPE]}
              />
            </div>
          </div>
          <div className='right'>
            <Button
              className='m-r-10'
              type='primary'
              onClick={() => props?.onManagePlanClick(true, false)}
            >
              Manage Plan
            </Button>
            <Button onClick={() => props?.onManagePlanClick(true, true)}>
              Add Add-on
            </Button>
          </div>
        </div>
      </div>

      <StatisticBanner className='m-b-20' loading={props?.loading}>
        <div>
          <div className='title'>Plan Name</div>
          <div className='value'>{props?.plan?.plan_name}</div>
        </div>
        <div>
          <div className='title'>Cost</div>
          <div className='value'>
            <span className='currency'>{props?.currency?.symbol}</span>
            <span className='price'>{props?.plan?.price}</span>
          </div>
        </div>
        <div>
          <div className='title'>Billing Frequency</div>
          <div className='value'>
            <span className='interval-count'>
              {props?.plan?.billing_interval_count}{" "}
            </span>
            <span className='interval'>
              {planTermConverter(props?.plan?.billing_interval || "")}
              {(props?.plan?.billing_interval_count || 0) > 1 ? "s" : ""}
            </span>
          </div>
        </div>
        <div>
          <div className='title'>Subscribers</div>
          <div className='value'>0</div>
        </div>
      </StatisticBanner>

      <div className='addon-plan-section'>
        <div className='d-flex justify-between'>
          <div>
            <h3>Add-ons</h3>
            <p>Manage add-ons for your plan</p>
          </div>
        </div>
        <div className='addon-plan-container'>
          {props?.plan?.addon_plans?.map(
            (addon) =>
              addon?.status === constants.STATUSES.ACTIVE_STATUS && (
                <Card
                  key={addon?._id}
                  className='addon-plan'
                  onClick={() => {
                    props?.onManagePlanClick(true, true, addon?._id)
                  }}
                >
                  <div className='addon-wrapper'>
                    <div className='d-flex justify-between align-center'>
                      <div className='title'>{addon?.plan_name}</div>
                      <div>
                        <Popconfirm
                          title='Are you sure you want to remove this add-on?'
                          onPopupClick={(e) => e?.stopPropagation()}
                          onConfirm={() => props?.onAddonDelete?.()}
                        >
                          <Button
                            className='btn-delete'
                            icon={<Icon icon='TRASH' />}
                            danger
                            size='small'
                            onClick={(e) => {
                              props?.onManagePlanClick(false, true, addon?._id)
                              e.stopPropagation()
                            }}
                          />
                        </Popconfirm>
                      </div>
                    </div>
                    <div className='price d-flex align-center'>
                      <div className='value '>
                        <span className='currency'>
                          {props?.currency?.symbol}
                        </span>
                        <span className='price'>{addon?.price}</span>
                      </div>
                      <div className='interval'>
                        {"/"}
                        <span className='interval-count'>
                          {props?.plan?.billing_interval_count}{" "}
                        </span>
                        <span className='interval'>
                          {planTermConverter(
                            props?.plan?.billing_interval || ""
                          )}
                          {(props?.plan?.billing_interval_count || 0) > 1
                            ? "s"
                            : ""}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              )
          )}
        </div>
      </div>
    </section>
  )
}

export default ViewPlan
