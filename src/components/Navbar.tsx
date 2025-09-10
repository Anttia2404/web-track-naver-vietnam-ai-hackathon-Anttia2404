import React from 'react'
import { NavLink } from 'react-router-dom'

const activeStyle = { color: '#e11d48', fontWeight: 700 }

export default function Navbar(){
  return (
    <nav style={{ display: 'flex', alignItems: 'center', gap: 20, padding: 12, borderBottom: '1px solid #eee' }}>
      <div style={{ fontWeight: 700 }}>Student Time Manager</div>
      <NavLink to="/do-now" style={({isActive}) => isActive ? activeStyle : undefined}>Do Now</NavLink>
      <NavLink to="/calendar" style={({isActive}) => isActive ? activeStyle : undefined}>Calendar</NavLink>
      <NavLink to="/analytics" style={({isActive}) => isActive ? activeStyle : undefined}>Analytics</NavLink>
    </nav>
  )
}
