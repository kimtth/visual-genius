import type { NextPage } from "next";
import dynamic from 'next/dynamic';
import { Card, CardBody, Image, Flex, Text, useDisclosure, IconButton } from "@chakra-ui/react";
import { useSelector } from "react-redux";
import BasicImageModal from "./modalCard";
import { FcSpeaker } from "react-icons/fc";
import synthesizeSpeech from "../util/speechUtil";

interface PhotoProps {
    item?: any;
    index?: any;
    imgPath: string;
}

const Draggable = dynamic(
    async () => {
        const mod = await import('react-beautiful-dnd');
        return mod.Draggable;
    },
    { ssr: false },
);


const PhotoCard: NextPage<PhotoProps> = ({ item, index, imgPath }) => {
    const showImgCaption = useSelector((state: any) => state.settings.showImgCaption);
    const showTextSpeech = useSelector((state: any) => state.settings.showTextSpeech);
    const { isOpen, onOpen, onClose } = useDisclosure();

    return (
        <>
            {isOpen ?
                <>
                    <BasicImageModal item={item} imgPath={imgPath} isOpen={isOpen} onClose={onClose} />
                </>
                : null}
            {/* The draggableId should match the key of the component */}
            <Draggable key={item.id} draggableId={item.id} index={index}>
                {(provided) => (
                    <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                    >
                        <Card
                            maxW='sm'
                            style={{ margin: '3px' }}
                        >
                            <CardBody>
                                <Flex align="center">
                                    <Image
                                        src={imgPath ? imgPath : ""}
                                        borderRadius='lg'
                                        objectFit='cover'
                                        maxW={{ sm: '10vw' }}
                                        onClick={onOpen}
                                    />
                                </Flex>
                                <Flex justifyContent={"space-between"} mt={1}>
                                    {showImgCaption && <Text fontSize='sm' as='b'>{(item.title).includes('_gen_') ? (item.title).replace('_gen_', '(🎨)') : item.title}</Text>}
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