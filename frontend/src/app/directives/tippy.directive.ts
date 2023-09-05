import { Directive, Input, OnInit, ElementRef, SimpleChanges, OnChanges } from '@angular/core';

import tippy, { Placement, Instance, Props } from 'tippy.js';

@Directive({
  standalone: true,
  selector: '[tippy]'
})

export class TippyDirective implements OnInit, OnChanges {

  @Input('options') public options!: Partial<Props> | undefined;

  private instance!: Instance<Props>;

  constructor(
    private el: ElementRef
  ) {}

  public ngOnInit() {


  }

  public ngOnDestroy() {
    this.instance?.destroy();
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log({changes})

    const el = this.el.nativeElement as HTMLElement;

    if (this.el.nativeElement._tippy) {
      const tippy = this.el.nativeElement._tippy as Instance;
      tippy.destroy();
    }

    if (!this.options?.content) return;

    el.style.cursor = 'default';
    const position = el.dataset.tippyPosition as Placement;
    const appendTo = el.dataset.appendTo as Element | "parent" | ((ref: Element) => Element);

    this.instance = tippy(el, {
      ...this.options,
      // content: el.dataset.tippyContent,
      zIndex: 21474841,
      theme: 'phunks',
      hideOnClick: false,
      arrow: '<svg height="6" viewBox="0 0 10 6" width="10" xmlns="http://www.w3.org/2000/svg"><path d="m8 2h-2v-2h-2v2h-2v2h-2v2h10v-2h-2z" fill="#ff04b4" fill-rule="evenodd"/></svg>',
      allowHTML: false
    });

    if (position) this.instance.props.placement = position;
    if (appendTo) this.instance.props.appendTo = appendTo;
  }

}
