import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Text, View, StyleSheet, Pressable } from 'react-native';
import { router } from "expo-router";

const ResultPage = () => {
    const params = useLocalSearchParams();
    
    fetch("http://192.168.1.71:3000/ratings/get", {
        method: "POST",
        body: JSON.stringify({
            energydrink: JSON.parse(params.recogResult).label,
        }),
        headers: {
            "Content-Type": "application/json",
        }
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
    });

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Result: {JSON.parse(params.recogResult).label}</Text>
            <Pressable onPress={() => router.push("/camera")}>
                <Text style={styles.button}>Recognize again</Text>
            </Pressable>
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
