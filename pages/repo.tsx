import {
  Box,
  Container,
  Heading,
  Flex,
  Grid,
  GridItem,
  HStack,
  Icon,
  Select,
  Spinner,
  Stack,
  Tag,
  Text,
  VStack,
  TableContainer,
  Table,
  TableCaption,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
  Tfoot,
} from "@chakra-ui/react";
import {
  FaCalendar,
  FaGem,
  FaGithub,
  FaGlasses,
  FaNpm,
  FaPython,
  FaTag,
  FaTags,
} from "react-icons/fa";
import { ImStatsBars, ImStatsDots } from "react-icons/im";
import {
  AiFillCode,
  AiFillStar,
  AiOutlineDownload,
  AiOutlineFork,
} from "react-icons/ai";
import axios from "axios";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import useSWR, { Fetcher } from "swr";
import { CheckCircleIcon, WarningIcon } from "@chakra-ui/icons";
import { PackageRegistries, RepoAnalysis } from "./api/getRepo";
import {
  downloadsWeekly,
  forksCount,
  latestReleaseVersionTime,
  originalReleaseTime,
  releaseVersionCount,
  starsCount,
  watchersCount,
} from "../utils/metrics";
import { IconType } from "react-icons";

const Repo: NextPage = () => {
  const fetcher: Fetcher<RepoAnalysis> = (url: string) =>
    axios.get(url).then((res) => res.data);
  const router = useRouter();
  const { data: response, error } = useSWR<RepoAnalysis>(
    `/api/getRepo?link=${router.query.url}&type=${router.query.type}`,
    fetcher
  );

  const checkIfOldVersion = (latestReleaseDate: Date): boolean => {
    const date1 = new Date(latestReleaseDate).getTime();
    const date2 = new Date().getTime();
    const diff = ((date2 - date1) / 60) * 60 * 24 * 30;
    if (diff > latestReleaseVersionTime) return false;
    else return true;
  };

  const checkIfOldEnough = (releaseDate: Date): boolean => {
    const date1 = new Date(releaseDate).getTime();
    const date2 = new Date().getTime();
    const diff = ((date2 - date1) / 60) * 60 * 24 * 30 * 12;
    if (diff > originalReleaseTime) return false;
    else return true;
  };

  return (
    <Flex align={"start"} bg={"grey.50"} m={10}>
      {response === undefined ? (
        <Stack
          width={"full"}
          height={"100vh"}
          justifyContent={"center"}
          alignItems="center"
          spacing={"6"}
        >
          <Spinner size={"xl"} speed={"0.6s"} />
          <Heading size={"md"}>Analysing the repository ...</Heading>
        </Stack>
      ) : (
        <Box width={"full"}>
          <Grid templateColumns="repeat(5, 1fr)" gap={4}>
            <GridItem
              colSpan={3}
              border={"2px"}
              borderRadius={5}
              borderColor={"gray.200"}
            >
              <VStack>
                <HStack
                  width={"full"}
                  bg={"gray.50"}
                  display="flex"
                  justifyContent="center"
                  borderBottom={"2px"}
                  borderColor={"gray.200"}
                  py={5}
                >
                  <Icon
                    as={
                      response.packageData !== undefined
                        ? response.packageData.type == PackageRegistries.pypi
                          ? FaPython
                          : response.packageData.type == PackageRegistries.npm
                          ? FaNpm
                          : response.packageData.type ==
                            PackageRegistries.rubygems
                          ? FaGem
                          : FaGithub
                        : FaGithub
                    }
                    fontSize={"6xl"}
                  />
                  <Heading pr={5} pl={5}>
                    {response.packageData?.packageName ??
                      response.repoData.repoName}
                  </Heading>
                  <Select
                    w={"20"}
                    size="sm"
                    bg="gray.500"
                    color={"white"}
                    borderRadius="md"
                  >
                    <option>1.01</option>
                    <option>1.01</option>
                    <option>1.01</option>
                  </Select>
                </HStack>
                <Text py={5}>
                  {response.packageData?.description ??
                    response.repoData.description}
                </Text>
              </VStack>
            </GridItem>
            <GridItem
              colSpan={2}
              border={"2px"}
              borderRadius={5}
              borderColor={"gray.200"}
            >
              <VStack>
                <HStack
                  width={"full"}
                  bg={"gray.50"}
                  display="flex"
                  justifyContent="center"
                  borderBottom={"2px"}
                  borderColor={"gray.200"}
                  py={5}
                >
                  <Icon as={ImStatsBars} fontSize={"6xl"} />
                  <Heading px="5">Result</Heading>
                </HStack>
                <Tag size={"lg"} variant={"solid"} colorScheme="green">
                  Safe to use
                </Tag>
              </VStack>
            </GridItem>
          </Grid>

          <Grid
            mt={16}
            display="flex"
            justifyContent="center"
            templateColumns="repeat(5, 1fr)"
            width={"full"}
            gap={10}
          >
            <GridItem
              colSpan={1}
              border={"2px"}
              borderRadius={5}
              borderColor={"gray.200"}
            >
              <VStack>
                <HStack
                  width={"full"}
                  bg={"gray.50"}
                  display="flex"
                  justifyContent="center"
                  borderBottom={"2px"}
                  borderColor={"gray.200"}
                  py={5}
                >
                  <Icon color={"gray.500"} as={ImStatsDots} fontSize={"3xl"} />
                  <Heading color={"gray.500"} fontSize={"2xl"} px="5">
                    Github Stats
                  </Heading>
                </HStack>
                <TableContainer>
                  <Table size={"md"} variant="striped">
                    <Tbody>
                      <TableRowComponent
                        icon={AiFillStar}
                        title="Stars"
                        value={response.repoData.stars!}
                        status={
                          response.repoData.stars === undefined
                            ? true
                            : response.repoData.stars < starsCount
                        }
                      />
                      <TableRowComponent
                        icon={FaGlasses}
                        title="Watchers"
                        value={response.repoData.watchers!}
                        status={
                          response.repoData.watchers == undefined
                            ? true
                            : response.repoData.watchers < watchersCount
                        }
                      />
                      <TableRowComponent
                        icon={AiOutlineFork}
                        title="Forks Count"
                        value={response.repoData.forksCount!}
                        status={
                          response.repoData.forksCount == undefined
                            ? true
                            : response.repoData.forksCount < forksCount
                        }
                      />
                      <TableRowComponent
                        icon={AiOutlineFork}
                        title="Is Forked Repo"
                        value={
                          response.repoData.isForked === undefined
                            ? "No Data"
                            : response.repoData.isForked
                            ? "Yes"
                            : "No"
                        }
                        status={
                          response.repoData.isForked == undefined
                            ? true
                            : response.repoData.isForked
                        }
                      />
                    </Tbody>
                  </Table>
                </TableContainer>
              </VStack>
            </GridItem>

            <GridItem
              colSpan={1}
              border={"2px"}
              borderRadius={5}
              borderColor={"gray.200"}
            >
              <VStack>
                <HStack
                  width={"full"}
                  bg={"gray.50"}
                  display="flex"
                  justifyContent="center"
                  borderBottom={"2px"}
                  borderColor={"gray.200"}
                  py={5}
                >
                  <Icon color={"gray.500"} as={ImStatsDots} fontSize={"3xl"} />
                  <Heading color={"gray.500"} fontSize={"2xl"} px="5">
                    {(response.packageData?.type??PackageRegistries.github).toUpperCase()} Stats
                  </Heading>
                </HStack>
                <TableContainer>
                  <Table size={"md"} variant="striped">
                    <Tbody>
                      <TableRowComponent
                        icon={AiOutlineDownload}
                        title="Weekly Downloads"
                        value={response.packageData?.weeklyDownloads}
                        status={
                          response.packageData?.weeklyDownloads < downloadsWeekly
                        }
                      />
                      <TableRowComponent
                        icon={FaTags}
                        title="Release Count"
                        value={response.packageData?.versionReleaseCount}
                        status={
                          response.packageData?.versionReleaseCount <
                          releaseVersionCount
                        }
                      />
                      <TableRowComponent
                        icon={AiFillCode}
                        title="Source Code"
                        value={
                          response.packageData?.gitUrlExists
                            ? "Exists"
                            : "Dont Exists"
                        }
                        status={!response.packageData?.gitUrlExists}
                      />
                      <TableRowComponent
                        icon={FaCalendar}
                        title="Latest Release Date"
                        value={new Date(
                          response.packageData?.latestReleaseDate!
                        ).toDateString()}
                        status={checkIfOldVersion(
                          response.packageData?.latestReleaseDate!
                        )}
                      />
                      <TableRowComponent
                        icon={FaCalendar}
                        title="Release Date"
                        value={new Date(
                          response.packageData?.originalReleaseDate!
                        ).toDateString()}
                        status={checkIfOldEnough(
                          response.packageData?.originalReleaseDate!
                        )}
                      />
                    </Tbody>
                  </Table>
                </TableContainer>
              </VStack>
            </GridItem>
          </Grid>
        </Box>
      )}
    </Flex>
  );
};

const TableRowComponent = (params: TableRowParams) => {
  return (
    <Tr>
      <Td>
        <HStack>
          <Icon fontSize={"2xl"} as={params.icon} color={"blue.300"} />
          <Text fontSize={"md"} fontWeight={"bold"}>
            {params.title}
          </Text>
        </HStack>
      </Td>
      <Td>{params.value === undefined ? "No Data" : params.value}</Td>
      <Td isNumeric>
        {params.status ? (
          <WarningIcon fontSize={18} color="orange" />
        ) : (
          <CheckCircleIcon fontSize={18} color={"green"} />
        )}
      </Td>
    </Tr>
  );
};

type TableRowParams = {
  icon: IconType;
  title: string;
  value: string | number | null;
  status: boolean;
  statusText?: string;
};

export default Repo;
