import type { NextPage } from "next";
import { Box, Button, IconButton, Image, Text, NumberDecrementStepper, NumberIncrementStepper, NumberInput, NumberInputField, NumberInputStepper, Switch, Textarea, VStack, Editable, EditableInput, EditablePreview, Alert, AlertDescription, AlertIcon } from "@chakra-ui/react";
import { PiCursorClickLight } from "react-icons/pi";
import { HiChevronLeft, HiOutlineTrash } from "react-icons/hi";
import { LiaShareSquareSolid, LiaDownloadSolid, LiaPrintSolid } from "react-icons/lia";
import { VscSaveAll } from "react-icons/vsc";
import { FC, MouseEvent, use, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useRouter as usePath } from 'next/router';
import BasicModal from "../dialog/modal";
import { pathes } from "../../components/state/pathes";
import { useDispatch, useSelector } from "react-redux";
import { setColumnNumber, setImageNumber, setRowNumber, showGenButton, showImgCaption, showTextSpeech } from "../state/settings";
import { setCategoryData, setImageDataPayload } from "../state/datas";
import useAxios from "axios-hooks";
import { API_ENDPOINT } from "../state/const";
import { arrangeDataToColumns } from "../data/dataHandler";
import { downloadZip, executeShareUrl } from "../util/actionUtil";


interface AlertPopupProps {
    message: string;
}

const AlertPopup: FC<AlertPopupProps> = ({ message }) => {

    return (
        <Alert status='warning' justifyContent={"center"}>
            <AlertIcon />
            <AlertDescription>{message}</AlertDescription>
        </Alert>
    )
}

