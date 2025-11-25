import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import '../global.css'
import { Link } from 'expo-router'


const Home = () => {
    return (
        <View >
            <Text >Homeee</Text>
            <Link href="/" asChild>
                <Text >Go to Login</Text>
            </Link>
        </View>
    )
}

export default Home

const styles = StyleSheet.create({})