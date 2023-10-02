from azure.cognitiveservices.speech import CancellationReason, SpeechSynthesisCancellationDetails, ResultReason, SpeechConfig, SpeechSynthesizer, AudioDataStream, SpeechSynthesisOutputFormat


async def synthesize_speech(text: str, speech_subscription_key: str, speech_region: str):
    speech_config = SpeechConfig(
        subscription=speech_subscription_key, region=speech_region)
    speech_config.speech_synthesis_language = "en-US"
    speech_config.speech_synthesis_voice_name = "en-US-JennyMultilingualNeural"
    speech_config.set_speech_synthesis_output_format(SpeechSynthesisOutputFormat.Audio16Khz32KBitRateMonoMp3)
    synthesizer = SpeechSynthesizer(speech_config=speech_config)

    result = synthesizer.speak_text_async(text).get()

    if result.reason == ResultReason.SynthesizingAudioCompleted:
        print("Speech synthesized to speaker for text [{}]".format(text))
        stream = AudioDataStream(result)
        audio_buffer = bytes(16000)
        audio_data = bytearray()

        while True:
            num_bytes_read = stream.read_data(audio_buffer)
            if num_bytes_read == 0:
                break
            audio_data.extend(audio_buffer[:num_bytes_read])

        return bytes(audio_data)
    elif result.reason == ResultReason.Canceled:
        cancellation_details = SpeechSynthesisCancellationDetails.from_result(
            result)
        print("Speech synthesis canceled: {}".format(
            cancellation_details.reason))
        if cancellation_details.reason == CancellationReason.Error:
            if cancellation_details.error_details:
                print("Error details: {}".format(
                    cancellation_details.error_details))
        print("Did you update the subscription info?")
        return {"message": "Speech synthesis canceled", "error": cancellation_details.reason}
