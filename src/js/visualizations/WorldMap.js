// @flow weak

import StoriesEpidemics from '../containers/StoriesEpidemics';
import { map } from '../util/util';
import type { TrendsAPIRegion } from '../util/types';
import * as d3 from 'd3';
import legend from 'd3-svg-legend';
import d3tip from 'd3-tip';
import * as topojson from 'topojson-client';
import log from 'loglevel';

export default class WorldMap {
  data: Array<TrendsAPIRegion>;
  parentContainer: HTMLElement;
  originalWidth: number;
  originalHeight: number;
  width: number;
  height: number;
  worldFeatures;
  svg: () => {};
  tip: () => {};
  thresholdScale: () => {};

  constructor(parentContainer: HTMLElement, data: Array<TrendsAPIRegion>) {
    const self = this;
    self.data = data;
    self.parentContainer = parentContainer;
    const size = this.getSize();
    this.width = size.width;
    this.height = size.height;
    this.originalWidth = size.width;
    this.originalHeight = size.height;

    d3.json(
      './data/world-topo.json',
      function(error, world) {
        self.worldFeatures = topojson.feature(world, world.objects.countries)
          .features;
        self.createElements(parentContainer);
      }
    );
  }

  getSize() {
    const { parentContainer } = this;
    const width = parentContainer.offsetWidth;
    const height = width*0.5;
    return { width, height };
  }

  resizeChart() {
    const { svg, originalWidth, originalHeight } = this;
    const size = this.getSize();
    const { width, height } = size;
    this.width = width;
    this.height = height;
    svg.attr('width', width)
      .attr('height', height);

    svg.select('.map')
      .attr('transform', `scale(${width/originalWidth}, ${height/originalHeight})`);

    svg.select('.legendThreshold')
      .attr('transform', `translate(${width-220},${height-30})`);
  }

  updateData(data) {
    this.data = data;
    this.updateElements();
  }

  createElements(parentContainer: HTMLElement) {
    log.info('createElements');
    const parentContainerSelection = d3.select(parentContainer);
    const { width, height, worldFeatures } = this;

    this.svg = parentContainerSelection
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('class', 'chart-canvas');
    const { svg } = this;

    this.tip = d3tip()
      .attr('class', 'd3-tip')
      .html(function(content: string) {
        return content;
      });

    svg.call(this.tip);

    this.thresholdScale = d3.scaleThreshold()
        .domain([1, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100])
        .range(d3.range(11).map(function(i) {
          return 'q' + i + '-10';
        }));
    const { thresholdScale } = this;

    const projection = d3.geoEquirectangular()
      .scale((width - 3) / (2 * Math.PI))
      .translate([width * 0.5, height * 0.5]);

    const path = d3.geoPath().projection(projection);

    const worldMap = svg.append('g')
      .attr('class', 'map');

    worldMap.selectAll('.country')
      .data(worldFeatures)
      .enter()
      .append('path')
      .attr('class', 'country')
      .attr('d', path)
      .attr('id', d => d.properties.countryCode);

    worldMap.select('#AQ').remove();

    svg.append('g')
      .attr('class', 'legendThreshold')
      .attr('transform', `translate(${width-220},${height-30})`);

    const colorLegend = legend.legendColor()
        .labels(function({ i, genLength, generatedLabels, domain }){
          return domain[i];
        })
        .shapeWidth(20)
        .shapeHeight(8)
        .shapePadding(0)
        .orient('horizontal')
        .useClass(true)
        .scale(thresholdScale);

    svg.select('.legendThreshold')
      .call(colorLegend);

    this.updateElements();
  }

  updateElements() {
    const { data, width, height, svg, tip, thresholdScale, worldFeatures } = this;

    const valueByRegion = {};
    data.forEach(d => {
      valueByRegion[d.regionCode] = +d.value;
    });

    worldFeatures.forEach(d => {
      valueByRegion[d.properties.countryCode]
        ? (d.value = valueByRegion[d.properties.countryCode])
        : (d.value = 0);
    });

    const worldMap = svg.select('.map');
    worldMap.selectAll('.country')
      .attr('class', d => {
        let value = valueByRegion[d.properties.countryCode];
        if (value === undefined) value = 0;
        return thresholdScale(value);
      })
      .classed('country', true)
      .style('cursor', d => valueByRegion[d.properties.countryCode] ? 'pointer' : 'auto')
      .on('mouseover', function(d) {
        const val = valueByRegion[d.properties.countryCode];
        if (val) {
          const tooltipHed = `<span class='country'>${d.properties.name}:</span>`;
          const tooltipVal = `<span class='value'>${valueByRegion[d.properties.countryCode]}</span>`;
          tip.show(tooltipHed + tooltipVal);
        }
      })
      .on('mouseout', tip.hide);
  }
}
