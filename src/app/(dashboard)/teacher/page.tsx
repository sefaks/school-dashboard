"use client"
import { useAuth } from '@/contexts/AuthContext'
import React from 'react'

const TeacherPage = () => {
  const { user, loading, error } = useAuth()

  if (loading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  if (!user) {
    return <div>User not found or not authorized</div>
  }

  return (
    <div>
      <h1>Teacher Page</h1>
      
    </div>
  )
}

export default TeacherPage
