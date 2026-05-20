import ProfilePage from '@/components/dashboard/superAdmin/profile'

import { getProfileAction } from '@/actions/profile.action'

async function page() {
  const result = await getProfileAction()

  if(!result.success) {
    return (
      <h1>User not found</h1>
    );
  }

  return (
    <div>
      <ProfilePage profile={result.data}/>
    </div>
  )
}

export default page
