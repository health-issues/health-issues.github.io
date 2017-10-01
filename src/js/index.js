// @flow weak

import MainNav from './components/MainNav';
import Home from './pages/Home';
import Intro from './pages/Intro';
import Stories from './pages/Stories';
import Explore from './pages/Explore';
import Ranking from './pages/Ranking';
import About from './pages/About';
import Footer from './pages/Footer';
import ShinyAPI from './api/ShinyAPI';
import TrendsAPI from './api/TrendsAPI';
import terms from './data/terms';
import countries from './data/countries';
import log from 'loglevel';
import Stickyfill from 'stickyfill';
const stickyfill = Stickyfill();
import '../sass/App.scss';

import GetMapData from './scripts/GetMapData';

var app = app || {};

app.main = (function (){

  let explore;

  function loadShinyAPI() {
    const shinyAPI = new ShinyAPI();
    if (ENV !== 'DEVELOPMENT') {
      shinyAPI.setup(function(){
        loadTrendsAPI(shinyAPI);
      });
    } else {
      loadTrendsAPI(null);
    }
  }

  function loadTrendsAPI(shinyAPI: ?ShinyAPI) {
    const trendsAPI = new TrendsAPI();
    trendsAPI.setup(function(){
      render(shinyAPI, trendsAPI);
    });
  }

  let ticking = false;
  let scrollY = 0;
  function scrollTicker(evt: Event, home: Home, mainNav: MainNav, explore: Explore) {
    if (!ticking) {
      window.requestAnimationFrame(function() {
        ticking = false;
        scrollY = window.scrollY;
        home.checkScroll(scrollY, home);
        mainNav.checkScroll(scrollY, mainNav);
        explore.checkScroll(scrollY, explore);
      });
    }
    ticking = true;
  }

  let resizeTimer;
  let width = window.innerWidth;
  function resizeListener(evt: Event, home: Home, mainNav: MainNav, intro: Intro, stories: Stories, explore: Explore) {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function() {
      const newWidth = window.innerWidth;
      if (newWidth !== width) {
        width = newWidth;
        home.createBgIcons(home);
        mainNav.getOffsetTops(mainNav);
        intro.resizeLineChart(intro);
        stories.resizeAllCharts(stories);
        explore.resizeLineCharts(explore);
      }
    }, 1000);
  }


  function render(shinyAPI: ?ShinyAPI, trendsAPI: TrendsAPI) {

    log.info('render');
    const body = document.querySelector('body');

    if (body) {

      const header = document.createElement('header');
      body.appendChild(header);
      const home = new Home(header, trendsAPI);

      const mainContainer = document.createElement('div');
      mainContainer.classList.add('main-container');
      body.appendChild(mainContainer);

        const mainNav = new MainNav(mainContainer);
        const intro = new Intro(mainContainer);
        const stories = new Stories(mainContainer);
        explore = new Explore(mainContainer, shinyAPI, trendsAPI);
        const ranking = new Ranking(mainContainer);
        const about = new About(mainContainer);

      const footer = new Footer(body);

      stickyfill.init();
      var stickyElements = document.getElementsByClassName('sticky');
      for (let i = stickyElements.length - 1; i >= 0  ; i--) {
        stickyfill.add(stickyElements[i]);
      }

      const bindScrollListener = evt => scrollTicker(evt, home, mainNav, explore);
      window.addEventListener('scroll', bindScrollListener);
      const bindResizeListener = evt => resizeListener(evt, home, mainNav, intro, stories, explore);
      window.addEventListener('resize', bindResizeListener);
    }
  }

  const init = function(){
    if (ENV === 'PRODUCTION') {
      log.disableAll();
    } else {
      log.enableAll();
    }
    log.info('Initializing app.');
    log.info('ENV: ' + ENV);
    loadShinyAPI();
  };

  return {
    init: init
  };
})();

window.addEventListener('DOMContentLoaded', app.main.init);
