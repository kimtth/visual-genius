import { Text, Image, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalOverlay } from "@chakra-ui/react"
import { FC } from "react";
import { FALLBACK_SRC } from "../state/const";

interface SearchImageModalProps {
    title: string;
    imgPath: string;
    isOpen: boolean;
    onClose: () => void;
}

const SearchImageModal: FC<SearchImageModalProps> = ({ title, imgPath, isOpen, onClose }) => {

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
                            src={imgPath}
                            fallbackSrc={FALLBACK_SRC}
                            borderRadius='lg'
                            objectFit='cover'
                        />
                    </ModalBody>
                    <ModalFooter justifyContent={"space-between"}>
                        <Text as='b'>{title}</Text>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    )
}

export default SearchImageModal;