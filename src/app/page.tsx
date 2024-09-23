import Image from "next/image"
import ConnectWallet from "@/components/ui/connect-wallet"
import Banner from "../../media/Story_Protocol_Banner.png"

export const description =
  "A login page with two columns. The first column has the login form with email and password. There's a Forgot your passwork link and a link to sign up if you do not have an account. The second column has a cover image."

export default function App() {
  return (
    <div className="w-full h-screen lg:grid lg:grid-cols-2">
      <div className="py-12">
        <h3 className="text-center text-2xl font-bold">Connect your wallet to continue</h3>
        <ConnectWallet />
      </div>
      <div className="hidden bg-muted lg:block">
        <Image
          src={Banner}
          alt="Image"
          width="1920"
          height="1080"
          className="w-full h-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  )
}
