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
    Paper, Title,
} from "@mantine/core";
import {keys} from "@mantine/utils";
import {
    IconSelector,
    IconChevronDown,
    IconChevronUp,
    IconSearch,
} from "@tabler/icons-react";
import Link from "next/link";

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
    name: string;
    description: string;
    exists: boolean;
}

interface TableSortProps {
    data: RowData[];
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
            (key) => key !== "exists" && item[key].toLowerCase().includes(query)
        )
    );
}

function sortData(
    data: RowData[],
    // payload: { sortBy: keyof RowData | null; reversed: boolean; search: string }
    // remove boolean type exists from keyof RowData
    payload: {
        sortBy: keyof Omit<RowData, "exists"> | null;
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

export function OwnersDetails({data}: TableSortProps) {
    const {classes} = useStyles();
    const [search, setSearch] = useState("");
    const [sortedData, setSortedData] = useState(data);
    const [sortBy, setSortBy] = useState<keyof Omit<RowData, "exists"> | null>(
        null
    );
    const [reverseSortDirection, setReverseSortDirection] = useState(false);

    const setSorting = (field: keyof Omit<RowData, "exists">) => {
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
                <Link href={`/user?address=${row.id}`}>
                    {row.exists ? row.name : "-"}
                </Link>
            </td>
            <td>
                <Link href={`/user?address=${row.id}`}>
                    {row.id}
                </Link>
            </td>
        </tr>
    ));

    return (
        <Paper p="xl" bg="#c4b7eb">
            <Title p={"sm"} size={"large"} fw={500} color="white">Safe Owners</Title>
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
                            sorted={sortBy === "name"}
                            reversed={reverseSortDirection}
                            onSort={() => setSorting("name")}

                        >
                            Name
                        </Th>
                        <Th
                            sorted={sortBy === "id"}
                            reversed={reverseSortDirection}
                            onSort={() => setSorting("id")}
                        >
                            Address
                        </Th>
                    </tr>
                    </thead>
                    <tbody>
                    {rows.length > 0 ? (
                        rows
                    ) : (
                        <tr>
                            <td>
                                <Text weight={500} align="center" sx={{color: "#3304ba"}}>
                                    Nothing found
                                </Text>
                            </td>
                        </tr>
                    )}
                    </tbody>
                </Table>
            </ScrollArea>
        </Paper>
    );
}
