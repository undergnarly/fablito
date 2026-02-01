import { checkAdminAuth } from "./actions"
import AdminLogin from "./admin-login"
import AdminDashboard from "./admin-dashboard"

export default async function AdminPage() {
  const isAuthenticated = await checkAdminAuth()

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center text-white glow-text">
          Fablito Admin
        </h1>

        {isAuthenticated ? <AdminDashboard /> : <AdminLogin />}
      </div>
    </div>
  )
}

