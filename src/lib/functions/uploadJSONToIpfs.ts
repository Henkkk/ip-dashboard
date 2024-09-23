"use server";
const pinataSDK = require("@pinata/sdk");

export async function uploadJSONToIPFS(formData: FormData) {
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const imageFile = formData.get("file") as File;

  // First pin the image
  const data = new FormData();
  data.append("file", imageFile);
  const pinFileRes = await fetch(
    "https://api.pinata.cloud/pinning/pinFileToIPFS",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_PINATA_API_KEY}`,
      },
      body: data,
    }
  );
  const { IpfsHash: ImageIpfsHash } = await pinFileRes.json();

  // Next pin the JSON
  const pinata = new pinataSDK({ pinataJWTKey: process.env.NEXT_PUBLIC_PINATA_API_KEY });
  const json = {
    name,
    description,
    image: `ipfs://${ImageIpfsHash}`,
  };
  const { IpfsHash: JsonIpfsHash } = await pinata.pinJSONToIPFS(json);
  return { ipfsUri: `ipfs://${JsonIpfsHash}`, ipfsJson: json };
}
