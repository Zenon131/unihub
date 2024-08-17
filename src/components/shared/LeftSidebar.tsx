import { sidebarLinks } from '@/constants'
import { useUserContext } from '@/context/authContext'
import { useLogoutAccMutation } from '@/lib/react-query/queriesAndMutations'
import { INavLink } from '@/types'
import  { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { Button } from '../ui/button'
import { getCurrentUser } from '@/lib/appwrite/api'

const LeftSidebar = () => {
    const { mutate: logout, isSuccess } = useLogoutAccMutation()
    const { user } = useUserContext()
    const { pathname } = useLocation()
    const navigate = useNavigate()

    const [currentUser, setCurrentUser] = useState(null)

    useEffect(() => {
        const fetchCurrentUser = async () => {
            const user = await getCurrentUser()
            setCurrentUser(user)
        }
        fetchCurrentUser()
    }, [])

    useEffect(() => {
        if (isSuccess) {
            navigate('/login')  // Redirect to login page or wherever is appropriate after logout
        }
    }, [isSuccess, navigate])

    return (
        <nav className='leftsidebar'>
            <div className='flex flex-col gap-11'>
                <Link to='/' className='flex gap-3 items-center' title='Go to Home'>
                    <img src='/assets/images/bashmnt2.svg' alt='Bashmnt Logo' width={150} height={36}/>
                </Link>
                <ul className='flex flex-col gap-6'>
                    {sidebarLinks.map((link: INavLink) => {
                        const isActive = pathname === link.route
                        return (
                            <li key={link.label} className={`leftsidebar-link ${isActive && 'bg-primary-500'}`}>
                                <NavLink to={link.route} className='flex gap-4 items-center p-6'>
                                    <img src={link.imgURL} className='invert' alt={link.label} width={24} height={24}/>
                                    {link.label}
                                </NavLink>
                            </li>
                        )
                    })}
                </ul>
            </div>
            <div className='flex flex-col gap-6'>
                {currentUser && (
                        <Link to={`/profile/${user.id}`} className='flex gap-3 items-center'>
                            <img src={currentUser.imgurl || '/assets/icons/profile-placeholder.svg'} alt='profile' className='h-14 w-14 rounded-full'/>
                            <div className='flex flex-col'>
                                <p className='body-bold'>{currentUser.username}</p>
                                <p className='small-regular text-light-4'>@{currentUser.username}</p>
                            </div>
                        </Link>
                    )}
                <Button variant='ghost' className='shad-button_ghost' onClick={() => logout()}>
                    <img className='invert-white' src='/assets/icons/box-arrow-left.svg' alt='logout' width={24} height={24}/>
                    <p className='small-medium lg:base-medium'>Logout</p>
                </Button>
            </div>
        </nav>
    )
}

export default LeftSidebar
