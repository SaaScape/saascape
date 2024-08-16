/*
 * Copyright SaaScape (c) 2024.
 */

import React from 'react'
import { ViewProps } from './ViewOVHSettingsContainer.tsx'
import { Spin } from 'antd'

function ViewOvhSettings({ isLoading }: ViewProps) {
  return (
    <Spin spinning={isLoading} tip="OVH Settings">
      <section className={'settings-page'} id={'ovhSettings'}></section>
    </Spin>
  )
}

export default ViewOvhSettings
