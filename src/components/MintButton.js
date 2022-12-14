import React, {useCallback, useEffect, useState} from "react";
import {ever, TokenDiceContractAddress} from "../providers/EverWalletProvider";

export default function MintButton({text, sender, receiver, mint, onError}) {
  let [inProgress, setIntProgress] = useState(false);

  const _mint = useCallback(() => {
    if (inProgress)
      return;
    setIntProgress(true);
    mint(sender, receiver).then(function (tx) {
      const subscriber = new ever.Subscriber();
      subscriber.trace(tx).finished().then(function () {
        //tx chain finished
        setIntProgress(false);
      })
    }).catch((e) => {
      //Rejected by user
      setIntProgress(false);
      if (e.code !== 3) {
        onError(e.message);
      }
    })
  }, [inProgress, setIntProgress, sender, receiver, mint, onError])

  return <span className={'button'} style={{minWidth: '165px'}} onClick={_mint}>
    {
      inProgress ? <span className={'loader'} style={{width: '24px', height: '24px'}}></span> : text
    }
  </span>
}