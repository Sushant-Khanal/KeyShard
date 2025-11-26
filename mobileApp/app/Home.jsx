import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { Text, View, TouchableOpacity, FlatList, Image, TextInput } from 'react-native';
import { Key, Lock, PlusCircle, ShieldCheck, Search } from 'lucide-react-native';
import { useFonts, Montserrat_400Regular, Montserrat_700Bold } from '@expo-google-fonts/montserrat';
import { navigate } from 'expo-router/build/global-state/routing';

const Home = () => {
    const [fontsLoaded] = useFonts({
        Montserrat_400Regular,
        Montserrat_700Bold,
    });

    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("All");

    const passwords = [
        { id: '1', title: 'Facebook', username: 'ravi@example.com', category: 'Social' },
        { id: '2', title: 'Gmail', username: 'ravi@gmail.com', category: 'Email' },
        { id: '3', title: 'Instagram', username: 'silent_ravi', category: 'Social' },
        { id: '4', title: 'Bank Account', username: 'ravi@bank.com', category: 'Banking' },
    ];

    const categories = ["All", "Social", "Email", "Banking", "Other"];

    // Filter passwords
    const filteredData = passwords.filter((item) => {
        const matchCategory = category === "All" || item.category === category;
        const matchSearch = item.title.toLowerCase().includes(search.toLowerCase());
        return matchCategory && matchSearch;
    });

    function handleAddNew() {
        navigate('/components/addPassword');
    }

    function handleViewPassword(id) {
        navigate(`/components/viewPassword?id=${id}`);
    }

    return (
        <LinearGradient
            colors={['#131920', '#050f1a']}
            className="flex-1 items-center"
        >
            <View className="min-h-screen w-[88%] pt-[60px] relative">

                {/* Header */}
                <View className="mb-[25px]">
                    <Text style={{ fontFamily: 'Montserrat_700Bold' }} className="text-white text-4xl">
                        Password Vault
                    </Text>
                    <Text style={{ fontFamily: 'Montserrat_400Regular' }} className="text-gray-300 text-base mt-[5px]">
                        Keep your secrets safe & encrypted
                    </Text>
                </View>

                {/* Search Bar */}
                <View className="flex-row items-center bg-[#1f2a38] rounded-xl px-4 py-3 mb-[20px]">
                    <Search color="white" size={22} />
                    <TextInput
                        placeholder="Search passwords..."
                        placeholderTextColor="#8b93a1"
                        value={search}
                        onChangeText={setSearch}
                        style={{ fontFamily: "Montserrat_400Regular" }}
                        className="text-white ml-3 flex-1"
                    />
                </View>

                {/* Category Filter */}
                <View className="flex-row mb-[15px]">
                    {categories.map((cat) => (
                        <TouchableOpacity
                            key={cat}
                            onPress={() => setCategory(cat)}
                            className={`px-4 py-2 rounded-xl mr-2 ${category === cat ? "bg-[#5783F3]" : "bg-[#1f2a38]"
                                }`}
                        >
                            <Text
                                style={{ fontFamily: 'Montserrat_400Regular' }}
                                className="text-white text-sm"
                            >
                                {cat}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Password List */}
                <FlatList
                    data={filteredData}
                    keyExtractor={(item) => item.id}
                    showsVerticalScrollIndicator={false}
                    className="w-full mb-[100px]"
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            onPress={() => handleViewPassword(item.id)}
                            className="w-full bg-[#1f2a38] p-4 rounded-2xl mt-3 flex-row items-center"
                            style={{
                                shadowColor: '#000',
                                shadowOpacity: 0.3,
                                shadowRadius: 5,
                                elevation: 6
                            }}
                        >
                            <Image source={item.icon} className="w-10 h-10 mr-4 rounded-lg" />

                            <View className="flex-1">
                                <Text
                                    style={{ fontFamily: 'Montserrat_700Bold' }}
                                    className="text-white text-lg"
                                >
                                    {item.title}
                                </Text>
                                <Text
                                    style={{ fontFamily: 'Montserrat_400Regular' }}
                                    className="text-gray-400 text-sm"
                                >
                                    {item.username}
                                </Text>
                            </View>

                            <Lock color="#c1c9d6" size={24} />
                        </TouchableOpacity>
                    )}
                />

                {/* Floating Add Button */}
                <TouchableOpacity
                    onPress={handleAddNew}
                    className="absolute bottom-[80px] right-[20px] bg-[#5783F3] p-4 rounded-full"
                    style={{
                        shadowColor: "#000",
                        shadowOpacity: 0.4,
                        shadowRadius: 6,
                        elevation: 8,
                    }}
                >
                    <PlusCircle color="white" size={30} />
                </TouchableOpacity>

                {/* Footer */}
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
        </LinearGradient>
    );
};

export default Home;
