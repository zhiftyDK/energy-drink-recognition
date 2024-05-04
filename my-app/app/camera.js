// Importer nødvendige moduler fra Expo og React Native.
import { StatusBar } from "expo-status-bar";
import { Camera } from "expo-camera";
import { useState, useEffect, useRef } from "react";
import { StyleSheet, Text, View, Pressable, Platform } from "react-native";
import { router } from "expo-router";

// Definerer et komponent for kamera-siden.
const CameraPage = () => {
    // Bruger state hooks til at styre kameratilladelse og autofokusindstilling.
    const [hasCameraPermission, setHasCameraPermission] = useState();
    const [customAutoFocus, setCustomAutoFocus] = useState(false);
    const cameraRef = useRef();

    // Bruger en effekt hook til at anmode om kameratilladelse og skifte autofokusindstillingen periodisk.
    useEffect(() => {
        (async () => {
            // Anmod om kameratilladelse.
            const cameraPermission = await Camera.requestCameraPermissionsAsync();
            setHasCameraPermission(cameraPermission.status === "granted");
        })();

        // Skift autofokusindstillingen hvert sekund.
        const interval = setInterval(() => {
            if (customAutoFocus) {
                setCustomAutoFocus(false)
            } else {
                setCustomAutoFocus(true)
            }
        }, 1000);
        // Ryd op efter intervallet, når komponenten unmountes.
        return () => clearInterval(interval);
    });

    // Hvis tilladelsesstatus er ukendt, viser en anmodningsbesked.
    if (hasCameraPermission === undefined) {
        return <Text>Requesting permission...</Text>
    // Hvis tilladelsen ikke blev givet, informer brugeren om at ændre indstillingerne.
    } else if (!hasCameraPermission) {
        return <Text>Not granted. Change in settings...</Text>
    }

    // Funktion til at tage et billede ved hjælp af kameraet.
    const takePicture = async () => {
        // Tag et billede med kameraet og få billedets URI og andre data.
        const photo = await cameraRef.current.takePictureAsync({
            quality: 1,
            base64: true,
            exif: false
        });
        router.push("/waiting");
        // Uddrag filnavnet og konstruer filens URI korrekt for platformen.
        const filename = photo.uri.replace(/^.*[\\\/]/, '');
        const photoURI = Platform.OS === "android" ? photo.uri : photo.uri.replace("file://", "");
        // Opret en form data til at sende billedet til serveren.
        const formData = new FormData();
        formData.append("file", {
            name: filename,
            type: photo.type,
            uri: photoURI
        });
        // Send billedet til serveren for sammenligning og håndter resultatet.
        fetch("http://192.168.1.71:3000/compare", {
            method: "POST",
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            router.push("/result?recogResult=" + JSON.stringify(data))
        });
    }

    // Returner brugergrænsefladen, herunder kameraet og en knap til at tage et billede.
    return (
        <View style={styles.container}>
            <Text style={styles.header}>Energy Drink Recognizer</Text>
            <Camera style={styles.camera} ref={cameraRef} autoFocus={customAutoFocus}></Camera>
            <Pressable onPress={() => takePicture()}>
                <Text style={styles.button}>Take Picture</Text>
            </Pressable>
            <StatusBar style="auto"/>
        </View>
    );
}

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
    camera: {
        marginTop: "10%",
        height: "60%",
        width: "80%",
    },
    button: {
        marginTop: "10%",
        padding: 10,
        backgroundColor: "#000",
        color: "#fff"
    }
});

// Eksporterer CameraPage-komponenten som standard.
export default CameraPage;