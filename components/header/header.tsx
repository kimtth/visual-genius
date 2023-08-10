import type { NextPage } from "next";
import { HStack, Box, Text, Input, InputGroup, Image, InputRightElement, Icon, IconButton } from "@chakra-ui/react";
import { SiMicrosoftbing } from 'react-icons/si';
import { FiSearch } from "react-icons/fi";
import { useRouter } from "next/navigation";
import { usePathname, useSearchParams } from 'next/navigation'
import { useState } from "react";


const Header: NextPage = () => {
    const { push } = useRouter();
    const [searchKeyword, setSearchKeyword] = useState('');
    const searchParams = useSearchParams()
    const sk = searchParams.get('sk')

    const handleSearch = () => {
        if (searchKeyword) {
            // Save a last searched keyword to next page
            push(`/select?sk=${searchKeyword}`)
        }
    }

    return (
        <>
            <HStack justifyContent='space-between' width={'100%'} height={'49px'} backgroundColor={'var(--comm-blue-primary-0078d4)'}>
                <Box display="flex" alignItems="center" p={4} >
                    <Icon as={SiMicrosoftbing} w={5} h={5} color='white' />
                    <Text fontWeight='bold' color="white">Visual Genius: Communication Assistant</Text>
                </Box>
                <Box>
                    <InputGroup size='sm'>
                        <Input
                            bg='white'
                            color='gray'
                            variant="outline"
                            placeholder="Search"
                            size='sm'
                            width={'35vw'}
                            value={searchKeyword ? searchKeyword : sk!}
                            onChange={(e) => { setSearchKeyword(e.target.value) }}
                        />
                        <InputRightElement>
                            <IconButton aria-label='Edit'
                                variant="ghost"
                                colorScheme='gray'
                                icon={<FiSearch
                                    color='gray.500'
                                />}
                                onClick={handleSearch}
                            />
                        </InputRightElement>
                    </InputGroup>
                </Box>
                <Box display="flex" alignItems="center" marginRight={'3rem'}>
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
        </>
    )
}

export default Header;