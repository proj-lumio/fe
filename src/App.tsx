import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { CustomCursor } from "@/components/CustomCursor"
import Landing from "@/pages/Landing"
import Login from "@/pages/Login"

export default function App() {
  return (
    <BrowserRouter>
      <CustomCursor />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
