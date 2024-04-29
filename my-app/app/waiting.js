import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const WaitingPage = () => (
    <View style={styles.container}>
        <Text style={styles.header}>Currently recognizing your energy drink...</Text>
    </View>
);

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
    }
});

export default WaitingPage;
