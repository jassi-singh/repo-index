import {
  Container,
  Flex,
  Heading,
  Spinner,
  Stack,
  Text,
} from "@chakra-ui/react";
import axios from "axios";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import useSWR from "swr";

const Repo: NextPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const fetcher = (url: string) => axios.get(url).then((res) => res.data);
  const router = useRouter();
  const { data: response, error } = useSWR(
    `/api/getRepo?link=${router.query.url}&type=${router.query.type}`,
    fetcher
  );

  return (
    <Flex minH={"100vh"} align={"center"} justify={"center"} bg={"grey.50"}>
      {response === undefined ? (
        <Stack alignItems="center" spacing={"6"}>
          <Spinner size={"xl"} speed={"0.6s"} />
          <Heading size={"md"}>Analysing the repository ...</Heading>
        </Stack>
      ) : (
        <Text>{`${response.repoData.data.forks}`}</Text>
      )}
    </Flex>
  );
};

export default Repo;
