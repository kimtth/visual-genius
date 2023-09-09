import { Flex, Heading, } from "@chakra-ui/react";
import { useEffect } from 'react';
import { pathes } from "../components/state/pathes";

export default function Home() {
    useEffect(() => {
        window.location.href= `${pathes.home}`;
    }, []);
    
    return (
        <Flex width="90vw" height="90vh" alignItems="center" justifyContent="center">
            <Flex direction="column" padding={6} rounded={6}>
                +        <Heading mb={6}>Welcome !!</Heading>
            </Flex>
        </Flex>
    )
}