/*
 * Copyright SaaScape (c) 2024.
 */

import moduleAlias from 'module-alias'
import path from 'path'
;(() => {
  const launchCommand = process.argv.find((arg) => arg.startsWith('launch_command='))?.split('=')[1] || ''
  if (!['start', 'start-bg'].includes(launchCommand)) return
  moduleAlias.addAliases({
    types: path.join(__dirname, '..', '..', 'types'),
  })
})()
