import { Shape, Statue } from '@core/enums';
import { RoomUser } from './socket';

export interface Trade {
  source: Shape;
  shape: Shape;
  target: Shape;
}

export interface UserTrade extends Trade {
  user: RoomUser;
  targetStatue: Statue;
}
