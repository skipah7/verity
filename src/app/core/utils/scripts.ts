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
  let tradedTo: Shape[] = [];
  const resultTrades: Trade[] = [];
  for (let i = 0; i < possibleTrades.length; i++) {
    const result = possibleTrades.find((trade) => {
      // i really dont like this part, it feels crutchy, but i havent found any better solution
      // this is used to ensure, that in any trade round (3 trades) there is no same source and same target
      const previousSkippedTrades = possibleTrades.filter(
        (item) =>
          tradedFrom.includes(item.source) &&
          !tradedTo.includes(item.target) &&
          !resultTrades.some((element) => isSameTrade(element, item)),
      );
      const hasSameTargetWithSkippedTrades = previousSkippedTrades.length
        ? previousSkippedTrades.some((item) => item.target === trade.target)
        : true;

      return (
        lastTarget !== trade.target &&
        hasSameTargetWithSkippedTrades &&
        !tradedFrom.includes(trade.source) &&
        !tradedTo.includes(trade.target) &&
        !resultTrades.some((element) => isSameTrade(element, trade))
      );
    });
    if (!result) continue;

    resultTrades.push(result);
    lastTarget = result.target;
    if (tradedFrom.length === 2) {
      tradedFrom = [];
    } else {
      tradedFrom.push(result.source);
    }
    if (tradedTo.length === 2) {
      tradedTo = [];
    } else {
      tradedTo.push(result.target);
    }
  }

  return resultTrades;
};

export const isSameTrade = (trade1: Trade, trade2: Trade) =>
  trade1.shape === trade2.shape &&
  trade1.source === trade2.source &&
  trade1.target === trade2.target;
