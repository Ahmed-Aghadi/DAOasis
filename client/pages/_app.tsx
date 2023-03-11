import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import {useEffect, useState} from "react";
import {SafeEventEmitterProvider} from "@web3auth/base";
import { SafeAuthKit, SafeAuthProviderType } from '@safe-global/auth-kit'

export default function App({ Component, pageProps }: AppProps) {
  const [safeAuth, setSafeAuth] = useState<SafeAuthKit>()
  const [provider, setProvider] = useState<SafeEventEmitterProvider | null>(null)

  useEffect(() => {
    ;(async () => {
      setSafeAuth(
          await SafeAuthKit.init(SafeAuthProviderType.Web3Auth, {
            chainId: '0x13881',
            txServiceUrl: 'https://safe-transaction-goerli.safe.global', // Optional. Only if want to retrieve related safes
            authProviderConfig: {
              rpcTarget: `https://polygon-mumbai.g.alchemy.com/v2/FhukjFEzDF-wIU2JxA11kGHQhevBg3AB`,
              clientId:
                  'BPw_nSO-LJembIhBHn-ga0hDG0LBSC0TBIuY7jNXdcKrp_QnKkx35bjcxSFLo5U-DkdkoRn08QNnGx9zY94m9Gg',
              network: 'testnet',
              theme: 'dark'
            }
          })
      )
    })()
  }, [])

  return <Component {...pageProps} />
}
