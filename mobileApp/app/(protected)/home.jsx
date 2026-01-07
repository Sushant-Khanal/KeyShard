import { LinearGradient } from 'expo-linear-gradient'
import React, { useEffect, useState } from 'react'
import { Text, Image, View, TouchableOpacity, ScrollView, TextInput } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Key, Lock, ShieldCheck, Search, Eye, EyeOff, Mail, Phone, Calendar, Tag, ArrowDown, ArrowUp } from 'lucide-react-native'
import { useFonts, Montserrat_400Regular, Montserrat_700Bold } from '@expo-google-fonts/montserrat'
import PasswordForm from '../components/PasswordForm'

const Home = () => {
    const [fontsLoaded] = useFonts({
        Montserrat_400Regular,
        Montserrat_700Bold,
    })

    const [search, setSearch] = useState('')
    const [category, setCategory] = useState('All')
    const [password, setPassword] = useState([])
    const [visibleId, setVisibleId] = useState(null)
    const [openId, setOpenId] = useState(null)




    function handleUpdatedPassword(data) {
        if (Array.isArray(data)) {
            setPassword(data)
        }
    }

    useEffect(() => {
        console.log('homepass:', password)
    }, [password])

    if (!fontsLoaded) return null

    const passwordList = Array.isArray(password) ? password : []




    return (
        <LinearGradient
            colors={['#131920', '#050f1a']}
            className="flex-1 relative items-center"
        >
            <SafeAreaView className="flex-1 w-full" edges={['top', 'bottom']}>
                <View className="flex-1 w-[88%] mx-auto">

                    {/* HEADER */}
                    <View className="mb-6">
                        <Text
                            style={{ fontFamily: 'Montserrat_700Bold' }}
                            className="text-white text-4xl"
                        >
                            Password Vault
                        </Text>
                        <Text
                            style={{ fontFamily: 'Montserrat_400Regular' }}
                            className="text-gray-300 text-base mt-1"
                        >
                            Keep your secrets safe & encrypted
                        </Text>
                    </View>

                    {/* SEARCH */}
                    <View className="mb-6">
                        <View className="flex-row items-center bg-[#0e1621] border border-[#1f2937] rounded-lg px-3 py-2">
                            <Search size={16} color="#9ca3af" />
                            <TextInput
                                placeholder="Search passwords..."
                                placeholderTextColor="#6b7280"
                                className="ml-2 text-white flex-1"
                                value={search}
                                onChangeText={setSearch}
                            />
                        </View>
                    </View>

                    {/* ADD PASSWORD FORM */}

                    <PasswordForm handleUpdatedPassword={handleUpdatedPassword} />


                    {/* PASSWORD LIST */}
                    <ScrollView
                        className="flex-1 mt-6"
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 120 }}
                    >
                        {passwordList.length > 0 ? (
                            passwordList.map((item) => {
                                if (!item || !item.id) return null

                                const isVisible = visibleId === item.id


                                return (
                                    <View
                                        key={item.id}
                                        className="bg-[#111d2e] border border-[#b7dcff] rounded-xl p-4 mb-4"
                                    >
                                        {/* TITLE + CATEGORY */}
                                        <View className="flex-row justify-between items-center mb-3 gap-2">
                                            <View className='flex flex-row justify-center items-center gap-2 flex-1'>
                                                <Image
                                                    style={{ width: 16, height: 16 }}
                                                    source={{ uri: `https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${item.url}&size=64` }}

                                                />
                                                <Text
                                                    style={{ fontFamily: 'Montserrat_700Bold' }}
                                                    className="text-white text-xl flex-1"
                                                    numberOfLines={1}
                                                >
                                                    {item.title || 'Untitled'}
                                                </Text>
                                            </View>
                                            <View className="bg-blue-500/20 px-3 py-1 rounded-full flex-shrink-0">
                                                <Text className="text-blue-400 text-xs font-semibold">
                                                    {item.category || 'Other'}
                                                </Text>
                                            </View>
                                        </View>

                                        {/* USERNAME */}
                                        <View className="flex-row items-center mb-3 bg-[#020617] rounded-lg px-3 py-2">
                                            <Key size={16} color="#9ca3af" />
                                            <View className="ml-2 flex-1">
                                                <Text className="text-gray-400 text-xs mb-1">Username</Text>
                                                <Text className="text-white text-sm">
                                                    {item.username || 'N/A'}
                                                </Text>
                                            </View>
                                        </View>
                                        <TouchableOpacity onPress={() => setOpenId((prev) =>
                                            prev === item.id ? null : item.id
                                        )}
                                            className='flex flex-row justify-center items-center opacity-50'>{!(openId === item.id) ? <><ArrowDown strokeWidth={1.2} color='white' className=' mr-5' /><Text className='text-white text-sm  ml-2'>Expand</Text></> : <><ArrowUp strokeWidth={1.2} color='white' className=' mr-5' /><Text className='text-white text-sm  ml-2'>Collapse</Text></>}</TouchableOpacity>

                                        {openId === item.id && (<View>
                                            {/* PASSWORD */}
                                            <View className="mb-3">
                                                <Text className="text-gray-400 text-xs mb-2">Password</Text>
                                                <View className="bg-[#020617] rounded-lg px-3 py-3 flex-row items-center justify-between">
                                                    <TextInput
                                                        className="text-white font-bold text-base flex-1 pr-3"
                                                        value={String(item.password || '')}
                                                        secureTextEntry={!isVisible}
                                                        editable={false}
                                                    />
                                                    <TouchableOpacity
                                                        onPress={() =>
                                                            setVisibleId((prev) =>
                                                                prev === item.id ? null : item.id
                                                            )
                                                        }
                                                    >
                                                        {isVisible ? (
                                                            <EyeOff color="#9ca3af" size={20} />
                                                        ) : (
                                                            <Eye color="#9ca3af" size={20} />
                                                        )}
                                                    </TouchableOpacity>
                                                </View>
                                            </View>

                                            {/* URL */}
                                            {item.url ? (
                                                <View className="flex-row items-center mb-3 bg-[#020617] rounded-lg px-3 py-2">
                                                    <Lock size={16} color="#9ca3af" />
                                                    <View className="ml-2 flex-1">
                                                        <Text className="text-gray-400 text-xs mb-1">Website</Text>
                                                        <Text className="text-blue-400 text-sm">
                                                            {item.url}
                                                        </Text>
                                                    </View>
                                                </View>
                                            ) : null}

                                            {/* RECOVERY EMAIL */}
                                            {item.recoveryEmail ? (
                                                <View className="flex-row items-center mb-3 bg-[#020617] rounded-lg px-3 py-2">
                                                    <Mail size={16} color="#9ca3af" />
                                                    <View className="ml-2 flex-1">
                                                        <Text className="text-gray-400 text-xs mb-1">Recovery Email</Text>
                                                        <Text className="text-white text-sm">
                                                            {item.recoveryEmail}
                                                        </Text>
                                                    </View>
                                                </View>
                                            ) : null}

                                            {/* RECOVERY PHONE */}
                                            {item.recoveryPhone ? (
                                                <View className="flex-row items-center mb-3 bg-[#020617] rounded-lg px-3 py-2">
                                                    <Phone size={16} color="#9ca3af" />
                                                    <View className="ml-2 flex-1">
                                                        <Text className="text-gray-400 text-xs mb-1">Recovery Phone</Text>
                                                        <Text className="text-white text-sm">
                                                            {item.recoveryPhone}
                                                        </Text>
                                                    </View>
                                                </View>
                                            ) : null}

                                            {/* TAGS */}
                                            {item.tags ? (
                                                <View className="flex-row items-center mb-3 bg-[#020617] rounded-lg px-3 py-2">
                                                    <Tag size={16} color="#9ca3af" />
                                                    <View className="ml-2 flex-1">
                                                        <Text className="text-gray-400 text-xs mb-1">Tags</Text>
                                                        <Text className="text-white text-sm">
                                                            {item.tags}
                                                        </Text>
                                                    </View>
                                                </View>
                                            ) : null}

                                            {/* NOTES */}
                                            {item.notes ? (
                                                <View className="mb-3 bg-[#020617] rounded-lg px-3 py-2">
                                                    <Text className="text-gray-400 text-xs mb-1">Notes</Text>
                                                    <Text className="text-white text-sm">
                                                        {item.notes}
                                                    </Text>
                                                </View>
                                            ) : null}
                                        </View>)}

                                        {/* CREATED DATE */}
                                        <View className="flex-row items-center mt-2 pt-3 border-t border-[#1f2937]">
                                            <Calendar size={14} color="#6b7280" />
                                            <Text className="text-gray-500 text-xs ml-2">
                                                Created: {new Date(item.createdAt).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </Text>
                                        </View>
                                    </View>
                                )
                            })
                        ) : (
                            <View className="flex-1 items-center justify-center mt-20">
                                <ShieldCheck size={64} color="#374151" />
                                <Text className="text-gray-400 text-center mt-4 text-base">
                                    No passwords saved yet
                                </Text>
                                <Text className="text-gray-500 text-center mt-2 text-sm">
                                    Add your first password to get started
                                </Text>
                            </View>
                        )}
                    </ScrollView>

                    {/* FOOTER */}
                    <View className="absolute bottom-[15px] w-full flex-row items-center justify-center">
                        <ShieldCheck size={18} color="white" />
                        <Text
                            style={{ fontFamily: 'Montserrat_400Regular' }}
                            className="text-white text-xs ml-2 opacity-70"
                        >
                            AES-256 encrypted • Stored locally
                        </Text>
                    </View>

                </View>
            </SafeAreaView>
        </LinearGradient>
    )
}

export default Home