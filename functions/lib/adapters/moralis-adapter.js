"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMoralisAdapter = void 0;
const moralis_1 = __importDefault(require("moralis"));
let initialized = false;
const init = async () => {
    if (initialized)
        return;
    const apiKey = process.env.MORALIS_API_KEY;
    if (!apiKey)
        throw new Error("MORALIS_API_KEY environment variable is not set");
    await moralis_1.default.start({ apiKey });
    initialized = true;
};
const toChainHex = (chain) => {
    const map = {
        eth: "0x1",
        sepolia: "0xaa36a7",
        polygon: "0x89",
        mumbai: "0x13881",
        base: "0x2105",
        "base sepolia": "0x14a34",
        arbitrum: "0xa4b1",
        optimism: "0xa",
        bsc: "0x38",
    };
    return map[chain] ?? "0x1";
};
const parseMetadata = (raw) => {
    if (!raw)
        return null;
    try {
        return JSON.parse(raw);
    }
    catch {
        return null;
    }
};
const getWalletNFTs = async (walletAddress, chain, contractAddress, cursor, limit = 100) => {
    await init();
    const response = await moralis_1.default.EvmApi.nft.getWalletNFTs({
        address: walletAddress,
        chain: toChainHex(chain),
        limit,
        normalizeMetadata: true,
        ...(contractAddress ? { tokenAddresses: [contractAddress] } : {}),
        ...(cursor ? { cursor } : {}),
    });
    const json = response.toJSON();
    const rawResult = json.result ?? [];
    return {
        total: json.total ?? 0,
        page: json.page ?? 0,
        pageSize: json.page_size ?? limit,
        cursor: json.cursor ?? null,
        result: rawResult.map((r) => ({
            tokenId: r.token_id,
            tokenAddress: r.token_address,
            name: r.name ?? "",
            symbol: r.symbol ?? "",
            tokenUri: r.token_uri ?? null,
            metadata: parseMetadata(r.metadata),
            ownerOf: r.owner_of,
            chain,
            amount: r.amount ?? "1",
            contractType: r.contract_type,
            lastMetadataSync: r.last_metadata_sync ?? null,
            lastTokenUriSync: r.last_token_uri_sync ?? null,
        })),
    };
};
const getNFTMetadata = async (contractAddress, tokenId, chain) => {
    await init();
    try {
        const response = await moralis_1.default.EvmApi.nft.getNFTMetadata({
            address: contractAddress,
            tokenId,
            chain: toChainHex(chain),
            normalizeMetadata: true,
        });
        if (!response)
            return null;
        const r = response.toJSON();
        return {
            tokenId: r.token_id,
            tokenAddress: r.token_address,
            name: r.name ?? "",
            symbol: r.symbol ?? "",
            tokenUri: r.token_uri ?? null,
            metadata: parseMetadata(r.metadata),
            ownerOf: "",
            chain,
            amount: r.amount ?? "1",
            contractType: r.contract_type,
            lastMetadataSync: r.last_metadata_sync ?? null,
            lastTokenUriSync: r.last_token_uri_sync ?? null,
        };
    }
    catch {
        return null;
    }
};
const getNFTTransfers = async (walletAddress, chain, cursor, limit = 100) => {
    await init();
    const response = await moralis_1.default.EvmApi.nft.getWalletNFTTransfers({
        address: walletAddress,
        chain: toChainHex(chain),
        limit,
        ...(cursor ? { cursor } : {}),
    });
    const json = response.toJSON();
    const rawResult = json.result ?? [];
    return {
        total: json.total ?? 0,
        page: json.page ?? 0,
        pageSize: json.page_size ?? limit,
        cursor: json.cursor ?? null,
        result: rawResult.map((r) => ({
            transactionHash: r.transaction_hash,
            blockTimestamp: r.block_timestamp,
            blockNumber: r.block_number,
            blockHash: r.block_hash,
            tokenId: r.token_id,
            tokenAddress: r.token_address,
            fromAddress: r.from_address ?? "",
            toAddress: r.to_address,
            value: r.value ?? "0",
            contractType: r.contract_type,
        })),
    };
};
const verifyOnChainOwnership = async (walletAddress, contractAddress, tokenIds, chain) => {
    if (tokenIds.length === 0)
        return true;
    await init();
    try {
        const checks = await Promise.all(tokenIds.map(async (tokenId) => {
            const response = await moralis_1.default.EvmApi.nft.getNFTTokenIdOwners({
                address: contractAddress,
                tokenId,
                chain: toChainHex(chain),
            });
            const json = response.toJSON();
            const owners = json.result ?? [];
            const normalizedWallet = walletAddress.toLowerCase();
            return owners.some((o) => o.owner_of.toLowerCase() === normalizedWallet);
        }));
        return checks.every(Boolean);
    }
    catch {
        return false;
    }
};
const getNFTsByContract = async (contractAddress, chain, cursor, limit = 100) => {
    await init();
    const response = await moralis_1.default.EvmApi.nft.getNFTOwners({
        address: contractAddress,
        chain: toChainHex(chain),
        limit,
        normalizeMetadata: true,
        ...(cursor ? { cursor } : {}),
    });
    const json = response.toJSON();
    const rawResult = json.result ?? [];
    return {
        total: json.total ?? 0,
        page: json.page ?? 0,
        pageSize: json.page_size ?? limit,
        cursor: json.cursor ?? null,
        result: rawResult.map((r) => ({
            tokenId: r.token_id,
            tokenAddress: r.token_address,
            name: r.name ?? "",
            symbol: r.symbol ?? "",
            tokenUri: r.token_uri ?? null,
            metadata: parseMetadata(r.metadata),
            ownerOf: r.owner_of,
            chain,
            amount: r.amount ?? "1",
            contractType: r.contract_type,
            lastMetadataSync: r.last_metadata_sync ?? null,
            lastTokenUriSync: r.last_token_uri_sync ?? null,
        })),
    };
};
const createMoralisAdapter = () => ({
    getWalletNFTs,
    getNFTMetadata,
    getNFTTransfers,
    verifyOnChainOwnership,
    getNFTsByContract,
});
exports.createMoralisAdapter = createMoralisAdapter;
//# sourceMappingURL=moralis-adapter.js.map