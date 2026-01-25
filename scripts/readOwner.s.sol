// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {Script, console} from "forge-std/Script.sol";
import {CoinbaseSmartWallet} from "./interfaces/CoinbaseSmartWallet.sol";

/**
 * @title ReadOwner
 * @notice Script to read owner information from Coinbase Smart Wallet
 * @dev Reads ownerCount and ownerAtIndex for validation
 */
contract ReadOwner is Script {
    address constant SMART_WALLET = vm.envAddress("SMART_WALLET_ADDRESS");

    function run() external view {
        CoinbaseSmartWallet wallet = CoinbaseSmartWallet(payable(SMART_WALLET));

        uint256 count = wallet.ownerCount();
        console.log("Owner Count:", count);

        for (uint256 i = 0; i < count; i++) {
            bytes memory ownerBytes = wallet.ownerAtIndex(i);
            // Owner bytes are left-padded: 12 bytes zeros + 20 bytes address
            address ownerAddress;
            assembly {
                ownerAddress := mload(add(ownerBytes, 12))
            }
            console.log("Owner at index", i, ":", ownerAddress);
            console.log("Owner bytes (hex):", vm.toString(ownerBytes));
        }
    }
}
