// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {Script, console} from "forge-std/Script.sol";
import {CoinbaseSmartWallet} from "./interfaces/CoinbaseSmartWallet.sol";

/**
 * @title RemoveOwner
 * @notice Script to remove an owner from Coinbase Smart Wallet by index
 * @dev Removes owner at specified index using removeOwnerAtIndex
 *      Owner bytes must be left-padded address (32 bytes total)
 */
contract RemoveOwner is Script {
    address constant SMART_WALLET = vm.envAddress("SMART_WALLET_ADDRESS");

    function run() external {
        uint256 ownerIndex = vm.envUint("OWNER_INDEX_TO_REMOVE");
        address ownerAddress = vm.envAddress("COMPROMISED_OWNER_ADDRESS");

        // Convert address to bytes (left-padded to 32 bytes)
        bytes memory ownerBytes = abi.encodePacked(bytes12(0), ownerAddress);

        CoinbaseSmartWallet wallet = CoinbaseSmartWallet(payable(SMART_WALLET));

        // Validate owner count before removal
        uint256 countBefore = wallet.ownerCount();
        console.log("Owner count before removal:", countBefore);
        require(countBefore > 1, "Cannot remove last owner");

        // Verify owner at index matches
        bytes memory ownerAtIdx = wallet.ownerAtIndex(ownerIndex);
        require(
            keccak256(ownerAtIdx) == keccak256(ownerBytes),
            "Owner bytes mismatch at index"
        );

        console.log("Removing owner at index", ownerIndex);
        console.log("Owner address:", ownerAddress);

        // Execute removal
        wallet.removeOwnerAtIndex(ownerIndex, ownerBytes);

        // Validate removal
        uint256 countAfter = wallet.ownerCount();
        console.log("Owner count after removal:", countAfter);
        require(countAfter == countBefore - 1, "Owner count mismatch");
    }
}
