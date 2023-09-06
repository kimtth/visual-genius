import { SpeechSynthesizer, SpeechConfig, ResultReason } from "microsoft-cognitiveservices-speech-sdk";
import { SPEECH_SUBSCRIPTION_KEY, SPEECH_SERVICE_REGION } from "../state/const";

const synthesizeSpeech = (title: string) => {
    if (!SPEECH_SUBSCRIPTION_KEY && !SPEECH_SERVICE_REGION) {
        console.error("Speech subscription key is not defined");
    } else {
        const speechConfig = SpeechConfig.fromSubscription(SPEECH_SUBSCRIPTION_KEY, SPEECH_SERVICE_REGION);
        speechConfig.speechSynthesisLanguage = "en-US"; 
        speechConfig.speechSynthesisVoiceName = "en-US-JennyMultilingualNeural";
        let synthesizer = new SpeechSynthesizer(speechConfig, undefined);

        synthesizer.speakTextAsync(title,
            function (result) {
                if (result.reason === ResultReason.SynthesizingAudioCompleted) {
                    console.log("synthesis finished.");
                    const audio = result.audioData;
                    const blob = new Blob([audio], { type: "audio/wav" });
                    const url = URL.createObjectURL(blob);
                    const audioElement = new Audio(url);
                    audioElement.play();
                } else {
                    console.error("Speech synthesis canceled, " + result.errorDetails +
                        "\nDid you set the speech resource key and region values?");
                }
                synthesizer.close();
            },
            function (err) {
                console.trace("err - " + err);
                synthesizer.close();
            });
    };
}

export default synthesizeSpeech;