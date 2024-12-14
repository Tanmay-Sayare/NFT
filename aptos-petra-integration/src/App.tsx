import { useEffect, useState } from 'react';
import { AptosClient, AptosAccount, FaucetClient } from 'aptos';

const NODE_URL = 'https://fullnode.devnet.aptoslabs.com';
const FAUCET_URL = 'https://faucet.devnet.aptoslabs.com';

function App() {
  const [walletConnected, setWalletConnected] = useState(false);
  const [devnetId, setDevnetId] = useState(null);
  const [tokenBalance, setTokenBalance] = useState(null);
  const [error, setError] = useState(null);

  const client = new AptosClient(NODE_URL);
  const faucetClient = new FaucetClient(NODE_URL, FAUCET_URL);

  // Function to connect the Petra Wallet
  const connectWallet = async () => {
    try {
      if (!window.aptos) {
        alert('Petra wallet not found! Please install the extension.');
        return;
      }

      const response = await window.aptos.connect();
      if (response.address) {
        setDevnetId(response.address);
        setWalletConnected(true);
      }
    } catch (err) {
      console.error('Error connecting wallet:', err);
      setError('Failed to connect wallet');
    }
  };

  // Function to fetch token balance of the connected wallet
  const fetchTokenBalance = async () => {
    try {
      if (!devnetId) {
        alert('Please connect your wallet first!');
        return;
      }

      const resources = await client.getAccountResources(devnetId);
      const coinStore = resources.find(resource => resource.type.includes('0x1::coin::CoinStore'));

      if (coinStore) {
        const balance = coinStore.data.coin.value;
        setTokenBalance(balance);
      } else {
        setTokenBalance('0');
      }
    } catch (err) {
      console.error('Error fetching token balance:', err);
      setError('Failed to fetch token balance');
    }
  };

  useEffect(() => {
    if (walletConnected) {
      fetchTokenBalance();
    }
  }, [walletConnected]);

  return (
    <div style={{ textAlign: 'center', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: '#4A90E2' }}>Aptos + Petra Wallet Integration</h1>
      {walletConnected ? (
        <div style={{ backgroundColor: '#F0F0F0', padding: '20px', borderRadius: '10px', display: 'inline-block' }}>
          <h2 style={{ color: '#333' }}>Wallet Connected</h2>
          <p><strong>Devnet ID:</strong> {devnetId}</p>
          <p><strong>Token Balance:</strong> {tokenBalance ?? 'Fetching...'}</p>
          <button 
            onClick={fetchTokenBalance} 
            style={{ 
              marginTop: '10px', 
              padding: '10px 20px', 
              backgroundColor: '#4A90E2', 
              color: 'white', 
              border: 'none', 
              borderRadius: '5px', 
              cursor: 'pointer' 
            }}
          >
            Refresh Balance
          </button>
        </div>
      ) : (
        <button 
          onClick={connectWallet} 
          style={{ 
            marginTop: '10px', 
            padding: '10px 20px', 
            backgroundColor: '#4A90E2', 
            color: 'white', 
            border: 'none', 
            borderRadius: '5px', 
            cursor: 'pointer' 
          }}
        >
          Connect Wallet
        </button>
      )}

      {error && <p style={{ color: 'red', marginTop: '20px' }}>{error}</p>}
    </div>
  );
}

export default App;
