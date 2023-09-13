import React, { useEffect, useState } from 'react';
import { Player } from "@remotion/player";
import { MotionComposition } from "../../remotion/MotionComposition";

const MotionPlayer = () => {
    // TODO: get window size dynamically
    const [duration, setDuration] = useState(1);

    useEffect(() => {
        // Player seems to execute server side code before rendering the client side. so that, make a delay to get the duration from localStorage
        setTimeout(() => {
            if (localStorage.getItem('duration') !== null) {
                const durationVar = localStorage.getItem('duration');
                setDuration(Number(durationVar));
            }
        }, 1000); // waits for 1 second
    }, []);

    return (
        <Player
            component={MotionComposition}
            durationInFrames={duration}
            compositionWidth={1620}
            compositionHeight={924}
            fps={10}
            controls
        />
    );
}

export default MotionPlayer;
