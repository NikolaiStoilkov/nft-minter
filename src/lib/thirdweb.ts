import { createThirdwebClient, type ThirdwebClient } from "thirdweb";

let _client: ThirdwebClient | null = null;

export function getThirdwebClient(): ThirdwebClient {
  if (!_client) {
    const clientId = process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID;
    if (!clientId) {
      throw new Error("Missing NEXT_PUBLIC_THIRDWEB_CLIENT_ID");
    }
    _client = createThirdwebClient({ clientId });
  }
  return _client;
}

