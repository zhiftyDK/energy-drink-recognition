// Importer nødvendige moduler og hooks fra Expo og React Native.
import { useLocalSearchParams } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, Pressable, TextInput } from 'react-native';
import { router } from "expo-router";

// Definerer ResultPage-komponenten.
const ResultPage = () => {
    // Henter søgeparametre fra den lokale routing.
    const params = useLocalSearchParams();

    // Definerer tilstande til at håndtere ratings og indtastninger.
    const [ratings, setRatings] = useState([]);
    const [name, setName] = useState();
    const [comment, setComment] = useState();
    const [rating, setRating] = useState();
    
    // Brug effekt-hook til at hente eksisterende ratings for en bestemt energidrik.
    useEffect(() => {
        fetch("http://" + process.env.IP_ADDRESS + ":3000/ratings/get", {
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
            setRatings(data.ratings);
        });
    }, []);

    // Funktion til at oprette en ny rating for en energidrik.
    function createRating() {
        if(name && comment && rating) {
            fetch("http://" + process.env.IP_ADDRESS + ":3000/ratings/create", {
                method: "POST",
                body: JSON.stringify({
                    name: name,
                    comment: comment,
                    rating: rating,
                    energydrink: JSON.parse(params.recogResult).label,
                }),
                headers: {
                    "Content-Type": "application/json",
                }
            })
            .then(response => response.json())
            .then(data => {
                console.log(data);
                // Tilføjer den nye rating til den eksisterende liste.
                setRatings(ratings.push({_id: crypto.randomUUID(), name: name, comment: comment, rating: rating}));
            });
        }
    }

    // Funktion til at gengive et antal stjerner baseret på et tal.
    function renderStars(numStars) {
        const stars = [];
        for (let i = 0; i < numStars; i++) {
            stars.push('⭐');
        }
        return stars.join('');
    }
    
    // Returnerer brugergrænsefladen for resultat-siden.
    return (
        <View style={styles.container}>
            <Text style={styles.header}>Result: {JSON.parse(params.recogResult).label}</Text>
            <Pressable onPress={() => router.push("/camera")}>
                <Text style={styles.button}>Recognize again</Text>
            </Pressable>
            <Text style={styles.header}>Rate the energydrink:</Text>
            <TextInput style={styles.input} editable placeholder="Whats your name?" onChangeText={text => setName(text)}></TextInput>
            <TextInput style={styles.input} editable placeholder="Comment on the drink!" onChangeText={text => setComment(text)}></TextInput>
            <TextInput style={styles.input} editable placeholder="Rate the drink from 1 to 5!" onChangeText={text => setRating(text)}></TextInput>
            <Pressable onPress={() => createRating()}>
                <Text style={[styles.button, {marginTop: "5%"}]}>Create rating</Text>
            </Pressable>
            <Text style={styles.header}>Ratings:</Text>
            {ratings.map(rating => (
                <View key={rating._id} style={styles.rating}>
                    <Text><Text style={{fontWeight: "bold"}}>Name:</Text> {rating.name}</Text>
                    <Text><Text style={{fontWeight: "bold"}}>Comment:</Text> {rating.comment}</Text>
                    <Text><Text style={{fontWeight: "bold"}}>Rating:</Text> {renderStars(parseInt(rating.rating))}</Text>
                </View>
            ))}
        </View>
    );
};

// Definerer stilarter for komponenterne ved hjælp af StyleSheet fra React Native.
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
    },
    input: {
        marginTop: "5%",
        padding: 10,
        borderStyle: "solid",
        borderColor: "#000",
        borderWidth: 2
    },
    rating: {
        marginTop: "5%",
        padding: 10,
        backgroundColor: "#e0e0e0"
    }
});

// Eksporterer ResultPage-komponenten som standard.
export default ResultPage;
