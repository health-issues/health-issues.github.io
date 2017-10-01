// @flow weak

import stories from '../data/stories';
import StoriesNavBar from '../components/StoriesNavBar';
import FiltersMenu from '../components/FiltersMenu';
import WorldMap from '../visualizations/WorldMap';
import LineChart from '../visualizations/LineChart';
import type { TrendsAPIRegionsList, TrendsAPIGraph } from '../util/types';
import { encodedStr, highlightText } from '../util/util';
import { LoadingAnimation } from '../util/loader';
import * as d3 from 'd3';
import log from 'loglevel';
import '../../sass/stories.scss';

export default class StoriesEpidemics {
  data: {
    storySection: string,
    currCase: number,
    geoIso: string,
    years: [number, number],
    currMonth: number,
    mapData: Array<TrendsAPIRegionsList>,
    chartData: {
      [key: string]: Array<TrendsAPIGraph>,
    },
    isLoading: boolean,
  };
  filtersMenu: HTMLElement;
  worldMap: WorldMap;
  lineChart: LineChart;
  slider: HTMLInputElement;
  copyContainer: HTMLElement;
  loaderContainer: HTMLElement;
  loadingAnimation: LoadingAnimation;
  playLoop: number;

  constructor(parentContainer: HTMLElement, storySection: string) {
    const self = this;
    self.playLoop = 0;

    const currCase = 0;
    const geoIso = stories[storySection].cases[currCase].geoList[0];
    const { years } = stories[storySection].cases[currCase];
    const currMonth = 0;
    const isLoading = false;

    const elementsContainer = document.createElement('div');
    elementsContainer.classList.add('story-section', 'epidemics');
    parentContainer.appendChild(elementsContainer);

    const mapDataPath = stories[storySection].cases[currCase].mapData;
    const chartDataPath = stories[storySection].cases[currCase].chartData;

    d3.json(mapDataPath, function(mapData) {
      d3.json(chartDataPath, function(chartData) {
        self.data = {
          storySection,
          currCase,
          mapData,
          chartData,
          geoIso,
          years,
          currMonth,
          isLoading,
        };
        self.createElements(elementsContainer);
      });
    });
  }

  resizeCharts(self: StoriesEpidemics) {
    const { worldMap, lineChart } = self;
    worldMap.resizeChart();
    lineChart.resizeChart();
    worldMap.updateElements();
    lineChart.updateElements();
  }

  loadNewCase(
    event: Event,
    self: StoriesEpidemics,
    elementsContainer: HTMLElement,
    currCase: number
  ) {
    event.preventDefault();
    const { storySection } = self.data;
    const mapDataPath = stories[storySection].cases[currCase].mapData;
    const chartDataPath = stories[storySection].cases[currCase].chartData;
    const geoIso = stories[storySection].cases[currCase].geoList[0];
    const { years } = stories[storySection].cases[currCase];
    let isLoading = true;
    self.updateData({ isLoading });

    elementsContainer.querySelectorAll('button').forEach((e, i) => {
      i === currCase ? e.classList.add('active') : e.classList.remove('active');
    });

    d3.json(mapDataPath, function(mapData) {
      const currMonth = 0;
      self.slider.value = '0';
      self.slider.setAttribute('max', (mapData.length - 1).toString());

      d3.json(chartDataPath, function(chartData) {
        isLoading = false;
        self.updateData({
          currCase,
          mapData,
          chartData,
          geoIso,
          years,
          currMonth,
          isLoading,
        });
      });
    });
  }

  handleSliderChange(event, self: StoriesEpidemics) {
    const { value } = event.target;
    const currMonth = parseInt(value);
    clearInterval(self.playLoop);
    self.playLoop = 0;
    self.updateData({ currMonth });
  }

  startPlayback(event: Event, self: StoriesEpidemics) {
    log.info('startPlayback');
    const playButton = event.target;
    playButton.classList.add('clicked');
    event.preventDefault();
    const { slider } = self;
    const maxVal = parseInt(slider.max);
    const totalTime = 5000;
    const interval = totalTime/maxVal;
    log.info(self.playLoop)
    if (self.playLoop === 0) {
      self.playLoop = setInterval(function(){
        self.play(self);
      }, interval);
    } else {
      self.pause(self);
    }
  }

  play(self: StoriesEpidemics) {
    log.info('play');
    const { slider } = self;
    const curVal = parseInt(slider.value);
    const maxVal = parseInt(slider.max);
    if (curVal < maxVal) {
      const newVal = curVal + 1;
      const currMonth = newVal;
      slider.value = newVal.toString();
      self.updateData({ currMonth });
    } else {
      self.stop(self);
    }
  }

  stop(self: StoriesEpidemics) {
    const { slider } = self;
    slider.value = (0).toString();
    self.pause(self);
  }

  pause(self: StoriesEpidemics) {
    clearInterval(self.playLoop);
    self.playLoop = 0;
    const playButton = document.querySelector('#stories.page .play-button');
    if (playButton) playButton.classList.remove('clicked');
  }

