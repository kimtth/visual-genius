import type { NextPage } from "next";
import { Box, Button, IconButton, Text, NumberDecrementStepper, NumberIncrementStepper, NumberInput, NumberInputField, NumberInputStepper, Switch, Textarea, VStack, Editable, EditableInput, EditablePreview, Alert, AlertDescription, AlertIcon, Select, Flex, ButtonGroup, Menu, MenuButton, MenuItem, MenuList, MenuOptionGroup } from "@chakra-ui/react";
import { PiCursorClickLight } from "react-icons/pi";
import { HiChevronLeft, HiOutlineTrash } from "react-icons/hi";
import { LiaShareSquareSolid, LiaDownloadSolid } from "react-icons/lia";
import { BiSort, BiImageAdd } from "react-icons/bi";
import { GoHistory } from "react-icons/go";
import { MdPlaylistRemove } from "react-icons/md";
import { RiAiGenerate } from "react-icons/ri";
import { TbNumbers, TbVideo } from "react-icons/tb";
import { VscSaveAll } from "react-icons/vsc";
import { ChangeEvent, FC, MouseEvent, useCallback, useEffect, useState } from "react";
import { useRouter as usePath, useRouter } from 'next/router';
import BasicModal from "../imgcard/basicModal";
import { pathes } from "../../components/state/pathes";
import { useDispatch, useSelector } from "react-redux";
import { setColumnNumber, setImageNumber, setRowNumber, showImgCaption, showNumbering, showTextSpeech } from "../state/settings";
import { setCategoryData, setImageDataPayload } from "../state/datas";
import useAxios from "axios-hooks";
import { API_ENDPOINT } from "../state/const";
import { arrangeDataToColumns } from "../data/dataHandler";
import { downloadZip, executeShareUrl } from "../util/actionUtil";
import Axios from "axios";
import { HamburgerIcon, AddIcon, ExternalLinkIcon, RepeatIcon, EditIcon, DeleteIcon } from "@chakra-ui/icons";


interface AlertPopupProps {
    message: string;
}

interface NewSidePanelProps {
    disableGenButton: boolean;
    setDisableGenButton: (disableGenButton: boolean) => void;
}

const AlertPopup: FC<AlertPopupProps> = ({ message }) => {

    return (
        <Alert status='warning' justifyContent={"center"}>
            <AlertIcon />
            <AlertDescription>{message}</AlertDescription>
        </Alert>
    )
}

