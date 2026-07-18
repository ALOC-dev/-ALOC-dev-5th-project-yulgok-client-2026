import axios from 'axios';

const chatBaseUrl = `${import.meta.env.VITE_API_BASE_URL}/api/chat`;

function getAuthConfig() {
  const accessToken = localStorage.getItem('accessToken');

  return {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  };
}

export function getChatErrorMessage(error, fallbackMessage = '채팅 정보를 불러오지 못했어요.') {
  return error?.response?.data?.message || fallbackMessage;
}

export async function getChatRooms() {
  const response = await axios.get(`${chatBaseUrl}/rooms`, getAuthConfig());
  return Array.isArray(response.data?.data?.rooms) ? response.data.data.rooms : [];
}

export async function getChatMessages(roomId, { cursor, size = 30 } = {}) {
  const response = await axios.get(`${chatBaseUrl}/rooms/${roomId}/messages`, {
    ...getAuthConfig(),
    params: {
      ...(cursor != null ? { cursor } : {}),
      size,
    },
  });

  const data = response.data?.data;
  return {
    messages: Array.isArray(data?.messages) ? data.messages : [],
    hasNext: Boolean(data?.hasNext),
  };
}

export async function markChatMessagesAsRead(roomId) {
  const response = await axios.patch(
    `${chatBaseUrl}/rooms/${roomId}/read`,
    null,
    getAuthConfig(),
  );

  return Boolean(response.data?.data?.success);
}

export async function getTotalUnreadCount() {
  const response = await axios.get(`${chatBaseUrl}/unread-count`, getAuthConfig());
  return Number(response.data?.data?.totalUnreadCount) || 0;
}
