import type { NextPage } from "next";
import { HStack, Box, Text, Input, InputGroup, Image, InputRightElement } from "@chakra-ui/react";
import { SiMicrosoftbing } from 'react-icons/si';
import { FiSearch } from "react-icons/fi";


const Header: NextPage = () => {
    return (
        <HStack justifyContent='space-evenly' spacing='25rem' position={'absolute'} width={'100%'} height={'49px'} backgroundColor={'var(--comm-blue-primary-0078d4)'}>
            <Box display="flex" alignItems="center">
                <SiMicrosoftbing color="white"/>
                <Text fontWeight='bold' color="white">ImagiGenius: Communication Assistant</Text>
            </Box>
            <Box>
                <InputGroup size='sm'>
                    <Input
                        bg='white'
                        color='gray'
                        variant="outline"
                        placeholder="Search"
                        size='sm'
                        width={'30vw'}
                    />
                    <InputRightElement
                        pointerEvents="none"
                        children={<FiSearch color='gray.500'/>}
                    />
                </InputGroup>
            </Box>
            <Box display="flex" alignItems="center" marginRight={'1rem'}>
                <Image
                    alt=""
                    width={'2vw'}
                    position={'absolute'}
                    src="/persona@3x.png"
                    zIndex='1'
                />
                <Image
                    alt=""
                    position={'absolute'}
                    src="/personacontainer.svg"
                    zIndex='2'
                />
            </Box>
        </HStack>
    )
}

export default Header;