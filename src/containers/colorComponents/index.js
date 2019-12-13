import React, { useEffect } from 'react';
import Home from './home/home.jsx';
import SeeExistingAccounts from './seeExistingAccounts/seeExistingAccounts.jsx';
import SignExtension from './signExtension/signExtension.jsx';
import SubmitProposal from './submitProposal/submitProposal.jsx';

export default function Index(props) {
  function allStorage() {
    var values = [],
      keys = Object.keys(localStorage).map((type, key) => {
        if (type.includes('cosmos-wallets-colors')) {
          return type;
        } else {
          return undefined;
        }
      }),
      i = keys.length;

    while (i--) {
      if (keys[i] !== undefined) {
        values.push(JSON.parse(localStorage.getItem(keys[i])));
      }
    }

    return values;
  }

  const [latestSignReq, setLatest] = React.useState(undefined);
  const [senderAddress, setSender] = React.useState(undefined);
  const [submitProposal, setsubmitProposal] = React.useState(undefined);

  useEffect(() => {
    let temp = localStorage.getItem('latestSignReq');
    let tempS = localStorage.getItem('senderAddress');
    let tempSubmit = localStorage.getItem('submitProposal');
    console.log(tempS);
    temp = JSON.parse(temp);
    if (temp !== null) {
      setLatest(temp);
    }
    if (tempS !== null) {
      setSender(tempS);
    }
    if (tempSubmit !== null) {
      setsubmitProposal(tempSubmit);
    }
  }, []);
  const usersExist = allStorage();
  console.log(latestSignReq, '==================================');
  return (
    <React.Fragment>
      {latestSignReq !== undefined ? (
        <SignExtension
          latestSignReq={latestSignReq}
          senderAddress={senderAddress}
        />
      ) : submitProposal !== undefined ? (
        <SubmitProposal />
      ) : usersExist.length !== 0 ? (
        <SeeExistingAccounts logo={props.logo} />
      ) : (
        <Home logo={props.logo} />
      )}
    </React.Fragment>
  );
}
