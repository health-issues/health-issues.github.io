// @flow weak

import TrendsAPI from '../api/TrendsAPI';
import type { Term, Geo, Filter, TrendsAPITopTopics } from '../util/types';
import terms from '../data/terms';
import countries from '../data/countries';
import { map, pickRandomIndex } from '../util/util';
import homeIconsList from '../data/homeIconsList';
import * as d3 from 'd3';
import $ from 'jquery';
import log from 'loglevel';
import '../../sass/home.scss';

export default class Home {

  data: {
    geo: Geo,
    disease: Term,
    topTopics: TrendsAPITopTopics[],
  }
  trendsAPI: TrendsAPI;
  countryContainer: HTMLElement;
  topTopicsList: HTMLElement;
  homeLoop: number;

  constructor(parentContainer: HTMLElement, trendsAPI: TrendsAPI) {
    const self = this;
    self.homeLoop = 0;
    self.data ={
      geo: { iso: '', name: ''},
      disease: { name: '', entity: ''},
      topTopics: [],
    }
    self.trendsAPI = trendsAPI;
    const disease = self.getRandomDisease();
    const country = self.getUserCountry(function(geo) {
      self.updateData({ disease, geo });
      self.getTrendsAPITopTopics();
    });
    this.createElements(parentContainer);
  }

  getRandomDisease(ignore?: string) {
    let topTerms = ['Acne', 'Allergy', 'Infection', 'Headache', 'Fever', 'Influenza'];
    if (ignore) {
      topTerms = topTerms.filter(t => t !== ignore);
    }
    const i = Math.floor(Math.random() * topTerms.length);
    const disease = terms.find(t => t.name === topTerms[i]);
    return disease;
  }

  countryToGeo(country: string):Geo {
    return countries.find(c => c.iso === country);
  }

  getPrevMonth() {
    const prevMonthDate = new Date();
    prevMonthDate.setMonth(prevMonthDate.getMonth() - 1);
    const year = prevMonthDate.getFullYear();
    let month = (new Date()).getMonth();
    month = month < 10 ? `0${month}` : month;
    return `${year}-${month}`;
  }

  getUserCountry(callback) {
    log.info('getUserCountry');
    const self = this;
    $.get("https://ipinfo.io", function(response) {
      if (response) {
        const { country } = response;
        const geo = self.countryToGeo(country);
        callback(geo);
      }
    }, 'jsonp')
    .fail(function() {
      callback('US');
    });
  }

  getTrendsAPITopTopics(){
    log.info('getTrendsAPITopTopics');
    const { geo, disease } = this.data;
    const self = this;
    const filter = {
      terms: [disease],
      geo,
      startDate: self.getPrevMonth(),
    };
    self.trendsAPI.getTopTopics(filter, function(val){
      log.info('From Google Trends: ', val);
      const { item } = val;
      if (item && item.length > 0) {
        self.updateData({ topTopics: item });
      } else if (geo && geo.iso !== 'US') {
        const defaultGeo = self.countryToGeo('US');
        self.updateData({ geo: defaultGeo });
        self.getTrendsAPITopTopics();
      } else if (disease) {
        self.updateData({ disease: self.getRandomDisease(disease.name) });
        self.getTrendsAPITopTopics();
      }
    });
  }

  createBgIcons(self: Home) {
    const { disease, topTopics } = self.data;
    const { topTopicsList, homeLoop } = self;
    const diseaseIconsList = homeIconsList[disease.name];
    const width = window.innerWidth;
    const height = window.innerHeight;
    const spacing = width < 600 ? 70 : 140;
    let i = 0;
    let line = 0;
    if (topTopics.length > 0) {
      topTopicsList.innerHTML = '';
      for (let y=0; y < height; y += spacing) {
        for (let x = (line % 2 === 0) ? 0 : -spacing/2 ; x < width; x += spacing) {
          const iconContainer = document.createElement('div');
          const n = i % diseaseIconsList.length;
          const iconName = diseaseIconsList[n];
          const distToCenter = Math.abs(height/2 - y);
          const opacity = map(distToCenter, 0, height/2, 0.24, 0.8);
          iconContainer.classList.add('icon-container');

          const icon = document.createElement('div');
          icon.classList.add('icon', iconName);
          iconContainer.appendChild(icon);

          iconContainer.style.top = `${y}px`;
          iconContainer.style.left = `${x}px`;
          iconContainer.style.opacity = opacity;
          topTopicsList.appendChild(iconContainer);

          const p = document.createElement('p');
          const randomTopic = topTopics[Math.floor(Math.random()*topTopics.length)];
          p.innerHTML = randomTopic.title;
          iconContainer.appendChild(p);

          i++;
        }
        line++;
      }
      clearInterval(self.homeLoop);
      self.homeLoop = 0;
      self.homeLoop = setInterval(this.showRandomTopic, 1500);
    }
  }

