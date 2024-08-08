/*
 * Copyright SaaScape (c) 2024.
 */
import React from 'react'
import { ViewProps } from './ViewDeploymentContainer.tsx'
import StatisticBanner from '../../../components/StatisticBanner.tsx'
import { Card, Table } from 'antd'
import { PieChart, Pie, Sector, Cell, Tooltip, ResponsiveContainer } from 'recharts'

function ViewDeployment({
  deployment,
  loading,
  selectedApplication,
  targetInstanceDistribution,
  deploymentColumns,
}: ViewProps) {
  console.log(deployment)

  const deploymentVersion = `${(deployment as any)?.version_obj?.namespace}/${(deployment as any)?.version_obj?.repository}/${(deployment as any)?.version_obj?.tag}`
  const deploymentGroup =
    deployment && selectedApplication?.config?.deployment_groups?.[deployment?.deployment_group?.toString()]
  const targetInstances = deployment?.targets || []

  return (
    <section className="sub-section view-deployment">
      <div className="top-bar-container">
        <div className="top-bar d-flex justify-between align-center">
          <div className="d-flex align-center">
            <div>
              <h1>{deployment?.name || 'Loading...'}</h1>
              <p>View deployment progress</p>
            </div>
            <div></div>
          </div>
          <div className="right"></div>
        </div>
      </div>
      <div>
        <StatisticBanner className="m-b-20" loading={loading}>
          <div>
            <div className="title">Deployment Name</div>
            <div className="value">{deployment?.name}</div>
          </div>
          <div>
            <div className="title">Target Group</div>
            <div className="value">{deploymentGroup?.name}</div>
          </div>
          <div>
            <div className="title">Target Version</div>
            <div className="value">{deploymentVersion}</div>
          </div>
          <div>
            <div className="title">Status</div>
            <div className="value">{deployment?.deployment_status}</div>
          </div>
        </StatisticBanner>

        <Card className={'deployment-stats-card'} loading={loading}>
          <div className={'grid-main'}>
            <div>
              <h3 className={'column-title'}>Instance Deployment</h3>
              <div className={'d-flex align-start'}>
                <div className={'p-relative chart-container'}>
                  <div className={'pie-text d-flex direction-column align-center justify-center'}>
                    <div className="value">{targetInstances?.length}</div>
                    <div className="entity">Instance{targetInstances?.length > 1 ? 's' : ''}</div>
                  </div>
                  <PieChart width={175} height={210}>
                    <Tooltip />
                    <Pie
                      data={targetInstanceDistribution}
                      cx={80}
                      cy={100}
                      innerRadius={60}
                      outerRadius={80}
                      fill="#8884d8"
                      paddingAngle={1}
                      dataKey="value"
                    >
                      {targetInstanceDistribution?.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry?.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </div>
                <div className={'status-color-key'}>
                  {targetInstanceDistribution?.map((entry) => {
                    return (
                      <div key={entry.name} className={`key d-flex justify-start align-center`}>
                        <div className={'color-square'} style={{ backgroundColor: entry.color }}></div>
                        <span>
                          {entry.name} ({entry.value})
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card className={'m-t-20'}>
          <Table columns={deploymentColumns} dataSource={targetInstances} />
        </Card>
      </div>
    </section>
  )
}

export default ViewDeployment
