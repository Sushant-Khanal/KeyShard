import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { Text, View, TouchableOpacity, FlatList, Image, TextInput } from 'react-native';
import { Key, Lock, PlusCircle, ShieldCheck, Search } from 'lucide-react-native';
import { useFonts, Montserrat_400Regular, Montserrat_700Bold } from '@expo-google-fonts/montserrat';
import { navigate } from 'expo-router/build/global-state/routing';
import { encryptPassword, decryptPassword } from './security/aesEncryption';


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
    function handleEncrypt() {
        try {
            const response = encryptPassword()
            console.log("Encryption: ", response)
        } catch (error) {
            console.log(error)
        }
    }

    function handleDecrypt() {
        try {
            const response = decryptPassword()
            console.log("Decryption: ", response)
        } catch (error) {
            console.log(error)
        }
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


                <View>
                    <TouchableOpacity onPress={handleEncrypt} className="bg-blue-500 py-2 "><Text>Encrypt</Text></TouchableOpacity>
                    <TouchableOpacity onPress={handleDecrypt} className="bg-blue-500 py-2 "><Text>Decrypt</Text></TouchableOpacity>

                </View>






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
