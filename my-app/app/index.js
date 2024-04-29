import { View, Text, StyleSheet, Pressable } from "react-native";
import { router } from "expo-router";

const HomePage = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.header}>Energy Drink Recognizer</Text>
            <Pressable onPress={() => router.push("/camera")}>
                <Text style={styles.button}>Start Recognizing</Text>
            </Pressable>
        </View>
    );
};

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

export default HomePage;