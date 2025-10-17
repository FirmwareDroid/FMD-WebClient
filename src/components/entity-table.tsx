import {Table, TableBody, TableCell, TableRow} from "@/components/ui/table.tsx";

type WithFragmentName = { " $fragmentName"?: string };

export function EntityTable(
    {
        entity,
    }: Readonly<{
        entity: WithFragmentName;
    }>,
) {
    return (
        <Table>
            <TableBody>
                {Object.entries(entity)
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    .filter(([key, _]) => key !== "__typename")
                    .map(([key, value]) => (
                        <TableRow key={key}>
                            <TableCell className="font-medium">{key}</TableCell>
                            <TableCell className="text-muted-foreground whitespace-pre-wrap">
                                {(() => {
                                    if (!value) {
                                        return String(value);
                                    }

                                    if (typeof value === "object") {
                                        try {
                                            return JSON.stringify(value, null, 2);
                                        } catch {
                                            return "[Object]";
                                        }
                                    }

                                    if (typeof value !== "string") {
                                        return String(value);
                                    }

                                    try {
                                        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                                        const parsed = JSON.parse(value);
                                        return JSON.stringify(parsed, null, 2);
                                    } catch {
                                        return value;
                                    }
                                })()}
                            </TableCell>
                        </TableRow>
                    ))}
            </TableBody>
        </Table>
    );
}
