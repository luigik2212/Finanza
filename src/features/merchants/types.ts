export interface Merchant {
  id: string;
  name: string;
  category?: string;
  archived?: boolean;
}

export interface MerchantPayload {
  name: string;
  category?: string;
  archived?: boolean;
}
