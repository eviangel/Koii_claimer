# Koii_claimer
This code is simplified from @_koii/create-task-cli , just to make claiming rewards easier. 
You need to create json file that contains : 

{
    "taskStateInfoAddress": "6GbpHRK3duDbo3dCEFXuJ2KD5Hg6Yo4A9LyHozeE7rjN",
    "stakePotAccount": "FnQm11NXJxPSjza3fuhuQ6Cu4fKNqdaPkVSRyLSWf14d",
    "beneficiaryAccount": "HERE_YOUR_WALLET_PUBLIC_ADDRESS",
    "claimerKeypairPath": "VPS-task/namespace/staking_wallet.json"
}

Then all you need is to call : 
npx koii_claimreweards1@latest test/params.json