  newCopy(copyContainer: HTMLElement, copyTitle: string, copy: string) {

    const { storySection, currCase } = this.data;
    let { terms } = stories[storySection].cases[currCase];

    const copyTitleContainer = document.createElement('h5');
    copyTitleContainer.innerHTML = copyTitle;
    copyContainer.appendChild(copyTitleContainer);

    terms = terms.map(h => encodedStr(h));

    for (const c of copy) {
      const p = document.createElement('p');
      p.innerHTML = highlightText(terms, encodedStr(c));
      copyContainer.appendChild(p);
    }
  }

  updateData(obj) {
    const { data } = this;
    Object.assign(data, obj);
    this.updateElements();
  }

  createElements(elementsContainer: HTMLElement) {
    const {
      storySection,
      currCase,
      mapData,
      chartData,
      geoIso,
      years,
      currMonth,
    } = this.data;
    const { terms, geoList, copyTitle, copy } = stories[storySection].cases[currCase];

    const sectionHeader = document.createElement('div');
    sectionHeader.classList.add('section-header', 'container');
    elementsContainer.appendChild(sectionHeader);

    const headerContent = document.createElement('div');
    headerContent.classList.add('header-content');
    sectionHeader.appendChild(headerContent);

    const title = document.createElement('h3');
    title.innerHTML = stories[storySection].title;
    headerContent.appendChild(title);

    const intro = document.createElement('p');
    intro.innerHTML = stories[storySection].intro;
    headerContent.appendChild(intro);

    const storiesNavBar = new StoriesNavBar(
      elementsContainer,
      stories[storySection].cases.map(c => c.title),
      this,
      this.loadNewCase
    );

    const sectionBody = document.createElement('div');
    sectionBody.classList.add('section-body', 'container');
    elementsContainer.appendChild(sectionBody);

    this.loaderContainer = document.createElement('div');
    const { loaderContainer } = this;
    loaderContainer.classList.add('loader-container');
    sectionBody.appendChild(loaderContainer);
    this.loadingAnimation = new LoadingAnimation(loaderContainer);

    const row = document.createElement('div');
    row.classList.add('row');
    sectionBody.appendChild(row);

    const colLeft = document.createElement('div');
    colLeft.classList.add('col-left');
    row.appendChild(colLeft);

    this.filtersMenu = new FiltersMenu(colLeft, terms, geoList, geoIso, years);

    const chartsContainer = document.createElement('div');
    chartsContainer.classList.add('charts-container');
    colLeft.appendChild(chartsContainer);

    let chartItem = document.createElement('div');
    chartItem.classList.add('chart-item');
    chartsContainer.appendChild(chartItem);
    this.worldMap = new WorldMap(chartItem, mapData[currMonth].regions);

    chartItem = document.createElement('div');
    chartItem.classList.add('chart-item');
    chartsContainer.appendChild(chartItem);
    this.lineChart = new LineChart(chartItem, 'mixed');

    const controls = document.createElement('div');
    controls.classList.add('controls');
    chartsContainer.appendChild(controls);

    const playButton = document.createElement('div');
    playButton.classList.add('play-button');
    const bindStartPlayback = evt => this.startPlayback(evt, this);
    playButton.addEventListener('click', bindStartPlayback);
    playButton.addEventListener('touchend', bindStartPlayback);
    controls.appendChild(playButton);

    this.slider = document.createElement('input');
    const { slider } = this;
    slider.setAttribute('type', 'range');
    slider.setAttribute('min', '0');
    slider.setAttribute('max', (mapData.length - 1).toString());
    slider.value = '0';
      const bindSliderChange = evt => this.handleSliderChange(evt, this);
    if (window.innerWidth > 600) {
      slider.addEventListener('input', bindSliderChange);
    } else {
      slider.addEventListener('touchmove', bindSliderChange);
    }
    controls.appendChild(slider);

    this.copyContainer = document.createElement('div');
    const { copyContainer } = this;
    copyContainer.classList.add('case-copy');
    row.appendChild(copyContainer);

    this.newCopy(copyContainer, copyTitle, copy);

    this.updateElements();
  }

  updateElements(self?: StoriesEpidemics) {
    if (!self) self = this;
    let { filtersMenu } = this;
    const { worldMap, lineChart, copyContainer, loaderContainer, loadingAnimation } = self;
    const {
      storySection,
      currCase,
      mapData,
      chartData,
      geoIso,
      years,
      currMonth,
      isLoading
    } = self.data;
    const { terms, geoList, chartType, copyTitle, copy } = stories[storySection].cases[
      currCase
    ];

    if (isLoading) {
      loaderContainer.classList.remove('hidden');
      loadingAnimation.start(loadingAnimation, 0);
    } else {
      loaderContainer.classList.add('hidden');
      loadingAnimation.stop(loadingAnimation);
    }

    const parent = filtersMenu.parentElement;
    filtersMenu = new FiltersMenu(
      filtersMenu.parentElement,
      terms,
      geoList,
      geoIso,
      years
    );

    if (worldMap.worldFeatures) worldMap.updateData(mapData[currMonth].regions);
    lineChart.updateData(chartData[geoIso], 'mixed');

    copyContainer.innerHTML = '';
    this.newCopy(copyContainer, copyTitle, copy);
  }
}
