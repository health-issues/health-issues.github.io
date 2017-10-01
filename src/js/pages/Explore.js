// @flow weak

// Components
import LineChart from '../visualizations/LineChart';
import TrendsAPI from '../api/TrendsAPI';
import ShinyAPI from '../api/ShinyAPI';

// Types
import type { Term, Geo, Filter, TrendsAPIGraph, TrendsAPITopQueries } from '../util/types';

// Data and Utils
import { arrayIsEqual, pickRandomIndex } from '../util/util';
import { LoadingAnimation } from '../util/loader';
import terms from '../data/terms';
import countries from '../data/countries';
import { dummyData } from '../scripts/data';

// Libraries
import log from 'loglevel';
import selectize from 'selectize';
import $ from 'jquery';

//Styles
import 'selectize/dist/css/selectize.css';
import '../../sass/explore.scss';

export default class Explore {

  data: {
    prevDiseases: Term[],
    diseases: Term[],
    prevGeo: Geo,
    geo: Geo,
    seasonal: TrendsAPIGraph[],
    trend: TrendsAPIGraph[],
    total: TrendsAPIGraph[],
    totalPerLine: TrendsAPIGraph[],
    topQueries: TrendsAPITopQueries[],
    isMerged: boolean,
    isChanging: boolean,
    isLoading: boolean,
    isInitialized: boolean,
  };

  diseaseSelect: selectize;
  geoSelect: selectize;

  loaderContainer: HTMLElement;
  loadingAnimation: LoadingAnimation;
  mergeButton: HTMLButtonElement;
  topQueriesList: HTMLElement;

  seasonalChart: LineChart;
  trendChart: LineChart;

  trendsAPI: TrendsAPI;
  shinyAPI: ShinyAPI;

  constructor(parentContainer: HTMLElement, shinyAPI: ?ShinyAPI, trendsAPI: TrendsAPI) {
    this.data = {
      prevDiseases: [],
      diseases: [],
      prevGeo: countries[0],
      geo: countries[0],
      seasonal: [],
      trend: [],
      total: [],
      totalPerLine: [],
      topQueries: [],
      isMerged: false,
      isChanging: false,
      isLoading: false,
      isInitialized: false,
    }
    const self = this;
    self.trendsAPI = trendsAPI;
    if (shinyAPI) {
      self.shinyAPI = shinyAPI;
      self.shinyAPI.setCallback(self, function(explore, dataFromR) {

        const { diseases, total } = self.data;
        const type = dataFromR.indexOf('trend') > -1 ? 'trend' : 'seasonal';
        const data = self.data[type];
        const index = data.length;
        const obj = {};

        obj[type] = data.concat({
          term: diseases[index].name,
          points: self.parseDataFromR(dataFromR)
        });
        self.updateData(obj);

        // I'm still getting R Data for that one type
        if (obj[type].length < total.length) {
          // Trend? Keep parsing the already loaded data
          if (type === 'trend') {
            const dataToR = self.parseDataToR(type);
            self.shinyAPI.updateData(type, dataToR);

          // Seasonal? Go get more data from Google Trends
          } else if (type === 'seasonal') {
            setTimeout(function() {
              self.getTrendsAPIGraph('seasonal');
            }, 500);
          }

        // I'm done with this type!
        } else {
          // Trend? Start seasonal then
          if (type === 'trend') {
            self.getTrendsAPIGraph('seasonal');
          // Seasonal? Move on to load top queries
          } else if (type === 'seasonal') {
            self.updateData({ topQueries: [], isLoading: false });
            setTimeout(function() {
              self.getTrendsAPITopQueries();
            }, 500);
          }
        }

      });
    }

    self.createElements(parentContainer);
  }

  resizeLineCharts(self: Explore) {
    const { seasonalChart, trendChart } = self;
    seasonalChart.resizeChart();
    trendChart.resizeChart();
    seasonalChart.updateElements();
    trendChart.updateElements();
  }

  checkScroll(scrollY: number, self: Explore) {
    const { isInitialized } = self.data;
    if (!isInitialized) {
      const mainContainer = document.querySelector('.main-container');
      const storiesPage = document.querySelector('#stories.page');
      if (mainContainer && storiesPage) {
        const storiesPageTop = mainContainer.offsetTop + storiesPage.offsetTop;
        if (scrollY > storiesPageTop) {
          self.initializeExplore(self);
        }
      }
    }
  }

