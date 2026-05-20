import { getProfileAction } from '@/actions/profile.action'
import ProfilePage from '@/components/dashboard/superAdmin/profile'
import React from 'react'

async function page() {
  const result = await getProfileAction()

  if(!result.success) {
    <>
    <h1>User not found</h1>
    </>
  }
  return (
    <div>
      <ProfilePage profile={result.data}/>
    </div>
  )
}

export default page
