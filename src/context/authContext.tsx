import { getCurrentUser } from '@/lib/appwrite/api';
import { IContextType, IUser } from '@/types';
import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const INITIAL_USER: IUser = {
    id: '',
    username: '',
    email: '',
    imgurl: '',
    bio: '',
};

const INITIAL_STATE: IContextType = {
    user: INITIAL_USER,
    isLoading: false,
    isAuthenticated: false,
    setUser: () => {},
    setIsAuthenticated: () => {},
    checkAuthUser: async () => false,
};

export const AuthContext = createContext<IContextType>(INITIAL_STATE);

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<IUser>(INITIAL_USER);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

    const navigate = useNavigate();

    const checkAuthUser = async () => {
        try {
          setIsLoading(true);
          const currentAcc = await getCurrentUser();
      
          if (currentAcc) {
            setUser({
              id: currentAcc.$id,
              username: currentAcc.username,
              email: currentAcc.email,
              imgurl: currentAcc.imgurl,
              bio: currentAcc.bio,
            });
      
            setIsAuthenticated(true);
            return true;
          } else {
            setUser(INITIAL_USER); // Ensure user is never null
            setIsAuthenticated(false);
            return false;
          }
        } catch (err) {
          console.log(err);
          setUser(INITIAL_USER); // Ensure user is never null
          setIsAuthenticated(false);
          return false;
        } finally {
          setIsLoading(false);
        }
      };
      
    
    useEffect(() => {
        const cookieFallback = localStorage.getItem('cookieFallback');
    
        // Avoid redirecting if the user is on the registration page
        if (window.location.pathname === '/register') {
            return;
        }
    
        if (!cookieFallback || cookieFallback === '[]') {
            navigate('/login');
        } else {
            checkAuthUser();
        }
    }, [navigate]);
    

    const value = {
        user,
        setUser,
        isLoading,
        setIsLoading,
        isAuthenticated,
        setIsAuthenticated,
        checkAuthUser,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;

export const useUserContext = () => useContext(AuthContext);
