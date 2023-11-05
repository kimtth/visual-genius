import { Card, CardBody, Image, Text, Checkbox, Flex, Spacer, useDisclosure, Box, Stack, HStack } from "@chakra-ui/react";
import SearchImageModal from "./searchModalCard";
import { FC } from "react";
import { FALLBACK_SRC } from "../state/const";

interface PhotoProps {
    title: string;
    imgPath: string;
    checked: boolean;
    onSelect: (checked: boolean) => void;
}

const SearchResultCard: FC<PhotoProps> = ({ title, imgPath, checked, onSelect }) => {
    const { isOpen, onOpen, onClose } = useDisclosure();

    return (
        <>
            {isOpen ?
                <>
                    <SearchImageModal title={title} imgPath={imgPath} isOpen={isOpen} onClose={onClose} />
                </>
                : null}
            <div>
                <Card>
                    <CardBody>
                        <Image
                            maxW='100%'
                            src={imgPath}
                            fallbackSrc={FALLBACK_SRC}
                            borderRadius='lg'
                            onClick={onOpen}
                        />
                        <Spacer />
                        <HStack mt={2}>
                            <Checkbox
                                size='sm'
                                colorScheme='green'
                                isChecked={checked}
                                onChange={() => { onSelect(!checked) }}
                            />
                            <Text fontSize='sm' as="b" isTruncated>{title}</Text>
                        </HStack>
                    </CardBody>
                </Card>
            </div>
        </>
    )
}

export default SearchResultCard;