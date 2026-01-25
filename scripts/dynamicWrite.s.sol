// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {Script, console} from "forge-std/Script.sol";
import {CoinbaseSmartWallet} from "./interfaces/CoinbaseSmartWallet.sol";

/**
 * @title DynamicWrite
 * @notice Generic script to make arbitrary write calls via Smart Wallet execute()
 * @dev Uses execute() to forward calls, enabling AA-compatible execution
 *      Set TARGET, VALUE, and CALL_DATA in environment
 */
contract DynamicWrite is Script {
    address constant SMART_WALLET = vm.envAddress("SMART_WALLET_ADDRESS");

    function run() external {
        address target = vm.envAddress("TARGET_ADDRESS");
        uint256 value = vm.envUint("CALL_VALUE");
        bytes memory callData = vm.envBytes("CALL_DATA");

        CoinbaseSmartWallet wallet = CoinbaseSmartWallet(payable(SMART_WALLET));

        console.log("Executing call to:", target);
        console.log("Value:", value);
        console.log("Call data length:", callData.length);

        wallet.execute(target, value, callData);

        console.log("Call executed successfully");
    }
}
