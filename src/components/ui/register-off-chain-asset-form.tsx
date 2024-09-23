import {Form,FormControl, FormField, FormItem, FormLabel} from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { uploadJSONToIPFS } from "@/lib/functions/uploadJSONToIpfs";
import { useStory } from "@/lib/context/AppContext";
import { useWalletClient } from "wagmi";
import { Address, toHex } from "viem";
import { useIpAsset } from "@story-protocol/react-sdk";
import { createClient } from '@/lib/supabase/client'

const formSchema = z.object({
    name: z.string().min(2, { message: "Name must be at least 2 characters." }),
    description: z.string(),
    // Remove file from the schema
})

export default function RegisterOffChainAssetForm() {
  const { mintNFT, setTxHash, setTxLoading, setTxName, addTransaction } = useStory();
  const [file, setFile] = useState<File | null>(null)
  const [isRegistrationComplete, setIsRegistrationComplete] = useState(false)
  const { data: wallet } = useWalletClient();
  const { register } = useIpAsset();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
        defaultValues: {
        name: "",
        description: "",
          // Remove file from defaultValues
        },
  })

  const registerExistingNFT = async (
    tokenId: string,
    nftContract: Address,
    ipfsUri: string | null,
    ipfsJson: any | null
  ) => {
    const supabase = createClient()

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

    const { data, error } = await supabase
    .from('ip_user')
    .insert({
      wallet_address: wallet.account.address,
      ip_id: response.ipId,
      nftMetadata_tokenId: tokenId,
    });

    /*
    console.log(`Root IPA created at tx hash ${response.txHash}, IPA ID: ${response.ipId}`);
    */

    if (error) {
      console.error('Error inserting data into ip_user:', error.message);
    } else {
      console.log(`wallet_address: ${wallet.account.address}, ip_id: ${response.ipId}, nftMetadata_tokenId: ${tokenId}`);
    }

    setTxLoading(false);
    setTxHash(response.txHash as string);
    addTransaction(response.txHash as string, "Register IPA", {
      ipId: response.ipId,
    });
    setIsRegistrationComplete(true);
  };

  const mintAndRegisterNFT = async (values: z.infer<typeof formSchema>) => {
    if (!wallet?.account.address || !file) return;
    setTxLoading(true);
    setTxName("Minting an NFT so it can be registered as an IP Asset...");
    const formData = new FormData();
    formData.append("name", values.name);
    formData.append("description", values.description);
    formData.append("file", file);
    const { ipfsUri, ipfsJson } = await uploadJSONToIPFS(formData);

    const tokenId = await mintNFT(wallet.account.address, ipfsUri);
    registerExistingNFT(
      tokenId,
      "0xe8E8dd120b067ba86cf82B711cC4Ca9F22C89EDc",
      ipfsUri,
      ipfsJson
    );
  };

  const handleRedirectToDashboard = () => {
    window.location.href = '/dashboard';
  };

  return (
    <div className="flex mt-8 justify-center min-h-screen">
      {isRegistrationComplete ? (
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Registration Completed!</h2>
          <p className="mb-4">Your asset has been successfully registered.</p>
          <Button onClick={handleRedirectToDashboard}>Go to Dashboard</Button>
        </div>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(mintAndRegisterNFT)} className="space-y-8 w-full max-w-md">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Asset name" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder="Describe your work" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormItem>
              <FormLabel>Upload your work</FormLabel>
              <FormControl>
                <Input 
                  type="file" 
                  accept="image/*,video/*,audio/*" 
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
              </FormControl>
            </FormItem>
            <Button type="submit">Register</Button>
          </form>
        </Form>
      )}
    </div>
  )
}