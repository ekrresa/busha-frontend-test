import * as React from "react";
import styled from "styled-components";

import Modal from "../shared/Modal";
import Loader from "../shared/Loader";
import { ReactComponent as Close } from "../../assets/close.svg";
import { ReactComponent as Warning } from "../../assets/warning.svg";
import NetworkError from "../shared/NetworkError";

interface AddNewWalletProps {
  onWalletCreate: () => void;
}

interface Wallet {
  currency: string;
  name: string;
  type: string;
  imgURL: string;
}

interface WalletState {
  loading: boolean;
  data: Wallet[];
  error: boolean;
}

const API_BASE_URL =
  process.env.NODE_ENV === "test" ? "http://localhost:3090" : "";

export default function AddNewWallet({ onWalletCreate }: AddNewWalletProps) {
  const [currency, setCurrency] = React.useState("");
  const [isModalOpen, setModalOpen] = React.useState(false);
  const [createWallet, setCreateWallet] = React.useState({
    loading: false,
    error: false,
  });
  const [wallets, setWallets] = React.useState<WalletState>({
    loading: true,
    data: [],
    error: false,
  });

  // Fetch wallets effect
  React.useEffect(() => {
    (async () => {
      if (!wallets.loading) return;

      setWallets((wallets) => ({ ...wallets, loading: true, error: false }));

      try {
        const response = await fetch(API_BASE_URL + "/wallets");
        if (!response.ok) {
          throw new Error("Error fetching wallets");
        }

        const data = await response.json();

        setWallets((wallets) => ({ ...wallets, data, loading: false }));
      } catch (error) {
        setWallets((wallets) => ({ ...wallets, error: true, loading: false }));
      }
    })();
  }, [wallets.loading]);

  // Handles creating an account
  React.useEffect(() => {
    (async () => {
      if (!createWallet.loading) return;

      try {
        const response = await fetch(API_BASE_URL + "/accounts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ currency }),
        });

        const data = await response.json();
        if (data.error) {
          throw new Error(data.error);
        }

        setCreateWallet((info) => ({ ...info, loading: false }));
        setWallets((wallets) => ({
          ...wallets,
          data: wallets.data.filter((wallet) => wallet.currency !== currency),
        }));
        setCurrency("");
        onWalletCreate();
        setModalOpen(false);
      } catch (error) {
        setCreateWallet({ loading: false, error: true });
      }
    })();
  }, [createWallet.loading, currency, onWalletCreate]);

  const addWallet = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currency) return;
    setCreateWallet({ loading: true, error: false });
  };

  return (
    <StyledContainer>
      <button className="new__item" onClick={() => setModalOpen(true)}>
        + Add new wallet
      </button>

      <Modal isOpen={isModalOpen} data-testid="modal">
        <AddNewWalletContent>
          {wallets.loading ? (
            <div className="loader">
              <Loader width={4} size={50} />
            </div>
          ) : wallets.error ? (
            <div className="fetch__error">
              <NetworkError
                retryRequest={() =>
                  setWallets((wallets) => ({ ...wallets, loading: true }))
                }
              />
            </div>
          ) : (
            <>
              <div className="header">
                <h2>Add new wallet</h2>

                <button
                  onClick={() => setModalOpen(false)}
                  aria-label="Close button"
                >
                  <Close className="close" />
                </button>
              </div>

              <p className="text">
                The crypto wallet will be created instantly and be available in
                your list of wallets.
              </p>

              <form className="wallets__form" onSubmit={addWallet}>
                <label htmlFor="currency">Select wallet</label>
                <select
                  id="currency"
                  onChange={(e) => setCurrency(e.currentTarget.value)}
                  value={currency}
                >
                  <option value="">Select:</option>
                  {wallets.data.map((wallet) => (
                    <option key={wallet.name} value={wallet.currency}>
                      {wallet.name}
                    </option>
                  ))}
                </select>

                <button
                  className="submit__wallet"
                  type="submit"
                  disabled={createWallet.loading}
                >
                  <span>Create wallet</span>
                  {createWallet.loading && (
                    <span style={{ marginLeft: "3px" }}>
                      <Loader size={20} />
                    </span>
                  )}
                </button>
              </form>

              {Boolean(createWallet.error) && (
                <div className="error">
                  <Warning className="warning" />
                  <span>Network Error</span>
                  <Close
                    aria-label="Reset error"
                    className="close"
                    onClick={() =>
                      setCreateWallet((info) => ({ ...info, error: false }))
                    }
                  />
                </div>
              )}
            </>
          )}
        </AddNewWalletContent>
      </Modal>
    </StyledContainer>
  );
}

const StyledContainer = styled.div`
  margin-left: auto;

  .new__item {
    background: none;
    border: none;
    color: #000;
    font-weight: 500;
    font-size: 0.875rem;
    margin-bottom: 0.5rem;
  }
`;

const AddNewWalletContent = styled.div`
  position: relative;
  padding: 4rem 1.5rem;
  height: 100%;

  .loader,
  .fetch__error {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    h2 {
      font-size: 1.2rem;
      font-weight: 500;
    }
    button {
      background: none;
      border: none;

      .close {
        width: 0.8rem;
        fill: #000;
      }
    }
  }

  .text {
    font-size: 0.875rem;
    line-height: 1.6;
    color: #3e4c59;
  }

  .wallets__form {
    width: 100%;
    text-align: center;
    margin-top: 3rem;

    label {
      display: block;
      color: #3e4c59;
      font-weight: 500;
      font-size: 0.875rem;
      text-align: left;
    }
    select {
      width: 100%;
      padding: 0.8rem 0.5rem;
      border: 1px solid #cbd2d9;
      border-radius: 5px;
      margin-top: 7px;
      cursor: pointer;
    }
    .submit__wallet {
      background: #000;
      border-radius: 40px;
      color: #fff;
      border-color: #000;
      padding: 1rem 1.7rem;
      margin: auto;
      margin-top: 1rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }

  .error {
    display: flex;
    align-items: center;
    padding: 0.8rem;
    background: #fff4f4;
    border: 1px solid #e0b3b2;
    border-radius: 8px;
    margin-top: 2rem;

    span {
      display: inline-block;
      font-size: 0.875rem;
      font-weight: 500;
      margin-left: 1rem;
    }
    .warning {
      width: 1.3rem;
      fill: #d72c0d;
    }
    .close {
      margin-left: auto;
      width: 0.7rem;
      cursor: pointer;

      path {
        fill: #d72c0d;
      }
    }
  }
`;
