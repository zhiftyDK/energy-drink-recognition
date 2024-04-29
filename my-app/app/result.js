import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Text, View, StyleSheet, Pressable } from 'react-native';
import { router } from "expo-router";

const ResultPage = () => {
    const params = useLocalSearchParams();
    return (
        <View style={styles.container}>
            <Pressable onPress={() => router.push("/camera")}>
                <Text style={styles.button}>Back</Text>
            </Pressable>
            <Text style={styles.header}>Result: {JSON.parse(params.recogResult).label}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    header: {
        color: "#000",
        fontSize: 20,
        marginTop: "10%",
    },
    image: {
        flex: 1,
        width: '100%',
        backgroundColor: '#0553',
    },
    button: {
        marginTop: "10%",
        padding: 10,
        backgroundColor: "#000",
        color: "#fff"
    }
});

export default ResultPage;
