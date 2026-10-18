import React, { useEffect, useState } from 'react'
import { api } from '../util/api-url/api'

export default function LandingPage() {

  const [stats, setStats] = useState(null)
  const [error, setError] = useState([])

  // Fetch Computer Data from API
  async function loadComputerData(){
    try{
      const response = await fetch(`${api}/api/system-stats`,{
        method: 'GET'
      })
      // Display spinner 
      const payload = await response.json()
      setStats(payload)
      // Hide Spinner
    }catch (error){
      console.log(error)
      setError([error.message])
    }
  }

  useEffect(function (){
    async function callLoadComputerData(){
      loadComputerData()
    }
    callLoadComputerData()
  },[])

  return (
    <div>LandingPage</div>
  )
}
