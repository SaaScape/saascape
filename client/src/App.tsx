import { useState } from "react"
import MainLayout from "./MainLayout"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Login from "./pages/Login"
import Loading from "./pages/Loading"
import "./styles/index.less"

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [checkedAuth, setCheckedAuth] = useState(false)

  const routesObj = {
    authenticated: <MainLayout />,
    unauthenticated: (
      <Routes>
        {checkedAuth ? (
          <Route path='/*' element={<Login />} />
        ) : (
          <Route path='/*' element={<Loading />} />
        )}
      </Routes>
    ),
  }

  return (
    <Router>
      {routesObj[isAuthenticated ? "authenticated" : "unauthenticated"]}
    </Router>
  )
}

export default App
