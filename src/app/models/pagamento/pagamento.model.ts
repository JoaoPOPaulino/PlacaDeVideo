export interface Pagamento {
  id: string; // Ex.: pix_char_123456
  chavePix: string; // Ex.: brCode
  qrCodeBase64: string; // Ex.: data:image/png;base64,...
  status: string; // Ex.: PENDING, COMPLETED
  amount?: number; // Opcional, valor em centavos
  createdAt?: string; // Opcional, data de criação
  expiresAt?: string; // Opcional, data de expiração
}