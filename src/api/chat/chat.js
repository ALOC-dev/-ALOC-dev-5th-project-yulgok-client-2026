import apiClient from '../client-api.js';

function getRoomTimestamp(room) {
  const timestamp = Date.parse(room.lastMessageTime);
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function sortRoomsByLastMessageTime(rooms) {
  return [...rooms].sort((roomA, roomB) => {
    const roomATime = getRoomTimestamp(roomA);
    const roomBTime = getRoomTimestamp(roomB);

    if (roomATime === 0 && roomBTime === 0) return 0;
    if (roomATime === 0) return 1;
    if (roomBTime === 0) return -1;

    return roomBTime - roomATime;
  });
}

export function getChatErrorMessage(error, fallbackMessage = '채팅 정보를 불러오지 못했어요.') {
  return error?.response?.data?.message || fallbackMessage;
}

export async function getChatRooms() {
  const response = await apiClient.get('/api/chat/rooms');
  const rooms = Array.isArray(response.data?.data?.rooms) ? response.data.data.rooms : [];
  return sortRoomsByLastMessageTime(rooms);
}

export async function getChatMessages(roomId, { cursor, size = 30 } = {}) {
  const response = await apiClient.get(`/api/chat/rooms/${roomId}/messages`, {
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
  const response = await apiClient.patch(
    `/api/chat/rooms/${roomId}/read`,
    null,
  );

  return Boolean(response.data?.data?.success);
}

export async function getTotalUnreadCount() {
  const response = await apiClient.get('/api/chat/unread-count');
  return Number(response.data?.data?.totalUnreadCount) || 0;
}
