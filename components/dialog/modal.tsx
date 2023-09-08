import { useDisclosure, Button, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter } from "@chakra-ui/react"
import { FC, useEffect, useState } from "react";


interface BasicModelProps {
    open: boolean;
    setOpen: (open: boolean) => void;
    title: string;
    messageType: string;
    callback?: () => void;
}

const BasicModal: FC<BasicModelProps> = ({ open, setOpen, title, messageType, callback }) => {
    const [message, setMessage] = useState<string>('');

    const handleAction = () => {
        if (callback) {
            callback();
        }
        setOpen(false);
    }

    // Change the message based on message type.
    useEffect(() => {
        if (messageType === 'delete') {
            setMessage('Are you sure you want to delete this item?');
        } else if (messageType === 'save') {
            setMessage('Are you sure you want to save this item?');
        } else if (messageType === 'share') {
            setMessage('Are you sure you want to share this item?');
        } else if (messageType === 'download') {
            setMessage('Are you sure you want to download this item?');
        } else if (messageType === 'print') {
            setMessage('Are you sure you want to print this item?');
        } else {
            setMessage('Are you sure you want to do this? The event is not supported.');
        }
    }, [messageType])

    return (
        <>
            <Modal isOpen={open} onClose={() => setOpen(false)}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>{title}</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        {message}
                    </ModalBody>

                    <ModalFooter>
                        <Button colorScheme='blue' mr={3} onClick={() => { handleAction() }}>
                            OK
                        </Button>
                        <Button variant='ghost' onClick={() => setOpen(false)}>Close</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    )
}

export default BasicModal;