  handleRError(self: Explore) {
    self.updateData({ isChanging: false, isLoading: false });
  }

  initializeExplore(self: Explore) {
    log.info('initializeExplore');
    const randomNames = ['Sunburn', 'Lyme disease', 'Dehydration'];
    const random = randomNames[pickRandomIndex(randomNames.length)];
    log.info(random);
    const diseases = [terms.find(t => t.name === random)];
    const geo = countries[0];
    const isInitialized = true;
    self.updateData({ diseases, geo, isInitialized });
    self.confirmFilters(self);
  }

  handleSelectDiseaseChange(value: string[], self: Explore) {
    const diseases = value.map(v => self.getDiseaseByEntity(v));
    this.updateData({diseases: diseases, isChanging: true});
    if (diseases.length > 0) {
      self.confirmFilters(self);
    }
  }

  handleSelectDiseaseBlur(self: Explore) {
    const { prevDiseases } = self.data;
    this.updateData({diseases: prevDiseases});
  }

  handleSelectGeoChange(value: string, self: Explore) {
    const name = this.getCountryByIso(value).name;
    this.updateData({geo: {iso: value, name: name}, isChanging: true});
    self.confirmFilters(self);
  }

  handleSelectGeoFocus(self: Explore) {
    const { geoSelect } = self;
    geoSelect.setValue('', true);
  }

  handleSelectGeoBlur(self: Explore) {
    const { geoSelect } = self;
    const { prevGeo } = self.data;
    if (geoSelect.getValue() === '') {
      this.updateData({geo: prevGeo});
    }
  }

  getDiseaseByEntity(entity: string): Term {
    return terms.find(t => t.entity === entity);
  }

  getCountryByIso(iso: string): Geo {
    return countries.find(c => c.iso === iso);
  }

  confirmFilters(self) {
    log.info('confirmFilters');
    const { diseases, geo } = self.data;
    self.updateData({
      prevDiseases: diseases,
      prevGeo: geo,
      isChanging: false,
      isLoading: true,
      totalPerLine: [],
      seasonal: [],
      trend: [],
    });
    self.getTrendsAPIGraph('trend');
  }

  toggleChartMerge(event, self) {
    event.preventDefault();
    let { isMerged } = self.data;
    isMerged = isMerged ? false : true;
    this.updateData({ isMerged, type: 'total' });
  }

  getTrendsAPIGraph(type: string){
    log.info('getTrendsAPIGraph');
    const self = this;
    const { diseases, geo, totalPerLine } = self.data;
    const { shinyAPI } = self;
    const terms = type === 'trend' ? diseases : [diseases[totalPerLine.length]];

    self.trendsAPI.getGraph({ terms, geo }, function(val){
      log.info('From Google Trends: ', type);
      log.info(val);

      const obj = {};
      if (type === 'trend') {
        obj['total'] = self.mapGraphResponse(val.lines);

      } else if (type === 'seasonal') {
        obj['totalPerLine'] = totalPerLine.concat(
          self.mapGraphResponse(val.lines)
        );
      }
      self.updateData(obj);

      if (ENV !== 'DEVELOPMENT') {
        const dataToR = self.parseDataToR(type);
        shinyAPI.updateData(type, dataToR);
      } else {
        const obj = {
          ...dummyData,
          topQueries: [],
          isLoading: false,
        };
        self.updateData(obj);
        self.getTrendsAPITopQueries();
      }
    });
  }

  mapGraphResponse(lines) {
    const { diseases } = this.data;
    return lines.map((l, i) => {
      return { term: diseases[i].name, points: l.points}
    });
  }

  getTrendsAPITopQueries(){
    log.info('getTrendsAPITopQueries');
    const { diseases, geo } = this.data;
    let { topQueries } = this.data;
    const index = topQueries.length;
    const disease = diseases[index];
    const self = this;

    self.trendsAPI.getTopQueries({terms: [disease], geo: geo}, function(val){
      log.info('From Google Trends: ', val);
      topQueries = topQueries.concat(val);
      self.updateData({topQueries});
      if (topQueries.length < diseases.length) {
        setTimeout(function() {
          self.getTrendsAPITopQueries();
        }, 500);
      }
    });
  }

