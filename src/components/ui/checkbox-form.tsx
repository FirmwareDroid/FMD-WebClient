import {zodResolver} from "@hookform/resolvers/zod"
import {useForm, UseFormReturn} from "react-hook-form"
import {z} from "zod"

import {Checkbox} from "@/components/ui/checkbox"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import {useEffect} from "react";

type Item = {
    id: string;
    label: string;
}

type CheckboxFormProps = {
    label?: string;
    description?: string;
    items: Item[];
    defaultItems?: Item[];
    validateOnMount?: boolean;
    validationMode?: "onBlur" | "onChange" | "onSubmit" | "onTouched" | "all";
    schema?: z.ZodObject<{ items: z.ZodArray<z.ZodString> }>;
}

const DefaultSchema = z.object({
    items: z.array(z.string()).refine((value) => value.some((item) => item), {
        message: "You have to select at least one item.",
    }),
})

export function CheckboxForm(
    {
        label,
        description,
        items,
        defaultItems,
        validateOnMount = false,
        validationMode = "onSubmit",
        schema,
    }: Readonly<CheckboxFormProps>) {
    const activeSchema = schema ?? DefaultSchema;

    const form = useForm<z.infer<typeof activeSchema>>({
        resolver: zodResolver(activeSchema),
        defaultValues: {
            items: defaultItems?.map(item => item.id) ?? []
        },
        mode: validationMode,
    })

    useEffect(() => {
        if (validateOnMount) {
            void form.trigger("items")
        }
    }, [validateOnMount, form]);

    return (
        <Form {...form}>
            <form className="space-y-8">
                <FormField
                    control={form.control}
                    name="items"
                    render={() => (
                        <FormItem>
                            {(label || description) && (<div className="mb-4">
                                {label && <FormLabel className="text-base">{label}</FormLabel>}
                                {description && <FormDescription>
                                    {description}
                                </FormDescription>}
                            </div>)}
                            <div className="gap-0">
                                {items.map((item) => (
                                    <ItemField key={item.id} item={item} form={form}/>
                                ))}
                            </div>
                            <FormMessage/>
                        </FormItem>
                    )}
                />
            </form>
        </Form>
    )
}

type ItemFieldProps = {
    item: Item;
    form: UseFormReturn<{ items: string[] }, any, { items: string[] }>;
}

function ItemField({item, form}: Readonly<ItemFieldProps>) {
    return (
        <FormField
            key={item.id}
            control={form.control}
            name="items"
            render={({field}) => {
                return (
                    <FormItem key={item.id}>
                        <FormLabel className="hover:bg-accent/50 flex flex-row items-center gap-2 w-full h-full rounded-md p-2 cursor-pointer">
                            <FormControl>
                                <Checkbox
                                    checked={field.value.includes(item.id)}
                                    onCheckedChange={(checked) => {
                                        return checked
                                            ? field.onChange([...field.value, item.id])
                                            : field.onChange(
                                                field.value.filter(
                                                    (value) => value !== item.id
                                                )
                                            )
                                    }}
                                />
                            </FormControl>
                            <span className="text-sm font-normal">{item.label}</span>
                        </FormLabel>
                    </FormItem>
                )
            }}
        />
    );
}
