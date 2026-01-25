// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

/**
 * @title CoinbaseSmartWallet
 * @notice Interface for Coinbase Smart Wallet contract
 * @dev Core functions for owner management and execution
 */
interface CoinbaseSmartWallet {
    struct Call {
        address target;
        uint256 value;
        bytes data;
    }

    // Owner management
    function ownerCount() external view returns (uint256);
    function ownerAtIndex(uint256 index) external view returns (bytes memory);
    function addOwnerAddress(address owner) external;
    function removeOwnerAtIndex(uint256 index, bytes memory owner) external;
    function removeLastOwner(uint256 index, bytes memory owner) external;
    function isOwnerAddress(address account) external view returns (bool);
    function isOwnerBytes(bytes memory account) external view returns (bool);

    // Execution
    function execute(address target, uint256 value, bytes memory data) external payable;
    function executeBatch(Call[] memory calls) external payable;
    function entryPoint() external view returns (address);

    // ERC-4337
    function validateUserOp(
        UserOperation calldata userOp,
        bytes32 userOpHash,
        uint256 missingAccountFunds
    ) external returns (uint256 validationData);

    function getUserOpHashWithoutChainId(UserOperation calldata userOp) external view returns (bytes32);
}

struct UserOperation {
    address sender;
    uint256 nonce;
    bytes initCode;
    bytes callData;
    uint256 callGasLimit;
    uint256 verificationGasLimit;
    uint256 preVerificationGas;
    uint256 maxFeePerGas;
    uint256 maxPriorityFeePerGas;
    bytes paymasterAndData;
    bytes signature;
}
