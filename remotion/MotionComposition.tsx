import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import React, { useEffect, useState } from 'react';
import { Img } from 'remotion';

type Image = {
    imgPath: string;
    title: string;
};

export const MotionComposition = () => {
    const { fps, durationInFrames, width, height } = useVideoConfig();
    const [idx, setIdx] = useState(0);
    const frame = useCurrentFrame();
    const totalFrame = durationInFrames / fps;
    const [Images, setImages] = useState<Image[] | null>(null);

    useEffect(() => {
        const imageData = localStorage.getItem('Images');
        const parsedImages: Image[] | null = imageData ? JSON.parse(imageData) : null;
        setImages(parsedImages);
    }, []);

    useEffect(() => {
        if (Images && Images.length > idx) {
            const idx = Math.floor(frame / 50);
            console.log('idx', idx);
            setIdx(idx);
        } else {
            setIdx(0);
        }
    }, [frame, totalFrame]);

    return (
        <AbsoluteFill
            style={{
                justifyContent: "center",
                alignItems: "center",
                fontSize: 60,
                color: "White",
                backgroundColor: "black",
            }}
        >
            <Img
                style={{
                    maxWidth: '60%',
                    maxHeight: '60%',
                }}
                src={Images && Images.length > idx ? Images[idx].imgPath : Images && Images.length > 0 ? Images[0].imgPath : "-"} />
            {Images && Images.length > idx ? Images[idx].title : Images && Images.length > 0 ? Images[0].title : "-"}
        </AbsoluteFill>
    );
};
