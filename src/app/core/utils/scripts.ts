import { Shape, Statue } from '@core/enums';
import { ShapeOrder, Trade, WallShapesOrder } from '@core/types';

export const calculateInsideTradeSteps = (
  shapes: ShapeOrder,
  allWallShapes: WallShapesOrder,
  lastTrade?: Statue,
) => {
  const trades: Trade[] = [];

  for (let i = 0; i < allWallShapes.length; i++) {
    const uniqueShapes = allWallShapes[i].filter(
      (shape, i, array) => array.indexOf(shape) === i,
    );
    const source = shapes[i];
    for (const shape of uniqueShapes) {
      for (let j = 0; j < shapes.length; j++) {
        if (j === i) continue;

        const target = shapes[j];
        if (shape === target) continue;
        trades.push({ source, shape, target });
      }
    }
  }

  const possibleTrades = trades.filter((trade) => {
    const hasAnotherOption = trades.some(
      (item) =>
        item.source === trade.source &&
        item.shape === trade.shape &&
        item.target !== trade.target,
    );
    const hasDouble = trades.some(
      (item) =>
        item.source !== trade.source &&
        item.shape === trade.shape &&
        item.target === trade.target,
    );
    return !hasAnotherOption || !hasDouble;
  });

  let lastTarget = shapes[lastTrade ?? shapes.length - 1];
  let tradedFrom: Shape[] = [];
  const resultTrades: Trade[] = [];
  for (let i = 0; i < possibleTrades.length; i++) {
    const trade = possibleTrades.find(
      (item) =>
        lastTarget !== item.target &&
        !tradedFrom.includes(item.source) &&
        !resultTrades.some((element) => isSameTrade(element, item)),
    );
    if (!trade) continue;

    resultTrades.push(trade);
    lastTarget = trade.target;
    if (tradedFrom.length === 2) {
      tradedFrom = [];
      continue;
    }
    tradedFrom.push(trade.source);
  }

  return resultTrades;
};

export const isSameTrade = (trade1: Trade, trade2: Trade) =>
  trade1.shape === trade2.shape &&
  trade1.source === trade2.source &&
  trade1.target === trade2.target;
