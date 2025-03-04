import HTTPErrorResponse from "../../../Types/API/HTTPErrorResponse";
import HTTPResponse from "../../../Types/API/HTTPResponse";
import Dictionary from "../../../Types/Dictionary";
import NotImplementedException from "../../../Types/Exception/NotImplementedException";
import { JSONObject } from "../../../Types/JSON";
import WorkspaceChannelInvitationPayload from "../../../Types/Workspace/WorkspaceChannelInvitationPayload";
import WorkspaceMessagePayload, {
  WorkspaceCheckboxBlock,
  WorkspaceDropdownBlock,
  WorkspaceMessageBlock,
  WorkspaceMessagePayloadButton,
  WorkspaceModalBlock,
  WorkspacePayloadButtons,
  WorkspacePayloadHeader,
  WorkspacePayloadImage,
  WorkspacePayloadMarkdown,
  WorkspaceTextAreaBlock,
  WorkspaceTextBoxBlock,
} from "../../../Types/Workspace/WorkspaceMessagePayload";
import WorkspaceType from "../../../Types/Workspace/WorkspaceType";
import logger from "../Logger";
import URL from "Common/Types/API/URL";

export interface WorkspaceThread {
  channel: WorkspaceChannel;
  threadId: string;
}

export interface WorkspaceSendMessageResponse {
  threads: Array<WorkspaceThread>;
  workspaceType: WorkspaceType;
}

export interface WorkspaceChannel {
  id: string;
  name: string;
  workspaceType: WorkspaceType;
}

export default class WorkspaceBase {
  public static async getUsernameFromUserId(_data: {
    authToken: string;
    userId: string;
  }): Promise<string> {
    throw new NotImplementedException();
  }

  public static async showModalToUser(_data: {
    authToken: string;
    triggerId: string;
    modalBlock: WorkspaceModalBlock;
  }): Promise<void> {
    throw new NotImplementedException();
  }

  public static getCheckboxBlock(_data: {
    payloadCheckboxBlock: WorkspaceCheckboxBlock;
  }): JSONObject {
    throw new NotImplementedException();
  }

  public static sendDirectMessageToUser(_data: {
    authToken: string;
    workspaceUserId: string;
    messageBlocks: Array<WorkspaceMessageBlock>;
  }): Promise<void> {
    throw new NotImplementedException();
  }

  public static async joinChannel(_data: {
    authToken: string;
    channelId: string;
  }): Promise<void> {
    throw new NotImplementedException();
  }

  public static async sendPayloadBlocksToChannel(_data: {
    authToken: string;
    workspaceChannel: WorkspaceChannel;
    blocks: Array<JSONObject>;
  }): Promise<WorkspaceThread> {
    throw new NotImplementedException();
  }

  public static async inviteUsersToChannels(data: {
    authToken: string;
    workspaceChannelInvitationPayload: WorkspaceChannelInvitationPayload;
  }): Promise<void> {
    for (const channelName of data.workspaceChannelInvitationPayload
      .channelNames) {
      await this.inviteUsersToChannel({
        authToken: data.authToken,
        channelName: channelName,
        workspaceUserIds:
          data.workspaceChannelInvitationPayload.workspaceUserIds,
      });
    }
  }

  public static async inviteUsersToChannel(data: {
    authToken: string;
    channelName: string;
    workspaceUserIds: Array<string>;
  }): Promise<void> {
    for (const userId of data.workspaceUserIds) {
      await this.inviteUserToChannelByChannelName({
        authToken: data.authToken,
        channelName: data.channelName,
        workspaceUserId: userId,
      });
    }
  }

  public static async inviteUserToChannelByChannelName(_data: {
    authToken: string;
    channelName: string;
    workspaceUserId: string;
  }): Promise<void> {
    throw new NotImplementedException();
  }

  public static async inviteUserToChannelByChannelId(_data: {
    authToken: string;
    channelId: string;
    workspaceUserId: string;
  }): Promise<void> { }

  public static async createChannelsIfDoesNotExist(_data: {
    authToken: string;
    channelNames: Array<string>;
  }): Promise<Array<WorkspaceChannel>> {
    throw new NotImplementedException();
  }

  public static async getWorkspaceChannelFromChannelId(_data: {
    authToken: string;
    channelId: string;
  }): Promise<WorkspaceChannel> {
    throw new NotImplementedException();
  }

  public static async sendMessage(_data: {
    workspaceMessagePayload: WorkspaceMessagePayload;
    authToken: string; // which auth token should we use to send.
    userId: string;
  }): Promise<WorkspaceSendMessageResponse> {
    throw new NotImplementedException();
  }

