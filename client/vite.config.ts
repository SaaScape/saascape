import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

export default defineConfig(({ command, mode, isSsrBuild, isPreview }) => {
  const returnObj: { [key: string]: any } = {
    plugins: [react()],
  }

  if (command === "serve") {
    const server = {
      proxy: {
        "/api": {
          target: "http://localhost:4000",
        },
        "/auth": {
          target: "http://localhost:4000",
        },
        "/public_api": {
          target: "http://localhost:4000",
        },
        "/webhooks": {
          target: "http://localhost:4000",
        },
        "/files": {
          target: "http://localhost:4000",
        },
      },
    }
    returnObj.server = server
  } else {
    // command === 'build'
  }

  return returnObj
})
