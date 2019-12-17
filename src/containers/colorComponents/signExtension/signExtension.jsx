/*global chrome*/
import React from 'react';
import color from '../../../assets/img/color.svg';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { fullDecimals, viewDenom } from '../scripts/num';
import { getStoredWallet, signWithPrivateKey } from '@rnssolution/color-keys';
import { goTo } from 'react-chrome-extension-router';
import TransactionSuccess from '../transactionsuccess/transactionSuccess';

let latestSignReq = localStorage.getItem('latestSignReq');
latestSignReq = JSON.parse(latestSignReq);

console.log('signExtension', latestSignReq);
export default function SignExtension(props) {
  let subtotal = parseFloat(latestSignReq.msgs[0].value.amount[0].amount);
  let networkfee = parseFloat(latestSignReq.fee.gas);
  subtotal = subtotal / 1000000;
  networkfee = networkfee * 0.000000001;
  let total = subtotal + networkfee;

  const [error, setError] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const [tocopied, settoCopied] = React.useState(false);
  ///Sign A transaction using Extension
  function signWithExtension(address, password, signMessage) {
    let wallet;
    let signature;
    let addr = localStorage.getItem('senderAddress');
    try {
      wallet = getStoredWallet(addr.substr(1, addr.length - 2), password);
      signature = signWithPrivateKey(
        JSON.stringify(signMessage),
        Buffer.from(wallet.privateKey, 'hex')
      );
      chrome.runtime.sendMessage(
        {
          method: 'LUNIE_SIGN_REQUEST_RESPONSE',
          data: {
            signature: signature.toString('hex'),
            publicKey: wallet.publicKey,
          },
        },
        function(response) {
          console.log(response);
          localStorage.removeItem('latestSignReq');
          localStorage.removeItem('senderAddress');
          goTo(TransactionSuccess);
        }
      );
    } catch (err) {
      console.log(err);
      setPassword('');
      setError(true);
      setTimeout(() => setError(false), 3000);
    }
  }

  function passWordChange(e) {
    setPassword(e.target.value);
    setError(false);
  }

  function set() {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function setTo() {
    settoCopied(true);
    setTimeout(() => settoCopied(false), 2000);
  }

  const [password, setPassword] = React.useState('');
  function reject(e, address, password, signMessage) {
    // e.preventDefault();
    let addr = localStorage.getItem('senderAddress');
    // const wallet = getStoredWallet(addr.substr(1, addr.length - 2), password);
    // // return signMessage => {
    // // const signature = signWithPrivateKey(
    // //   signMessage,
    // //   Buffer.from(wallet.privateKey, 'hex')
    // // );
    chrome.runtime.sendMessage(
      {
        method: 'rejectsignaccount',
        data: {
          rejected: true,
        },
      },
      function(response) {
        // localStorage.removeItem('latestSignReq');
        // localStorage.removeItem('senderAddress');
      }
    );
    localStorage.removeItem('latestSignReq');
    localStorage.removeItem('senderAddress');
    window.close();
  }

  const { senderAddress } = props.senderAddress;
  return (
    <div className="session-approve">
      <h2>Approve Transaction</h2>
      <br />
      <div className="from">
        From&nbsp;
        <div className="bech32-address">
          <div className="address">
            <CopyToClipboard
              text={latestSignReq.msgs[0].value.from_address}
              onCopy={() => set()}
            >
              <span>
                {latestSignReq.msgs[0].value.from_address.substr(0, 6) +
                  '...' +
                  latestSignReq.msgs[0].value.from_address.substr(
                    latestSignReq.msgs[0].value.from_address.length - 4,
                    latestSignReq.msgs[0].value.from_address.length - 1
                  )}
                {copied && (
                  <span style={{ color: 'green', fontSize: '10px' }}>
                    &nbsp;&#10004;&nbsp;Copied
                  </span>
                )}
              </span>
            </CopyToClipboard>
          </div>
          <div className="copied">
            <i className="material-icons">check</i>
          </div>
        </div>
      </div>
      <div className="tm-form-group">
        <div className="tm-form-group__field">
          <div className="tx">
            <div className="tx__icon">
              <img src={color} alt="cosmic atom token" className="banking" />
            </div>
            <div className="tx__content">
              <div className="tx__content__left">
                <div
                  className="tx__content__caption"
                  style={{ color: 'black' }}
                >
                  <p>
                    Sent&nbsp;
                    <b>{fullDecimals(subtotal)}&nbsp;</b>
                    <span>CLR</span>
                  </p>
                </div>
                <div className="tx__content__information">
                  To&nbsp;
                  <div className="bech32-address">
                    <div className="address">
                      <CopyToClipboard
                        text={latestSignReq.msgs[0].value.to_address}
                        onCopy={() => setTo()}
                      >
                        <span>
                          {latestSignReq.msgs[0].value.to_address.substr(0, 6) +
                            '...' +
                            latestSignReq.msgs[0].value.to_address.substr(
                              latestSignReq.msgs[0].value.to_address.length - 4,
                              latestSignReq.msgs[0].value.to_address.length - 1
                            )}
                        </span>
                      </CopyToClipboard>
                    </div>
                    <div className="copied">
                      <i className="material-icons">check</i>
                    </div>
                  </div>
                  {tocopied && (
                    <span style={{ color: 'green', fontSize: '10px' }}>
                      &nbsp;&#10004;&nbsp;Copied
                    </span>
                  )}
                  <span>&nbsp;- (Sent via Color Wallet)</span>
                </div>
              </div>
            </div>
          </div>
          <div className="approval-table">
            <ul className="table-invoice">
              <li>
                <span>Subtotal</span>
                <span>{fullDecimals(subtotal)}&nbsp;CLR</span>
              </li>
              <li>
                <span>Network Fee</span>
                <span>{fullDecimals(networkfee)}&nbsp;CLR</span>
              </li>
              <li className="total-row">
                <span>Total</span>
                <span>{fullDecimals(total)}&nbsp;CLR</span>
              </li>
            </ul>
          </div>
          <div className="action-modal-group tm-form-group">
            <label for="password" className="tm-form-group__label">
              Password
            </label>
            <div className="tm-form-group__field">
              <input
                type="password"
                placeholder="Password"
                className="tm-field"
                id="password"
                value={password}
                onChange={(e) => passWordChange(e)}
              />
            </div>
            <div>
              {error && (
                <span style={{ color: 'red', fontSize: '14px' }}>
                  Incorrect Password
                </span>
              )}
            </div>
          </div>
          <div className="session-approve-footer">
            <button
              className="button left-button secondary"
              id="reject-btn"
              onClick={(e) =>
                reject(e, senderAddress, password, {
                  chain_id: latestSignReq.chain_id,
                  account_number: latestSignReq.account_number,
                  sequence: latestSignReq.sequence,
                  fee: latestSignReq.fee,
                  msgs: latestSignReq.msgs,
                  memo: latestSignReq.memo,
                })
              }
            >
              Reject
            </button>
            <button
              className="button right-button"
              id="approve-btn"
              onClick={() =>
                signWithExtension(
                  latestSignReq.msgs[0].value.from_address,
                  password,
                  {
                    account_number: latestSignReq.account_number,
                    chain_id: latestSignReq.chain_id,
                    fee: latestSignReq.fee,
                    memo: latestSignReq.memo,
                    msgs: latestSignReq.msgs,
                    sequence: latestSignReq.sequence,
                  }
                )
              }
            >
              Approve
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
