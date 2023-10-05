import os
import uuid
from azure.cognitiveservices.speech import CancellationReason, SpeechSynthesisCancellationDetails, ResultReason, SpeechConfig, SpeechSynthesizer, AudioDataStream, SpeechSynthesisOutputFormat
from azure.cognitiveservices.speech.audio import AudioOutputConfig

async def synthesize_speech(text: str, speech_subscription_key: str, speech_region: str):
    try:
        speech_config = SpeechConfig(
            subscription=speech_subscription_key, region=speech_region)
        speech_config.speech_synthesis_language = "en-US"
        speech_config.speech_synthesis_voice_name = "en-US-JennyMultilingualNeural"
        # https://learn.microsoft.com/en-us/answers/questions/1184428/azure-text-to-speech-error-code-0x38-(spxerr-audio
        # the remote app service the default audio config needs to be set to an audio file 
        # instead of default as in local machine it cannot default to a speaker in this case.
        file_name = str(uuid.uuid4()) + ".mp3"
        file_config = AudioOutputConfig(filename=file_name)
        
        speech_config.set_speech_synthesis_output_format(
            SpeechSynthesisOutputFormat.Audio16Khz32KBitRateMonoMp3)
        synthesizer = SpeechSynthesizer(speech_config=speech_config, audio_config=file_config)

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
    except Exception as e:
        print("Error: {}".format(e))
        return {"message": "Error", "error": e}
    finally:
        # After processing (or if an error occurs), delete the file
        os.remove(file_name)