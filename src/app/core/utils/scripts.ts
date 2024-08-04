import { Statue } from '@core/enums';
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

  let lastTraded = shapes[lastTrade ?? shapes.length - 1];
  const firstTradeRound: Trade[] = [];
  for (let i = 0; i < 3; i++) {
    const trade = possibleTrades.find(
      (item) =>
        lastTraded !== item.target &&
        !firstTradeRound.some((element) => isSameTrade(element, item)) &&
        !firstTradeRound.some((element) => element.source === item.source),
    );
    if (!trade) continue;

    firstTradeRound.push(trade);
    lastTraded = trade.target;
  }

  const possibleSecondTradeRound = possibleTrades.filter(
    (trade) => !firstTradeRound.some((item) => isSameTrade(item, trade)),
  );
  const secondTradeRound: Trade[] = [];
  for (let i = 0; i < 3; i++) {
    const trade = possibleSecondTradeRound.find(
      (item) =>
        lastTraded !== item.target &&
        !secondTradeRound.some((element) => isSameTrade(element, item)),
    );
    if (!trade) continue;

    secondTradeRound.push(trade);
    lastTraded = trade.target;
  }

  return [firstTradeRound, secondTradeRound];
};

export const isSameTrade = (trade1: Trade, trade2: Trade) =>
  trade1.shape === trade2.shape &&
  trade1.source === trade2.source &&
  trade1.target === trade2.target;
