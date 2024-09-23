import {Form,FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Address, toHex } from "viem";
import { useIpAsset } from "@story-protocol/react-sdk";
import { useStory } from "@/lib/context/AppContext";
import { useWalletClient } from "wagmi";

const formSchema = z.object({
    nftId: z.string().min(1, { message: "NFT ID is required." }),
    nftContractAddress: z.string().min(42, { message: "Invalid NFT Contract Address." }),
})

export default function RegisterOnChainAsset() {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            nftId: "",
            nftContractAddress: "",
        },
    })

    const { setTxHash, setTxLoading, setTxName, addTransaction } =
    useStory();
    const { data: wallet } = useWalletClient();
    const { register } = useIpAsset();

    const registerExistingNFT = async (
      tokenId: string,
      nftContract: Address,
      ipfsUri: string | null,
      ipfsJson: any | null
    ) => {
      if (!wallet?.account.address) return;
      setTxLoading(true);
      setTxName("Registering an NFT as an IP Asset...");
      const response = await register({
        nftContract,
        tokenId,
        metadata: {
          metadataURI: ipfsUri || "test-metadata-uri", // uri of IP metadata
          metadataHash: toHex(ipfsJson || "test-metadata-hash", { size: 32 }), // hash of IP metadata
          nftMetadataHash: toHex(ipfsJson || "test-nft-metadata-hash", {
            size: 32,
          }), // hash of NFT metadata
        },
        txOptions: { waitForTransaction: true },
      });
      console.log(
        `Root IPA created at tx hash ${response.txHash}, IPA ID: ${response.ipId}`
      );
      setTxLoading(false);
      setTxHash(response.txHash as string);
      addTransaction(response.txHash as string, "Register IPA", {
        ipId: response.ipId,
      });
    };

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            await registerExistingNFT(
                values.nftId,
                values.nftContractAddress as `0x${string}`,
                null,
                null
            );
        } catch (error) {
            console.error("Error registering NFT:", error);
            console.log("Wallet Address:", wallet?.account.address);
            // Handle error (e.g., show error message to user)
        }
    };

    return (
        <div className="flex mt-8 justify-center min-h-screen">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-full max-w-md">
                    <FormField
                        control={form.control}
                        name="nftId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>NFT ID</FormLabel>
                                <FormControl>
                                    <Input placeholder="12" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="nftContractAddress"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>NFT Contract Address</FormLabel>
                                <FormControl>
                                    <Input placeholder="0xe8E8dd120b067ba86cf82B711cC4Ca9F22C89EDc" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormDescription>
                        Register an existing NFT in your wallet as an IP Asset.
                    </FormDescription>
                    <Button type="submit">Register</Button>
                </form>
            </Form>
        </div>
    )
}