const NewSidePanel: NextPage = () => {
    const { push, refresh } = useRouter();
    const router = usePath();
    const [prompts, setPrompts] = useState("");
    const [genTriggerd, setGenTriggered] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [modalTitle, setModalTitle] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [categoryTitle, setCategoryTitle] = useState("New Category");
    const [modalMessageType, setModalMessageType] = useState("");
    const [alertMessage, setAlertMessage] = useState("");

    const dataPayload = useSelector((state: any) => state.datas.ImageDataPayload);
    const imageNumber = useSelector((state: any) => state.settings.setImageNumber);
    const imgCaption = useSelector((state: any) => state.settings.showImgCaption);
    const showGenButtonVar = useSelector((state: any) => state.settings.showGenButton);
    const categoryData = useSelector((state: any) => state.datas.CategoryData);
    const textSpeech = useSelector((state: any) => state.settings.showTextSpeech);
    const rowNumber = useSelector((state: any) => state.settings.setRowNumber);
    const columnNumber = useSelector((state: any) => state.settings.setColumnNumber);
    const dispatch = useDispatch();

    const [{ data, loading, error }, refetch] = useAxios({
        url: `${API_ENDPOINT}/gen_img_list/${prompts}`,
        method: 'GET'
    }, { manual: true }
    );
    const [{ data: categoryFetchedData, loading: categoryLoading, error: categoryError }, getCategoryData] = useAxios(
        `${API_ENDPOINT}/category/${categoryId}`, { manual: true }
    );
    const [{ data: postData, loading: postLoading, error: postError }, executePost] = useAxios(
        {
            url: `${API_ENDPOINT}/category`,
            method: 'POST'
        },
        { manual: true }
    )
    const [{ data: putData, loading: putLoading, error: putError }, executePut] = useAxios(
        {
            url: `${API_ENDPOINT}/category/${categoryData.id}`,
            method: 'PUT'
        },
        { manual: true }
    )
    const [{ data: downloadData, loading: downloadLoading, error: downloadError }, executeDownload] = useAxios(
        {
            url: `${API_ENDPOINT}/category/${categoryData.id}/download`,
            method: 'GET',
            responseType: 'blob'
        },
        { manual: true }
    )
    const [{ data: deleteData, loading: deleteLoading, error: deleteError }, executeDelete] = useAxios(
        {
            url: `${API_ENDPOINT}/category/${categoryData.id}/delete`,
            method: 'PUT'
        },
        { manual: true }
    )

    const onSetImageNumber = useCallback(
        (any: any) => dispatch(setImageNumber(any)),
        [dispatch]
    );
    const onShowImgCaption = useCallback(
        (any: any) => dispatch(showImgCaption(any)),
        [dispatch]
    );
    const onShowGenButton = useCallback(
        (any: any) => dispatch(showGenButton(any)),
        [dispatch]
    );
    const onShowTextSpeech = useCallback(
        (any: any) => dispatch(showTextSpeech(any)),
        [dispatch]
    );
    const onSetRowNumber = useCallback(
        (any: any) => dispatch(setRowNumber(any)),
        [dispatch]
    );
    const onSetColumnNumber = useCallback(
        (any: any) => dispatch(setColumnNumber(any)),
        [dispatch]
    );
    const onCategoryData = useCallback(
        (any: any) => dispatch(setCategoryData(any)),
        [dispatch]
    );
    const onDataPayload = useCallback(
        (any: any) => dispatch(setImageDataPayload(any)),
        [dispatch]
    );

    const onSetImageColRowNumber = (totalImgNum: number, rowNum: number, columnNumber: number) => {
        onSetImageNumber(totalImgNum > 0 ? totalImgNum : 1);
        onSetRowNumber(rowNum > 0 ? rowNum : 1);
        onSetColumnNumber(columnNumber > 0 ? columnNumber : 5);
        //console.log(totalImgNum, rowNum, columnNumber);
    }

    useEffect(() => {
        downloadZip(downloadData);
    }, [downloadData]);

    useEffect(() => {
        if (Object.keys(categoryData).length === 0) {
            const currentURL = router.asPath;
            const urlParams = new URLSearchParams(currentURL.split('?')[1]);
            const categoryId = urlParams.get('categoryId');

            if (categoryId) {
                setCategoryId(categoryId);
            }
        }
    }, [categoryData]);

    useEffect(() => {
        if (categoryId) {
            getCategoryData();
        }
        if (categoryFetchedData) {
            onCategoryData(categoryFetchedData);
            setCategoryTitle(categoryFetchedData.title);
        }
    }, [categoryId, categoryFetchedData]);

    useEffect(() => {
        if (data) {
            //console.log(data);
            const arrangedData = arrangeDataToColumns(data, columnNumber,
                // callback function
                (totalImgNum: number, rowNum: number, columnNumber: number) => {
                    onSetImageColRowNumber(totalImgNum, rowNum, columnNumber)
                }
            );
            onDataPayload(arrangedData);
            setGenTriggered(false);
            onShowGenButton(false);
        }
    }, [data]);

    const handleGenRequest = () => {
        if (!prompts) {
            setAlertMessage("Prompts cannot be empty!");
            handleAlert(true);
        } else {
            try {
                refetch();
            } catch (error) {
                alert(error);
                console.error(error);
            } finally {
                setGenTriggered(true);
            }
        }
    }

    const handleTitleChange = (newTitle: string) => {
        setCategoryTitle(newTitle);
    }

    const handleUpdateRequest = () => {
        try {
            if (Object.keys(categoryData).length !== 0) {
                executePut({
                    data: {
                        ...categoryData,
                        title: categoryTitle
                    }
                })
            }
        } catch (error) {
            alert(error);
            console.error(error);
        }
    }

    const handleAlert = (showAlert: boolean) => {
        setShowAlert(showAlert);

        setTimeout(() => {
            setShowAlert(false);
        }, 2000);
    }

    const handleAddPhoto = () => {
        push(pathes.rtn);
    }

    const handleImageRearrange = (e: MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        // console.log(categoryData);
        // console.log(dataPayload);
        if (columnNumber > 6) {
            alert("Grid size is too big! (max.6)");
            handleAlert(true);
        } else {
            const rowNum = Math.ceil(imageNumber / columnNumber);
            onSetRowNumber(rowNum);
            onSetColumnNumber(columnNumber);
            const flatData = Object.values(dataPayload).flatMap((obj: any) => obj.items);
            const arrangedData = arrangeDataToColumns(flatData, columnNumber,
                // callback function
                (totalImgNum: number, rowNum: number, columnNumber: number) => {
                    onSetImageColRowNumber(totalImgNum, rowNum, columnNumber)
                }
            );
            onDataPayload(arrangedData);
        }
    }

    const handlePostCategory = () => {
        try {
            if (Object.keys(categoryData).length === 0) {
                if (!dataPayload){
                    alert("Please generate the category first!")
                    return;
                }
                const flatData = Object.values(dataPayload).flatMap((obj: any) => obj.items);
                const newCategoryId = flatData[0].categoryId;
                const newCategory = {
                    id: newCategoryId,
                    title: categoryTitle,
                    category: "Object Recognition",
                    difficulty: "Medium",
                    imgNum: imageNumber,
                    contentUrl: []
                }
                executePost({    
                data: {
                    category: newCategory,
                    images: flatData
                }})
            } else {
                alert("The category already exists!")
            }
            onShowGenButton(false);
        } catch (error) {
            alert(error);
            console.error(error);
        }
    }

    const handleModal = (modalTitle: string, modalMessageType: string) => {
        setModalTitle(modalTitle);
        setModalMessageType(modalMessageType);
        setShowModal(true);
    }

    const handleCallback = () => {
        try {
            if (modalMessageType === 'delete') {
                executeDelete();
                alert('The category has been deleted.');
            } else if (modalMessageType === 'save') {
                handlePostCategory();
            } else if (modalMessageType === 'share') {
                executeShareUrl(categoryData.id);
            } else if (modalMessageType === 'download') {
                executeDownload();
                alert(deleteData);
            } else if (modalMessageType === 'print') {
                alert('Under construction');
            } else {
                console.log('The event is not supported.');
            }
        } catch (error) {
            console.error(error);
        }
    }

    // if (loading) return <p>Loading...</p>;
    if (error || putError) return <p>Error!</p>;

    return (
        <>
            {showAlert ?
                <>
                    <AlertPopup message={alertMessage} />
                </>
                : null
            }
            {showModal ?
                <>
                    <BasicModal
                        open={showModal}
                        setOpen={setShowModal}
                        title={modalTitle}
                        messageType={modalMessageType}
                        callback={handleCallback}
                    />
                </> : null
            }
            <VStack position={'fixed'} top={'50px'} left={'3px'} width={'20vw'} padding={'5px'} alignItems="left">
                <Box display="flex" alignItems="center" paddingLeft={'5px'}>
                    <Editable
                        defaultValue={categoryData.title ? categoryData.title : categoryTitle}
                        fontWeight='bold'
                        fontSize='2xl'
                        onChange={(value) => { handleTitleChange(value) }}
                        onSubmit={() => handleUpdateRequest()}
                    >
                        <EditablePreview />
                        <EditableInput />
                    </Editable>
                    <PiCursorClickLight />
                </Box>
                <Box display="flex" alignItems="center">
                    <IconButton aria-label='Back to Home'
                        variant="ghost"
                        colorScheme='gray'
                        icon={<HiChevronLeft />}
                        onClick={() => { push(pathes.home) }}
                    />
                    <Text fontWeight='bold' fontSize='md'>Back to Home</Text>
                </Box>
                <Box>
                    <Text padding={'5px'} fontWeight='bold' fontSize='sm'>Prompts</Text>
                    <Textarea
                        margin={'5px'}
                        placeholder='Hint'
                        minHeight={"30vh"}
                        variant={'filled'}
                        resize="none"
                        value={prompts}
                        onChange={(e) => { setPrompts(e.target.value) }}
                    />
                </Box>
                {/* Number of cards */}
                <Box>
                    <Text padding={'5px'} fontWeight='bold' fontSize='sm'>Number of cards</Text>
                    <Box>
                        <NumberInput
                            size='sm'
                            min={1}
                            max={30}
                            value={imageNumber}
                            defaultValue={1}
                            isReadOnly={true}
                        >
                            <NumberInputField />
                        </NumberInput>
                    </Box>
                </Box>
                {/* Number of cards */}
                {/* Toggle */}
                <Box display="flex" alignItems="center" justifyContent={"space-between"}>
                    <Text padding={'5px'} fontWeight='bold' fontSize='sm'>Caption</Text>
                    <Switch size='md'
                        isChecked={imgCaption}
                        onChange={() => onShowImgCaption(!imgCaption)}
                        overflow={"auto"}
                    />
                </Box>
                <Box display="flex" alignItems="center" justifyContent={"space-between"}>
                    <Text padding={'5px'} fontWeight='bold' fontSize='sm'>Text to Speech</Text>
                    <Switch size='md'
                        isChecked={textSpeech}
                        onChange={() => onShowTextSpeech(!textSpeech)}
                        overflow={"auto"}
                    />
                </Box>
                {/* Toggle */}
                {/* Grid Size */}
                <Box>
                    <Box>
                        <Text padding={'5px'} fontWeight='bold' fontSize='sm'>Grid size</Text>
                    </Box>
                    <Box display="flex" alignItems="center">
                        <Box>
                            <NumberInput
                                size='sm'
                                min={1}
                                defaultValue={1}
                                value={rowNumber}
                                isReadOnly={true}
                            >
                                <NumberInputField />
                            </NumberInput>
                        </Box>
                        <Image alt="" src="/dismiss.svg" />
                        <Box>
                            <NumberInput
                                size='sm'
                                min={1}
                                max={6}
                                defaultValue={1}
                                value={columnNumber}
                            >
                                <NumberInputField />
                                <NumberInputStepper>
                                    <NumberIncrementStepper
                                        onClick={() => { onSetColumnNumber(columnNumber + 1) }}
                                    />
                                    <NumberDecrementStepper
                                        onClick={() => { onSetColumnNumber(columnNumber - 1) }}
                                    />
                                </NumberInputStepper>
                            </NumberInput>
                        </Box>
                    </Box>
                </Box>
                {/* Grid Size */}
                {/* Icon Button */}
                <Box padding={'2vh'}>
                    <Button
                        isLoading={genTriggerd}
                        colorScheme='messenger'
                        size='sm'
                        width='95%'
                        marginBottom='2px'
                        isDisabled={showGenButtonVar}
                        onClick={() => { handleGenRequest() }}
                    >
                        Generate
                    </Button>
                    <Button colorScheme='twitter'
                        size='sm'
                        width='95%'
                        variant="outline"
                        marginBottom='2px'
                        onClick={() => { handleAddPhoto() }}
                    >
                        Add my own photos
                    </Button>
                    <Button colorScheme='whatsapp'
                        size='sm'
                        width='95%'
                        variant="outline"
                        marginBottom='2px'
                        onClick={(e) => { handleImageRearrange(e) }}
                    >
                        Rearrange cards
                    </Button>
                </Box>
                <Box display="flex" position={'fixed'} bottom={0}>
                    <Box marginRight="9vw">
                        <IconButton aria-label='Delete'
                            variant="ghost"
                            colorScheme='red'
                            icon={<HiOutlineTrash />}
                            onClick={() => { handleModal('Delete', 'delete') }}
                        />
                    </Box>
                    <Box>
                        <IconButton aria-label='Save'
                            isLoading={postLoading}
                            variant="ghost"
                            colorScheme='blue'
                            icon={<VscSaveAll />}
                            onClick={() => { handleModal('Save', 'save') }}
                        />
                        <IconButton aria-label='Share'
                            variant="ghost"
                            colorScheme='blue'
                            icon={<LiaShareSquareSolid />}
                            onClick={() => { handleModal('Share', 'share') }}
                        />
                        <IconButton aria-label='Download'
                            isLoading={downloadLoading}
                            variant="ghost"
                            colorScheme='blue'
                            icon={<LiaDownloadSolid />}
                            onClick={() => { handleModal('Download', 'download') }}
                        />
                        {/* <IconButton aria-label='Print'
                            variant="ghost"
                            colorScheme='blue'
                            icon={<LiaPrintSolid />}
                            onClick={() => { handleModal('Print', 'print') }}
                        /> */}
                    </Box>
                </Box>
                {/* Icon Button */}
            </VStack >
        </>
    )
}

export default NewSidePanel;