import './App.css'
import MainMenu from './pages/main_menu'
import { Outlet } from "react-router-dom"

function App() {
  return (
    <>
      <Outlet />
    </>
  )
}

export default App
