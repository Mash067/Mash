import { Request, Response } from "express";
import { ChatService } from "../services/chat.service";
import { asyncHandler } from "../middleware/helper";
import { sendJsonResponse } from "../middleware/helper";
import { BadRequest } from "../middleware/errors";
import getUserData from "../middleware/helper";

const chatService = new ChatService();

export class ChatController {
  /**
   * Create a new chat room
   */

  public createChatRoom = asyncHandler(async (req: Request, res: Response) => {
    const { participants } = req.body;
    const { status_code, message, data } = await chatService.createChatRoom(
      participants
    );
    sendJsonResponse(res, status_code, message, data);
  });

  /**
   * Send a message to the chat room
   */

  public sendMessage = asyncHandler(async (req: Request, res: Response) => {
    const { chatId, senderId, content } = req.body;
    const userData = getUserData(req);

    if (!userData) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    if (senderId !== userData.userId ) {
      throw new Error(`User is not authorised to perform this action`);
    }

    const { status_code, message, data } = await chatService.sendMessage(
      chatId,
      senderId,
      content
    );
    sendJsonResponse(res, status_code, message, data);
  });

  /**
   * Send/upload Image and video to the chat room
   */

  public uploadMedia = asyncHandler(async (req: Request, res: Response) => {
    const { chatId, senderId } = req.body;
    const media = req.files as Express.Multer.File[];
    const userData = getUserData(req);

    if(!userData) {
      throw new Error('User not authenticated');
    }

    if(senderId !== userData.userId) {
      throw new Error('User is not authorized to perform this action');
    }

    const { status_code, message, data } = await chatService.uploadMedia(
      chatId,
      senderId,
      media
    )
    sendJsonResponse(res, status_code, message, data);
  });

  /**
   * Get all messages in a chat room
   */
  public getMessages = asyncHandler(async (req: Request, res: Response) => {
    const { chatId } = req.params;
    const { status_code, message, data } = await chatService.getMessages(
      chatId
    );
    sendJsonResponse(res, status_code, message, data);
  });

  /**
   * Get all chat rooms for a user
   */
  public getChatRoomsForUser = asyncHandler(
    async (req: Request, res: Response) => {
      const { userId } = req.params;
      const userData = getUserData(req);

      if (!userData) {
        throw new BadRequest("You are not authenticated");
      }

      if (userId !== userData.userId) {
        throw new BadRequest("You are not authorized to view this chat room");
      }

      const { status_code, message, data } =
        await chatService.getChatRoomsForUser(userId);
      sendJsonResponse(res, status_code, message, data);
    }
  );
}
