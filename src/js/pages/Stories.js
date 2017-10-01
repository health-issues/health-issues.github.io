// @flow weak

import StoriesLineCharts from '../containers/StoriesLineCharts';
import StoriesEpidemics from '../containers/StoriesEpidemics';
import LineChart from '../visualizations/LineChart';
import * as d3 from 'd3';
import log from 'loglevel';
import '../../sass/stories.scss';

export default class Stories {

  storiesSeasonal: StoriesLineCharts;
  storiesHolidays: StoriesLineCharts;
  storiesMedia: StoriesLineCharts;
  storiesEpidemics: StoriesEpidemics;

  constructor(parentContainer: HTMLElement) {
    this.createElements(parentContainer);
  }

  resizeAllCharts(self: Stories) {
    const { storiesSeasonal, storiesHolidays, storiesMedia, storiesEpidemics } = self;
    storiesSeasonal.resizeLineChart(storiesSeasonal);
    storiesHolidays.resizeLineChart(storiesHolidays);
    storiesMedia.resizeLineChart(storiesMedia);
    storiesEpidemics.resizeCharts(storiesEpidemics);
  }

  createElements(parentContainer: HTMLElement) {

    const elementsContainer = document.createElement('div');
    elementsContainer.id = 'stories';
    elementsContainer.classList.add('page');
    parentContainer.appendChild(elementsContainer);

    const sticky = document.createElement('div');
    sticky.classList.add('sticky', 'header');
    elementsContainer.appendChild(sticky);

    const pageHeader = document.createElement('div');
    pageHeader.classList.add('page-header');
    sticky.appendChild(pageHeader);

    const container = document.createElement('div');
    container.classList.add('container');
    pageHeader.appendChild(container);

    const pageName = document.createElement('p');
    pageName.innerHTML = "Stories";
    container.appendChild(pageName);

    const pageBody = document.createElement('div');
    pageBody.classList.add('page-body');
    elementsContainer.appendChild(pageBody);

    this.storiesSeasonal = new StoriesLineCharts(pageBody, 'seasonal');
    this.storiesHolidays = new StoriesLineCharts(pageBody, 'holidays', 15);
    this.storiesMedia = new StoriesLineCharts(pageBody, 'media');
    this.storiesEpidemics = new StoriesEpidemics(pageBody, 'epidemics');
  }
}
