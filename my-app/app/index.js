// Importerer nødvendige komponenter fra React Native og Expo Router.
import { View, Text, StyleSheet, Pressable } from "react-native";
import { router } from "expo-router";

// Definerer en funktionskomponent for hjemmesiden.
const HomePage = () => {
    return (
        // Returnerer en View-komponent som hovedbeholderen.
        <View style={styles.container}>
            <Text style={styles.header}>Energy Drink Recognizer</Text>
            <Pressable onPress={() => router.push("/camera")}>
                <Text style={styles.button}>Start Recognizing</Text>
            </Pressable>
        </View>
        // Opretter en knap ved hjælp af Pressable, der navigerer til kamera-siden, når der trykkes på den.
    );
};

// Definerer stilarter for komponenterne ved hjælp af StyleSheet fra React Native.
const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
    },
    header: {
        color: "#000",
        fontSize: 20,
        marginTop: "10%",
    },
    button: {
        marginTop: "80%",
        padding: 10,
        backgroundColor: "#000",
        color: "#fff"
    }
});

// Eksporterer CameraPage-komponenten som standard.
export default HomePage;