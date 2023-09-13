import React, { useEffect } from "react";
import { Composition } from "remotion";
import { MotionComposition } from "./MotionComposition";

export const RemotionRoot: React.FC = () => {
	const [duration, setDuration] = React.useState(1);

	useEffect(() => {
        const durationInFrames = localStorage.getItem('duration');
        setDuration(Number(durationInFrames));
    }, []);
	
	return (
		<>
			<Composition
				id="Empty"
				component={MotionComposition}
				durationInFrames={duration}
				fps={30}
				width={window.innerWidth}
				height={window.innerHeight}
			/>
		</>
	);
};
