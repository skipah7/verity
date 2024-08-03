import { Shape, Shape3D } from '@core/enums';

export const shapeMap: Record<Shape3D, [Shape, Shape]> = {
  [Shape3D.CUBE]: [Shape.SQUARE, Shape.SQUARE],
  [Shape3D.SPHERE]: [Shape.CIRCLE, Shape.CIRCLE],
  [Shape3D.TETRAHEDRON]: [Shape.TRIANGLE, Shape.TRIANGLE],
  [Shape3D.CONE]: [Shape.CIRCLE, Shape.TRIANGLE],
  [Shape3D.CYLINDER]: [Shape.CIRCLE, Shape.SQUARE],
  [Shape3D.TRIANGULAR_PRISM]: [Shape.TRIANGLE, Shape.SQUARE],
};

export const resultShape: Record<Shape, Shape3D> = {
  [Shape.CIRCLE]: Shape3D.TRIANGULAR_PRISM,
  [Shape.SQUARE]: Shape3D.CONE,
  [Shape.TRIANGLE]: Shape3D.CYLINDER,
};

export const allowedWallShapes: Record<Shape, Shape[][]> = {
  [Shape.CIRCLE]: [
    [Shape.CIRCLE, Shape.SQUARE],
    [Shape.CIRCLE, Shape.TRIANGLE],
    [Shape.CIRCLE, Shape.CIRCLE],
  ],
  [Shape.SQUARE]: [
    [Shape.SQUARE, Shape.CIRCLE],
    [Shape.SQUARE, Shape.TRIANGLE],
    [Shape.SQUARE, Shape.SQUARE],
  ],
  [Shape.TRIANGLE]: [
    [Shape.TRIANGLE, Shape.CIRCLE],
    [Shape.TRIANGLE, Shape.SQUARE],
    [Shape.TRIANGLE, Shape.TRIANGLE],
  ],
};
