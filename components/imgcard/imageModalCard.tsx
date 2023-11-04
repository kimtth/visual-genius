import { Image, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalOverlay, IconButton, Flex, Button, Editable, EditablePreview, EditableInput } from "@chakra-ui/react";
import { MdOutlineYoutubeSearchedFor } from "react-icons/md";
import { FaPaintBrush } from "react-icons/fa";
import { VscSaveAll } from "react-icons/vsc";
import useAxios from "axios-hooks";
import '../util/axiosInterceptor';
import { API_ENDPOINT } from "../state/const";
import { FC, useCallback, useEffect, useState } from "react";
import { setImageDataPayload } from "../state/datas";
import { useDispatch, useSelector } from "react-redux";
import { HiOutlineTrash } from "react-icons/hi";
import { PiCursorClickLight } from "react-icons/pi";
import { CountResponse } from "../state/type";


interface BasicImageModalProps {
    item: any;
    imgPath: string;
    isOpen: boolean;
    onClose: () => void;
}


const BasicImageModal: FC<BasicImageModalProps> = ({ item, isOpen, onClose }) => {
    const [imageTitle, setImageTitle] = useState(item.title);
    const categoryPayload = useSelector((state: any) => state.datas.CategoryData);
    const imageDataPayload = useSelector((state: any) => state.datas.ImageDataPayload);
    const [imgPath, setImgPath] = useState("");
    const [isGenLoading, setIsGenLoading] = useState(false);
    const dispatch = useDispatch();

    const [{ data: cntData, loading: cntloading, error: cntError }, cntFetch] = useAxios<CountResponse>(
        `${API_ENDPOINT}/category/${categoryPayload.sid}/exist`, { manual: true, autoCancel: false });
    const [{ data: bingImgUrl, loading: bingImgLoading, error: bingImgError }, getBingImg] = useAxios(
        {
            url: `${API_ENDPOINT}/bing_img/${imageTitle}?title=${categoryPayload.title}`,
            method: 'GET'
        }, { manual: true, autoCancel: false }
    );

    const [{ data: genImgUrl, loading: genImgLoading, error: genImgError }, getGenImg] = useAxios(
        {
            url: `${API_ENDPOINT}/gen_img/${imageTitle}`,
            method: 'GET'
        }, { manual: true, autoCancel: false }
    );

    const [{ data: updateImgUrl, loading: updateImgLoading, error: updateImgError }, updateImg] = useAxios(
        {
            url: `${API_ENDPOINT}/images/${item.sid}`,
            method: 'PUT'
        }, { manual: true, autoCancel: false }
    );

    const [{ data: deleteImgUrl, loading: deleteImgLoading, error: deleteImgError }, deleteImg] = useAxios(
        {
            url: `${API_ENDPOINT}/images/${item.sid}/delete`,
            method: 'PUT'
        }, { manual: true, autoCancel: false }
    );

    const onDataPayload = useCallback(
        (any: any) => dispatch(setImageDataPayload(any)),
        [dispatch]
    );

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

    const handleImageUpdate = async (imgId: string) => {
        const newImgPath = imgPath;
        let clonedDataPayload = JSON.parse(JSON.stringify(imageDataPayload));
        const updatedPayload = Object.values(clonedDataPayload).map((obj: any) => {
            if (obj.items) {
                obj.items = obj.items.map((item: any) => {
                    if (item.sid === imgId) {
                        return { ...item, imgPath: newImgPath, title: imageTitle };
                    }
                    return item;
                });
                return { ...obj, items: [...obj.items] };
            }
            return obj;
        });
        // Check whether the image is exist or not
        try {
            if (bingImgError) {
                alert(bingImgError);
            } else {
                const cnt = await cntFetch();
                // Wait until cntFetch() is done
                if (parseInt(cnt?.data.count) > 0) {
                    updateImg({
                        data: {
                            ...item,
                            imgPath: newImgPath,
                            title: imageTitle
                        }
                    });
                }
            }
            onDataPayload(updatedPayload);
            clonedDataPayload = null;
            onClose();
        } catch (err) {
            alert(err);
            console.error(err);
        }
    }

    const handleImageSearch = () => {
        try {
            getBingImg();
        } catch (err) {
            console.error(err);
        }
    }

    const handleImageGenerate = () => {
        try {
            setIsGenLoading(true);
            getGenImg();
        } catch (err) {
            alert("Sorry, the image generation service is not available at the moment. Please try again later.")
            console.error(err);
        }
    }

    const handleImageDelete = (imgId: string) => {
        if (confirm("Are you sure you want to delete this image?")) {
            let clonedDataPayload = JSON.parse(JSON.stringify(imageDataPayload));
            const updatedPayload = Object.values(clonedDataPayload).map((obj: any) => {
                if (obj.items) {
                    obj.items = obj.items.filter((item: any) => item.sid !== imgId);
                    return { ...obj, items: [...obj.items] };
                }
                return obj;
            });
            try {
                deleteImg({
                    data: {
                        sid: imgId
                    }
                });
                onDataPayload(updatedPayload);
                clonedDataPayload = null;
                onClose();
            } catch (err) {
                console.error(err);
            }
        }
    }

    const handleTitleChange = (newTitle: string) => {
        setImageTitle(newTitle);
    }

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
                        <Flex>
                            <Editable
                                value={imageTitle}
                                fontWeight='bold'
                                fontSize='md'
                                submitOnBlur={true}
                                onChange={(value: string) => { handleTitleChange(value) }}
                            >
                                <EditablePreview />
                                <EditableInput />
                            </Editable>
                            <PiCursorClickLight />
                        </Flex>
                        <Flex>
                            <IconButton
                                variant='ghost'
                                colorScheme='red'
                                aria-label='Delete'
                                size='sm'
                                icon={<HiOutlineTrash />}
                                onClick={() => { handleImageDelete(item.sid) }}
                            />
                            <IconButton
                                variant='ghost'
                                colorScheme='twitter'
                                aria-label='Save'
                                size='sm'
                                icon={<VscSaveAll />}
                                onClick={() => { handleImageUpdate(item.sid) }}
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