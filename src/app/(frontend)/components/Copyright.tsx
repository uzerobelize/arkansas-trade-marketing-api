// components/Copyright.tsx
"use client"
import { useEffect, useState } from "react"

export default function Copyright() {
  const [year, setYear] = useState("")

  useEffect(() => {
    setYear(new Date().getFullYear().toString())
  }, [])

  return <span>© {year}</span>
}
