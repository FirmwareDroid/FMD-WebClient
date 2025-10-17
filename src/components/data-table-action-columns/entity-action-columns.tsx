import type {ColumnDef} from "@tanstack/react-table";
import {Checkbox} from "@/components/ui/checkbox.tsx";
import {
    Exact,
    Scalars,
} from "@/__generated__/graphql.ts";
import {TypedDocumentNode} from "@graphql-typed-document-node/core";
import {
    DeleteEntityButton,
} from "@/components/data-table-action-columns/action-buttons.tsx";

export type WithId = { id: string };
export type WithIdAndFirmwareIdReference = {
    id: string;
    firmwareIdReference?: {
        __typename?: "AndroidFirmwareType"
        id: string
    } | null;
};
export type WithTypenameMutation = { __typename?: "Mutation" };

function buildSelectEntityColumn<T extends WithId>(): ColumnDef<T> {
    return (
        {
            id: "select",
            header: ({table}) => (
                <Checkbox
                    className="flex items-center"
                    checked={
                        table.getIsAllPageRowsSelected() ||
                        (table.getIsSomePageRowsSelected() && "indeterminate")
                    }
                    onCheckedChange={(value) => {
                        table.toggleAllPageRowsSelected(!!value);
                    }}
                    aria-label="Select all"
                />
            ),
            cell: ({row}) => (
                <Checkbox
                    className="flex items-center"
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => {
                        row.toggleSelected(!!value);
                    }}
                    aria-label="Select row"
                />
            ),
        }
    );
}

function buildDeleteEntityColumn<T extends WithId, U extends WithTypenameMutation>(
    tooltipSingle: string,
    tooltipSelected: string,
    deleteMutation: TypedDocumentNode<U, Exact<{
        objectIds: Array<Scalars["String"]["input"]> | Scalars["String"]["input"]
    }>>
): ColumnDef<T> {
    return (
        {
            id: "delete",
            header: ({table}) =>
                <DeleteEntityButton<U>
                    ids={table.getSelectedRowModel().flatRows.map(row => row.original.id)}
                    tooltip={tooltipSelected}
                    deleteMutation={deleteMutation}
                />,
            cell: ({row}) =>
                <DeleteEntityButton
                    ids={[row.original.id]}
                    tooltip={tooltipSingle}
                    deleteMutation={deleteMutation}
                />
        }
    );
}

export {
    buildSelectEntityColumn,
    buildDeleteEntityColumn,
}
