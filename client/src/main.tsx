import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App.tsx"
import { store } from "./store/store.ts"
import { Provider } from "react-redux"
import { ConfigProvider } from "antd"

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider store={store}>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: "#3498db",
          },
        }}
      >
        <App />
      </ConfigProvider>
    </Provider>
  </React.StrictMode>
)
