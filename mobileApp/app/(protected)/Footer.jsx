import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native'
import React from 'react'
import { House, RotateCcwKey, ShieldCheck, BarChart3 } from 'lucide-react-native'
import { navigate } from 'expo-router/build/global-state/routing'
import { useFonts, Montserrat_400Regular, Montserrat_700Bold } from '@expo-google-fonts/montserrat'

const TABS = [
    { key: 'home', label: 'Home', icon: House, route: './home' },
    { key: 'generator', label: 'Generator', icon: RotateCcwKey, route: './Generator' },
    { key: 'security', label: 'Security', icon: ShieldCheck, route: './Security' },
    { key: 'dashboard', label: 'Dashboard', icon: BarChart3, route: './Dashboard' },
]

const Footer = ({ currentPage }) => {
    const [fontsLoaded] = useFonts({ Montserrat_400Regular, Montserrat_700Bold })

    if (!fontsLoaded) return null

    return (
        <View style={styles.container}>
            <View style={styles.row}>
                {TABS.map(({ key, label, icon: Icon, route }) => {
                    const active = currentPage === key
                    return (
                        <TouchableOpacity
                            key={key}
                            onPress={() => navigate(route)}
                            style={styles.tab}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.pill, active && styles.pillActive]}>
                                <Icon
                                    size={22}
                                    color={active ? '#2e85db' : '#555'}
                                    strokeWidth={active ? 2 : 1.5}
                                />
                            </View>
                            <Text style={[
                                styles.label,
                                { 
                                    color: active ? '#2e85db' : '#555',
                                    fontFamily: active ? 'Montserrat_700Bold' : 'Montserrat_400Regular',
                                }
                            ]}>
                                {label}
                            </Text>
                        </TouchableOpacity>
                    )
                })}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        backgroundColor: 'rgba(10,10,10,0.97)',
        borderTopWidth: 1,
        borderTopColor: '#2a2a2a',
        paddingBottom: 6,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingTop: 8,
        paddingHorizontal: 4,
    },
    tab: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
    },
    pill: {
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    pillActive: {
        backgroundColor: 'rgba(46,133,219,0.12)',
    },
    label: {
        fontSize: 10,
        marginTop: 0,
    },
})

export default Footer