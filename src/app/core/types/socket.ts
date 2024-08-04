import { ShapeOrder, UserOrder } from './starting-values';

export type RoomUser = { id: string; name: string; isAdmin: boolean };

export type RoomUpdate = { roomName: string; room: RoomUser[] };

export enum BroadcastEventType {
  VALUES_CHANGE = 'values_change',
  STEP_CHANGE = 'step_change',
}

interface DefaultBroadcastEvent {
  type: BroadcastEventType;
  sender: RoomUser;
}

export type ValuesChangePayload = {
  shapes: ShapeOrder | undefined;
  users: UserOrder | undefined;
};
export interface ValuesChangeEvent extends DefaultBroadcastEvent {
  type: BroadcastEventType.VALUES_CHANGE;
  payload: ValuesChangePayload;
}

export type StepChangePayload = {};
export interface StepChangeEvent extends DefaultBroadcastEvent {
  type: BroadcastEventType.STEP_CHANGE;
  payload: StepChangePayload;
}

export type BroadcastEvent = ValuesChangeEvent | StepChangeEvent;
