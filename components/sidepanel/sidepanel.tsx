import type { NextPage } from "next";
import { Box, Button, IconButton, Image, Text, NumberDecrementStepper, NumberIncrementStepper, NumberInput, NumberInputField, NumberInputStepper, Switch, Textarea, VStack, Editable, EditableInput, EditablePreview, Alert, AlertDescription, AlertIcon } from "@chakra-ui/react";
import { GrFormEdit } from "react-icons/gr";
import { HiChevronLeft, HiOutlineTrash } from "react-icons/hi";
import { LiaShareSquareSolid, LiaDownloadSolid, LiaPrintSolid } from "react-icons/lia";
import { VscSaveAll } from "react-icons/vsc";
import { FC, useState } from "react";
import { useRouter } from "next/navigation";
import BasicModal from "../dialog/modal";
import { pathes } from "../../components/state/pathes";


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
    const { push } = useRouter();
    const [captionToggle, setCaptionToggle] = useState(true);
    const [showAlert, setShowAlert] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [modalTitle, setModalTitle] = useState("");
    const [modalMessageType, setModalMessageType] = useState("");

    const [alertMessage, setAlertMessage] = useState("");
    const [prompts, setPrompts] = useState("");
    const [title, setTitle] = useState("Patterns");

    const [numCard, setNumCard] = useState(1); // number of cards
    const [rowNumCard, setRowNumCard] = useState(1); // number of cards per row
    const [colNumCard, setColNumCard] = useState(1); // number of cards per column

    const handleAlert = (showAlert: boolean) => {
        setShowAlert(showAlert);

        setTimeout(() => {
            setShowAlert(false);
        }, 2000);
    }

    const handleModal = (modalTitle: string, modalMessageType: string) => {
        setModalTitle(modalTitle);
        setModalMessageType(modalMessageType);

        setShowModal(true);
    }

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
                    <BasicModal open={showModal} setOpen={setShowModal} title={modalTitle} messageType={modalMessageType} />
                </> : null
            }
            <VStack position={'fixed'} top={'50px'} left={'3px'} width={'20vw'} padding={'5px'} alignItems="left">
                <Box display="flex" alignItems="center" paddingLeft={'5px'}>
                    <Editable
                        defaultValue={title}
                        fontWeight='bold'
                        fontSize='2xl'
                    >
                        <EditablePreview />
                        <EditableInput />
                    </Editable>
                    <IconButton aria-label='Edit'
                        variant="ghost"
                        colorScheme='gray'
                        icon={<GrFormEdit />}
                    />
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
                    <Text padding={'5px'} fontWeight='bold' fontSize='sm'>Number of cards (max. 30)</Text>
                    <Box>
                        <NumberInput
                            size='sm'
                            min={1}
                            max={30}
                            value={numCard}
                            defaultValue={1}
                        >
                            <NumberInputField />
                            <NumberInputStepper>
                                <NumberIncrementStepper
                                    onClick={() => { setNumCard(numCard + 1) }}
                                />
                                <NumberDecrementStepper
                                    onClick={() => { setNumCard(numCard - 1) }}
                                />
                            </NumberInputStepper>
                        </NumberInput>
                    </Box>
                </Box>
                {/* Number of cards */}
                {/* Toggle */}
                <Box display="flex" alignItems="center" justifyContent={"space-between"}>
                    <Text padding={'5px'} fontWeight='bold' fontSize='sm'>Caption</Text>
                    <Switch size='md'
                        isChecked={captionToggle}
                        onChange={() => setCaptionToggle(!captionToggle)}
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
                                value={rowNumCard}
                            >
                                <NumberInputField />
                                <NumberInputStepper>
                                    <NumberIncrementStepper
                                        onClick={() => { setRowNumCard(rowNumCard + 1) }}
                                    />
                                    <NumberDecrementStepper
                                        onClick={() => { setRowNumCard(rowNumCard - 1) }}
                                    />
                                </NumberInputStepper>
                            </NumberInput>
                        </Box>
                        <Image alt="" src="/dismiss.svg" />
                        <Box>
                            <NumberInput
                                size='sm'
                                min={1}
                                defaultValue={1}
                                value={colNumCard}
                            >
                                <NumberInputField />
                                <NumberInputStepper>
                                    <NumberIncrementStepper
                                        onClick={() => { setColNumCard(colNumCard + 1) }}
                                    />
                                    <NumberDecrementStepper
                                        onClick={() => { setColNumCard(colNumCard - 1) }}
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
                        colorScheme='messenger'
                        size='sm'
                        width='95%'
                        marginBottom='2px'
                        onClick={() => { }}
                    >
                        Generate
                    </Button>
                    <Button colorScheme='twitter'
                        size='sm'
                        width='95%'
                        variant="outline"
                        marginBottom='2px'
                        onClick={() => { push(pathes.rtn) }}
                    >
                        Add my own photos
                    </Button>
                    <Button colorScheme='whatsapp'
                        size='sm'
                        width='95%'
                        variant="outline"
                        marginBottom='2px'
                        onClick={() => {
                            const checkNumCard = rowNumCard * colNumCard;
                            if (checkNumCard > numCard) {
                                setAlertMessage("Grid size is too big!");
                                handleAlert(true);
                            } else {
                                console.log("Grid size is okay!");
                            }
                        }}
                    >
                        Rearrange cards
                    </Button>
                </Box>
                <Box display="flex" position={'fixed'} bottom={0}>
                    <Box marginRight="5vw">
                        <IconButton aria-label='Delete'
                            variant="ghost"
                            colorScheme='red'
                            icon={<HiOutlineTrash />}
                            onClick={() => { handleModal('Delete', 'delete') }}
                        />
                    </Box>
                    <Box>
                        <IconButton aria-label='Save'
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
                            variant="ghost"
                            colorScheme='blue'
                            icon={<LiaDownloadSolid />}
                            onClick={() => { handleModal('Download', 'download') }}
                        />
                        <IconButton aria-label='Print'
                            variant="ghost"
                            colorScheme='blue'
                            icon={<LiaPrintSolid />}
                            onClick={() => { handleModal('Print', 'print') }}
                        />
                    </Box>
                </Box>
                {/* Icon Button */}
            </VStack >
        </>
    )
}

export default NewSidePanel;