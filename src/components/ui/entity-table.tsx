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
                    .filter(([_, value]) => !value || typeof value !== "object") // show object if it's null, otherwise we don't display objects
                    .map(([key, value]) => (
                        <TableRow key={key}>
                            <TableCell className="font-medium">{key}</TableCell>
                            <TableCell className="text-muted-foreground whitespace-pre-wrap">
                                {(() => {
                                    let displayValue = value;

                                    try {
                                        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                                        const parsed = JSON.parse(value);
                                        displayValue = JSON.stringify(parsed, null, 2);
                                    } catch {
                                        // ignore, we leave it as string if parsing fails
                                    }

                                    return displayValue;
                                })()}
                            </TableCell>
                        </TableRow>
                    ))}
            </TableBody>
        </Table>
    );
}
