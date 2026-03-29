import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import React, { useEffect, useState } from 'react'
import { House, RotateCcwKey, ShieldCheck, BarChart3 } from 'lucide-react-native'
import { navigate } from 'expo-router/build/global-state/routing'
import { useFonts, Montserrat_400Regular } from '@expo-google-fonts/montserrat'

const TABS = [
    { key: 'home', label: 'Home', icon: House, route: './home' },
    { key: 'generator', label: 'Generator', icon: RotateCcwKey, route: './Generator' },
    { key: 'security', label: 'Security', icon: ShieldCheck, route: './Security' },
    { key: 'dashboard', label: 'Dashboard', icon: BarChart3, route: './Dashboard' },
]

const Footer = ({ currentPage }) => {
    const [fontsLoaded] = useFonts({ Montserrat_400Regular })

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
                        >
                            <Icon
                                size={22}
                                color={active ? '#2e85db' : '#888'}
                                strokeWidth={active ? 2 : 1.5}
                            />
                            <Text style={[
                                styles.label,
                                { color: active ? '#2e85db' : '#888' }
                            ]}>
                                {label}
                            </Text>
                            {active && <View style={styles.activeDot} />}
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
        paddingBottom: 4,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 8,
    },
    tab: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 4,
        gap: 2,
    },
    label: {
        fontSize: 10,
        fontFamily: 'Montserrat_400Regular',
        marginTop: 2,
    },
    activeDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#2e85db',
        marginTop: 2,
    },
})

export default Footer