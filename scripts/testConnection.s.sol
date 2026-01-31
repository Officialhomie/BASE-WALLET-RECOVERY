// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {Script, console} from "forge-std/Script.sol";
import {CoinbaseSmartWallet} from "./interfaces/CoinbaseSmartWallet.sol";

/**
 * @title TestConnection
 * @notice Test script to verify all environment variables and connections
 * @dev Tests RPC connection, wallet access, owner information, and configuration
 */
contract TestConnection is Script {
    address constant SMART_WALLET = vm.envAddress("SMART_WALLET_ADDRESS");
    address constant SAFE_OWNER = vm.envAddress("SAFE_OWNER_ADDRESS");
    address constant COMPROMISED_OWNER = vm.envAddress("COMPROMISED_OWNER_ADDRESS");
    uint256 constant OWNER_INDEX = vm.envUint("OWNER_INDEX_TO_REMOVE");

    function run() external view {
        console.log("=== Testing Base Wallet Recovery Configuration ===\n");

        // Test 1: RPC Connection
        testRPCConnection();

        // Test 2: Wallet Access
        testWalletAccess();

        // Test 3: Owner Information
        testOwnerInformation();

        // Test 4: Configuration Validation
        testConfiguration();

        console.log("\n=== All Tests Completed ===");
    }

    function testRPCConnection() internal view {
        console.log("Test 1: RPC Connection");
        console.log("----------------------");
        
        uint256 blockNumber = block.number;
        console.log("Current block number:", blockNumber);
        console.log("RPC connection: OK\n");
    }

    function testWalletAccess() internal view {
        console.log("Test 2: Wallet Access");
        console.log("---------------------");
        
        CoinbaseSmartWallet wallet = CoinbaseSmartWallet(payable(SMART_WALLET));
        
        // Check if wallet is a contract
        uint256 codeSize;
        assembly {
            codeSize := extcodesize(SMART_WALLET)
        }
        
        if (codeSize == 0) {
            console.log("ERROR: Address is not a contract!");
            return;
        }
        
        console.log("Wallet address:", SMART_WALLET);
        console.log("Contract code size:", codeSize, "bytes");
        console.log("Wallet access: OK\n");
    }

    function testOwnerInformation() internal view {
        console.log("Test 3: Owner Information");
        console.log("-------------------------");
        
        CoinbaseSmartWallet wallet = CoinbaseSmartWallet(payable(SMART_WALLET));
        
        // Get owner count
        uint256 count = wallet.ownerCount();
        console.log("Total owners:", count);
        
        if (count == 0) {
            console.log("ERROR: No owners found!");
            return;
        }
        
        // Check each owner
        for (uint256 i = 0; i < count; i++) {
            bytes memory ownerBytes = wallet.ownerAtIndex(i);
            address ownerAddress;
            assembly {
                ownerAddress := mload(add(ownerBytes, 12))
            }
            
            console.log("Owner", i, ":", ownerAddress);
            
            // Check if it's the safe owner
            if (ownerAddress == SAFE_OWNER) {
                console.log("  -> This is your SAFE owner");
            }
            
            // Check if it's the compromised owner
            if (ownerAddress == COMPROMISED_OWNER) {
                console.log("  -> This is the COMPROMISED owner");
            }
        }
        
        // Verify safe owner
        bool isSafeOwner = wallet.isOwnerAddress(SAFE_OWNER);
        console.log("\nSafe owner verified:", isSafeOwner);
        
        // Verify compromised owner
        bool isCompromisedOwner = wallet.isOwnerAddress(COMPROMISED_OWNER);
        console.log("Compromised owner verified:", isCompromisedOwner);
        
        // Check owner at target index
        if (OWNER_INDEX < count) {
            bytes memory ownerAtIdx = wallet.ownerAtIndex(OWNER_INDEX);
            address ownerAtIdxAddr;
            assembly {
                ownerAtIdxAddr := mload(add(ownerAtIdx, 12))
            }
            console.log("\nOwner at index", OWNER_INDEX, ":", ownerAtIdxAddr);
            console.log("Matches compromised owner:", ownerAtIdxAddr == COMPROMISED_OWNER);
        } else {
            console.log("\nWARNING: Owner index", OWNER_INDEX, "is out of bounds!");
        }
        
        console.log("Owner information: OK\n");
    }

    function testConfiguration() internal view {
        console.log("Test 4: Configuration Validation");
        console.log("----------------------------------");
        
        console.log("Smart Wallet:", SMART_WALLET);
        console.log("Safe Owner:", SAFE_OWNER);
        console.log("Compromised Owner:", COMPROMISED_OWNER);
        console.log("Target Index:", OWNER_INDEX);
        
        // Validate addresses are different
        require(SMART_WALLET != SAFE_OWNER, "Smart wallet cannot be safe owner");
        require(SMART_WALLET != COMPROMISED_OWNER, "Smart wallet cannot be compromised owner");
        require(SAFE_OWNER != COMPROMISED_OWNER, "Safe and compromised owners must be different");
        
        console.log("\nAddress validation: OK");
        console.log("Configuration: OK\n");
    }
}
