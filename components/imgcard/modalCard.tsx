import { Text, Image, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalOverlay, IconButton, Flex, Button } from "@chakra-ui/react"
import { NextPage } from "next";
import { MdOutlineYoutubeSearchedFor } from "react-icons/md";
import { FaPaintBrush } from "react-icons/fa";
import { VscSaveAll } from "react-icons/vsc";
import useAxios from "axios-hooks";
import { API_ENDPOINT } from "../state/const";
import { useCallback, useEffect, useState } from "react";
import { setImageDataPayload } from "../state/datas";
import { useDispatch, useSelector } from "react-redux";


interface BasicImageModalProps {
    item: any;
    imgPath: string;
    isOpen: boolean;
    onClose: () => void;
}

type Item = {
    categoryId: string;
    title: string;
    imgPath: string;
    id: string;
};

type DataPayload = {
    [key: string]: {
        items?: Item[];
    };
};

const BasicImageModal: NextPage<BasicImageModalProps> = ({ item, isOpen, onClose }) => {
    const dataPayload = useSelector((state: any) => state.datas.ImageDataPayload);
    const [imgPath, setImgPath] = useState("");
    const [isGenLoading, setIsGenLoading] = useState(false);
    const dispatch = useDispatch();

    const [{ data: bingImgUrl, loading: bingImgLoading, error: bingImgError }, getBingImg] = useAxios(
        {
            url: `${API_ENDPOINT}/bing_img/${item.title}`,
            method: 'GET'
        }, { manual: true }
    );

    const [{ data: genImgUrl, loading: genImgLoading, error: genImgError }, getGenImg] = useAxios(
        {
            url: `${API_ENDPOINT}/gen_img/${item.title}`,
            method: 'GET'
        }, { manual: true }
    );

    const [{ data: updateImgUrl, loading: updateImgLoading, error: updateImgError }, updateImg] = useAxios(
        {
            url: `${API_ENDPOINT}/images/${item.id}`,
            method: 'PUT'
        }, { manual: true }
    );

    const onDataPayload = useCallback(
        (any: any) => dispatch(setImageDataPayload(any)),
        [dispatch]
    );

    const handleImageUpdate = async (imgId: string) => {
        const newImgPath = imgPath;
        let clonedDataPayload = JSON.parse(JSON.stringify(dataPayload));
        const updatedPayload = Object.values(clonedDataPayload).map((obj: any) => {
            if (obj.items) {
                obj.items = obj.items.map((item: any) => {
                    if (item.id === imgId) {
                        return { ...item, imgPath: newImgPath };
                    }
                    return item;
                });
                return { ...obj, items: [...obj.items] };
            }
            return obj;
        });

        console.log(updatedPayload);
        onDataPayload(updatedPayload);
        clonedDataPayload = null;

        try {
            updateImg({
                data: {
                    ...item,
                    imgPath: newImgPath
                }
            });
        } catch (err) {
            console.error(err);
        }
    }

    const handleImageSearch = async () => {
        try {
            await getBingImg();
        } catch (err) {
            console.error(err);
        }
    }

    const handleImageGenerate = async () => {
        try {
            setIsGenLoading(true);
            await getGenImg();
        } catch (err) {
            alert("Sorry, the image generation service is not available at the moment. Please try again later.")
            console.error(err);
        }
    }

    useEffect(() => {
        setImgPath(item.imgPath);
    }, [])

    useEffect(() => {
        if (bingImgUrl) {
            setImgPath(bingImgUrl);
        } else {
            setImgPath(item.imgPath);
        }
    }, [bingImgUrl])

    useEffect(() => {
        if (genImgUrl) {
            setImgPath(genImgUrl);
        } else {
            setImgPath(item.imgPath);
        }
        setIsGenLoading(false);
    }, [genImgUrl])

    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalCloseButton />
                    <ModalBody mt={30}>
                        <Image
                            maxW='100%'
                            maxH='100%'
                            src={imgPath ? imgPath : ""}
                            borderRadius='lg'
                            objectFit='cover'
                        />
                    </ModalBody>
                    <ModalFooter justifyContent={"space-between"}>
                        <Text as='b'>{item.title}</Text>
                        <Flex>
                            <IconButton
                                variant='ghost'
                                colorScheme='twitter'
                                aria-label='Save'
                                size='sm'
                                icon={<VscSaveAll />}
                                onClick={() => { handleImageUpdate(item.id) }}
                            />
                            <IconButton
                                ml={2}
                                variant='ghost'
                                colorScheme='twitter'
                                aria-label='Search'
                                size='sm'
                                icon={<MdOutlineYoutubeSearchedFor />}
                                onClick={() => { handleImageSearch() }}
                            />
                            <Button
                                isLoading={isGenLoading}
                                borderRadius='8px'
                                variant='ghost'
                                colorScheme='twitter'
                                aria-label='CreatePainting'
                                size='sm'
                                rightIcon={<FaPaintBrush />}
                                onClick={() => { handleImageGenerate() }}
                            />
                        </Flex>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    )
}

export default BasicImageModal;