import { Box, Text, Image, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, useDisclosure } from "@chakra-ui/react"
import { NextPage } from "next";


interface BasicImageModalProps {
    title: string;
    imgPath: string;
    isOpen: boolean;
    onClose: () => void;
}

const BasicImageModal: NextPage<BasicImageModalProps> = ({ title, imgPath, isOpen, onClose }) => {

    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    {/* <ModalHeader>{title}</ModalHeader> */}
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
                    <ModalFooter justifyContent={"left"}>
                        <Text as='b'>{title}</Text>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    )
}

export default BasicImageModal;