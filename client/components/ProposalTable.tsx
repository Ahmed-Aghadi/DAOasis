import {useState} from "react";
import {
    createStyles,
    Table,
    ScrollArea,
    UnstyledButton,
    Group,
    Text,
    Center,
    TextInput,
    rem,
    Paper, Title, Button, Modal,
} from "@mantine/core";
import {keys} from "@mantine/utils";
import {
    IconSelector,
    IconChevronDown,
    IconChevronUp,
    IconSearch,
} from "@tabler/icons-react";
import Link from "next/link";
import CreateProposalModal from "@/components/CreateProposalModal";
import {useRouter} from "next/router";

const useStyles = createStyles((theme) => ({
    th: {
        padding: "0 !important",
    },

    tr: {
        color: theme.colors.blueTheme[1],
        "&:hover": {
            backgroundColor: theme.colors.blueTheme[2],
            color: theme.colors.blueTheme[0]
        },
    },

    control: {
        width: "100%",
        padding: `${theme.spacing.xs} ${theme.spacing.md}`,
        color: theme.colors.blueTheme[1],
        "&:hover": {
            backgroundColor: theme.colors.blueTheme[2],
            color: theme.colors.blueTheme[0]
        },
    },

    icon: {
        width: rem(21),
        height: rem(21),
        borderRadius: rem(21),
    },
}));

interface RowData {
    id: string;
    title: string;
    creator: string;
    createdAt: string;
}

interface TableSortProps {
    data: RowData[];
    name: string;
    safeAddress: string;
    chainId: string;
}

interface ThProps {
    children: React.ReactNode;
    reversed: boolean;
    sorted: boolean;

    onSort(): void;
}

function Th({children, reversed, sorted, onSort}: ThProps) {
    const {classes} = useStyles();
    const Icon = sorted
        ? reversed
            ? IconChevronUp
            : IconChevronDown
        : IconSelector;
    return (
        <th className={classes.th}>
            <UnstyledButton onClick={onSort} className={classes.control}>
                <Group position="apart">
                    <Text fw={500} fz="sm">
                        {children}
                    </Text>
                    <Center className={classes.icon}>
                        <Icon size="0.9rem" stroke={1.5}/>
                    </Center>
                </Group>
            </UnstyledButton>
        </th>
    );
}

function filterData(data: RowData[], search: string) {
    const query = search.toLowerCase().trim();
    return data.filter((item) =>
        keys(data[0]).some(
            (key) => item[key].toLowerCase().includes(query)
        )
    );
}

function sortData(
    data: RowData[],
    // payload: { sortBy: keyof RowData | null; reversed: boolean; search: string }
    // remove boolean type exists from keyof RowData
    payload: {
        sortBy: keyof RowData | null;
        reversed: boolean;
        search: string;
    }
) {
    const {sortBy} = payload;

    if (!sortBy) {
        return filterData(data, payload.search);
    }

    return filterData(
        [...data].sort((a, b) => {
            if (payload.reversed) {
                return b[sortBy].localeCompare(a[sortBy]);
            }

            return a[sortBy].localeCompare(b[sortBy]);
        }),
        payload.search
    );
}

export function ProposalTable({data, name, safeAddress, chainId}: TableSortProps) {
    const {classes} = useStyles();
    const router = useRouter()
    const [search, setSearch] = useState("");
    const [sortedData, setSortedData] = useState(data);
    const [modalOpened, setModalOpened] = useState(false);
    const [sortBy, setSortBy] = useState<keyof RowData | null>(
        null
    );
    const [reverseSortDirection, setReverseSortDirection] = useState(false);

    const open = () => {
        setModalOpened(true);
    };

    const modal = (
        <Modal opened={modalOpened} onClose={() => setModalOpened(false)} centered radius={"lg"}
               title={"Create Proposal"}
               styles={(theme) => ({
                   content: {
                       backgroundColor: theme.colors.blueTheme[2]
                   },
                   title: {
                       fontFamily: "Inter",
                       fontWeight: 600,
                       fontSize: "1.2rem",
                       color: theme.colors.violet[6]
                   },
                   header: {
                       backgroundColor: theme.colors.blueTheme[2],
                       color: theme.colors.violet[6]
                   }
               })}
        >
            <CreateProposalModal chainId={chainId} address={router.query?.address! as string} name={name}/>
        </Modal>
    );

    const setSorting = (field: keyof RowData) => {
        const reversed = field === sortBy ? !reverseSortDirection : false;
        setReverseSortDirection(reversed);
        setSortBy(field);
        setSortedData(sortData(data, {sortBy: field, reversed, search}));
    };

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const {value} = event.currentTarget;
        setSearch(value);
        setSortedData(
            sortData(data, {
                sortBy,
                reversed: reverseSortDirection,
                search: value,
            })
        );
    };

    const rows = sortedData.map((row) => (
        <tr className={classes.tr} key={row.id}>
            <td>
                <Link href={`/proposal?id=${row.id}&name=${name}&address=${safeAddress}&chainId=${chainId}`}>
                    {row.title}
                </Link>
            </td>
            <td>
                <Link href={`/proposal?id=${row.id}&name=${name}&address=${safeAddress}&chainId=${chainId}`}>
                    {row.creator}
                </Link>
            </td>
            <td>
                <Link href={`/proposal?id=${row.id}&name=${name}&address=${safeAddress}&chainId=${chainId}`}>
                    {new Date(parseInt(row.createdAt)).toLocaleDateString()}
                </Link>
            </td>
        </tr>
    ));

    return (
        <Paper p="xl" bg="#c4b7eb">
            <Group position={"apart"} mx={"md"} my={"xs"} p={"xs"}>
                <Title size={"large"} fw={500} color="white">Safe Proposals</Title>
                <Button variant="light" compact onClick={open} color={"#3304ba"}>
                    Create a new proposal
                </Button>
            </Group>
            <ScrollArea h={360}>
                <TextInput
                    placeholder="Search by any field"
                    mb="md"
                    icon={<IconSearch size="0.9rem" stroke={1.5} color={"#3304ba"}/>}
                    value={search}
                    onChange={handleSearchChange}
                    styles={{
                        input: {
                            backgroundColor: "#eeebf7",
                            borderRadius: "0.5rem",
                            color: "#3304ba",
                            "&:focus": {
                                borderColor: "#3304ba",
                            },
                            "&::placeholder": {
                                color: "#3304ba",
                            }
                        },
                    }}
                />
                <Table
                    horizontalSpacing="md"
                    verticalSpacing="xs"
                >
                    <thead>
                    <tr>
                        <Th
                            sorted={sortBy === "title"}
                            reversed={reverseSortDirection}
                            onSort={() => setSorting("title")}

                        >
                            Title of Proposal
                        </Th>
                        <Th
                            sorted={sortBy === "creator"}
                            reversed={reverseSortDirection}
                            onSort={() => setSorting("creator")}
                        >
                            Creator of Proposal
                        </Th>
                        <Th
                            sorted={sortBy === "createdAt"}
                            reversed={reverseSortDirection}
                            onSort={() => setSorting("createdAt")}
                        >
                            Created At
                        </Th>
                    </tr>
                    </thead>
                    <tbody>
                    {rows.length > 0 ? (
                        rows
                    ) : (
                        <tr>
                            <td>
                                <Text weight={500} align="left" sx={{color: "#3304ba"}}>
                                    Nothing found
                                </Text>
                            </td>
                        </tr>
                    )}
                    </tbody>
                </Table>
            </ScrollArea>
            {modal}
        </Paper>
    );
}
