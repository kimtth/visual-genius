import type { NextPage } from "next";
import { Box, Button, IconButton, Image, Text, NumberDecrementStepper, NumberIncrementStepper, NumberInput, NumberInputField, NumberInputStepper, Switch, Textarea, VStack } from "@chakra-ui/react";
import styles from "./sidepanel.module.css";
import { GrFormEdit } from "react-icons/gr";
import { HiChevronLeft, HiOutlineTrash } from "react-icons/hi";
import { LiaShareSquareSolid, LiaDownloadSolid, LiaPrintSolid } from "react-icons/lia";
import { VscSaveAll } from "react-icons/vsc";
import { useState } from "react";

const NewSidePanel: NextPage = () => {
    const [captionToggle, setCaptionToggle] = useState(true);

    return (
        <>
            <VStack position={'fixed'} top={'50px'} left={'3px'} width={'20vw'} padding={'5px'} alignItems="left">
                <Box display="flex" alignItems="center" paddingLeft={'5px'}>
                    <Text fontWeight='bold' fontSize='2xl'>Patterns</Text>
                    <IconButton aria-label='Edit'
                        variant="ghost"
                        colorScheme='gray'
                        icon={<GrFormEdit />} />
                </Box>
                <Box display="flex" alignItems="center">
                    <IconButton aria-label='Back'
                        variant="ghost"
                        colorScheme='gray'
                        icon={<HiChevronLeft />} />
                    <Text fontWeight='bold' fontSize='md'>Back</Text>
                </Box>
                <Box>
                    <Text padding={'5px'} fontWeight='bold' fontSize='sm'>Prompts</Text>
                    <Textarea
                        margin={'5px'} 
                        placeholder='Hint text'
                        minHeight={"30vh"}
                        variant={'filled'}
                        resize="none" />
                </Box>
                {/* Number of cards */}
                <Box>
                    <Text padding={'5px'} fontWeight='bold' fontSize='sm'>Number of cards</Text>
                    <Box>
                        <NumberInput size='sm' min={1} defaultValue={1}>
                            <NumberInputField />
                            <NumberInputStepper>
                                <NumberIncrementStepper />
                                <NumberDecrementStepper />
                            </NumberInputStepper>
                        </NumberInput>
                    </Box>
                </Box>
                {/* Number of cards */}
                {/* Toggle */}
                <Box display="flex" alignItems="center">
                    <Text padding={'5px'} fontWeight='bold' fontSize='sm' marginRight="8vw">Caption</Text>
                    <Switch size='md' isChecked={captionToggle} onChange={() => setCaptionToggle(!captionToggle)} overflow={"auto"}/>
                </Box>
                {/* Toggle */}
                {/* Grid Size */}
                <Box>
                    <Box>
                        <Text padding={'5px'} fontWeight='bold' fontSize='sm'>Grid size</Text>
                    </Box>
                    <Box display="flex" alignItems="center">
                        <Box>
                            <NumberInput size='sm' min={1} defaultValue={1}>
                                <NumberInputField />
                                <NumberInputStepper>
                                    <NumberIncrementStepper />
                                    <NumberDecrementStepper />
                                </NumberInputStepper>
                            </NumberInput>
                        </Box>
                        <Image alt="" src="/dismiss.svg" />
                        <Box>
                            <NumberInput size='sm' min={1} defaultValue={1}>
                                <NumberInputField />
                                <NumberInputStepper>
                                    <NumberIncrementStepper />
                                    <NumberDecrementStepper />
                                </NumberInputStepper>
                            </NumberInput>
                        </Box>
                    </Box>
                </Box>
                {/* Grid Size */}
                {/* Icon Button */}
                <Box padding={'2vh'}>
                    <Button colorScheme='messenger' size='sm' width='95%'>
                        Generate
                    </Button>
                </Box>
                <Box display="flex" alignItems="center" position={'fixed'} bottom={0}>
                    <Box marginRight="10rem">
                        <IconButton aria-label='Delete'
                            variant="ghost"
                            colorScheme='red'
                            icon={<HiOutlineTrash />} />
                    </Box>
                    <Box>
                        <IconButton aria-label='Share'
                            variant="ghost"
                            colorScheme='blue'
                            icon={<VscSaveAll/>} />
                        <IconButton aria-label='Share'
                            variant="ghost"
                            colorScheme='blue'
                            icon={<LiaShareSquareSolid />} />
                        <IconButton aria-label='Download'
                            variant="ghost"
                            colorScheme='blue'
                            icon={<LiaDownloadSolid />} />
                        <IconButton aria-label='Print'
                            variant="ghost"
                            colorScheme='blue'
                            icon={<LiaPrintSolid />} />
                    </Box>
                </Box>
                {/* Icon Button */}
            </VStack>
        </>
    )
}

export default NewSidePanel;