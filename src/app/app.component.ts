import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet />`,
  styles: ``,
})
export class AppComponent {
  // calculateInsideTradeSteps(
  //   shapes: ShapeOrder,
  //   allWallShapes: WallShapesOrder,
  //   lastTrade?: Statue,
  // ) {
  //   const trades: { shape: Shape; target: Shape }[] = [];
  //   const shapesToTrade: Shape[][] = [];
  //   const tradedTo: Shape[] = [];
  //   let lastTarged = shapes[lastTrade ?? 0];
  //   for (let i = 0; i < allWallShapes.length; i++) {
  //     const wallShapes = [...allWallShapes[i]];
  //     for (const wallShape of wallShapes) {
  //       for (let j = 0; j < shapes.length; j++) {
  //         if (j === i) continue;
  //         const target = shapes[j];
  //         if (lastTarged === target) continue;
  //         if (wallShape === target) continue;
  //         // if (tradedTo.includes(target)) continue;
  //         trades[i] = { shape: wallShape, target };
  //       }
  //     }
  //     const target = trades[i].target;
  //     tradedTo.push(target);
  //     lastTarged = target;
  //     wallShapes.splice(wallShapes.indexOf(trades[i].shape), 1);
  //     shapesToTrade.push(wallShapes);
  //     console.log(trades[i]);
  //   }
  //   if (shapesToTrade.some((item) => !item.length)) return;
  //   this.calculateInsideTradeSteps(
  //     shapes,
  //     shapesToTrade as WallShapesOrder,
  //     shapes.indexOf(trades[trades.length - 1].target),
  //   );
  // }
}
