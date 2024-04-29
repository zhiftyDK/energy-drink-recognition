import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Text, View, StyleSheet } from 'react-native';

const ResultPage = () => {
    const params = useLocalSearchParams();
    return (
        <View style={styles.container}>
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
});

export default ResultPage;
