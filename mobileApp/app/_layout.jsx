import { Slot } from 'expo-router';
import "../global.css";
import { AppState } from 'react-native';
import { useEffect, useRef } from 'react';
import { clearSession } from './security/secureStore';
import { useRouter } from 'expo-router';


export default function RootLayout() {
    const router = useRouter();
    const appState = useRef(AppState.current)
    useEffect(() => {
        const subscription = AppState.addEventListener('change', nextState => {
            if (
                appState.current === 'active' &&
                nextState !== 'active'
            ) {
                clearSession()
                router.replace('/');
            }
            appState.current = nextState
        })

        return () => subscription.remove()
    }, [])
    return <Slot />;
}
