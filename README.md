# Koii_claimer
This code is simplified from @_koii/create-task-cli , just to make claiming rewards easier. 
You need to create json file that contains let's call it **"params.json"** : 

```
nano params.json
```


    {"taskStateInfoAddress": "4ipWnABntsvJPsAkwyMF7Re4z39ZUMs2S2dfEm5aa2is",
    
    "stakePotAccount": "stakepotaccountsP9iQfvCxMeS7RNNgrSVTDyxJRPQ",
    
    "beneficiaryAccount": "HERE_YOUR_WALLET_PUBLIC_ADDRESS",
    
    "claimerKeypairPath": "VPS-task/namespace/staking_wallet.json"}


*this json file is an example for the free token task only.

Then all you need is to call : 

```
npx koii_claimrewards@latest params.json
```