  parseDataToR(type: string) {
    log.info('parseDataToR', type);
    const { total, totalPerLine } = this.data;
    const { shinyAPI } = this;
    const index = this.data[type].length;
    const whichTotal = type === 'trend' ? total : totalPerLine;
    return whichTotal[index].points.map((p, i) => p.date+','+p.value);
  }

  parseDataFromR(dataFromR) {
    log.info('parseDataFromR');
    const { diseases, total, seasonal, trend, isLoading } = this.data;
    const type = dataFromR.indexOf('trend') > -1 ? 'trend' : 'seasonal';
    const index = this.data[type].length;
    const newDataString = dataFromR.substring(
      dataFromR.indexOf(type) + type.length + 1);
    let newData = (newDataString.split(','));
    if (type === 'seasonal') {
      newData = newData.slice(0, 13);
    }
    return (
      newData.map((n, i) => {
        const date = total[0].points[i].date;
        const value = (Math.round(Number(n.trim())*100))/100;
        return { date, value };
      })
    )
  }

  updateData(obj) {
    const { data } = this;
    Object.assign(data, obj);
    log.info(this.data);
    log.info('geo: ', data.geo.iso);
    this.updateElements();
  }

  createElements(parentContainer: HTMLElement) {

    const self = this;

    const elementsContainer = document.createElement('div');
    elementsContainer.id = 'explore';
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
    pageName.innerHTML = "Explore";
    container.appendChild(pageName);

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
    title.innerHTML = 'Your Turn';
    headerContent.appendChild(title);

    const intro = document.createElement('p');
    intro.innerHTML = "Can you find other seasonal patterns or interesting trends? Maybe something specific to your country? Pick up to three options from the list below and choose a location to start exploring.";
    headerContent.appendChild(intro);

    const sectionBody = document.createElement('div');
    sectionBody.classList.add('section-body', 'container');
    pageBody.appendChild(sectionBody);

    // Loader
    self.loaderContainer = document.createElement('div');
    const { loaderContainer } = self;
    loaderContainer.classList.add('loader-container');
    sectionBody.appendChild(loaderContainer);
    self.loadingAnimation = new LoadingAnimation(loaderContainer);

    // filtersMenu
    const filtersMenu = document.createElement('div');
    filtersMenu.classList.add('filters-menu');
    sectionBody.appendChild(filtersMenu);

    let text = document.createElement('span');
    text.classList.add('sentence');
    text.innerHTML = 'Search interest from 2004 to today for<br/>';
    filtersMenu.appendChild(text);


    // Diseases
    const diseaseSelect = document.createElement('select');
    diseaseSelect.classList.add('disease-select');
    terms.forEach((d, i) => {
      const option = document.createElement('option');
      option.setAttribute('value', d.entity);
      option.setAttribute('key', i);
      option.innerHTML = d.name;
      diseaseSelect.appendChild(option);
    });
    let bindHandleChange = value => self.handleSelectDiseaseChange(value, self);
    let bindHandleBlur = value => self.handleSelectDiseaseBlur(self);
    filtersMenu.appendChild(diseaseSelect);
    const diseaseSelectize = $(diseaseSelect).selectize({
      plugins: ['remove_button'],
      maxItems: 3,
      onChange: bindHandleChange,
      onBlur: bindHandleBlur,
      openOnFocus: false,
      closeAfterSelect: true,
      placeholder: 'Type'
    });
    self.diseaseSelect = diseaseSelectize[0].selectize;

    text = document.createElement('span');
    text.classList.add('sentence');
    text.innerHTML = ' in ';
    filtersMenu.appendChild(text);

    // Geo
    const geoSelect = document.createElement('select');
    geoSelect.classList.add('geo-select');
    geoSelect.name = 'geo-select';
    countries.forEach((c, i) => {
      const option = document.createElement('option');
      option.setAttribute('value', c.iso);
      option.innerHTML = c.name;
      geoSelect.appendChild(option);
    });
    bindHandleChange = value => self.handleSelectGeoChange(value, self);
    let bindHandleFocus = value => self.handleSelectGeoFocus(self);
    bindHandleBlur = value => self.handleSelectGeoBlur(self);
    filtersMenu.appendChild(geoSelect);
    const geoSelectize = $(geoSelect).selectize({
      maxItems: 1,
      onChange: bindHandleChange,
      onBlur: bindHandleBlur,
      onFocus: bindHandleFocus,
      placeholder: 'Select'
    });
    self.geoSelect = geoSelectize[0].selectize;


    const row = document.createElement('div');
    row.classList.add('row');
    sectionBody.appendChild(row);

    const colLeft = document.createElement('div');
    colLeft.classList.add('col-left');
    row.appendChild(colLeft);

    // Charts section
    const chartsContainer = document.createElement('div');
    chartsContainer.classList.add('charts-container');
    colLeft.appendChild(chartsContainer);

    // Seasonal Chart
    let chartItem = document.createElement('div');
    chartItem.classList.add('chart-item');
    chartsContainer.appendChild(chartItem);
    self.seasonalChart = new LineChart(chartItem, 'seasonal');

    // Trend chart
    chartItem = document.createElement('div');
    chartItem.classList.add('chart-item');
    chartsContainer.appendChild(chartItem);

    self.mergeButton = document.createElement('button');
    const { mergeButton } = self;
    const bindToggleChartMerge = evt => self.toggleChartMerge(evt, self);
    mergeButton.classList.add('merge-button');
    mergeButton.innerHTML = 'See Total Interest';
    mergeButton.addEventListener('click', bindToggleChartMerge);
    mergeButton.addEventListener('touchend', bindToggleChartMerge);
    chartItem.appendChild(mergeButton);

    self.trendChart = new LineChart(chartItem, 'trend');


    // Top Queries
    const topQueriesContainer = document.createElement('div');
    topQueriesContainer.classList.add('top-queries-container');
    row.appendChild(topQueriesContainer);

    const topQueriesTitle = document.createElement('h4');
    topQueriesTitle.innerHTML = 'Top Related Queries';
    topQueriesContainer.appendChild(topQueriesTitle);

    this.topQueriesList = document.createElement('div');
    const { topQueriesList } = this;
    topQueriesList.classList.add('top-queries-list');
    topQueriesContainer.appendChild(topQueriesList);

    self.updateElements();
  }

