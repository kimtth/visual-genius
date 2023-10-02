import axios from 'axios';

const synthesizeSpeech = async (text: string) => {
    try {
        const response = await axios.post('/synthesize_speech', { text: text }, { responseType: 'arraybuffer' });
        const blob = new Blob([response.data], { type: 'audio/mp3' });
        const url = window.URL.createObjectURL(blob);
        const audio = new Audio(url);
        audio.load();
        await audio.play();
    } catch (e) {
        alert('play audio error');
        console.log('play audio error: ', e);
    }
};

export default synthesizeSpeech;