  showRandomTopic() {
    const iconContainers = document.querySelectorAll('#home.page .top-topics-list .icon-container');
    if(iconContainers.length > 0) {
      const i = Math.floor(Math.random()*iconContainers.length);
      const randomIcon = iconContainers[pickRandomIndex(iconContainers.length)];
      let icon, p;
      icon = randomIcon.querySelector('.icon');
      p = randomIcon.querySelector('p');
      if (icon && p) {
        icon.classList.add('flipped');
        p.classList.add('flipped');

        setTimeout(function() {
          icon.classList.remove('flipped');
          p.classList.remove('flipped');
        }, 4000);
      }
    }
  }

  checkScroll(scrollY: number, self: Home) {
    const mainContainer= document.querySelector('.main-container');
    if (mainContainer) {
      const mainContainerTop = mainContainer.offsetTop;
      if (scrollY > mainContainerTop) {
        clearInterval(self.homeLoop);
        self.homeLoop = 0;
      }
    }
  }

  updateData(obj) {
    const { data } = this;
    Object.assign(data, obj);
    log.info(this.data);
    this.updateElements();
  }

  createElements(parentContainer: HTMLElement) {

    const elementsContainer = document.createElement('div');
    elementsContainer.id = 'home';
    elementsContainer.classList.add('page');
    elementsContainer.style.height = `${window.innerHeight*1.3}px`;
    parentContainer.appendChild(elementsContainer);

    const titleContainer = document.createElement('div');
    titleContainer.classList.add('title-container');
    elementsContainer.appendChild(titleContainer);

    const title = document.createElement('h1');
    title.innerHTML = 'I\'m not<br>feeling well';
    titleContainer.appendChild(title);
    setTimeout(function() {
      titleContainer.classList.add('enter');
    }, 500);

    const projectDescription = document.createElement('p');
    projectDescription.classList.add('project-description', 'container');
    projectDescription.innerHTML = 'To everything there is a season, and diseases are no different. Google search patterns show us what health issues people worry about, when they worry about them, and how epidemics spread through the world.';
    titleContainer.appendChild(projectDescription);

    const logosContainer = document.createElement('div');
    logosContainer.classList.add('logos-container');
    titleContainer.appendChild(logosContainer);

    const gabriel = document.createElement('p');
    gabriel.classList.add('gabriel');
    gabriel.innerHTML = 'Gabriel Gianordoli';
    logosContainer.appendChild(gabriel);

    const forSpan = document.createElement('span');
    forSpan.innerHTML = 'for';
    logosContainer.appendChild(forSpan);

    const gnl = document.createElement('div');
    gnl.classList.add('google-news-lab-logo');
    logosContainer.appendChild(gnl);

    // const menuContainer = document.createElement('div');
    // menuContainer.classList.add('menu-container');
    // menuContainer.style.height = `${window.innerHeight*1.3}px`;
    // elementsContainer.appendChild(menuContainer);
    //
    // const container = document.createElement('div');
    // container.classList.add('container');
    // menuContainer.appendChild(container);
    //
    // const menu = document.createElement('div');
    // menu.classList.add('menu');
    // container.appendChild(menu);
    //
    // const menuTitle = document.createElement('p');
    // menuTitle.innerHTML = 'Jump to:';
    // menu.appendChild(menuTitle);
    //
    // const linksContainer = document.createElement('ul');
    // menu.appendChild(linksContainer);
    //
    // const links = ['stories', 'explore', 'ranking', 'about'];
    // for (const l of links) {
    //   const li = document.createElement('li');
    //   linksContainer.appendChild(li);
    //   const button = document.createElement('a');
    //   button.innerHTML = l;
    //   button.setAttribute('href', `#${l}`);
    //   li.appendChild(button);
    // }

    this.countryContainer = document.createElement('div');
    this.countryContainer.classList.add('country-container');
    elementsContainer.appendChild(this.countryContainer);

    this.topTopicsList = document.createElement('div');
    this.topTopicsList.classList.add('top-topics-list');
    elementsContainer.appendChild(this.topTopicsList);
  }

  updateElements() {
    const { geo, disease, topTopics } = this.data;
    const { countryContainer, topTopicsList, homeLoop } = this;
    if (topTopics.length > 0) {

      let span = document.createElement('span');
      span.innerHTML = 'Searches for ';
      countryContainer.append(span);

      const diseaseContainer = document.createElement('span');
      diseaseContainer.classList.add('disease-container');
      diseaseContainer.innerHTML = disease.name.toLowerCase();
      countryContainer.appendChild(diseaseContainer);

      countryContainer.appendChild(document.createElement('br'));

      span = document.createElement('span');
      span.innerHTML = 'in ';
      countryContainer.appendChild(span);

      const country = document.createElement('span');
      country.classList.add('country');
      country.innerHTML = geo.name;
      countryContainer.appendChild(country);

      this.createBgIcons(this);
    }
  }
}
