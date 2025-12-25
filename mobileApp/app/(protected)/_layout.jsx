import { Slot, Redirect, useRouter } from 'expo-router';
import { getSession } from '../security/secureStore';
import "../../global.css";
import { useEffect, useState } from 'react';


export default function RootLayout() {
    const [hasSession, setHasSession] = useState(false)
    const router = useRouter();


    useEffect(() => {
        function checkSession() {
            const session = getSession();
            setHasSession(!!session?.vaultKey)
        }

        checkSession()
        const interval = setInterval(() => {
            checkSession()
        }, 1000);

        return () => clearInterval(interval);
    }, [])

    if (!hasSession) {
        return <Redirect href="/" />;
    }

    return <Slot />;
}
