import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App.tsx"
import { store } from "./store/store.ts"
import { Provider } from "react-redux"
import { ConfigProvider } from "antd"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

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
        <>
          <App />
          <ToastContainer position='top-right' hideProgressBar pauseOnHover />
        </>
      </ConfigProvider>
    </Provider>
  </React.StrictMode>
)
