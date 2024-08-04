import { Shape } from '@core/enums';
import { RoomUser } from './socket';

export type ShapeOrder = [Shape, Shape, Shape];

export type WallShapes = [Shape, Shape];

export type WallShapesOrder = [WallShapes, WallShapes, WallShapes];

export type UserOrder = [RoomUser, RoomUser, RoomUser];
