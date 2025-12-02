// Shared socket helpers for server and controllers
let ioInstance = null;
const userSockets = new Map(); // userId -> socketId

export const setIO = (io) => {
  ioInstance = io;
};

export const getIO = () => ioInstance;

export const getUserSockets = () => userSockets;

export default {
  setIO,
  getIO,
  getUserSockets
};
