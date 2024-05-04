import { StatusBar } from "expo-status-bar";
import { Camera } from "expo-camera";
import { useState, useEffect, useRef } from "react";
import { StyleSheet, Text, View, Pressable, Platform } from "react-native";
import { router } from "expo-router";

const CameraPage = () => {
    const [hasCameraPermission, setHasCameraPermission] = useState();
    const [customAutoFocus, setCustomAutoFocus] = useState(false);
    const cameraRef = useRef();

    useEffect(() => {
        (async () => {
            const cameraPermission = await Camera.requestCameraPermissionsAsync();
            setHasCameraPermission(cameraPermission.status === "granted");
        })();

        const interval = setInterval(() => {
            if (customAutoFocus) {
                setCustomAutoFocus(false)
            } else {
                setCustomAutoFocus(true)
            }
        }, 1000);
        return () => clearInterval(interval);
    });

    if (hasCameraPermission === undefined) {
        return <Text>Requesting permission...</Text>
    } else if (!hasCameraPermission) {
        return <Text>Not granted. Change in settings...</Text>
    }

    const takePicture = async () => {
        const photo = await cameraRef.current.takePictureAsync({
            quality: 1,
            base64: true,
            exif: false
        });
        router.push("/waiting");
        const filename = photo.uri.replace(/^.*[\\\/]/, '');
        const photoURI = Platform.OS === "android" ? photo.uri : photo.uri.replace("file://", "");
        const formData = new FormData();
        formData.append("file", {
            name: filename,
            type: photo.type,
            uri: photoURI
        });
        fetch("http://" + process.env.IP_ADDRESS + ":3000/compare", {
            method: "POST",
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            router.push("/result?recogResult=" + JSON.stringify(data))
        });
    }

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

export default CameraPage;