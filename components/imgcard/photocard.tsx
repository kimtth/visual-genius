import dynamic from 'next/dynamic';
import { Card, CardBody, Image, Flex, Text, useDisclosure, IconButton } from "@chakra-ui/react";
import { useSelector } from "react-redux";
import BasicImageModal from "./imageModalCard";
import { FcSpeaker } from "react-icons/fc";
import synthesizeSpeech from "../util/speechUtil";
import { FC } from "react";
import { FALLBACK_SRC } from '../state/const';

interface PhotoProps {
    item?: any;
    index?: any;
    number?: number;
    imgPath: string;
}

const Draggable = dynamic(
    async () => {
        const mod = await import('react-beautiful-dnd');
        return mod.Draggable;
    },
    { ssr: false },
);


const PhotoCard: FC<PhotoProps> = ({ item, index, number, imgPath }) => {
    const showImgCaption = useSelector((state: any) => state.settings.showImgCaption);
    const showTextSpeech = useSelector((state: any) => state.settings.showTextSpeech);
    const showNumbering = useSelector((state: any) => state.settings.showNumbering);
    const { isOpen, onOpen, onClose } = useDisclosure();

    return (
        <>
            {isOpen ?
                <>
                    <BasicImageModal item={item} imgPath={imgPath} isOpen={isOpen} onClose={onClose} />
                </>
                : null}
            {/* The draggableId should match the key of the component */}
            <Draggable key={item.sid} draggableId={item.sid} index={index}>
                {(provided) => (
                    <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                    >
                        <Card
                            maxW={{ sm: '15vw' }}
                            style={{ margin: '2px' }}
                            alignItems={"center"}
                        >
                            <CardBody>
                                <Flex align="center">
                                    <Image
                                        src={imgPath}
                                        fallbackSrc={FALLBACK_SRC}
                                        borderRadius='lg'
                                        objectFit='cover'
                                        maxW={{ sm: '10vw' }}
                                        onClick={onOpen}
                                    />
                                </Flex>
                                <Flex justifyContent={"space-between"} mt={1}>
                                    {showImgCaption && <Text fontSize='sm' as='b' noOfLines={1} wordBreak='break-all'>{showNumbering && `${number}.`}{item.title}</Text>}
                                    {showTextSpeech && <IconButton aria-label="Text2Speech" size={"sm"} variant='outline' icon={<FcSpeaker />} onClick={() => synthesizeSpeech(item.title)} />}
                                </Flex>
                            </CardBody>
                        </Card>
                    </div>
                )}
            </Draggable>
        </>
    )
}

export default PhotoCard;