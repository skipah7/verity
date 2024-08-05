import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Shape, Statue } from '@core/enums';
import { calculateInsideTradeSteps } from '@core/utils';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet />`,
  styles: ``,
})
export class AppComponent {
  // constructor() {
  //   console.log(
  //     calculateInsideTradeSteps(
  //       [Shape.TRIANGLE, Shape.CIRCLE, Shape.SQUARE],
  //       [
  //         [Shape.TRIANGLE, Shape.CIRCLE],
  //         [Shape.CIRCLE, Shape.TRIANGLE],
  //         [Shape.SQUARE, Shape.SQUARE],
  //       ],
  //       Statue.RIGHT,
  //     ),
  //   );
  //   console.log(
  //     calculateInsideTradeSteps(
  //       [Shape.TRIANGLE, Shape.CIRCLE, Shape.SQUARE],
  //       [
  //         [Shape.TRIANGLE, Shape.TRIANGLE],
  //         [Shape.CIRCLE, Shape.CIRCLE],
  //         [Shape.SQUARE, Shape.SQUARE],
  //       ],
  //       Statue.RIGHT,
  //     ),
  //   );
  //   console.log(
  //     calculateInsideTradeSteps(
  //       [Shape.TRIANGLE, Shape.CIRCLE, Shape.SQUARE],
  //       [
  //         [Shape.TRIANGLE, Shape.CIRCLE],
  //         [Shape.CIRCLE, Shape.SQUARE],
  //         [Shape.SQUARE, Shape.TRIANGLE],
  //       ],
  //       Statue.RIGHT,
  //     ),
  //   );
  // console.log(
  //   calculateInsideTradeSteps(
  //     [Shape.CIRCLE, Shape.SQUARE, Shape.TRIANGLE],
  //     [
  //       [Shape.CIRCLE, Shape.CIRCLE],
  //       [Shape.SQUARE, Shape.TRIANGLE],
  //       [Shape.SQUARE, Shape.TRIANGLE],
  //     ],
  //   ),
  // );
  // console.log(
  //   calculateInsideTradeSteps(
  //     [Shape.CIRCLE, Shape.TRIANGLE, Shape.SQUARE],
  //     [
  //       [Shape.CIRCLE, Shape.CIRCLE],
  //       [Shape.TRIANGLE, Shape.TRIANGLE],
  //       [Shape.SQUARE, Shape.SQUARE],
  //     ],
  //   ),
  // );
}
