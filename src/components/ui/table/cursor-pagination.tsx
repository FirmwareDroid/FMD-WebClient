import {Button} from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export interface CursorPaginationProps {
    pageSize: number;
    onPageSizeChange: (n: number) => void;
    hasPrevious: boolean;
    hasNext: boolean;
    onPrevious: () => void;
    onNext: () => void;
    loading?: boolean;
}

export function CursorPagination({
                                     pageSize,
                                     onPageSizeChange,
                                     hasPrevious,
                                     hasNext,
                                     onPrevious,
                                     onNext,
                                     loading,
                                 }: Readonly<CursorPaginationProps>) {
    return (
        <div className="flex items-center justify-between px-2 py-2">
            <div className="flex flex-wrap items-center gap-4 lg:gap-8">
                <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">Rows per page</span>
                    <Select
                        value={pageSize.toString()}
                        onValueChange={(value) => {
                            onPageSizeChange(Number(value));
                        }}
                        disabled={loading}
                    >
                        <SelectTrigger className="h-8 w-[70px]">
                            <SelectValue placeholder={pageSize}/>
                        </SelectTrigger>
                        <SelectContent side="top">
                            {[10, 25, 50, 100].map((pageSize) => (
                                <SelectItem key={pageSize} value={pageSize.toString()}>
                                    {pageSize}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onPrevious}
                        disabled={!hasPrevious || loading}
                    >
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onNext}
                        disabled={!hasNext || loading}
                    >
                        Next
                    </Button>
                </div>
            </div>
        </div>
    );
}
