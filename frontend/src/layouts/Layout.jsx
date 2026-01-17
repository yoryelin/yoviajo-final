import { useNavigate } from 'react-router-dom'
// ... (existing imports)

const Layout = ({ children }) => {
    const { user, logout } = useAuth()
    const navigate = useNavigate() // Hook for navigation
        // ...

        // ... (inside the logout button)
        < button
    onClick = {() => {
    logout()
    navigate('/')
}}
className = "ml-2 px-3 py-1 text-[10px] font-bold text-slate-400 hover:text-red-400 transition uppercase tracking-wider"
    >
    Salir
                                </button >
                            </div >
                        </div >
                    )}
                </div >
            </header >

    {/* Main Content Injection */ }
    < main className = "max-w-4xl mx-auto px-4 py-8" >
        { children }
            </main >

    {/* Global Modals (Like Profile) */ }
    < ProfileModal
isOpen = { showProfileModal }
onClose = {() => setShowProfileModal(false)}
user = { user }
API_URL = { API_URL } // Need to pass this or use Env in Modal? Modal takes props currently
authFetch = { async(url, options) => { // Simple authFetch wrapper purely for ProfileModal if needed, or ProfileModal should use Context/Hook?
    // The original App.jsx passed authFetch. Ideally ProfileModal should use useAuth or receive it.
    // Let's keep it simple and recreate a basic authFetch wrapper here or pass none if ProfileModal handles it.
    // ProfileModal DOES require authFetch prop.
    const token = localStorage.getItem('token')
    return fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            ...options?.headers,
        },
    })
}}
onUpdate = {() => window.location.reload()}
            />
        </div >
    )
}

export default Layout