  public static async getAllWorkspaceChannels(_data: {
    authToken: string;
  }): Promise<Dictionary<WorkspaceChannel>> {
    throw new NotImplementedException();
  }

  public static async getWorkspaceChannelFromChannelName(_data: {
    authToken: string;
    channelName: string;
  }): Promise<WorkspaceChannel> {
    throw new NotImplementedException();
  }

  public static async createChannel(_data: {
    authToken: string;
    channelName: string;
  }): Promise<WorkspaceChannel> {
    throw new NotImplementedException();
  }

  public static getHeaderBlock(_data: {
    payloadHeaderBlock: WorkspacePayloadHeader;
  }): JSONObject {
    throw new NotImplementedException();
  }

  public static getDividerBlock(): JSONObject {
    throw new NotImplementedException();
  }

  public static getMarkdownBlock(_data: {
    payloadMarkdownBlock: WorkspacePayloadMarkdown;
  }): JSONObject {
    throw new NotImplementedException();
  }

  public static getButtonBlock(_data: {
    payloadButtonBlock: WorkspaceMessagePayloadButton;
  }): JSONObject {
    throw new NotImplementedException();
  }

  public static getBlocksFromWorkspaceMessagePayload(data: {
    messageBlocks: Array<WorkspaceMessageBlock>;
  }): Array<JSONObject> {
    const { messageBlocks } = data;

    const blocks: Array<JSONObject> = [];
    for (const block of messageBlocks) {
      switch (block._type) {
        case "WorkspacePayloadHeader":
          blocks.push(
            this.getHeaderBlock({
              payloadHeaderBlock: block as WorkspacePayloadHeader,
            }),
          );
          break;
        case "WorkspacePayloadMarkdown":
          blocks.push(
            this.getMarkdownBlock({
              payloadMarkdownBlock: block as WorkspacePayloadMarkdown,
            }),
          );
          break;
        case "WorkspacePayloadDivider":
          blocks.push(this.getDividerBlock());
          break;
        case "WorkspacePayloadButtons":
          blocks.push(
            this.getButtonsBlock({
              payloadButtonsBlock: block as WorkspacePayloadButtons,
            }),
          );
          break;
        case "WorkspaceTextAreaBlock":
          blocks.push(
            this.getTextAreaBlock({
              payloadTextAreaBlock: block as WorkspaceTextAreaBlock,
            }),
          );
          break;
        case "WorkspaceTextBoxBlock":
          blocks.push(
            this.getTextBoxBlock({
              payloadTextBoxBlock: block as WorkspaceTextBoxBlock,
            }),
          );
          break;
        case "WorkspacePayloadImage":
          blocks.push(
            this.getImageBlock({
              payloadImageBlock: block as WorkspacePayloadImage,
            }),
          );
          break;
        case "WorkspaceDropdownBlock":
          blocks.push(
            this.getDropdownBlock({
              payloadDropdownBlock: block as WorkspaceDropdownBlock,
            }),
          );
          break;
        case "WorkspaceModalBlock":
          blocks.push(
            this.getModalBlock({
              payloadModalBlock: block as WorkspaceModalBlock,
            }),
          );
          break;
        default:
          logger.error("Unknown block type: " + block._type);
          break;
      }
    }
    return blocks;
  }

  public static getTextAreaBlock(_data: {
    payloadTextAreaBlock: WorkspaceTextAreaBlock;
  }): JSONObject {
    throw new NotImplementedException();
  }

  public static getTextBoxBlock(_data: {
    payloadTextBoxBlock: WorkspaceTextBoxBlock;
  }): JSONObject {
    throw new NotImplementedException();
  }

  public static getImageBlock(_data: {
    payloadImageBlock: WorkspacePayloadImage;
  }): JSONObject {
    throw new NotImplementedException();
  }

  public static getDropdownBlock(_data: {
    payloadDropdownBlock: WorkspaceDropdownBlock;
  }): JSONObject {
    throw new NotImplementedException();
  }

  public static getModalBlock(_data: {
    payloadModalBlock: WorkspaceModalBlock;
  }): JSONObject {
    throw new NotImplementedException();
  }

  public static getButtonsBlock(_data: {
    payloadButtonsBlock: WorkspacePayloadButtons;
  }): JSONObject {
    throw new NotImplementedException();
  }

  public static async sendMessageToChannelViaIncomingWebhook(_data: {
    url: URL;
    text: string;
  }): Promise<HTTPResponse<JSONObject> | HTTPErrorResponse> {
    throw new NotImplementedException();
  }

  public static async isUserInChannel(_data: {
    authToken: string;
    channelId: string;
    userId: string;
  }): Promise<boolean> {
    throw new NotImplementedException();
  }
}