  updateElements() {
    log.info('updateElements');
    const { data, loaderContainer, loadingAnimation, diseaseSelect, geoSelect, mergeButton, seasonalChart, trendChart, topQueriesList } = this;
    const { diseases, geo, seasonal, trend, total, topQueries, isMerged, isChanging, isLoading } = data;

    if (isLoading) {
      loaderContainer.classList.remove('hidden');
      loadingAnimation.start(loadingAnimation, 0);
      diseaseSelect.disable();
      geoSelect.disable();
    } else {
      loaderContainer.classList.add('hidden');
      loadingAnimation.stop(loadingAnimation);
      diseaseSelect.enable();
      geoSelect.enable();
    }

    if (!arrayIsEqual(diseaseSelect.getValue(), diseases.map(d => d.entity))) {
      diseaseSelect.setValue(diseases.map(d => d.entity), true);
    }

    if (geoSelect.getValue() !== geo.iso) {
      geoSelect.setValue(geo.iso, true);
    }

    mergeButton.innerHTML = isMerged ? 'See Trend' : 'See Total Interest';

    // if(!isChanging && !isLoading && seasonal.length > 0 && trend.length > 0 && total.length > 0) {
    if(!isChanging && !isLoading && trend.length > 0 && total.length > 0) {
      seasonalChart.updateData(seasonal);
      isMerged ? trendChart.updateData(total, 'total') : trendChart.updateData(trend, 'trend');

      if (topQueries.length > 0) {

        let isEmpty = true;
        topQueriesList.innerHTML = '';
        for(let i = 0; i < topQueries.length; i++) {
          if (topQueries[i].item) {
            isEmpty = false;
            const listContainer = document.createElement('div');
            listContainer.classList.add('list-container');
            topQueriesList.appendChild(listContainer);

            const term = document.createElement('p');
            term.innerHTML = diseases[i].name;
            listContainer.appendChild(term);

            const list = document.createElement('ol');
            listContainer.appendChild(list);

            for(const q of topQueries[i].item) {
              const listItem = document.createElement('li');
              list.appendChild(listItem);
              const link = document.createElement('a');
              link.innerHTML = q.title;
              link.setAttribute('href', `https://www.google.com/#q=${encodeURIComponent(q.title)}`);
              link.setAttribute('target', '_blank');
              listItem.appendChild(link);
            }
          }
        }
        const parent = topQueriesList.parentElement;
        if (parent) {
          isEmpty ? parent.classList.add('hidden') : parent.classList.remove('hidden');
        }
      }
    }
  }
}
