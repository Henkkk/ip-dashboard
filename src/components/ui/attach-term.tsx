"use client"
import {Form,FormControl, FormField, FormItem, FormLabel} from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react";
import * as z from "zod"
import { useWalletClient } from "wagmi";
import { useLicense } from "@story-protocol/react-sdk";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select";
import { Label } from "../ui/label";
import { Button } from "@/components/ui/button"
import { useStory } from "@/lib/context/AppContext";
import { Address } from "viem";

const formSchema = z.object({
  ipId: z.string().min(1, "IP ID is required"),
})

export default function AttachTerm() {
    const [termsId, setTermsId] = useState("");
    const { attachLicenseTerms } = useLicense();
    const { data: wallet } = useWalletClient();
    const { setTxHash, setTxLoading, setTxName, addTransaction } = useStory();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            ipId: "",
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        const { ipId } = values;
        if (!wallet?.account.address) return;
        setTxLoading(true);
        setTxName("Attaching terms to an IP Asset...");
        try {
            const response = await attachLicenseTerms({
                licenseTermsId: termsId,
                ipId: ipId as Address,
                txOptions: { waitForTransaction: true },
            });
            console.log(`Attached License Terms to IP at tx hash ${response.txHash}`);
            setTxLoading(false);
            setTxHash(response.txHash);
            addTransaction(response.txHash, "Attach Terms", {});
        } catch (e) {
            console.error(e);
            setTxLoading(false);
        }
    }

    return (    
        <div className="flex items-center justify-center min-h-screen">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-full max-w-md">
                    <FormField
                        control={form.control}
                        name="ipId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>IP ID</FormLabel>
                                <FormControl>
                                    <Input placeholder="IP ID" {...field} />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    <Label htmlFor="termsId">Terms</Label>
                    <Select onValueChange={(value) => setTermsId(value)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select pre-set terms" />
                        </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="2">
                        Non-Commercial Social Remixing
                        </SelectItem>
                    </SelectContent>
                    </Select>
                    <Button type="submit">Attach</Button>
                </form>
            </Form>      
        </div>
    );
}