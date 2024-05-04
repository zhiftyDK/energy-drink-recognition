// Importerer React og nødvendige komponenter fra React Native.
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

// Definerer en funktionskomponent, der repræsenterer en venteskærm.
const WaitingPage = () => (
    // Returnerer en View-komponent, der fungerer som container for ventebeskeden.
    <View style={styles.container}>
        <Text style={styles.header}>Currently recognizing your energy drink...</Text>
    </View>
);

// Definerer stilarter for venteskærmens komponenter.
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

// Eksporterer WaitingPage-komponenten som standard.
export default WaitingPage;
