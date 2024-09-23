"use client"
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  DynamicEmbeddedWidget,
  useDynamicContext
} from "@dynamic-labs/sdk-react-core";
import { useWalletClient } from "wagmi";
import Loading from "./loading";

function WalletConnectWrapper() {
  const { user } = useDynamicContext();
  const router = useRouter();
  const { data: wallet } = useWalletClient();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (wallet?.account.address) {
      setIsLoading(true);
      // Redirect to the new page when user is connected
      router.push('/dashboard');
    }
  }, [user, router, wallet]);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div style={{
        marginLeft: "15%",
        marginRight: "15%",
    }}>
      <DynamicEmbeddedWidget/>
    </div>
  );
}

export default function Waller() {
  return (
    <WalletConnectWrapper />
  );
}