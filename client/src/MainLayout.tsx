import Aside from "./components/Aside"
import Header from "./components/Header"
import Main from "./pages/Main"

const MainLayout = () => {
  return (
    <div className='main-layout'>
      <Header />
      <Aside />
      <Main />
    </div>
  )
}

export default MainLayout
