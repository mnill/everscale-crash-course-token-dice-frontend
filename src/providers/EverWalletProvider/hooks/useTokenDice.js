import {ever, EverWalletContext, TokenDiceContractAddress} from "../index";
import {useCallback, useContext, useEffect, useState} from "react";
import TokenDiceAbi from "../abi/TokenDice.abi.json";
import BigNumber from "bignumber.js";

export function useTokenDice() {
  const {isConnected} = useContext(EverWalletContext);
  const [contract, setContract] = useState(undefined);
  const [maxBet, setMaxBet] = useState(undefined);

  useEffect( () => {
    let stale = false;
    setContract(new ever.Contract(TokenDiceAbi, TokenDiceContractAddress))
    return () => {
      stale = true;
      setContract(undefined);
    }
  }, [isConnected]);

  useEffect(() => {
    if (contract) {
      let stale = false;

      function updateMaxBet() {
        // For responsible view we use .call, but for simple view we use .
        contract.methods.maxBet().call().then((answer) => {
          if (!stale) {
            setMaxBet(new BigNumber(answer.value0));
          }
        });
      }
      updateMaxBet();

      const subscriber = new ever.Subscriber();
      subscriber.transactions(contract.address).on((tx) => {
        if (!stale) {
          updateMaxBet();
        }
      });

      return () => {
        stale = true;
        setMaxBet(undefined);
        subscriber.unsubscribe();
      }
    }
  }, [contract]);

  const decodeEvents = useCallback(async function (tx) {
    return await contract.decodeTransactionEvents({
      transaction: tx,
    })
  }, [contract]);

  return {
    isLoaded: !!contract && maxBet !== undefined,
    maxBet: maxBet,
    decodeEvents
  };
}
