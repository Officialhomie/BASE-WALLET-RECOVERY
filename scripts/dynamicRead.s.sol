// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {Script, console} from "forge-std/Script.sol";

/**
 * @title DynamicRead
 * @notice Generic script to make arbitrary read calls to the Smart Wallet
 * @dev Uses cast-style ABI encoding for flexible function calls
 *      Set FUNCTION_SELECTOR and FUNCTION_ARGS in environment
 */
contract DynamicRead is Script {
    address constant SMART_WALLET = vm.envAddress("SMART_WALLET_ADDRESS");

    function run() external view returns (bytes memory) {
        bytes4 selector = bytes4(vm.envBytes32("FUNCTION_SELECTOR"));
        bytes memory args = vm.envBytes("FUNCTION_ARGS");
        bytes memory callData = abi.encodePacked(selector, args);

        (bool success, bytes memory returnData) = SMART_WALLET.staticcall(callData);
        require(success, "Call failed");

        console.log("Return data:", vm.toString(returnData));
        return returnData;
    }
}
