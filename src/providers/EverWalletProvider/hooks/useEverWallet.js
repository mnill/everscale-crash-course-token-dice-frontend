import {EverWalletContext} from "../index";
import {useContext} from "react";

export function useEverWallet() {
  const {isInitializing, isConnected, hasProvider, selectedNetworkId, account, login, logout} = useContext(EverWalletContext);
  return {isInitializing, isConnected, hasProvider, selectedNetworkId, account, login, logout};
}
