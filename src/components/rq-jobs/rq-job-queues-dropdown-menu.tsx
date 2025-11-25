// typescript
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu.tsx";
import {useEffect, useState} from "react";
import {Button} from "@/components/ui/button.tsx";
import {ChevronDownIcon} from "lucide-react";
import {useQuery} from "@apollo/client";
import {GET_RQ_QUEUE_NAMES} from "@/components/graphql/rq-job.graphql.ts";
import {isNonNullish} from "@/lib/graphql/graphql-utils.ts";

export function RqJobQueuesDropdownMenu(
    {
        onSelect,
        filterQueue,
    }: {
        onSelect?: (queue: string) => void;
        filterQueue?: "scanner" | "extractor";
    }) {
    const {data} = useQuery(GET_RQ_QUEUE_NAMES);
    const queues = (data?.rq_queue_name_list ?? [])
        .filter(isNonNullish);

    const filteredQueues = filterQueue
        ? queues.filter(q => q.toLowerCase().includes(filterQueue))
        : queues;

    const [rqJobQueue, setRqJobQueue] = useState<string>("");
    const [open, setOpen] = useState<boolean>(false);

    // initialize selected queue from the first filtered item and keep in sync
    useEffect(() => {
        if (filteredQueues.length > 0) {
            const first = filteredQueues[0];
            if (rqJobQueue === "" || !filteredQueues.includes(rqJobQueue)) {
                setRqJobQueue(first);
                onSelect?.(first);
            }
        } else {
            // clear selection if no queues available
            if (rqJobQueue !== "") {
                setRqJobQueue("");
                onSelect?.("");
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filteredQueues]);

    if (filteredQueues.length <= 0) {
        return null;
    }

    const handleSelect = (value: string) => {
        setRqJobQueue(value);
        onSelect?.(value);
    };

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="outline">
                    {rqJobQueue}
                    <ChevronDownIcon
                        className={`h-4 w-4 transition-transform duration-200 ${open ? "rotate-180" : "rotate-0"}`}
                    />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuLabel>RQ Job Queues</DropdownMenuLabel>
                <DropdownMenuSeparator/>
                <DropdownMenuRadioGroup value={rqJobQueue} onValueChange={handleSelect}>
                    {filteredQueues.map((queue) => (
                        <DropdownMenuRadioItem key={queue} value={queue}>{queue}</DropdownMenuRadioItem>
                    ))}
                </DropdownMenuRadioGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
