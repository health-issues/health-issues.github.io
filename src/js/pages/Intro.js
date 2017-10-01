// @flow weak

import FiltersMenu from '../components/FiltersMenu';
import LineChart from '../visualizations/LineChart';
import { seasonalRatio } from '../util/constants';
import introSlides from '../data/introSlides';
import { encodedStr, highlightText } from '../util/util';
import * as d3 from 'd3';
import { graphScroll } from 'graph-scroll';
import log from 'loglevel';
import '../../sass/intro.scss';

export default class Intro {
  chart: LineChart;

  constructor(parentContainer: HTMLElement) {
    const self = this;

    const elementsContainer = document.createElement('div');
    elementsContainer.id = 'intro';
    elementsContainer.classList.add('page');
    parentContainer.appendChild(elementsContainer);

    d3.json('./data/intro-influenza.json', function(chartData) {
      self.createElements(elementsContainer, chartData);
    });
  }

  resizeLineChart(self: Intro) {
    const { chart } = self;
    chart.resizeChart();
    chart.updateElements();
  }

  createElements(elementsContainer: HTMLElement, chartData) {

    const pageBody = document.createElement('div');
    pageBody.classList.add('page-body');
    elementsContainer.appendChild(pageBody);

    const sectionHeader = document.createElement('div');
    sectionHeader.classList.add('section-header', 'container');
    pageBody.appendChild(sectionHeader);

    const headerContent = document.createElement('div');
    headerContent.classList.add('header-content');
    sectionHeader.appendChild(headerContent);

    const title = document.createElement('h3');
    title.innerHTML = 'Trends and Seasonality';
    headerContent.appendChild(title);

    const intro = document.createElement('p');
    intro.innerHTML =
      'Is the search interest for a given disease increasing? Are there different times of the year when people search for a particular health issue? We can answer both questions using Google Trends, but first we&#x2019;ll need to look at its data in two different formats. Let&#x2019;s take a look at global searches for the flu as an example.';
    headerContent.appendChild(intro);

    const sectionBody = document.createElement('div');
    sectionBody.classList.add('section-body', 'container');
    pageBody.appendChild(sectionBody);

    const row = document.createElement('div');
    row.classList.add('row');
    sectionBody.appendChild(row);

    const colLeft = document.createElement('div');
    colLeft.classList.add('col-left');
    row.appendChild(colLeft);

    const filtersMenu = new FiltersMenu(
      colLeft,
      ['Influenza'],
      ['world'],
      'world',
      [2004, 2016],
    );

    const chartsContainer = document.createElement('div');
    chartsContainer.classList.add('charts-container');
    colLeft.appendChild(chartsContainer);
    chartsContainer.style.height = (chartsContainer.offsetWidth * seasonalRatio).toString() + 'px';

    const chartItem = document.createElement('div');
    chartItem.classList.add('chart-item');
    chartsContainer.appendChild(chartItem);
    this.chart = new LineChart(chartItem, 'total');
    const { chart } = this;

    const slidesContainer = document.createElement('div');
    slidesContainer.classList.add('slides-container');
    if (window.innerWidth < 600) slidesContainer.style.paddingTop = `${window.innerHeight*0.5}px`;
    row.appendChild(slidesContainer);

    for (const i of introSlides) {
      const slide = document.createElement('div');
      slide.classList.add('slide');
      slide.style.paddingBottom = `${window.innerHeight*0.5}px`;
      slidesContainer.appendChild(slide);

      const content = document.createElement('div');
      content.classList.add('content');
      slide.appendChild(content);

      const title = document.createElement('h5');
      title.innerHTML = i.title;
      content.appendChild(title);

      const terms = i.highlights.map(h => encodedStr(h));
      for (const c of i.copy) {
        const paragraph = document.createElement('p');
        paragraph.innerHTML = highlightText(terms, encodedStr(c));
        content.appendChild(paragraph);
      }
    }

    const thisPage = d3.select(elementsContainer);
    const containerD3 = thisPage.select('.row');
    const colLeftD3 = containerD3.select('.col-left');
    const slidesContainerD3 = containerD3.selectAll('.slides-container');
    const slidesD3 = slidesContainerD3.selectAll('.slide');

    let yearlyLoop;
    let yearlyLoopIndex = 0;
    function loopThroughYears(type: string, title: string) {
      const data = {
        term: chartData[0].term,
        points: chartData[0].points.slice(yearlyLoopIndex * 12, yearlyLoopIndex * 12 + 12),
      }
      chart.updateData([data], type, title);
      if (yearlyLoopIndex < 12) {
        yearlyLoopIndex ++;
      } else {
        yearlyLoopIndex = 0;
        clearInterval(yearlyLoop);
      }
    }

    graphScroll()
      .graph(colLeftD3)
      .container(containerD3)
      .sections(slidesD3)
      .offset(window.innerHeight / 2)
      .on('active', function(i) {

        clearInterval(yearlyLoop);
        chartsContainer.classList.remove('step-1', 'step-2', 'step-3', 'step-4');

        let title, type, range;
        let timeSeries = [];

        switch (i) {

          case 0:
            type = 'total';
            timeSeries = chartData.filter(d => d.data === 'total');
            chart.updateData(timeSeries, type, title, range);
            break;

          case 1:
            type = 'mixed';
            title = 'Trend per year';
            chartsContainer.classList.add('step-1');
            yearlyLoop = setInterval(function(){
              loopThroughYears(type, title, range);
            }, 2000);
            break;

          case 2:
            type = 'trend';
            chartsContainer.classList.add('step-2');
            timeSeries = chartData.filter(d => d.data === 'total' || d.data === 'trend');
            chart.updateData(timeSeries, type, title, range);
            break;

          case 3:
            chartsContainer.classList.add('step-3');
            type = 'seasonal';
            title = 'Seasonal over time';
            range = 100;
            timeSeries = chartData.filter(d => d.data === 'remainder');
            chart.updateData(timeSeries, type, title, range);
            break;

          case 4:
            type = 'seasonal';
            range = 20;
            chartsContainer.classList.add('step-4');
            timeSeries = chartData.filter(d => d.data === 'seasonal');
            chart.updateData(timeSeries, type, title, range);
            const remainder = chartData.find(d => d.data === 'remainder');
            const seasonal = chartData.find(d => d.data === 'seasonal');
            for (let i = 0; i < remainder.points.length - 13; i += 12) {
              const thisYear = {
                term: 'Influenza',
                points: remainder.points.slice(i, i + 13)
              }
              thisYear.points = thisYear.points.map((p, j) => {
                const { value } = p;
                const date = seasonal.points[j].date;;
                return { value, date };
              });
              timeSeries.push(thisYear);
            }
            chart.updateData(timeSeries, type, title, range);
        }
      });
  }
}