const NewSidePanel: NextPage<NewSidePanelProps> = ({ disableGenButton, setDisableGenButton }) => {
    const { push } = useRouter();
    const router = usePath();
    const [prompts, setPrompts] = useState("");
    const [genTriggerd, setGenTriggered] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [modalTitle, setModalTitle] = useState("");
    const [categoryIdState, setCategoryId] = useState("");
    const [categoryTitle, setCategoryTitle] = useState("New Category");
    const [modalMessageType, setModalMessageType] = useState("");
    const [alertMessage, setAlertMessage] = useState("");
    const [showNumberingSt, setShowNumberingSt] = useState(false);
    const [searchHistoryList, setSearchHistoryList] = useState<string[]>([]);
    const [mode, setMode] = useState("list");
    const [persona, setPersona] = useState("any");

    const dataPayload = useSelector((state: any) => state.datas.ImageDataPayload);
    const imageNumber = useSelector((state: any) => state.settings.setImageNumber);
    const imgCaption = useSelector((state: any) => state.settings.showImgCaption);
    const categoryData = useSelector((state: any) => state.datas.CategoryData);
    const imageData = useSelector((state: any) => state.datas.ImageDataPayload);
    const textSpeech = useSelector((state: any) => state.settings.showTextSpeech);
    const rowNumber = useSelector((state: any) => state.settings.setRowNumber);
    const columnNumber = useSelector((state: any) => state.settings.setColumnNumber);
    const dispatch = useDispatch();

    const [{ data, loading, error }, refetch] = useAxios({
        url: `${API_ENDPOINT}/gen_img_list/${prompts}?mode=${mode}&persona=${persona}`,
        method: 'GET'
    }, { manual: true, autoCancel: false }
    );
    const [{ data: postData, loading: postLoading, error: postError }, executePost] = useAxios(
        {
            url: `${API_ENDPOINT}/category`,
            method: 'POST'
        },
        { manual: true, autoCancel: false }
    )
    const [{ data: putData, loading: putLoading, error: putError }, executePut] = useAxios(
        {
            url: `${API_ENDPOINT}/category/${categoryData.sid}`,
            method: 'PUT'
        },
        { manual: true, autoCancel: false }
    )
    const [{ data: downloadData, loading: downloadLoading, error: downloadError }, executeDownload] = useAxios(
        {
            url: `${API_ENDPOINT}/category/${categoryData.sid}/download`,
            method: 'GET',
            responseType: 'blob'
        },
        { manual: true, autoCancel: false }
    )
    const [{ data: deleteData, loading: deleteLoading, error: deleteError }, executeDelete] = useAxios(
        {
            url: `${API_ENDPOINT}/category/${categoryData.sid}/delete`,
            method: 'PUT'
        },
        { manual: true, autoCancel: false }
    )

    const onSetImageNumber = useCallback(
        (any: any) => dispatch(setImageNumber(any)),
        [dispatch]
    );
    const onShowImgCaption = useCallback(
        (any: any) => dispatch(showImgCaption(any)),
        [dispatch]
    );
    const onShowTextSpeech = useCallback(
        (any: any) => dispatch(showTextSpeech(any)),
        [dispatch]
    );
    const onShowNumbering = useCallback(
        (any: any) => dispatch(showNumbering(any)),
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
        if (router.isReady) {
            const { categoryId } = router.query;
            setCategoryId(categoryId as string);
            if (categoryIdState) {
                Axios.get(`${API_ENDPOINT}/category/${categoryId}`).then((result: any) => {
                    const data = result.data;
                    onCategoryData(data);
                    setCategoryTitle(data.title);
                    if (data && Object.keys(data).length !== 0) {
                        setDisableGenButton(true);
                    }
                }).catch((error: any) => {
                    console.log(error);
                });
            }
        }
    }, [router.isReady, router.query, categoryIdState]);

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
        }
    }, [data]);

    const handleGenRequest = () => {
        if (!prompts) {
            alert("Prompts cannot be empty!");
            //handleAlert(true);
        } else {
            try {
                refetch();
            } catch (error) {
                alert(error);
                console.error(error);
            } finally {
                setGenTriggered(true);
                const searchHistory = localStorage.getItem('searchHistory');
                const searchHistoryList = searchHistory ? JSON.parse(searchHistory) : [];

                if (!searchHistoryList.includes(prompts)) {
                    searchHistoryList.push(prompts);
                    localStorage.setItem('searchHistory', JSON.stringify(searchHistoryList));
                    console.log('The search history has been saved.');
                } else {
                    console.log('The same text already exists in the list');
                }
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
        //window.location.href = `${pathes.rtn}`;
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
                if (!dataPayload) {
                    alert("Please generate the category first!")
                    return;
                }
                const flatData = Object.values(dataPayload).flatMap((obj: any) => obj.items);
                const newCategoryId = flatData[0].categoryId;
                const newCategory = {
                    sid: newCategoryId,
                    title: categoryTitle,
                    category: "Object Recognition", //TODO: change to dynamic
                    difficulty: "Medium",  //TODO: change to dynamic
                    imgNum: imageNumber,
                    //contentUrl: []
                }
                console.log(newCategory);
                executePost({
                    data: {
                        category: newCategory,
                        images: flatData
                    }
                })
            } else {
                alert("The category already exists!")
            }
            setDisableGenButton(true);
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
                executeShareUrl(categoryData.sid);
            } else if (modalMessageType === 'download') {
                executeDownload();
            } else if (modalMessageType === 'print') {
                alert('Under construction');
            } else {
                console.log('The event is not supported.');
            }
        } catch (error) {
            console.error(error);
        }
    }

    const handleMoveHome = () => {
        window.location.href = `${pathes.home}`;
    }

    const handleModeSelect = (e: ChangeEvent<HTMLSelectElement>) => {
        setMode(e.target.value);
    }

    const handlePersonaSelect = (e: ChangeEvent<HTMLSelectElement>) => {
        setPersona(e.target.value);
    }

    const handleShowhHistory = (e: MouseEvent<HTMLButtonElement>) => {
        const searchHistory = localStorage.getItem('searchHistory');
        if (searchHistory) {
            const searchHistoryList = JSON.parse(searchHistory);
            setSearchHistoryList(searchHistoryList);
        }
    }

    const handleDeleteSearchHistory = (item: string) => {
        const updatedList = searchHistoryList.filter((historyItem: string) => historyItem !== item);
        setSearchHistoryList(updatedList);
        localStorage.setItem('searchHistory', JSON.stringify(updatedList));
    }

    const handleMotionRendering = () => {
        console.log(imageData);
        let newItems: any = [];
        for (const key in imageData) {
            const items = imageData[key].items;
            for (const item of items) {
                const { sid, imgPath, title } = item;
                const newItem = { imgPath, title };
                newItems.push(newItem);
            }
        }
        const duration = newItems.length > 1 ? newItems.length * 50 : 200;
        localStorage.setItem('Images', JSON.stringify(newItems));
        localStorage.setItem('duration', JSON.stringify(duration));
        window.open('/motion', '_blank');
    }

    // if (loading) return <p>Loading...</p>;
    if (error || putError) return <p>Error!</p>;

    return (
        <>
            {showAlert ? // Change the alert to toast
                <>
                    <AlertPopup message={alertMessage} />
                </>
                : null
            }
            {

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
                        value={categoryTitle}
                        fontWeight='bold'
                        fontSize='2xl'
                        onChange={(value: string) => { handleTitleChange(value) }}
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
                        onClick={() => { handleMoveHome() }}
                    />
                    <Text fontWeight='bold' fontSize='md'>Back to Home</Text>
                </Box>
                <Box>
                    <Flex ml={2}>
                        <Text fontWeight='bold' fontSize='sm' mr={1} width='30%'>Persona</Text>
                        <Select
                            placeholder='Select option'
                            size='xs'
                            onChange={(e) => { handlePersonaSelect(e) }}
                            maxWidth={'60%'}
                            defaultValue={'any'}
                        >
                            <option value='parent'>Parent/care giver</option>
                            <option value='child'>Child</option>
                            <option value='any'>Any</option>
                        </Select>
                    </Flex>
                </Box>
                <Box>
                    <Flex ml={2}>
                        <Text fontWeight='bold' fontSize='sm' mr={1} width='30%'>Mode</Text>
                        <Select
                            placeholder='Select option'
                            size='xs'
                            onChange={(e) => { handleModeSelect(e) }}
                            maxWidth={'60%'}
                            defaultValue={'list'}
                        >
                            <option value='list'>Generate List</option>
                            <option value='step'>Generate Steps</option>
                            <option value='explicit'>Explicit (Newline seperated)</option>
                        </Select>
                    </Flex>
                </Box>
                <Box>
                    <Flex>
                        <Text padding={'5px'} fontWeight='bold' fontSize='sm'>Prompts</Text>
                        <Menu>
                            <MenuButton
                                as={IconButton}
                                aria-label='History'
                                icon={<GoHistory />}
                                size='xs' onClick={handleShowhHistory}
                                isRound
                            />
                            <MenuList>
                                <MenuOptionGroup title='Search History' type='radio'>
                                    {searchHistoryList.map((item: string, index: number) => {
                                        return (
                                            <MenuItem
                                                key={index}
                                                maxW={'20vw'}
                                                fontSize={'xs'}
                                            >
                                                <Text onClick={() => { setPrompts(item) }}>{item}</Text>
                                                <IconButton
                                                    aria-label={'history-remove'}
                                                    size={'xs'}
                                                    icon={<DeleteIcon />}
                                                    onClick={() => { handleDeleteSearchHistory(item) }}
                                                />
                                            </MenuItem>
                                        )
                                    })}
                                </MenuOptionGroup>
                            </MenuList>
                        </Menu>
                    </Flex>
                    <Textarea
                        margin={'5px'}
                        placeholder='Hint'
                        minHeight={"30vh"}
                        variant={'filled'}
                        resize="none"
                        value={prompts}
                        onChange={(e: any) => { setPrompts(e.target.value) }}
                    />
                </Box>
                {/* Number of cards */}
                {/* <Box>
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
                </Box> */}
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
                <Box margin={2} overflow={"auto"} textAlign={"center"}>
                    <Button
                        isLoading={genTriggerd}
                        leftIcon={<RiAiGenerate />}
                        colorScheme='messenger'
                        size='sm'
                        width='95%'
                        marginBottom={1}
                        isDisabled={disableGenButton}
                        onClick={() => { handleGenRequest() }}
                    >
                        Generate Cards
                    </Button>
                    <Button colorScheme='twitter'
                        leftIcon={<BiImageAdd />}
                        size='sm'
                        width='95%'
                        variant="outline"
                        marginBottom={1}
                        onClick={() => { handleAddPhoto() }}
                    >
                        Add my own photos
                    </Button>
                    <ButtonGroup>
                        <Button
                            colorScheme='teal'
                            leftIcon={<BiSort />}
                            size='xs'
                            marginBottom={1}
                            onClick={(e) => { handleImageRearrange(e) }}
                        >
                            Rearrange
                        </Button>
                        <Button
                            colorScheme='teal'
                            leftIcon={<TbNumbers />}
                            size='xs'
                            marginBottom={1}
                            onClick={() => { onShowNumbering(!showNumberingSt) }}
                        >
                            Number
                        </Button>
                        <Button
                            colorScheme='twitter'
                            leftIcon={<TbVideo />}
                            size='xs'
                            marginBottom={1}
                            onClick={() => { handleMotionRendering() }}
                        >
                            Motion
                        </Button>
                    </ButtonGroup>
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