import { Directive, ElementRef, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';

import * as d3 from 'd3';

import tinyColor from 'tinycolor2';

import { Auction } from '../interfaces/auction';
import { Web3Service } from '../services/web3.service';

import { placeholderPunkData } from './placeholderPunkData';

@Directive({
  selector: 'phunk-image'
})

export class PhunkImageDirective implements OnChanges {

  @Input() currentAuction!: Auction;
  @Input() animate: boolean = false;
  @Input() dimensions!: { width: number, height: number };
  @Input() addBackground?: boolean;

  @Output() backgroundColor: EventEmitter<tinyColor.ColorFormats.RGBA> = new EventEmitter();

  // SVG Chart Element
  svg!: d3.Selection<SVGGElement, unknown, null, undefined>;

  // Dimensions
  phunkMargin = { top: 0, right: 0, bottom: 0, left: 0 };
  phunkWidth!: number;
  phunkHeight!: number;

  // Scales & Axis
  xScale!: d3.ScaleBand<string>;
  yScale!: d3.ScaleBand<string>;

  // Chart data
  dataArr: Array<any> = [];

  constructor(
    private el: ElementRef,
    private web3Svc: Web3Service
  ) {}

  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    if (!this.svg) await this.buildChart();

    const auction = changes['currentAuction'];
    if (
      auction?.currentValue?.phunkId !== auction?.previousValue?.phunkId &&
      changes['currentAuction']?.currentValue
    ) {
      this.buildPhunk(auction.currentValue.phunkId);
    }
  }

  async buildChart(): Promise<void> {

    this.phunkWidth = this.dimensions.width - this.phunkMargin.left - this.phunkMargin.right;
    this.phunkHeight = this.dimensions.height - this.phunkMargin.top - this.phunkMargin.bottom;

    const element = this.el.nativeElement as HTMLElement;
    element.style.width = this.phunkWidth + 'px';
    element.style.height = this.phunkHeight + 'px';

    // Create the SVG
    this.svg = d3.select(this.el.nativeElement)
      .append('svg')
        .style('display', 'block')
        .attr('preserveAspectRatio', 'xMinYMin meet')
        .attr('viewBox', `0 0 ${this.phunkHeight} ${this.phunkWidth}`)
        .attr('width', '100%')
        // .attr('height', '100%')
      .append('g')
        .attr('transform', `translate(${this.phunkMargin.left}, ${this.phunkMargin.top})`);

    const x = [...Array(24).keys()].map((i) => `${i}`).reverse();
    const y = [...Array(24).keys()].map((i) => `${i}`).reverse();

    // Build X scales and axis:
    this.xScale = d3.scaleBand()
      .range([ 0, this.phunkWidth ])
      .domain(x)
      .padding(0);

    this.svg.append('g')
      .attr('transform', `translate(0, ${this.phunkHeight})`)
      .call(d3.axisBottom(this.xScale))
      .call((g: any) => g.select('.domain').remove());

    // Build Y scales and axis:
    this.yScale = d3.scaleBand()
      .range([ this.phunkHeight, 0 ])
      .domain(y)
      .padding(0);

    this.svg.append('g')
      .call(d3.axisLeft(this.yScale))
      .call((g: any) => g.select('.domain').remove());

    this.svg.selectAll('text')
      .remove()
    
    this.buildPhunk();
  }

  async buildPhunk(phunkId?: string): Promise<void> {

    let punkData = phunkId ? await this.web3Svc.getPunkImage(phunkId) ?? placeholderPunkData : placeholderPunkData;

    const phunkArr = punkData?.replace('0x', '').match(/.{1,8}/g) as string[];
    this.dataArr = phunkArr.map((res, i, arr) => ({ x: `${i % 24}`, y: `${Math.floor(i / 24)}`, value: res }));

    this.svg.selectAll('rect')
      .data(this.dataArr)
        .join('rect')
          .style('fill', '#00000000')
          .attr('shape-rendering', 'crispEdges')
          .attr('width', this.xScale.bandwidth())
          .attr('height', this.yScale.bandwidth())
          .attr('x', (d: any) => this.xScale(d.x) as any)
          .attr('y', (d: any) => this.yScale(d.y) as any)
          .transition()
            .style('fill', (d) => `#${d.value}`)
            .delay((d, i) => Math.floor(Math.random() * this.dataArr.length));
    
    const colorGroups: any = {};
    this.dataArr.map((res: any) => {
      if (!colorGroups[res.value]) colorGroups[res.value] = 1;
      colorGroups[res.value]++;
    });

    const hslColors = Object.keys(colorGroups).map((key: any) => tinyColor(key).toHsl());
    const brightest = hslColors.sort((a: any, b: any) => (`${b.s}`.localeCompare(`${a.s}`) || b.l - a.l))[2];
    const rgb = tinyColor(brightest).toRgb();
    this.backgroundColor.emit(rgb);

    if (this.addBackground) {
      const element = this.el.nativeElement as HTMLElement;
      element.style.backgroundColor = tinyColor(brightest).setAlpha(.15).toRgbString();
    }
  }

}
