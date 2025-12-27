import type { Widget } from '../types';

export abstract class BaseWidget {
  widget: Widget;

  constructor(widget: Widget) {
    this.widget = widget;
  }

  abstract render(ctx: CanvasRenderingContext2D): void | Promise<void>;
}