// Shared client-side types for the UPA BK chatbox.
// The API is the source of truth; these mirror its shape.

export type MessageSender = 'mahasiswa' | 'bot' | 'sistem';

export type ConversationStatus = 'normal' | 'crisis' | 'handoff';

export interface ConversationSummary {
  id: string;
  title: string;
  status: ConversationStatus;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
  lastMessagePreview: string;
}

export interface ChatMessage {
  id: string;
  sender: MessageSender;
  text: string;
  createdAt: string;
}

export interface ConversationDetail {
  conversation: {
    id: string;
    title: string;
    status: ConversationStatus;
    createdAt: string;
    updatedAt: string;
  };
  messages: ChatMessage[];
}

// POST /api/chat/message response. `status` is the conversation status AFTER
// processing this message (so the UI can update badges live); `escalated`
// marks that an audit marker ([ESKALASI]/[OTOMATIS]) was appended server-side
// and should be reflected in the transcript; `llmError` is set when layer 3
// (LLM) fell back to the static error reply.
export interface SendMessageResponse {
  reply: string;
  conversationId: string;
  status: ConversationStatus;
  escalated: boolean;
  llmError: string | null;
}

// ---------------------------------------------------------------- admin/petugas

export interface Dass21ResultInfo {
  skorDepresi: number;
  skorKecemasan: number;
  skorStres: number;
  katDepresi: string;
  katKecemasan: string;
  katStres: string;
  submittedAt?: string;
}

export interface FollowupInfo {
  status: string;
  catatanPetugas: string | null;
  petugasNama: string | null;
  updatedAt?: string;
}

export interface RegistrationSummary {
  id: string;
  nama: string;
  nim: string;
  kontak: string;
  jenisLayanan: string;
  preferensiHari: string;
  preferensiWaktu: string;
  keluhan: string | null;
  createdAt: string;
  dass21: Dass21ResultInfo | null;
  followup: FollowupInfo | null;
  conversationCount: number;
}

export interface AdminMessage {
  id: string;
  sender: MessageSender;
  text: string;
  createdAt: string;
}

export interface AdminConversation {
  id: string;
  title: string;
  status: ConversationStatus;
  updatedAt: string;
  messages: AdminMessage[];
}

export interface RegistrationDetail {
  registration: {
    id: string;
    nama: string;
    nim: string;
    kontak: string;
    jenisLayanan: string;
    preferensiHari: string;
    preferensiWaktu: string;
    keluhan: string | null;
    consentStatus: string;
    createdAt: string;
  };
  dass21: (Dass21ResultInfo & { jawaban: number[]; scoringVersion: string }) | null;
  followup: FollowupInfo | null;
  conversations: AdminConversation[];
}

export interface AdminStats {
  totalRegistrations: number;
  totalScreened: number;
  totalConversations: number;
  crisisConversations: number;
  tindakLanjut: Record<string, number>;
}
