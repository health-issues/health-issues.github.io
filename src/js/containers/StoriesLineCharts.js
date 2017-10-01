// @flow weak

import stories from '../data/stories';
import StoriesNavBar from '../components/StoriesNavBar';
import FiltersMenu from '../components/FiltersMenu';
import LineChart from '../visualizations/LineChart';
import type { Term, Geo, TrendsAPIGraph } from '../util/types';
import { encodedStr, highlightText } from '../util/util';
import { LoadingAnimation } from '../util/loader';
import $ from 'jquery';
import * as d3 from 'd3';
import log from 'loglevel';
// import '../../sass/stories.scss';

export default class StoriesLineCharts {
  data: {
    storySection: string,
    currCase: number,
    geoIso: string,
    years: [number, number],
    chartData: {
      [key: string]: Array<TrendsAPIGraph>,
    },
    range?: number,
    isLoading: boolean,
  };
  filtersMenu: HTMLElement;
  chart: LineChart;
  copyContainer: HTMLElement;
  loaderContainer: HTMLElement;
  loadingAnimation: LoadingAnimation;

  constructor(parentContainer: HTMLElement, storySection: string, range?: number) {
    const self = this;
    const currCase = 0;
    const geoIso = stories[storySection].cases[currCase].geoList[0];
    const { years } = stories[storySection].cases[currCase];
    const path = stories[storySection].cases[currCase].data;
    const isLoading = false;

    const elementsContainer = document.createElement('div');
    elementsContainer.classList.add('story-section');
    parentContainer.appendChild(elementsContainer);

    d3.json(path, function(chartData) {
      self.data = { storySection, currCase, chartData, geoIso, years, range, isLoading };
      self.createElements(elementsContainer);
    });
  }

  resizeLineChart(self: StoriesLineCharts) {
    const { chart } = self;
    chart.resizeChart();
    chart.updateElements();
  }

  loadNewCase(
    event: Event,
    self: StoriesLineCharts,
    elementsContainer: HTMLElement,
    currCase: number
  ) {
    event.preventDefault();
    const { storySection } = self.data;
    const path = stories[storySection].cases[currCase].data;
    const geoIso = stories[storySection].cases[currCase].geoList[0];
    const { years } = stories[storySection].cases[currCase];
    let isLoading = true;
    self.updateData({ isLoading });

    elementsContainer.querySelectorAll('button').forEach((e, i) => {
      i === currCase ? e.classList.add('active') : e.classList.remove('active');
    });
    d3.json(path, function(chartData) {
      isLoading = false;
      self.updateData({ currCase, chartData, geoIso, years, isLoading });
    });
  }

  changeGeo(geoIso: string, self: StoriesLineCharts) {
    self.updateData({ geoIso });
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
    const { storySection, currCase, chartData, geoIso, years, range } = this.data;
    const { terms, geoList, chartType, copyTitle, copy } = stories[storySection].cases[
      currCase
    ];

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

    this.filtersMenu = new FiltersMenu(
      colLeft,
      terms,
      geoList,
      geoIso,
      years,
      this,
      this.changeGeo,
    );

    const chartsContainer = document.createElement('div');
    chartsContainer.classList.add('charts-container');
    colLeft.appendChild(chartsContainer);

    const chartItem = document.createElement('div');
    chartItem.classList.add('chart-item');
    chartsContainer.appendChild(chartItem);
    this.chart = new LineChart(chartItem, chartType, range);

    this.copyContainer = document.createElement('div');
    const { copyContainer } = this;
    copyContainer.classList.add('case-copy');
    row.appendChild(copyContainer);

    this.newCopy(copyContainer, copyTitle, copy);

    this.updateElements();
  }

  updateElements() {
    let { filtersMenu } = this;
    const { chart, copyContainer, loaderContainer, loadingAnimation } = this;
    const { storySection, currCase, chartData, geoIso, years, isLoading } = this.data;
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
      years,
      this,
      this.changeGeo
    );

    chart.updateData(chartData[geoIso], chartType);

    copyContainer.innerHTML = '';
    this.newCopy(copyContainer, copyTitle, copy);
  }
}
