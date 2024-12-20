from azure.cognitiveservices.speech import (
    CancellationReason,
    SpeechSynthesisCancellationDetails,
    ResultReason,
    SpeechConfig,
    SpeechSynthesizer,
    AudioDataStream,
    SpeechSynthesisOutputFormat,
)
from azure.cognitiveservices.speech.audio import AudioOutputConfig, PullAudioOutputStream


async def synthesize_speech(
    text: str, speech_subscription_key: str, speech_region: str
):
    try:
        # Validate input parameters
        if not text:
            raise ValueError("Text for speech synthesis cannot be empty.")
        if not speech_subscription_key or not speech_region:
            raise ValueError("Speech subscription key and region must be provided.")

        # Configure speech synthesis
        speech_config = SpeechConfig(
            subscription=speech_subscription_key, region=speech_region
        )
        speech_config.speech_synthesis_language = "en-US"
        speech_config.speech_synthesis_voice_name = "en-US-JennyMultilingualNeural"

        # Set up pull stream and audio output
        pull_stream = PullAudioOutputStream()
        audio_config = AudioOutputConfig(stream=pull_stream)

        # Specify the output format
        speech_config.set_speech_synthesis_output_format(
            SpeechSynthesisOutputFormat.Audio16Khz32KBitRateMonoMp3
        )

        # Initialize the synthesizer
        synthesizer = SpeechSynthesizer(
            speech_config=speech_config, audio_config=audio_config
        )

        # Start speech synthesis asynchronously
        result = synthesizer.speak_text_async(text).get()

        # Handle synthesis result
        if result.reason == ResultReason.SynthesizingAudioCompleted:
            print(f"Speech synthesized successfully for text: {text}")
            audio_data_stream = AudioDataStream(result)
            audio_buffer = bytes(16000)
            audio_data = bytearray()

            while True:
                num_bytes_read = audio_data_stream.read_data(audio_buffer)
                if num_bytes_read == 0:
                    break
                audio_data.extend(audio_buffer[:num_bytes_read])
            return bytes(audio_data)
        elif result.reason == ResultReason.Canceled:
            cancellation_details = SpeechSynthesisCancellationDetails.from_result(
                result
            )
            print(f"Speech synthesis canceled: {cancellation_details.reason}")
            if (
                cancellation_details.reason == CancellationReason.Error
                and cancellation_details.error_details
            ):
                print(f"Error details: {cancellation_details.error_details}")
            print("Ensure that the subscription info is correct.")
            return {
                "message": "Speech synthesis canceled",
                "error": cancellation_details.reason,
            }

    except Exception as e:
        print(f"Error during speech synthesis: {e}")
        return {"message": "Error", "error": str(e)}

    finally:
        # Ensure resources are cleaned up properly
        if "synthesizer" in locals():
            del synthesizer
