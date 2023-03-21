import { useState } from "react";
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
    Paper,
} from "@mantine/core";
import { keys } from "@mantine/utils";
import {
    IconSelector,
    IconChevronDown,
    IconChevronUp,
    IconSearch,
} from "@tabler/icons-react";

const useStyles = createStyles((theme) => ({
    th: {
        padding: "0 !important",
    },

    control: {
        width: "100%",
        padding: `${theme.spacing.xs} ${theme.spacing.md}`,

        "&:hover": {
            backgroundColor:
                theme.colorScheme === "dark"
                    ? theme.colors.dark[6]
                    : theme.colors.gray[0],
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

function Th({ children, reversed, sorted, onSort }: ThProps) {
    const { classes } = useStyles();
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
                        <Icon size="0.9rem" stroke={1.5} />
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
    const { sortBy } = payload;

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

export function OwnersDetails({ data }: TableSortProps) {
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
        setSortedData(sortData(data, { sortBy: field, reversed, search }));
    };

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = event.currentTarget;
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
        <tr key={row.id}>
            <td>{row.exists ? row.name : "-"}</td>
            <td>{row.id}</td>
        </tr>
    ));

    return (
        <Paper p="xl" bg="#c4b7eb">
            <ScrollArea h={360}>
                <TextInput
                    placeholder="Search by any field"
                    mb="md"
                    icon={<IconSearch size="0.9rem" stroke={1.5} />}
                    value={search}
                    onChange={handleSearchChange}
                />
                <Table
                    horizontalSpacing="md"
                    verticalSpacing="xs"
                    // miw={700}
                    // sx={{ tableLayout: "fixed" }}
                    // striped
                    highlightOnHover
                    // withBorder
                    // withColumnBorders
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
                                <td colSpan={Object.keys(data[0]).length}>
                                    <Text weight={500} align="center">
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
