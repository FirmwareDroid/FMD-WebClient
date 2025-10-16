import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu.tsx";
import {useState} from "react";
import {Button} from "@/components/ui/button.tsx";
import {ChevronDownIcon} from "lucide-react";
import {useQuery} from "@apollo/client";
import {GET_RQ_QUEUE_NAMES} from "@/components/graphql/rq-job.graphql.ts";
import {isNonNullish} from "@/lib/graphql/graphql-utils.ts";

export function RqJobQueuesDropdownMenu(
    {
        onSelect,
    }: {
        onSelect?: (queue: string) => void;
    }) {
    const {data} = useQuery(GET_RQ_QUEUE_NAMES);
    const queues = (data?.rq_queue_name_list ?? [])
        .filter(isNonNullish);
    const [rqJobQueue, setRqJobQueue] = useState<string>("");
    const [open, setOpen] = useState<boolean>(false);

    if (queues.length > 0 && rqJobQueue === "") {
        // setting the last item as the initial value (should be "default-python")
        const initial = queues[queues.length - 1];
        setRqJobQueue(initial);
        onSelect?.(initial);
    }

    if (queues.length <= 0) {
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
                    {queues.map((queue) => (
                        <DropdownMenuRadioItem key={queue} value={queue}>{queue}</DropdownMenuRadioItem>
                    ))}
                </DropdownMenuRadioGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}